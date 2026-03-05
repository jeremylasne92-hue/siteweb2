"""
Service d'authentification locale (email/mot de passe).
Logique métier pour l'inscription et la connexion classique.
"""
import re
import logging
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from models import User, UserSession, UserRegister, UserLoginLocal
from auth_utils import hash_password, verify_password

logger = logging.getLogger(__name__)

# Règles de validation du mot de passe
PASSWORD_MIN_LENGTH = 8
PASSWORD_REGEX = re.compile(
    r'^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]).{8,}$'
)


def validate_password_strength(password: str) -> None:
    """Validate password meets security requirements."""
    if len(password) < PASSWORD_MIN_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le mot de passe doit contenir au moins 8 caractères."
        )
    if not PASSWORD_REGEX.match(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le mot de passe doit contenir au moins 1 majuscule, 1 chiffre et 1 caractère spécial."
        )


async def register_user(data: UserRegister, db: AsyncIOMotorDatabase) -> dict:
    """Register a new user with email/password."""
    # Validate password confirmation
    if data.password != data.password_confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les mots de passe ne correspondent pas."
        )

    # Validate password strength
    validate_password_strength(data.password)

    # Validate age consent
    if not data.age_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous devez certifier avoir plus de 15 ans."
        )

    # Check for existing username or email
    existing = await db.users.find_one({
        "$or": [
            {"username": data.username},
            {"email": data.email}
        ]
    })
    if existing:
        if existing.get("email") == data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cette adresse email est déjà utilisée."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce nom d'utilisateur est déjà pris."
        )

    # Create user
    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    await db.users.insert_one(user.model_dump())

    logger.info(f"New local user registered: {user.email}")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "message": "Compte créé avec succès"
    }


async def login_user(data: UserLoginLocal, db: AsyncIOMotorDatabase) -> dict:
    """Authenticate user by email or username + password. Returns user + session_token."""
    # Lookup by email or username
    user_doc = await db.users.find_one({
        "$or": [
            {"email": data.identifier},
            {"username": data.identifier}
        ]
    })

    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )

    if not verify_password(data.password, user_doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )

    user = User(**user_doc)

    # Update last login
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"last_login": datetime.utcnow()}}
    )

    # Create session
    session = UserSession(
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7)
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
        "session_token": session.session_token
    }
