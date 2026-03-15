from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator
from typing import Optional, Literal, List
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
    bio: Optional[str] = None
    interests: list[str] = Field(default_factory=list)
    avatar_url: Optional[str] = None
    notification_prefs: dict = Field(default_factory=lambda: {
        "newsletter": True,
        "episodes": True,
        "events": True,
        "partners": False,
    })
    is_member: bool = False
    member_since: Optional[datetime] = None

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "username": "john_doe",
            "email": "john@example.com",
            "role": "user"
        }
    })


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
    interests: list[str] = Field(default_factory=list)
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

    model_config = ConfigDict(json_schema_extra={
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
    })


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
    project: Literal["cognisphere", "echolink", "scenariste"]
    skills: str
    message: str
    status: Literal["pending", "entretien", "accepted", "rejected"] = "pending"
    status_note: Optional[str] = None
    portfolio_url: Optional[str] = None
    creative_interests: Optional[str] = None
    experience_level: Optional[Literal["professional", "student", "self_taught", "motivated"]] = None
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class TechCandidatureRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    project: Literal["cognisphere", "echolink", "scenariste"]
    skills: str = Field(min_length=2, max_length=500)
    message: str = Field(min_length=10, max_length=2000)
    website: str = ""  # honeypot field
    portfolio_url: Optional[str] = Field(None, max_length=500)
    creative_interests: Optional[str] = Field(None, max_length=500)
    experience_level: Optional[Literal["professional", "student", "self_taught", "motivated"]] = None

    @field_validator("portfolio_url")
    @classmethod
    def validate_portfolio_url(cls, v):
        if v is None or v == "":
            return v
        from urllib.parse import urlparse
        parsed = urlparse(v)
        if parsed.scheme not in ("http", "https"):
            raise ValueError("L'URL doit commencer par http:// ou https://")
        return v


class TechCandidatureEditUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    project: Optional[Literal["cognisphere", "echolink", "scenariste"]] = None
    skills: Optional[str] = Field(None, min_length=2, max_length=500)
    message: Optional[str] = Field(None, min_length=10, max_length=2000)
    portfolio_url: Optional[str] = Field(None, max_length=500)
    creative_interests: Optional[str] = Field(None, max_length=500)
    experience_level: Optional[Literal["professional", "student", "self_taught", "motivated"]] = None


class TechCandidatureStatusUpdate(BaseModel):
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None


class TechCandidatureBatchStatusUpdate(BaseModel):
    ids: list[str] = Field(min_length=1)
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None


class EventType(str, Enum):
    PROJECTION = "Projection"
    ATELIER = "Atelier"
    CONFERENCE = "Conférence"
    EN_LIGNE = "En ligne"


class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    date: datetime  # ISO 8601
    date_end: Optional[datetime] = None
    time: Optional[str] = None  # "20:00"
    location: str
    type: EventType
    image_url: Optional[str] = None  # legacy single image
    images: List[str] = Field(default_factory=list)  # up to 10 images
    booking_enabled: bool = False
    booking_url: Optional[str] = None
    organizer: Optional[str] = None
    is_published: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class EventCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    date: datetime
    date_end: Optional[datetime] = None
    time: Optional[str] = Field(default=None, pattern=r"^\d{2}:\d{2}$")
    location: str = Field(min_length=3, max_length=200)
    type: EventType
    image_url: Optional[str] = None
    images: List[str] = Field(default_factory=list, max_length=10)
    booking_enabled: bool = False
    booking_url: Optional[str] = None
    organizer: Optional[str] = Field(default=None, max_length=200)


class Pending2FA(BaseModel):
    user_id: str
    code: str  # 6-digit code
    attempts: int = 0
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ContactMessageRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    subject: Literal["question_generale", "presse_media", "partenariat", "autre"]
    message: str = Field(min_length=10, max_length=5000)
    consent_rgpd: bool
    website: str = ""  # honeypot field

    @field_validator("consent_rgpd")
    @classmethod
    def validate_consent(cls, v):
        if not v:
            raise ValueError("Le consentement RGPD est obligatoire")
        return v


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str
    message: str
    ip_address: str  # anonymisé
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read: bool = False


class AnalyticsEventCreate(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    action: str = Field(min_length=1, max_length=50)
    path: str = Field(min_length=1, max_length=200)
    partner_id: Optional[str] = None
    session_id: Optional[str] = Field(None, max_length=36)
    utm_source: Optional[str] = Field(None, max_length=100)
    utm_medium: Optional[str] = Field(None, max_length=100)
    utm_campaign: Optional[str] = Field(None, max_length=200)
    referrer: Optional[str] = Field(None, max_length=500)
    label: Optional[str] = Field(None, max_length=100)


class AnalyticsEvent(AnalyticsEventCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# --- Volunteer Application Models ---

class VolunteerApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    motivation: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    experience_level: Literal["professional", "student", "self_taught", "motivated"]
    availability: Literal["punctual", "regular", "active"]
    values_accepted: bool = True
    message: Optional[str] = None
    status: Literal["pending", "entretien", "accepted", "rejected"] = "pending"
    status_note: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class VolunteerApplicationRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    city: str = Field(min_length=2, max_length=100)
    motivation: list[str] = Field(default_factory=list, max_length=10)
    skills: list[str] = Field(min_length=1, max_length=50)
    experience_level: Literal["professional", "student", "self_taught", "motivated"]
    availability: Literal["punctual", "regular", "active"]
    values_accepted: bool
    message: Optional[str] = Field(None, max_length=2000)
    website: str = ""  # honeypot field

    @field_validator("values_accepted")
    @classmethod
    def validate_values(cls, v):
        if not v:
            raise ValueError("L'adhésion aux valeurs est obligatoire")
        return v


class VolunteerEditUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    skills: Optional[list[str]] = None
    experience_level: Optional[Literal["professional", "student", "self_taught", "motivated"]] = None
    availability: Optional[Literal["punctual", "regular", "active"]] = None
    message: Optional[str] = Field(None, max_length=2000)


class VolunteerStatusUpdate(BaseModel):
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None


class VolunteerBatchStatusUpdate(BaseModel):
    ids: list[str] = Field(min_length=1)
    status: Literal["pending", "entretien", "accepted", "rejected"]
    status_note: Optional[str] = None
