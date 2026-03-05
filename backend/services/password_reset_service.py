"""
Service de réinitialisation de mot de passe.
Gestion des tokens sécurisés et du changement de mot de passe.
"""
import os
import logging
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from models import PasswordResetToken
from auth_utils import hash_password
from services.auth_local_service import validate_password_strength
from email_service import send_password_reset

logger = logging.getLogger(__name__)

RESET_TOKEN_TTL_HOURS = 1
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


async def request_reset(email: str, db: AsyncIOMotorDatabase) -> dict:
    """Request a password reset. Always returns the same message (anti-enumeration)."""
    generic_message = "Si un compte est associé à cette adresse, un email de réinitialisation a été envoyé."

    # Normalize email
    email = email.strip().lower()

    # Lookup user
    user = await db.users.find_one({"email": email})

    if user and user.get("password_hash"):
        # Invalidate any existing unused tokens for this user
        await db.password_reset_tokens.update_many(
            {"user_id": user["id"], "used": False},
            {"$set": {"used": True}}
        )

        # Create reset token (1h TTL)
        token = PasswordResetToken(
            user_id=user["id"],
            expires_at=datetime.utcnow() + timedelta(hours=RESET_TOKEN_TTL_HOURS)
        )
        await db.password_reset_tokens.insert_one(token.model_dump())

        # Build reset link
        reset_link = f"{FRONTEND_URL}/reset-password/{token.token}"

        # Send email
        await send_password_reset(email, reset_link)
        logger.info(f"Password reset requested for {email}")
    else:
        # Log but don't reveal anything to the user
        logger.info(f"Password reset requested for unknown email: {email}")

    return {"message": generic_message}


async def _get_valid_token(token: str, db: AsyncIOMotorDatabase) -> dict:
    """Internal helper: fetch and validate a reset token."""
    token_doc = await db.password_reset_tokens.find_one({
        "token": token,
        "used": False
    })

    if not token_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce lien de réinitialisation est invalide ou a déjà été utilisé."
        )

    if datetime.utcnow() > token_doc["expires_at"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau."
        )

    return token_doc


async def verify_token(token: str, db: AsyncIOMotorDatabase) -> dict:
    """Verify a reset token is valid and not expired."""
    await _get_valid_token(token, db)
    return {"valid": True}


async def reset_password(token: str, new_password: str, new_password_confirm: str, db: AsyncIOMotorDatabase) -> dict:
    """Reset the user's password using a valid token."""
    token_doc = await _get_valid_token(token, db)

    # Validate password match
    if new_password != new_password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas."
        )

    # Validate password strength (reuse from auth_local_service)
    validate_password_strength(new_password)

    # Update user password
    await db.users.update_one(
        {"id": token_doc["user_id"]},
        {"$set": {"password_hash": hash_password(new_password)}}
    )

    # Invalidate the token (single-use)
    await db.password_reset_tokens.update_one(
        {"token": token},
        {"$set": {"used": True}}
    )

    logger.info(f"Password reset completed for user {token_doc['user_id']}")

    return {"message": "Mot de passe réinitialisé avec succès."}
