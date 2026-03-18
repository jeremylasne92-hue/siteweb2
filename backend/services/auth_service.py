"""
Service d'authentification Google OAuth.
Gère l'échange de code, la création/mise à jour d'utilisateur, et la génération de session.
"""
import httpx
import hmac
import hashlib
import time
import secrets
from models import User, UserSession, Pending2FA
from auth_utils import generate_2fa_code
from email_service import send_2fa_code
from datetime import datetime, timedelta, UTC
from urllib.parse import urlencode
from core.config import settings
import logging

logger = logging.getLogger(__name__)

# Timeout pour les requêtes HTTP externes (en secondes)
HTTPX_TIMEOUT = 10.0


def generate_oauth_state() -> str:
    """Generate a signed state parameter to prevent CSRF attacks."""
    nonce = secrets.token_urlsafe(32)
    timestamp = str(int(time.time()))
    payload = f"{nonce}:{timestamp}"
    signature = hmac.new(
        settings.OAUTH_STATE_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{payload}:{signature}"


def verify_oauth_state(state: str) -> bool:
    """Verify the state parameter is valid and not expired (5 min max)."""
    try:
        parts = state.split(":")
        if len(parts) != 3:
            return False
        nonce, timestamp_str, signature = parts
        payload = f"{nonce}:{timestamp_str}"

        expected_sig = hmac.new(
            settings.OAUTH_STATE_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_sig):
            return False

        # Check expiration (5 minutes)
        ts = int(timestamp_str)
        if time.time() - ts > 300:
            return False

        return True
    except Exception:
        return False


async def google_callback_service(code: str, db) -> dict:
    """Exchange code for user profile and generate JWT session."""
    client_id = settings.GOOGLE_CLIENT_ID
    client_secret = settings.GOOGLE_CLIENT_SECRET
    redirect_uri = settings.GOOGLE_REDIRECT_URI

    # 1. Exchange code for access token
    async with httpx.AsyncClient(timeout=HTTPX_TIMEOUT) as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri
            }
        )

        if token_response.status_code != 200:
            logger.error(f"Failed to exchange Google code: {token_response.text}")
            raise ValueError("Failed to exchange authorization code")

        access_token = token_response.json().get("access_token")

        # 2. Get user info
        userinfo_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if userinfo_response.status_code != 200:
            logger.error(f"Failed to get Google user info: {userinfo_response.text}")
            raise ValueError("Failed to fetch user information")

        user_info = userinfo_response.json()

    # 3. Check if user exists or create (normalize email)
    from utils.normalize import normalize_email
    email = normalize_email(user_info.get("email"))
    user_doc = await db.users.find_one({"email": email})

    if user_doc:
        user = User(**user_doc)
        # Verify provider and update if needed
        updates = {"last_login": datetime.now(UTC)}
        if not user.oauth_provider:
            updates["oauth_provider"] = "google"
            updates["oauth_id"] = user_info.get("id")

        await db.users.update_one(
            {"id": user.id},
            {"$set": updates}
        )
    else:
        # Create new user with atomic unique username via upsert pattern
        base_name = user_info.get("name", "").replace(" ", "_").lower()
        if not base_name:
            base_name = email.split('@')[0].lower()

        # Use a unique suffix to avoid race conditions
        username = f"{base_name}_{secrets.token_hex(4)}"

        user = User(
            username=username,
            email=email,
            oauth_provider="google",
            oauth_id=user_info.get("id"),
            picture=user_info.get("picture"),
            is_active=True,
            consent_date=datetime.now(UTC),
            consent_version="2026-03-18",
        )
        await db.users.insert_one(user.model_dump())

    # 4. Check if user has 2FA enabled
    if user.is_2fa_enabled:
        code = generate_2fa_code()

        # Delete old pending 2FA
        await db.pending_2fa.delete_many({"user_id": user.id})

        pending_2fa = Pending2FA(
            user_id=user.id,
            code=code,
            expires_at=datetime.now(UTC) + timedelta(minutes=10)
        )
        await db.pending_2fa.insert_one(pending_2fa.model_dump())

        # Send email
        await send_2fa_code(user.email, code)
        logger.info(f"2FA code sent to {user.email} (OAuth login)")

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

    # 5. Create Session (only if 2FA not enabled)
    session = UserSession(
        user_id=user.id,
        expires_at=datetime.now(UTC) + timedelta(days=7)
    )
    await db.user_sessions.insert_one(session.model_dump())

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


def get_google_login_url() -> str:
    """Generate the Google OAuth2 login URL with CSRF state."""
    state = generate_oauth_state()

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
        "state": state
    }

    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
