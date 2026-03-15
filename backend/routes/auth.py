from pydantic import BaseModel as PydanticBaseModel
from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.responses import RedirectResponse, StreamingResponse, JSONResponse
from models import User, UserCreate, UserLogin, UserRegister, UserLoginLocal, UserSession, Pending2FA
from auth_utils import hash_password, verify_password, generate_session_token, generate_2fa_code
from services.auth_local_service import register_user, login_user
from services.password_reset_service import request_reset, verify_token, reset_password as reset_pwd
from email_service import send_2fa_code
from utils.rate_limit import check_rate_limit
from core.config import settings
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx
import csv
import io
import json
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


class Verify2FARequest(PydanticBaseModel):
    user_id: str
    code: str


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    from server import db
    return db


async def get_current_user(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)) -> User:
    """Get current authenticated user from session token"""
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    # Find session
    session = await db.user_sessions.find_one({"session_token": session_token})
    if not session or session["expires_at"] < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session"
        )
    
    # Find user
    user_doc = await db.users.find_one({"id": session["user_id"]})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(**user_doc)


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.post("/register")
async def register(request: Request, user_data: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Register new user with email/password (Service Pattern)."""
    await check_rate_limit(db, request, "register", max_requests=5, window_minutes=15)
    result = await register_user(user_data, db)
    return result


@router.post("/login-local")
async def login_local(request: Request, credentials: UserLoginLocal, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Login with email or username + password (Service Pattern)."""
    await check_rate_limit(db, request, "login", max_requests=10, window_minutes=15)
    result = await login_user(credentials, db)

    # Set session cookie (M5 — token only in httpOnly cookie, not in JSON body)
    response.set_cookie(
        key="session_token",
        value=result["session_token"],
        path="/",
        httponly=True,
        secure=settings.is_production,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )

    # Return user info only, not the session_token
    return {"user": result["user"]}


@router.post("/login")
async def login(request: Request, credentials: UserLogin, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Login with username/password"""
    await check_rate_limit(db, request, "login", max_requests=10, window_minutes=15)
    # Server-side reCAPTCHA v3 verification
    if not credentials.captcha_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha token required"
        )
    recaptcha_secret = settings.RECAPTCHA_SECRET_KEY
    if recaptcha_secret:
        try:
            async with httpx.AsyncClient(timeout=5.0) as http_client:
                recaptcha_resp = await http_client.post(
                    "https://www.google.com/recaptcha/api/siteverify",
                    data={"secret": recaptcha_secret, "response": credentials.captcha_token}
                )
                recaptcha_data = recaptcha_resp.json()
                if not recaptcha_data.get("success") or recaptcha_data.get("score", 0) < 0.5:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Captcha verification failed"
                    )
        except HTTPException:
            raise
        except Exception:
            logger.error("reCAPTCHA API unreachable — blocking login for security")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Security verification service temporarily unavailable. Please retry."
            )
    else:
        logger.warning("RECAPTCHA_SECRET_KEY not set — skipping server-side verification in dev")
    
    # Find user
    user_doc = await db.users.find_one({"username": credentials.username})
    if not user_doc or not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    user = User(**user_doc)
    
    # Update last login
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # If 2FA enabled, send code
    if user.is_2fa_enabled:
        code = generate_2fa_code()
        
        # Delete old pending 2FA
        await db.pending_2fa.delete_many({"user_id": user.id})
        
        pending_2fa = Pending2FA(
            user_id=user.id,
            code=code,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        await db.pending_2fa.insert_one(pending_2fa.dict())
        
        # Send email
        await send_2fa_code(user.email, code)
        logger.info(f"2FA code sent to {user.email}")
        
        return {
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            "requires_2fa": True,
            "message": "Code 2FA envoyé par email"
        }
    
    # Create session
    session = UserSession(
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    await db.user_sessions.insert_one(session.dict())
    
    # Set session cookie
    response.set_cookie(
        key="session_token",
        value=session.session_token,
        path="/",
        httponly=True,
        secure=settings.is_production,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "picture": user.picture
        },
        "requires_2fa": False
    }


@router.post("/verify-2fa")
async def verify_2fa(data: Verify2FARequest, response: Response, request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Verify 2FA code and create session"""
    # Rate limit: max 5 attempts per 15 min per IP
    await check_rate_limit(db, request, "verify-2fa", max_requests=5, window_minutes=15)

    # Find pending 2FA
    pending = await db.pending_2fa.find_one({"user_id": data.user_id})

    if not pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending 2FA verification"
        )

    # Check expiration
    if pending["expires_at"] < datetime.utcnow():
        await db.pending_2fa.delete_one({"user_id": data.user_id})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code expired"
        )

    # Check attempts
    if pending["attempts"] >= 5:
        await db.pending_2fa.delete_one({"user_id": data.user_id})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed attempts"
        )

    # Verify code
    if pending["code"] != data.code:
        await db.pending_2fa.update_one(
            {"user_id": data.user_id},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid code"
        )

    # Delete pending 2FA
    await db.pending_2fa.delete_one({"user_id": data.user_id})

    # Create session
    session = UserSession(
        user_id=data.user_id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    await db.user_sessions.insert_one(session.dict())
    
    # Set session cookie
    response.set_cookie(
        key="session_token",
        value=session.session_token,
        path="/",
        httponly=True,
        secure=settings.is_production,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )

    return {"verified": True}


@router.get("/google/login")
async def google_login():
    from services.auth_service import get_google_login_url
    url = get_google_login_url()
    return RedirectResponse(url=url)


@router.get("/google/callback")
async def google_callback(
    code: str,
    state: str = "",
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Handle Google OAuth login callback with CSRF state validation.
    The JWT is stored in a secure httpOnly cookie, never in the URL."""
    from services.auth_service import google_callback_service, verify_oauth_state

    frontend_url = settings.FRONTEND_URL

    # Validate CSRF state
    if not state or not verify_oauth_state(state):
        logger.warning("Google OAuth callback with invalid or expired state parameter")
        return RedirectResponse(url=f"{frontend_url}/login?error=invalid_state")

    try:
        result = await google_callback_service(code, db)

        # Redirect to frontend success page WITHOUT the token in the URL
        redirect_resp = RedirectResponse(url=f"{frontend_url}/auth/google/success")

        # Store session token in a secure httpOnly cookie
        redirect_resp.set_cookie(
            key="session_token",
            value=result["session_token"],
            path="/",
            httponly=True,
            secure=settings.is_production,
            max_age=7 * 24 * 60 * 60,
            samesite="lax"
        )
        return redirect_resp
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}")
        return RedirectResponse(url=f"{frontend_url}/login?error=oauth_failed")



@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "picture": current_user.picture,
        "is_2fa_enabled": current_user.is_2fa_enabled,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "email_opt_out": current_user.email_opt_out,
        "bio": current_user.bio,
        "interests": current_user.interests,
        "avatar_url": current_user.avatar_url,
        "notification_prefs": current_user.notification_prefs,
        "is_member": current_user.is_member,
        "member_since": current_user.member_since.isoformat() if current_user.member_since else None,
    }


class ProfileUpdate(PydanticBaseModel):
    email_opt_out: bool | None = None
    bio: str | None = None
    interests: list[str] | None = None
    avatar_url: str | None = None
    notification_prefs: dict | None = None


VALID_INTERESTS = [
    "philosophie-conscience", "spiritualite-esoterisme", "religions-traditions",
    "mythes-civilisations", "sciences-neurosciences", "ecologie-climat",
    "justice-droits", "geopolitique-pouvoir", "economie-industrie",
    "technologies-ia", "sante-bien-etre", "arts-medias-culture",
]


@router.patch("/me")
async def update_profile(
    updates: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update current user profile fields"""
    update_data: dict = {}

    if updates.email_opt_out is not None:
        update_data["email_opt_out"] = updates.email_opt_out

    if updates.bio is not None:
        if len(updates.bio) > 280:
            raise HTTPException(status_code=400, detail="Bio must be 280 characters or less")
        update_data["bio"] = updates.bio.strip()

    if updates.interests is not None:
        cleaned = [i for i in updates.interests if i in VALID_INTERESTS]
        update_data["interests"] = cleaned

    if updates.avatar_url is not None:
        if updates.avatar_url:
            if len(updates.avatar_url) > 500:
                raise HTTPException(status_code=400, detail="Avatar URL too long")
            from urllib.parse import urlparse
            parsed = urlparse(updates.avatar_url)
            if parsed.scheme not in ("http", "https", ""):
                raise HTTPException(status_code=400, detail="Avatar URL must use http or https")
        update_data["avatar_url"] = updates.avatar_url

    if updates.notification_prefs is not None:
        allowed_keys = {"newsletter", "episodes", "events", "partners"}
        cleaned_prefs = {k: bool(v) for k, v in updates.notification_prefs.items() if k in allowed_keys}
        update_data["notification_prefs"] = cleaned_prefs

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    await db.users.update_one({"id": current_user.id}, {"$set": update_data})
    logger.info(f"User {current_user.id} updated profile fields: {list(update_data.keys())}")

    return {"message": "Profile updated", "updated_fields": list(update_data.keys())}


@router.delete("/user/{user_id}")
async def delete_user(
    user_id: str,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete user account permanently"""
    # Only allow users to delete their own account
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own account"
        )
    
    # Delete user data
    await db.users.delete_one({"id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.video_progress.delete_many({"user_id": user_id})
    await db.pending_2fa.delete_many({"user_id": user_id})
    # Cascade: delete partner data
    await db.partners.delete_many({"user_id": user_id})
    # Cascade: delete tech candidatures by email
    if current_user.email:
        await db.tech_candidatures.delete_many({"email": current_user.email})
    # Cascade: delete episode optins
    await db.episode_optins.delete_many({"user_id": user_id})

    logger.info(f"Deleted user account: {user_id}")

    # Clear session cookie
    response.delete_cookie(
        "session_token",
        path="/",
        httponly=True,
        secure=settings.is_production,
        samesite="lax"
    )

    return {"message": "Account deleted successfully"}


@router.get("/me/export")
async def export_my_data(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Export all user data (RGPD right to data portability)"""
    user_data = await db.users.find_one(
        {"id": current_user.id},
        {"_id": 0, "password_hash": 0, "totp_secret": 0}
    )
    sessions = await db.user_sessions.find(
        {"user_id": current_user.id}, {"_id": 0, "session_token": 0}
    ).to_list(None)
    optins = await db.episode_optins.find(
        {"user_id": current_user.id}, {"_id": 0}
    ).to_list(None)
    partner = await db.partners.find_one(
        {"user_id": current_user.id}, {"_id": 0, "ip_address": 0}
    )

    export = {
        "user": user_data,
        "sessions": sessions,
        "episode_optins": optins,
        "partner": partner,
        "exported_at": datetime.utcnow().isoformat(),
    }

    return export


def _serialize_for_json(obj):
    """Recursively convert datetime objects to ISO strings for JSON export."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    if isinstance(obj, dict):
        return {k: _serialize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize_for_json(item) for item in obj]
    return obj


@router.get("/my-data/export")
async def export_my_data_download(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Export all user data as downloadable JSON (RGPD art. 15/20 — right of access & portability)"""
    user_data = await db.users.find_one(
        {"id": current_user.id},
        {"_id": 0, "password_hash": 0, "totp_secret": 0}
    )
    sessions = await db.user_sessions.find(
        {"user_id": current_user.id}, {"_id": 0, "session_token": 0}
    ).to_list(None)
    optins = await db.episode_optins.find(
        {"user_id": current_user.id}, {"_id": 0}
    ).to_list(None)
    partner = await db.partners.find_one(
        {"user_id": current_user.id}, {"_id": 0, "ip_address": 0}
    )
    contact_messages = await db.contact_messages.find(
        {"email": current_user.email}, {"_id": 0, "ip_address": 0}
    ).to_list(None)
    volunteer_apps = await db.volunteer_applications.find(
        {"email": current_user.email}, {"_id": 0, "ip_address": 0}
    ).to_list(None)
    tech_candidatures = await db.tech_candidatures.find(
        {"email": current_user.email}, {"_id": 0, "ip_address": 0}
    ).to_list(None)
    analytics = await db.analytics_events.find(
        {"session_id": current_user.id}, {"_id": 0}
    ).to_list(None)
    video_progress = await db.video_progress.find(
        {"user_id": current_user.id}, {"_id": 0}
    ).to_list(None)

    export = _serialize_for_json({
        "user": user_data,
        "sessions": sessions,
        "episode_optins": optins,
        "partner": partner,
        "contact_messages": contact_messages,
        "volunteer_applications": volunteer_apps,
        "tech_candidatures": tech_candidatures,
        "analytics_events": analytics,
        "video_progress": video_progress,
        "exported_at": datetime.utcnow().isoformat(),
    })

    content = json.dumps(export, ensure_ascii=False, indent=2)
    logger.info(f"User {current_user.id} exported their personal data (RGPD)")

    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=mes-donnees-echo.json"},
    )


@router.delete("/my-data")
async def request_account_deletion(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Request account deletion (RGPD art. 17 — right to erasure).
    Marks the account for deletion rather than deleting immediately."""
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"deletion_requested_at": datetime.utcnow()}}
    )

    logger.info(f"User {current_user.id} requested account deletion (RGPD art. 17)")

    return {"message": "Votre demande de suppression a bien été enregistrée. Votre compte sera supprimé sous 30 jours."}


@router.get("/unsubscribe/{user_id}")
async def unsubscribe_emails(
    user_id: str,
    token: str = "",
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Unsubscribe from non-transactional emails (RGPD). Requires valid HMAC token."""
    import hmac, hashlib
    expected = hmac.new(
        settings.UNSUBSCRIBE_SECRET.encode(),
        user_id.encode(),
        hashlib.sha256
    ).hexdigest()
    if not token or not hmac.compare_digest(token, expected):
        raise HTTPException(status_code=403, detail="Invalid unsubscribe token")
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"email_opt_out": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Vous etes desinscrits des emails non-transactionnels."}


@router.post("/logout")
async def logout(request: Request, response: Response, current_user: User = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Logout and invalidate current session only"""
    # Delete only the current session, not all sessions
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})

    # Clear cookie
    response.delete_cookie(
        "session_token",
        path="/",
        httponly=True,
        secure=settings.is_production,
        samesite="lax"
    )

    return {"message": "Logged out successfully"}



# ==================== PASSWORD RESET (Story 1.3) ====================


from pydantic import Field


class ForgotPasswordRequest(PydanticBaseModel):
    email: str = Field(..., min_length=5, max_length=254, pattern=r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


class ResetPasswordRequest(PydanticBaseModel):
    password: str = Field(..., min_length=8, max_length=256)
    password_confirm: str = Field(..., min_length=8, max_length=256)


@router.post("/forgot-password")
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Request password reset email (Service Pattern)."""
    await check_rate_limit(db, request, "forgot_password", max_requests=3, window_minutes=60)
    result = await request_reset(data.email, db)
    return result


@router.get("/reset-password/{token}")
async def check_reset_token(token: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Verify reset token validity (Service Pattern)."""
    result = await verify_token(token, db)
    return result


@router.post("/reset-password/{token}")
async def do_reset_password(request: Request, token: str, data: ResetPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Reset password with valid token (Service Pattern)."""
    await check_rate_limit(db, request, "reset_password", max_requests=5, window_minutes=15)
    result = await reset_pwd(token, data.password, data.password_confirm, db)
    return result


@router.get("/admin/export-users")
async def export_users_csv(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Export all users as CSV (admin only)"""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0, "totp_secret": 0}).to_list(None)

    output = io.StringIO()
    output.write("﻿")
    writer = csv.writer(output)
    writer.writerow(["id", "username", "email", "role", "oauth_provider", "is_2fa_enabled", "created_at", "last_login"])
    for u in users:
        created = u.get("created_at", "")
        if hasattr(created, "isoformat"):
            created = created.isoformat()
        last_login = u.get("last_login", "")
        if hasattr(last_login, "isoformat"):
            last_login = last_login.isoformat()
        writer.writerow([
            u.get("id", ""),
            u.get("username", ""),
            u.get("email", ""),
            u.get("role", ""),
            u.get("oauth_provider", ""),
            u.get("is_2fa_enabled", False),
            created,
            last_login or "",
        ])

    output.seek(0)
    logging.getLogger(__name__).info(f"Admin {admin.id} exported {len(users)} user records")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=users-export.csv"}
    )
