from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.responses import RedirectResponse
from models import User, UserCreate, UserLogin, UserSession, Pending2FA
from auth_utils import hash_password, verify_password, generate_session_token, generate_2fa_code
from email_service import send_2fa_code
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
async def register(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Register new user with optional 2FA"""
    # Check if username or email already exists
    existing_user = await db.users.find_one({
        "$or": [
            {"username": user_data.username},
            {"email": user_data.email}
        ]
    })
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        is_2fa_enabled=user_data.enable_2fa
    )
    
    await db.users.insert_one(user.dict())
    
    # If 2FA enabled, send code
    if user_data.enable_2fa:
        code = generate_2fa_code()
        pending_2fa = Pending2FA(
            user_id=user.id,
            code=code,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        await db.pending_2fa.insert_one(pending_2fa.dict())
        
        # Send email
        await send_2fa_code(user.email, code)
        logger.info(f"2FA code for {user.email}: {code}")
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "requires_2fa": True,
            "message": f"Code 2FA envoyé à {user.email}"
        }
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "requires_2fa": False,
        "message": "Compte créé avec succès"
    }


@router.post("/login")
async def login(credentials: UserLogin, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Login with username/password"""
    # TODO SECURITY: Implement server-side CAPTCHA verification (reCAPTCHA v3)
    # Currently trusts client-side boolean - must validate with Google reCAPTCHA API in production
    if not credentials.captcha_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha verification required"
        )
    
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
        logger.info(f"2FA code for {user.email}: {code}")
        
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
        httponly=True,
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
        "session_token": session.session_token,
        "requires_2fa": False
    }


@router.post("/verify-2fa")
async def verify_2fa(user_id: str, code: str, response: Response, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Verify 2FA code and create session"""
    # Find pending 2FA
    pending = await db.pending_2fa.find_one({"user_id": user_id})
    
    if not pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending 2FA verification"
        )
    
    # Check expiration
    if pending["expires_at"] < datetime.utcnow():
        await db.pending_2fa.delete_one({"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code expired"
        )
    
    # Check attempts
    if pending["attempts"] >= 5:
        await db.pending_2fa.delete_one({"user_id": user_id})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many failed attempts"
        )
    
    # Verify code
    if pending["code"] != code:
        await db.pending_2fa.update_one(
            {"user_id": user_id},
            {"$inc": {"attempts": 1}}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid code"
        )
    
    # Delete pending 2FA
    await db.pending_2fa.delete_one({"user_id": user_id})
    
    # Create session
    session = UserSession(
        user_id=user_id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    await db.user_sessions.insert_one(session.dict())
    
    # Set session cookie
    response.set_cookie(
        key="session_token",
        value=session.session_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax"
    )
    
    return {
        "verified": True,
        "session_token": session.session_token
    }


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
    from core.config import settings

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
            httponly=True,
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
        "is_2fa_enabled": current_user.is_2fa_enabled
    }


@router.delete("/user/{user_id}")
async def delete_user(
    user_id: str,
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
    
    logger.info(f"Deleted user account: {user_id}")
    
    return {"message": "Account deleted successfully"}


@router.post("/logout")
async def logout(response: Response, current_user: User = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_db)):
    """Logout and invalidate session"""
    # Delete session from database
    await db.user_sessions.delete_many({"user_id": current_user.id})
    
    # Clear cookie
    response.delete_cookie("session_token")
    
    return {"message": "Logged out successfully"}


