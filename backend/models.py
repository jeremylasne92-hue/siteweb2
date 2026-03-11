from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal
from datetime import datetime
import uuid
import secrets
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    PARTNER = "partner"


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
    email_opt_out: bool = False

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
    captcha_token: str = ""


class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    password_confirm: str
    age_consent: bool = False


class UserLoginLocal(BaseModel):
    identifier: str  # email or username
    password: str


class UserSession(BaseModel):
    user_id: str
    session_token: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PasswordResetToken(BaseModel):
    token: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    user_id: str
    expires_at: datetime
    used: bool = False
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



class EpisodeOptIn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    season: int
    episode: int
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EpisodeOptInRequest(BaseModel):
    season: int
    episode: int


class TechCandidature(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    project: Literal["cognisphere", "echolink"]
    skills: str
    message: str
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TechCandidatureRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    project: Literal["cognisphere", "echolink"]
    skills: str = Field(min_length=2, max_length=500)
    message: str = Field(min_length=10, max_length=2000)
    website: str = ""  # honeypot field


class EventType(str, Enum):
    PROJECTION = "Projection"
    ATELIER = "Atelier"
    CONFERENCE = "Conférence"
    EN_LIGNE = "En ligne"


class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: datetime  # ISO 8601
    time: str  # "20:00"
    location: str
    type: EventType
    image_url: Optional[str] = None
    is_published: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class EventCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=2000)
    date: datetime
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    location: str = Field(min_length=3, max_length=200)
    type: EventType
    image_url: Optional[str] = None


class Pending2FA(BaseModel):
    user_id: str
    code: str  # 6-digit code
    attempts: int = 0
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AnalyticsEventCreate(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    action: str = Field(min_length=1, max_length=50)
    path: str = Field(min_length=1, max_length=200)


class AnalyticsEvent(AnalyticsEventCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
