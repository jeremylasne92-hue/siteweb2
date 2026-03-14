# Member Profiles — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow accepted members to have clickable public profiles with bio, social links, role, and contact info — enabling spectators to discover and contact ECHO members. Support admin analytics for recruitment insights.

**Architecture:** Separate MongoDB collection `member_profiles`, linked to `users` via `user_id`. New FastAPI router `members.py` with public, authenticated, and admin endpoints. Frontend: new `MemberModal` component on the PartnersPage, profile editing section on the Profile page.

**Tech Stack:** FastAPI + Motor (async MongoDB), React 19 + TypeScript + Tailwind CSS 4, Pydantic models, Vitest + Pytest

---

### Task 1: Backend — Pydantic Models for Member Profiles

**Files:**
- Create: `backend/models_member.py`
- Test: `backend/tests/test_models_member.py`

**Step 1: Write the failing test**

```python
# backend/tests/test_models_member.py
"""Tests for member profile Pydantic models."""
from models_member import MemberProfile, MemberProfileCreate, MemberProfileUpdate, SocialLink, VisibilityOverrides

def test_member_profile_create_minimal():
    """Minimal creation requires display_name + project."""
    profile = MemberProfileCreate(display_name="Alice", project="cognisphere")
    assert profile.display_name == "Alice"
    assert profile.project == "cognisphere"
    assert profile.skills == []
    assert profile.social_links == []

def test_member_profile_create_with_social_links():
    """Social links are validated as list of SocialLink objects."""
    profile = MemberProfileCreate(
        display_name="Bob",
        project="echolink",
        social_links=[
            SocialLink(platform="linkedin", url="https://linkedin.com/in/bob"),
            SocialLink(platform="instagram", url="https://instagram.com/bob"),
        ],
    )
    assert len(profile.social_links) == 2
    assert profile.social_links[0].platform == "linkedin"

def test_member_profile_slug_auto_generated():
    """Slug is auto-generated from display_name if not provided."""
    profile = MemberProfileCreate(display_name="Élise Dupont-Martin", project="benevole")
    assert profile.slug == "elise-dupont-martin"

def test_member_profile_display_name_max_length():
    """display_name is capped at 50 characters."""
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        MemberProfileCreate(display_name="A" * 51, project="cognisphere")

def test_member_profile_bio_max_length():
    """bio is capped at 300 characters."""
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        MemberProfileCreate(display_name="Alice", project="cognisphere", bio="A" * 301)

def test_visibility_overrides_defaults():
    """Default visibility: contact_email=False, city=True, social_links=True, age_range=False, professional_sector=False."""
    v = VisibilityOverrides()
    assert v.contact_email is False
    assert v.city is True
    assert v.social_links is True
    assert v.age_range is False
    assert v.professional_sector is False

def test_social_link_platform_enum():
    """Social link platform must be one of the allowed values."""
    link = SocialLink(platform="github", url="https://github.com/alice")
    assert link.platform == "github"

def test_member_profile_update_partial():
    """Update model allows partial updates."""
    update = MemberProfileUpdate(bio="New bio text")
    assert update.bio == "New bio text"
    assert update.display_name is None
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_models_member.py -p no:recording -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'models_member'`

**Step 3: Write the implementation**

```python
# backend/models_member.py
"""Pydantic models for the member_profiles collection."""
from pydantic import BaseModel, Field, field_validator
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
    # Normalize unicode (é -> e, etc.)
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

    project: ProjectType
    role_title: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    experience_level: Optional[ExperienceLevel] = None
    availability: Optional[Availability] = None

    age_range: Optional[AgeRange] = None
    professional_sector: Optional[ProfessionalSector] = None
    gender: Optional[Gender] = None

    contact_email: Optional[str] = None
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

    project: Optional[ProjectType] = None
    role_title: Optional[str] = None
    skills: Optional[list[str]] = None
    experience_level: Optional[ExperienceLevel] = None
    availability: Optional[Availability] = None

    age_range: Optional[AgeRange] = None
    professional_sector: Optional[ProfessionalSector] = None
    gender: Optional[Gender] = None

    contact_email: Optional[str] = None
    social_links: Optional[list[SocialLink]] = None


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

    project: ProjectType
    role_title: Optional[str] = None
    skills: list[str] = Field(default_factory=list)
    experience_level: Optional[ExperienceLevel] = None
    availability: Optional[Availability] = None

    age_range: Optional[AgeRange] = None
    professional_sector: Optional[ProfessionalSector] = None
    gender: Optional[Gender] = None

    contact_email: Optional[str] = None
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
```

