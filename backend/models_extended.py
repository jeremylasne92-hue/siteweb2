from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum


class ThematicType(str, Enum):
    SOCIETALE = "sociétale"
    SOCIALE = "sociale"
    EXISTENTIELLE = "existentielle"
    ENVIRONNEMENTALE = "environnementale"
    PHILOSOPHIQUE = "philosophique"
    SPIRITUELLE = "spirituelle"


class Thematic(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    episode_id: str
    type: ThematicType
    title: str
    description: str
    image_url: Optional[str] = None
    order: int = 0  # For sorting multiple thematics
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ResourceType(str, Enum):
    VIDEO = "vidéo"
    BOOK = "livre"
    ARTICLE = "article"
    PODCAST = "podcast"
    AUTHOR = "auteur"
    OTHER = "autre"


class Resource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    episode_id: str
    type: ResourceType
    title: str
    description: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    author: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Actor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    role: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
