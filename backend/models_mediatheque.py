"""Pydantic models for the Médiathèque (media resources)."""
from datetime import datetime, UTC
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ResourceType(str, Enum):
    DOCUMENT = "document"
    VIDEO = "video"
    LIVRE = "livre"
    OUTIL = "outil"


class MediaResourceCreate(BaseModel):
    """Schema for creating/updating a media resource (POST/PUT)."""
    resource_type: ResourceType
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=5000)
    thumbnail_url: Optional[str] = None
    external_url: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    tags: list[str] = Field(default_factory=list)
    source: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = Field(None, ge=1900, le=2100)
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = 0


class MediaResource(BaseModel):
    """Schema for reading a media resource from the database (GET responses)."""
    id: str
    resource_type: ResourceType
    title: str
    description: str
    thumbnail_url: Optional[str] = None
    external_url: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    tags: list[str] = Field(default_factory=list)
    source: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = None
    is_featured: bool = False
    is_published: bool = False
    sort_order: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