**Step 4: Run test to verify it passes**

Run: `cd backend && python -m pytest tests/test_models_member.py -p no:recording -q`
Expected: 8 passed

**Step 5: Commit**

```bash
git add backend/models_member.py backend/tests/test_models_member.py
git commit -m "feat: add Pydantic models for member_profiles collection"
```

---

### Task 2: Backend — Members Router (Public Endpoints)

**Files:**
- Create: `backend/routes/members.py`
- Create: `backend/tests/routes/test_members.py`
- Modify: `backend/server.py` (register router)

**Step 1: Write the failing test**

```python
# backend/tests/routes/test_members.py
"""Tests for member profiles public + authenticated endpoints."""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from server import app
from routes.auth import get_db, get_current_user, require_admin
from models import User, UserRole
from datetime import datetime

client = TestClient(app)

MOCK_PROFILE = {
    "_id": "fake_oid",
    "id": "profile-1",
    "user_id": "user-1",
    "display_name": "Alice Dupont",
    "slug": "alice-dupont",
    "bio": "Développeuse passionnée",
    "avatar_url": None,
    "city": "Lyon",
    "region": "auvergne_rhone_alpes",
    "department": "69",
    "project": "cognisphere",
    "role_title": "Développeur Frontend",
    "skills": ["react", "typescript"],
    "experience_level": "professional",
    "availability": "regular",
    "age_range": "26-35",
    "professional_sector": "tech",
    "gender": "woman",
    "contact_email": "alice@public.com",
    "social_links": [
        {"platform": "linkedin", "url": "https://linkedin.com/in/alice", "label": None},
        {"platform": "github", "url": "https://github.com/alice", "label": None},
    ],
    "visible": True,
    "visibility_overrides": {
        "contact_email": True,
        "city": True,
        "social_links": True,
        "age_range": False,
        "professional_sector": False,
    },
    "candidature_id": "cand-1",
    "candidature_type": "tech",
    "membership_status": "active",
    "joined_at": datetime(2026, 1, 15),
    "last_active_at": None,
    "created_at": datetime(2026, 1, 15),
    "updated_at": datetime(2026, 3, 1),
}


def make_mock_db(profiles=None):
    """Create a mock database for member profiles."""
    db = MagicMock()
    if profiles is None:
        profiles = [MOCK_PROFILE]

    # Mock find() for listing — returns cursor with chaining
    cursor = MagicMock()
    cursor.sort = MagicMock(return_value=cursor)
    cursor.skip = MagicMock(return_value=cursor)
    cursor.limit = MagicMock(return_value=cursor)
    cursor.to_list = AsyncMock(return_value=profiles)
    db.member_profiles.find = MagicMock(return_value=cursor)

    # Mock find_one
    db.member_profiles.find_one = AsyncMock(return_value=profiles[0] if profiles else None)

    # Mock count_documents
    db.member_profiles.count_documents = AsyncMock(return_value=len(profiles))

    # Mock insert/update
    db.member_profiles.insert_one = AsyncMock()
    db.member_profiles.update_one = AsyncMock(return_value=MagicMock(matched_count=1))

    return db


def test_list_members_public():
    """GET /api/members returns visible profiles with filtered fields."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    response = client.get("/api/members")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert "members" in data
    assert len(data["members"]) == 1
    member = data["members"][0]
    assert member["display_name"] == "Alice Dupont"
    # Demographics should NOT be in public response
    assert "age_range" not in member
    assert "gender" not in member


def test_get_member_by_slug():
    """GET /api/members/{slug} returns a single profile."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    response = client.get("/api/members/alice-dupont")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Alice Dupont"
    assert data["slug"] == "alice-dupont"


def test_get_member_not_found():
    """GET /api/members/{slug} returns 404 for unknown slug."""
    db = make_mock_db(profiles=[])
    db.member_profiles.find_one = AsyncMock(return_value=None)
    app.dependency_overrides[get_db] = lambda: db
    response = client.get("/api/members/nonexistent")
    app.dependency_overrides.clear()

    assert response.status_code == 404


def test_get_my_profile():
    """GET /api/members/me returns own profile for authenticated user."""
    db = make_mock_db()
    mock_user = User(id="user-1", username="alice", email="alice@example.com", role=UserRole.USER)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    response = client.get("/api/members/me")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "Alice Dupont"


def test_update_my_profile():
    """PUT /api/members/me updates own profile."""
    db = make_mock_db()
    mock_user = User(id="user-1", username="alice", email="alice@example.com", role=UserRole.USER)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    response = client.put("/api/members/me", json={"bio": "Updated bio", "role_title": "Fullstack Dev"})
    app.dependency_overrides.clear()

    assert response.status_code == 200
    db.member_profiles.update_one.assert_called_once()


def test_update_visibility():
    """PATCH /api/members/me/visibility toggles visibility."""
    db = make_mock_db()
    mock_user = User(id="user-1", username="alice", email="alice@example.com", role=UserRole.USER)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: mock_user
    response = client.patch("/api/members/me/visibility", json={"visible": True})
    app.dependency_overrides.clear()

    assert response.status_code == 200
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/routes/test_members.py -p no:recording -q`
Expected: FAIL — router not registered, 404 on all endpoints

