from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import secrets
import pyotp
import random
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def generate_session_token() -> str:
    """Generate secure random session token"""
    return secrets.token_urlsafe(32)


def generate_2fa_secret() -> str:
    """Generate TOTP secret for 2FA"""
    return pyotp.random_base32()


def generate_2fa_code() -> str:
    """Generate 4-digit 2FA code"""
    return ''.join(random.choices(string.digits, k=4))


def verify_totp_code(secret: str, code: str) -> bool:
    """Verify TOTP code"""
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)
