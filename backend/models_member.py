"""Pydantic models for the member_profiles collection."""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
import re
import unicodedata
import uuid


# --- Enums as Literal types ---

ProjectType = Literal["cognisphere", "echolink", "scenariste", "benevole"]
ExperienceLevel = Literal["professional", "student", "self_taught", "motivated"]
Availability = Literal["punctual", "regular", "active"]
MembershipStatus = Literal["active", "inactive", "suspended", "alumni"]
AgeRange = Literal["18-25", "26-35", "36-45", "46-55", "56+"]
Gender = Literal["woman", "man", "non_binary", "prefer_not_to_say"]

FrenchRegion = Literal[
    "auvergne_rhone_alpes", "bourgogne_franche_comte", "bretagne",
    "centre_val_de_loire", "corse", "grand_est", "hauts_de_france",
    "ile_de_france", "normandie", "nouvelle_aquitaine", "occitanie",
    "pays_de_la_loire", "provence_alpes_cote_d_azur", "outre_mer",
]

ProfessionalSector = Literal[
    "tech", "creative", "audiovisual", "education", "health",
    "business", "public_sector", "environment", "social_work",
    "journalism", "legal", "student", "retired", "other",
]

SocialPlatform = Literal[
    "website", "instagram", "linkedin", "tiktok", "facebook",
    "twitter", "youtube", "github", "behance", "vimeo", "other",
]


def _slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


class SocialLink(BaseModel):
    platform: SocialPlatform
    url: str
    label: Optional[str] = None


class VisibilityOverrides(BaseModel):
    contact_email: bool = False
    city: bool = True
    social_links: bool = True
    age_range: bool = False
    professional_sector: bool = False


class MemberProfileCreate(BaseModel):
    """Schema for creating a member profile."""
    display_name: str = Field(max_length=50)
    slug: Optional[str] = None
    bio: Optional[str] = Field(default=None, max_length=300)
    avatar_url: Optional[str] = None
    city: Optional[str] = None
    region: Optional[FrenchRegion] = None
    department: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    project: ProjectType
    role_title: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    experience_level: Optional[ExperienceLevel] = None
    availability: Optional[Availability] = None

    age_range: Optional[AgeRange] = None
    professional_sector: Optional[ProfessionalSector] = None
    gender: Optional[Gender] = None

    contact_email: Optional[EmailStr] = None
    social_links: list[SocialLink] = Field(default_factory=list)

    def __init__(self, **data):
        super().__init__(**data)
        if self.slug is None:
            self.slug = _slugify(self.display_name)

    @field_validator("skills", mode="before")
    @classmethod
    def normalize_skills(cls, v):
        if isinstance(v, list):
            return [s.strip().lower() for s in v if s.strip()]
        return v


class MemberProfileUpdate(BaseModel):
    """Schema for partial profile updates (all fields optional)."""
    display_name: Optional[str] = Field(default=None, max_length=50)
    slug: Optional[str] = None
    bio: Optional[str] = Field(default=None, max_length=300)
    avatar_url: Optional[str] = None
    city: Optional[str] = None
    region: Optional[FrenchRegion] = None
    department: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    project: Optional[ProjectType] = None
    role_title: Optional[str] = None
    skills: Optional[list[str]] = None
    experience_level: Optional[ExperienceLevel] = None
    availability: Optional[Availability] = None

    age_range: Optional[AgeRange] = None
    professional_sector: Optional[ProfessionalSector] = None
    gender: Optional[Gender] = None

    contact_email: Optional[EmailStr] = None
    social_links: Optional[list[SocialLink]] = None

    @field_validator("skills", mode="before")
    @classmethod
    def normalize_skills(cls, v):
        if isinstance(v, list):
            return [s.strip().lower() for s in v if s.strip()]
        return v


class VisibilityUpdate(BaseModel):
    """Schema for toggling visibility."""
    visible: Optional[bool] = None
    visibility_overrides: Optional[VisibilityOverrides] = None


class MemberProfile(BaseModel):
    """Full member profile document (read model)."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str

    display_name: str
    slug: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    city: Optional[str] = None
    region: Optional[FrenchRegion] = None
    department: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    project: ProjectType
    role_title: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    experience_level: Optional[ExperienceLevel] = None
    availability: Optional[Availability] = None

    age_range: Optional[AgeRange] = None
    professional_sector: Optional[ProfessionalSector] = None
    gender: Optional[Gender] = None

    contact_email: Optional[EmailStr] = None
    social_links: list[SocialLink] = Field(default_factory=list)

    visible: bool = False
    visibility_overrides: VisibilityOverrides = Field(default_factory=VisibilityOverrides)

    candidature_id: Optional[str] = None
    candidature_type: Optional[str] = None
    membership_status: MembershipStatus = "active"
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    last_active_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