**Step 3: Write the implementation**

```python
# backend/routes/members.py
"""Member profiles endpoints — public listing, authenticated editing, admin management."""
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from routes.auth import get_db, get_current_user, require_admin
from models import User
from models_member import MemberProfileCreate, MemberProfileUpdate, VisibilityUpdate
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/members", tags=["Members"])

# Fields to NEVER expose publicly (demographics = admin-only)
PRIVATE_FIELDS = {"age_range", "gender", "professional_sector", "user_id", "candidature_id", "candidature_type"}


def _public_projection(profile: dict) -> dict:
    """Strip private fields and apply visibility overrides."""
    result = {k: v for k, v in profile.items() if k not in PRIVATE_FIELDS and k != "_id"}
    overrides = profile.get("visibility_overrides", {})
    if not overrides.get("contact_email", False):
        result.pop("contact_email", None)
    if not overrides.get("city", True):
        result.pop("city", None)
    if not overrides.get("social_links", True):
        result.pop("social_links", None)
    result.pop("visibility_overrides", None)
    return result


# --- Public endpoints ---

@router.get("")
async def list_members(
    project: str | None = None,
    region: str | None = None,
    skill: str | None = None,
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Public: list visible member profiles with optional filters."""
    query: dict = {"visible": True, "membership_status": "active"}
    if project:
        query["project"] = project
    if region:
        query["region"] = region
    if skill:
        query["skills"] = {"$in": [skill.lower()]}
    if search:
        query["display_name"] = {"$regex": search, "$options": "i"}

    total = await db.member_profiles.count_documents(query)
    cursor = db.member_profiles.find(query).sort("joined_at", -1).skip((page - 1) * limit).limit(limit)
    docs = await cursor.to_list(length=limit)

    members = [_public_projection(doc) for doc in docs]
    return {"members": members, "total": total, "page": page}


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Authenticated: get own full profile."""
    profile = await db.member_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouvé. Contactez un administrateur.")
    profile.pop("_id", None)
    return profile


@router.put("/me")
async def update_my_profile(
    data: MemberProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Authenticated: update own profile."""
    update_fields = {k: v for k, v in data.model_dump(exclude_none=True).items()}
    if not update_fields:
        raise HTTPException(status_code=400, detail="Aucune modification fournie")

    update_fields["updated_at"] = datetime.utcnow()
    result = await db.member_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return {"message": "Profil mis à jour"}


@router.patch("/me/visibility")
async def update_visibility(
    data: VisibilityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Authenticated: toggle visibility settings."""
    update_fields: dict = {"updated_at": datetime.utcnow()}
    if data.visible is not None:
        update_fields["visible"] = data.visible
    if data.visibility_overrides is not None:
        update_fields["visibility_overrides"] = data.visibility_overrides.model_dump()

    result = await db.member_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profil non trouvé")
    return {"message": "Visibilité mise à jour"}


@router.get("/{slug}")
async def get_member_by_slug(
    slug: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Public: get a single visible member profile by slug."""
    profile = await db.member_profiles.find_one({"slug": slug, "visible": True, "membership_status": "active"})
    if not profile:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    return _public_projection(profile)
```

