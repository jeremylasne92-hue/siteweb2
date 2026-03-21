"""
Service d'authentification locale (email/mot de passe).
Logique métier pour l'inscription et la connexion classique.
"""
import re
import logging
from datetime import datetime, timedelta, UTC
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status
from models import User, UserSession, UserRegister, UserLoginLocal
from auth_utils import hash_password, verify_password

logger = logging.getLogger(__name__)

# Hash factice pour réponse en temps constant (H1 — timing attack)
DUMMY_HASH = hash_password("DummyP@ss1")

# Règles de validation
PASSWORD_MIN_LENGTH = 8
PASSWORD_REGEX = re.compile(
    r'^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]).{8,}$'
)
USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9_]{3,30}$')


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
    # M3 — Validate username format (backend mirror of frontend Zod)
    if not USERNAME_REGEX.match(data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nom d'utilisateur doit contenir 3-30 caractères (lettres, chiffres, underscores)."
        )

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

    # Normalize email for consistent storage
    from utils.normalize import normalize_email
    normalized_email = normalize_email(data.email)

    # Check for existing username or email
    existing = await db.users.find_one({
        "$or": [
            {"username": data.username},
            {"email": normalized_email}
        ]
    })
    if existing:
        # H2 — Message générique pour éviter l'énumération d'emails
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cet email ou nom d'utilisateur existe déjà."
        )

    # Validate and clean interests
    valid_interests = [
        "philosophie-conscience", "spiritualite-esoterisme", "religions-traditions",
        "mythes-civilisations", "sciences-neurosciences", "ecologie-climat",
        "justice-droits", "geopolitique-pouvoir", "economie-industrie",
        "technologies-ia", "sante-bien-etre", "arts-medias-culture",
    ]
    cleaned_interests = [i for i in (data.interests or []) if i in valid_interests]

    # Create user with acquisition tracking + RGPD consent proof
    from models import NotificationPreferences
    user = User(
        username=data.username,
        email=normalized_email,
        password_hash=hash_password(data.password),
        interests=cleaned_interests,
        acquisition_source=data.acquisition_source,
        first_utm_source=data.utm_source,
        first_utm_medium=data.utm_medium,
        first_utm_campaign=data.utm_campaign,
        first_referrer=data.referrer,
        consent_date=datetime.now(UTC),
        consent_version="v2026-03-20",
        consent_ip=data.consent_ip,
        notification_prefs=NotificationPreferences(
            newsletter=data.newsletter_optin,
        ),
        onboarding_step=0,
        onboarding_next_at=datetime.now(UTC) + timedelta(days=3),
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
    # Normalize identifier for case-insensitive email lookup
    from utils.normalize import normalize_email
    normalized_identifier = normalize_email(data.identifier)
    # Lookup by email (normalized) or username (exact)
    user_doc = await db.users.find_one({
        "$or": [
            {"email": normalized_identifier},
            {"username": data.identifier}
        ]
    })

    # H1 — Toujours exécuter bcrypt pour réponse en temps constant
    stored_hash = user_doc.get("password_hash", DUMMY_HASH) if user_doc else DUMMY_HASH
    password_ok = verify_password(data.password, stored_hash)

    if not user_doc or not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects."
        )

    user = User(**user_doc)

    # Update last login
    await db.users.update_one(
        {"id": user.id},
        {"$set": {"last_login": datetime.now(UTC)}}
    )

    # Create session
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
        "session_token": session.session_token
    }
