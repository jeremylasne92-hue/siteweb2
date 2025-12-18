from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: Optional[str] = None
    oauth_provider: Optional[str] = None  # google, discord
    oauth_id: Optional[str] = None
    picture: Optional[str] = None
    role: UserRole = UserRole.USER
    is_2fa_enabled: bool = False
    totp_secret: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "role": "user"
            }
        }


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    enable_2fa: bool = False


class UserLogin(BaseModel):
    username: str
    password: str
    captcha_verified: bool = False


class UserSession(BaseModel):
    user_id: str
    session_token: str = Field(default_factory=lambda: str(uuid.uuid4()))
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Episode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    season: int
    episode: int
    title: str
    description: str
    duration: str  # e.g., "52 min"
    thumbnail_url: str
    video_url: str  # Local path or future S3 URL
    is_published: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "season": 1,
                "episode": 1,
                "title": "Épisode 1 — Le Réveil",
                "description": "Premier épisode...",
                "duration": "52 min",
                "thumbnail_url": "https://...",
                "video_url": "/videos/s1e1.mp4",
                "is_published": True
            }
        }


class VideoProgress(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    episode_id: str
    season: int
    episode: int
    current_time: float  # seconds
    duration: float  # seconds
    progress_percent: float
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class VideoProgressCreate(BaseModel):
    """Model for creating/updating video progress"""
    episode_id: str
    season: int
    episode: int
    current_time: float
    duration: float



class Pending2FA(BaseModel):
    user_id: str
    code: str  # 4-digit code
    attempts: int = 0
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