**Step 4: Register the router in `server.py`**

Add to `backend/server.py` imports (line 14):
```python
from routes import auth, episodes, progress, videos, users, thematics, resources, partners, candidatures, events, analytics, contact, volunteers, members
```

Add after line 48 (`api_router.include_router(volunteers.router)`):
```python
api_router.include_router(members.router)
```

**Step 5: Run test to verify it passes**

Run: `cd backend && python -m pytest tests/routes/test_members.py -p no:recording -q`
Expected: 7 passed

**Step 6: Commit**

```bash
git add backend/routes/members.py backend/tests/routes/test_members.py backend/server.py
git commit -m "feat: add members router with public listing and authenticated profile endpoints"
```

---

### Task 3: Backend — Admin Endpoints + Profile Seeding

**Files:**
- Modify: `backend/routes/members.py` (add admin endpoints)
- Modify: `backend/tests/routes/test_members.py` (add admin tests)

**Step 1: Write the failing tests**

Add to `backend/tests/routes/test_members.py`:

```python
MOCK_ADMIN = User(id="admin-1", username="admin", email="admin@echo.fr", role=UserRole.ADMIN)

def test_admin_list_all_members():
    """GET /api/admin/members returns all profiles (including invisible) with demographics."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    response = client.get("/api/admin/members")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data["members"]) == 1
    # Admin CAN see demographics
    member = data["members"][0]
    assert "age_range" in member


def test_admin_seed_profile():
    """POST /api/admin/members/seed creates profile from candidature data."""
    db = make_mock_db(profiles=[])
    db.member_profiles.find_one = AsyncMock(return_value=None)
    db.tech_candidatures.find_one = AsyncMock(return_value={
        "id": "cand-123",
        "name": "Bob Martin",
        "email": "bob@example.com",
        "project": "echolink",
        "skills": "Python, FastAPI",
        "experience_level": "student",
    })
    db.users.find_one = AsyncMock(return_value={"id": "user-bob", "email": "bob@example.com"})
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    response = client.post("/api/admin/members/seed/cand-123", json={"candidature_type": "tech"})
    app.dependency_overrides.clear()

    assert response.status_code == 201
    db.member_profiles.insert_one.assert_called_once()


def test_admin_update_member_status():
    """PATCH /api/admin/members/{id}/status changes membership_status."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    response = client.patch("/api/admin/members/profile-1/status", json={"membership_status": "suspended"})
    app.dependency_overrides.clear()

    assert response.status_code == 200


def test_admin_analytics():
    """GET /api/admin/members/analytics returns aggregated stats."""
    db = make_mock_db()
    # Mock aggregate pipeline
    db.member_profiles.aggregate = MagicMock()
    db.member_profiles.aggregate.return_value.to_list = AsyncMock(return_value=[
        {"_id": "cognisphere", "count": 5},
        {"_id": "echolink", "count": 3},
    ])
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    response = client.get("/api/admin/members/analytics")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert "by_project" in data
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/routes/test_members.py -p no:recording -q`
Expected: FAIL on all 4 new tests (404 — endpoints don't exist yet)

**Step 3: Add admin endpoints to `backend/routes/members.py`**

```python
# --- Admin endpoints ---

admin_router = APIRouter(prefix="/admin/members", tags=["Admin Members"])


@admin_router.get("")
async def admin_list_members(
    project: str | None = None,
    status: str | None = None,
    region: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Admin: list all profiles with full data (including demographics)."""
    query: dict = {}
    if project:
        query["project"] = project
    if status:
        query["membership_status"] = status
    if region:
        query["region"] = region

    total = await db.member_profiles.count_documents(query)
    cursor = db.member_profiles.find(query, {"_id": 0}).sort("joined_at", -1).skip((page - 1) * limit).limit(limit)
    docs = await cursor.to_list(length=limit)

    return {"members": docs, "total": total, "page": page}


@admin_router.get("/analytics")
async def admin_analytics(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Admin: aggregated member analytics for recruitment dashboard."""
    import asyncio

    async def aggregate(field: str):
        pipeline = [
            {"$match": {"membership_status": "active"}},
            {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        return await db.member_profiles.aggregate(pipeline).to_list(length=None)

    by_project, by_region, by_sector, by_age, by_gender, by_experience = await asyncio.gather(
        aggregate("project"),
        aggregate("region"),
        aggregate("professional_sector"),
        aggregate("age_range"),
        aggregate("gender"),
        aggregate("experience_level"),
    )

    total = await db.member_profiles.count_documents({"membership_status": "active"})
    visible = await db.member_profiles.count_documents({"membership_status": "active", "visible": True})

    return {
        "total_active": total,
        "total_visible": visible,
        "by_project": by_project,
        "by_region": by_region,
        "by_sector": by_sector,
        "by_age": by_age,
        "by_gender": by_gender,
        "by_experience": by_experience,
    }


@admin_router.patch("/{profile_id}/status")
async def admin_update_member_status(
    profile_id: str,
    data: dict,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Admin: change membership_status (active, inactive, suspended, alumni)."""
    new_status = data.get("membership_status")
    if new_status not in ("active", "inactive", "suspended", "alumni"):
        raise HTTPException(status_code=400, detail="Statut invalide")

    update_fields = {"membership_status": new_status, "updated_at": datetime.utcnow()}
    if new_status in ("inactive", "suspended"):
        update_fields["visible"] = False

    result = await db.member_profiles.update_one(
        {"id": profile_id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profil non trouvé")

    logger.info(f"Admin {admin.id} set member {profile_id} status to {new_status}")
    return {"message": f"Statut mis à jour : {new_status}"}


@admin_router.post("/seed/{candidature_id}")
async def admin_seed_profile(
    candidature_id: str,
    data: dict,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Admin: create a member profile from an accepted candidature."""
    candidature_type = data.get("candidature_type", "tech")

    # Look up candidature
    collection = "tech_candidatures" if candidature_type == "tech" else "volunteer_applications"
    candidature = await db[collection].find_one({"id": candidature_id})
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")

    # Find linked user account (by email)
    user = await db.users.find_one({"email": candidature["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="Aucun compte utilisateur trouvé pour cet email")

    # Check if profile already exists
    existing = await db.member_profiles.find_one({"user_id": user["id"]})
    if existing:
        raise HTTPException(status_code=409, detail="Ce membre a déjà un profil")

    # Build profile from candidature data
    from models_member import _slugify
    skills_raw = candidature.get("skills", "")
    skills = [s.strip().lower() for s in skills_raw.split(",")] if isinstance(skills_raw, str) else skills_raw

    profile = {
        "id": str(__import__("uuid").uuid4()),
        "user_id": user["id"],
        "display_name": candidature["name"],
        "slug": _slugify(candidature["name"]),
        "bio": None,
        "avatar_url": None,
        "city": candidature.get("city"),
        "region": None,
        "department": None,
        "project": candidature.get("project", "benevole"),
        "role_title": None,
        "skills": skills,
        "experience_level": candidature.get("experience_level"),
        "availability": None,
        "age_range": None,
        "professional_sector": None,
        "gender": None,
        "contact_email": None,
        "social_links": [],
        "visible": False,
        "visibility_overrides": {
            "contact_email": False,
            "city": True,
            "social_links": True,
            "age_range": False,
            "professional_sector": False,
        },
        "candidature_id": candidature_id,
        "candidature_type": candidature_type,
        "membership_status": "active",
        "joined_at": datetime.utcnow(),
        "last_active_at": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db.member_profiles.insert_one(profile)

    # Mark user as member
    await db.users.update_one({"id": user["id"]}, {"$set": {"is_member": True, "member_since": datetime.utcnow()}})

    logger.info(f"Admin {admin.id} seeded profile for {candidature['name']} from {candidature_type} candidature {candidature_id}")
    return {"message": "Profil créé", "profile_id": profile["id"]}
```

**Step 4: Register admin_router in `server.py`**

After `api_router.include_router(members.router)`:
```python
from routes.members import admin_router as members_admin_router
api_router.include_router(members_admin_router)
```

Or simpler, in `members.py`, export both routers, and in `server.py`:
```python
api_router.include_router(members.router)
api_router.include_router(members.admin_router)
```

**Step 5: Run tests**

Run: `cd backend && python -m pytest tests/routes/test_members.py -p no:recording -q`
Expected: 11 passed

**Step 6: Commit**

```bash
git add backend/routes/members.py backend/tests/routes/test_members.py backend/server.py
git commit -m "feat: add admin member endpoints (analytics, seed, status management)"
```

---

### Task 4: Backend — MongoDB Indexes for member_profiles

**Files:**
- Modify: `backend/server.py` (add index creation in `startup_indexes`)

**Step 1: Add indexes to startup**

In `backend/server.py`, inside `startup_indexes()`, after existing index creation:

```python
    # Member profiles indexes
    try:
        await db.member_profiles.create_index("user_id", unique=True)
        await db.member_profiles.create_index("slug", unique=True)
        await db.member_profiles.create_index([("visible", 1), ("project", 1)])
        await db.member_profiles.create_index("membership_status")
    except Exception as e:
        logger.warning(f"Member profiles index creation: {e}")
```

**Step 2: Run all backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All pass

**Step 3: Commit**

```bash
git add backend/server.py
git commit -m "feat: add MongoDB indexes for member_profiles collection"
```

---

### Task 5: Frontend — API Config + Member Types

**Files:**
- Modify: `frontend/src/config/api.ts` (add MEMBERS_API)
- Create: `frontend/src/types/member.ts` (TypeScript types mirroring backend)

**Step 1: Add API endpoint constant**

In `frontend/src/config/api.ts`, add:
```typescript
export const MEMBERS_API = `${API_URL}/members`;
```

**Step 2: Create TypeScript types**

```typescript
// frontend/src/types/member.ts
export type ProjectType = 'cognisphere' | 'echolink' | 'scenariste' | 'benevole';
export type ExperienceLevel = 'professional' | 'student' | 'self_taught' | 'motivated';
export type Availability = 'punctual' | 'regular' | 'active';

export type SocialPlatform =
    | 'website' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook'
    | 'twitter' | 'youtube' | 'github' | 'behance' | 'vimeo' | 'other';

export interface SocialLink {
    platform: SocialPlatform;
    url: string;
    label?: string;
}

export interface MemberProfile {
    id: string;
    display_name: string;
    slug: string;
    bio?: string;
    avatar_url?: string;
    city?: string;
    region?: string;
    project: ProjectType;
    role_title?: string;
    skills: string[];
    experience_level?: string;
    availability?: string;
    contact_email?: string;
    social_links: SocialLink[];
    joined_at: string;
    membership_status: string;
}
```

**Step 3: Commit**

```bash
git add frontend/src/config/api.ts frontend/src/types/member.ts
git commit -m "feat: add member profile TypeScript types and API config"
```

---

### Task 6: Frontend — MemberModal Component

**Files:**
- Create: `frontend/src/components/partners/MemberModal.tsx`

**Step 1: Create the MemberModal component**

```tsx
// frontend/src/components/partners/MemberModal.tsx
import { Modal } from '../ui/Modal';
import { PROJECT_LABELS, EXPERIENCE_LABELS } from '../../config/candidatures';
import type { MemberProfile, SocialPlatform } from '../../types/member';
import {
    Globe, Linkedin, Instagram, Twitter, Youtube,
    Github, Facebook, ExternalLink, Mail, MapPin,
    Calendar, Clock, Code, Pen, Heart,
} from 'lucide-react';

interface MemberModalProps {
    member: MemberProfile | null;
    isOpen: boolean;
    onClose: () => void;
}

const SOCIAL_ICONS: Record<SocialPlatform, typeof Globe> = {
    website: Globe,
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    youtube: Youtube,
    github: Github,
    facebook: Facebook,
    tiktok: ExternalLink,
    behance: ExternalLink,
    vimeo: ExternalLink,
    other: ExternalLink,
};

const SOCIAL_COLORS: Partial<Record<SocialPlatform, string>> = {
    linkedin: '#0A66C2',
    instagram: '#E1306C',
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    github: '#FFFFFF',
    facebook: '#1877F2',
    tiktok: '#00F2EA',
};

const PROJECT_ICONS: Record<string, typeof Code> = {
    cognisphere: Code,
    echolink: Code,
    scenariste: Pen,
    benevole: Heart,
};

const AVAILABILITY_LABELS: Record<string, string> = {
    punctual: 'Ponctuel',
    regular: 'Régulier',
    active: 'Très actif',
};

export function MemberModal({ member, isOpen, onClose }: MemberModalProps) {
    if (!member) return null;

    const project = PROJECT_LABELS[member.project] || PROJECT_LABELS.benevole;
    const ProjectIcon = PROJECT_ICONS[member.project] || Heart;

    const joinedDate = new Date(member.joined_at).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-0 overflow-hidden">
            {/* Top color bar */}
            <div className="h-2 w-full" style={{ backgroundColor: project.color }} />

            <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 text-xl font-bold overflow-hidden"
                        style={{ backgroundColor: `${project.color}20`, color: project.color }}
                    >
                        {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.display_name} className="w-full h-full object-cover" />
                        ) : (
                            member.display_name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-serif text-white font-bold truncate">
                            {member.display_name}
                        </h2>
                        {member.role_title && (
                            <p className="text-sm text-neutral-400 mt-0.5">{member.role_title}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                            <ProjectIcon size={14} style={{ color: project.color }} />
                            <span className="text-xs font-medium" style={{ color: project.color }}>
                                {project.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bio */}
                {member.bio && (
                    <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                        {member.bio}
                    </p>
                )}

                {/* Skills */}
                {member.skills.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Compétences
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {member.skills.map(skill => (
                                <span
                                    key={skill}
                                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-neutral-300 border border-white/10"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {member.city && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <MapPin size={14} className="text-neutral-500 shrink-0" />
                            <span>{member.city}</span>
                        </div>
                    )}
                    {member.experience_level && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Code size={14} className="text-neutral-500 shrink-0" />
                            <span>{EXPERIENCE_LABELS[member.experience_level] || member.experience_level}</span>
                        </div>
                    )}
                    {member.availability && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Clock size={14} className="text-neutral-500 shrink-0" />
                            <span>{AVAILABILITY_LABELS[member.availability] || member.availability}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Calendar size={14} className="text-neutral-500 shrink-0" />
                        <span>Membre depuis {joinedDate}</span>
                    </div>
                </div>

                {/* Contact Email */}
                {member.contact_email && (
                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Contact
                        </h4>
                        <a
                            href={`mailto:${member.contact_email}`}
                            className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
                        >
                            <Mail size={14} />
                            {member.contact_email}
                        </a>
                    </div>
                )}

                {/* Social Links */}
                {member.social_links.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                            Réseaux
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {member.social_links.map((link, i) => {
                                const Icon = SOCIAL_ICONS[link.platform] || ExternalLink;
                                const color = SOCIAL_COLORS[link.platform] || '#9CA3AF';
                                return (
                                    <a
                                        key={`${link.platform}-${i}`}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={link.label || link.platform}
                                        className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:scale-110"
                                        style={{
                                            backgroundColor: `${color}15`,
                                            borderColor: `${color}30`,
                                            color: color,
                                        }}
                                    >
                                        <Icon size={16} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
```

**Step 2: Commit**

```bash
git add frontend/src/components/partners/MemberModal.tsx
git commit -m "feat: add MemberModal component for clickable member profiles"
```

---

### Task 7: Frontend — Make MemberCards Clickable + Integrate MemberModal

**Files:**
- Modify: `frontend/src/components/partners/MembersSection.tsx` (add click handler)
- Modify: `frontend/src/pages/PartnersPage.tsx` (add MemberModal + fetch from new API)

**Step 1: Update MembersSection to support clicks**

Modify `MembersSection.tsx` to accept an `onMemberClick` callback:

```tsx
// Add to MembersSectionProps:
interface MembersSectionProps {
    members: Member[];
    onMemberClick?: (slug: string) => void;
}

// In the member card div, add onClick + cursor:
<div
    key={`${member.name}-${i}`}
    className="p-4 rounded-xl bg-[#1A1A1A] border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
    onClick={() => onMemberClick?.(member.slug || '')}
>
```

Update the `Member` interface to include `slug`:
```typescript
export interface Member {
    name: string;
    project: string;
    skills: string;
    experience_level?: string;
    type: 'candidature' | 'volunteer';
    slug?: string;
}
```

**Step 2: Integrate MemberModal in PartnersPage**

In `frontend/src/pages/PartnersPage.tsx`:

1. Add imports:
```typescript
import { MemberModal } from '../components/partners/MemberModal';
import type { MemberProfile } from '../types/member';
import { MEMBERS_API } from '../config/api';
```

2. Add state:
```typescript
const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
```

3. Add handler to fetch full profile by slug:
```typescript
const handleMemberClick = async (slug: string) => {
    if (!slug) return;
    try {
        const res = await fetch(`${MEMBERS_API}/${slug}`);
        if (res.ok) {
            setSelectedMember(await res.json());
        }
    } catch (err) {
        console.error("Failed to fetch member profile", err);
    }
};
```

4. Pass `onMemberClick` to `MembersSection`:
```tsx
<MembersSection members={members} onMemberClick={handleMemberClick} />
```

5. Add `MemberModal` next to `PartnerModal`:
```tsx
<MemberModal
    member={selectedMember}
    isOpen={!!selectedMember}
    onClose={() => setSelectedMember(null)}
/>
```

**Step 3: Run frontend build + lint**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`
Expected: All pass

**Step 4: Commit**

```bash
git add frontend/src/components/partners/MembersSection.tsx frontend/src/pages/PartnersPage.tsx
git commit -m "feat: make member cards clickable with profile modal"
```

---

### Task 8: Frontend — Transition from Candidature-Based Members to Profile-Based

**Files:**
- Modify: `frontend/src/pages/PartnersPage.tsx` (fetch from MEMBERS_API instead of CANDIDATURES_API)

**Step 1: Update the initial data fetch**

Replace the members fetch in `fetchInitData`:

```typescript
// Before: fetch(`${CANDIDATURES_API}/members`)
// After:
const membersRes = await fetch(`${MEMBERS_API}?limit=100`);
if (membersRes.ok) {
    const data = await membersRes.json();
    // Map API response to Member interface for MembersSection
    const membersList = (data.members || []).map((m: MemberProfile) => ({
        name: m.display_name,
        project: m.project,
        skills: m.skills.join(', '),
        experience_level: m.experience_level,
        type: 'candidature' as const,
        slug: m.slug,
    }));
    setMembers(membersList);
}
```

**Note:** This replaces the candidatures-based member listing with the new member_profiles API. The old `/api/candidatures/members` endpoint remains for backward compatibility but is no longer used by the PartnersPage.

**Step 2: Run frontend build + lint**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`
Expected: All pass

**Step 3: Commit**

```bash
git add frontend/src/pages/PartnersPage.tsx
git commit -m "feat: switch PartnersPage to fetch members from profiles API"
```

---

### Task 9: Verification + Integration Test

**Step 1: Run full backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All pass

**Step 2: Run full frontend quality checks**

Run: `cd frontend && npx eslint . && npx vitest run && npm run build`
Expected: All pass

**Step 3: Manual verification checklist**

- [ ] Start backend and frontend dev servers
- [ ] Visit `/partenaires` page
- [ ] Verify member cards are visible
- [ ] Click a member card — modal opens with profile details
- [ ] Close modal (X button, click outside)
- [ ] Check modal shows: name, project badge, bio, skills, city, social links, joined date
- [ ] Verify demographics (age_range, gender) are NOT shown in public modal
- [ ] Check contact email only shows if member opted in

**Step 4: Commit final integration**

```bash
git commit -m "chore: verify member profiles integration"
```
