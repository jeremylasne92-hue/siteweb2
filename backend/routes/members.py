"""Member profiles public + authenticated + admin endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from routes.auth import get_db, get_current_user, require_admin
from models import User
from models_member import MemberProfileUpdate, VisibilityUpdate, MembershipStatus, _slugify
from datetime import datetime
from typing import Literal
import asyncio
import logging
import re
import uuid

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/members", tags=["Members"])

PRIVATE_FIELDS = {
    "age_range", "gender", "professional_sector",
    "user_id", "candidature_id", "candidature_type",
}


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


# ---- Authenticated endpoints (must be before /{slug}) ----

@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get own full profile by user_id."""
    profile = await db.member_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Profil non trouve")
    profile.pop("_id", None)
    return profile


@router.patch("/me")
async def update_my_profile(
    data: MemberProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update own profile (partial update)."""
    update_data = data.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.utcnow()

    result = await db.member_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profil non trouve")

    updated = await db.member_profiles.find_one({"user_id": current_user.id})
    updated.pop("_id", None)
    return updated


@router.patch("/me/visibility")
async def update_visibility(
    data: VisibilityUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Toggle visible flag and visibility_overrides."""
    update_data = {}
    if data.visible is not None:
        update_data["visible"] = data.visible
    if data.visibility_overrides is not None:
        update_data["visibility_overrides"] = data.visibility_overrides.model_dump()
    update_data["updated_at"] = datetime.utcnow()

    result = await db.member_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profil non trouve")

    updated = await db.member_profiles.find_one({"user_id": current_user.id})
    updated.pop("_id", None)
    return updated


# ---- Public endpoints ----

@router.get("/")
async def list_members(
    project: str | None = Query(None),
    region: str | None = Query(None),
    skill: str | None = Query(None),
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List visible, active member profiles with optional filters."""
    query: dict = {"visible": True, "membership_status": "active"}

    if project:
        query["project"] = project
    if region:
        query["region"] = region
    if skill:
        query["skills"] = skill.lower()
    if search:
        safe_search = re.escape(search)
        query["$or"] = [
            {"display_name": {"$regex": safe_search, "$options": "i"}},
            {"bio": {"$regex": safe_search, "$options": "i"}},
            {"skills": {"$regex": safe_search, "$options": "i"}},
        ]

    total = await db.member_profiles.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.member_profiles.find(query).sort("joined_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    members = [_public_projection(doc) for doc in docs]
    return {"members": members, "total": total, "page": page}


@router.get("/{slug}")
async def get_member_by_slug(
    slug: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get a single visible member profile by slug."""
    profile = await db.member_profiles.find_one({
        "slug": slug,
        "visible": True,
        "membership_status": "active",
    })
    if not profile:
        raise HTTPException(status_code=404, detail="Membre non trouve")
    return _public_projection(profile)


# ---- Admin endpoints ----

admin_router = APIRouter(prefix="/admin/members", tags=["Admin Members"])


class StatusUpdate(BaseModel):
    membership_status: MembershipStatus


class SeedRequest(BaseModel):
    candidature_type: Literal["tech", "volunteer"]


@admin_router.get("/")
async def admin_list_members(
    project: str | None = Query(None),
    status: str | None = Query(None),
    region: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List ALL profiles (including invisible, with demographics). Admin only."""
    query: dict = {}
    if project:
        query["project"] = project
    if status:
        query["membership_status"] = status
    if region:
        query["region"] = region

    total = await db.member_profiles.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.member_profiles.find(query).sort("joined_at", -1).skip(skip).limit(limit)
    docs = await cursor.to_list(length=limit)

    members = []
    for doc in docs:
        doc.pop("_id", None)
        members.append(doc)

    return {"members": members, "total": total, "page": page}


@admin_router.get("/analytics")
async def admin_analytics(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Aggregated member stats. Admin only."""
    fields = {
        "by_project": "project",
        "by_region": "region",
        "by_sector": "professional_sector",
        "by_age": "age_range",
        "by_gender": "gender",
        "by_experience": "experience_level",
    }

    async def run_pipeline(field: str):
        pipeline = [
            {"$match": {"membership_status": "active"}},
            {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ]
        return await db.member_profiles.aggregate(pipeline).to_list(length=None)

    results = await asyncio.gather(
        *[run_pipeline(f) for f in fields.values()]
    )

    data = {}
    for key, result in zip(fields.keys(), results):
        data[key] = result

    data["total_active"] = await db.member_profiles.count_documents(
        {"membership_status": "active"}
    )
    data["total_visible"] = await db.member_profiles.count_documents(
        {"membership_status": "active", "visible": True}
    )

    return data


@admin_router.patch("/{profile_id}/status")
async def admin_update_status(
    profile_id: str,
    body: StatusUpdate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Change membership_status. Admin only."""
    update: dict = {"membership_status": body.membership_status, "updated_at": datetime.utcnow()}
    if body.membership_status in ("inactive", "suspended"):
        update["visible"] = False

    result = await db.member_profiles.update_one(
        {"id": profile_id},
        {"$set": update},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profil non trouve")
    return {"status": "updated", "membership_status": body.membership_status}


@admin_router.post("/seed/{candidature_id}", status_code=201)
async def admin_seed_profile(
    candidature_id: str,
    body: SeedRequest,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a member profile from an accepted candidature. Admin only."""
    # Look up candidature
    collection = "tech_candidatures" if body.candidature_type == "tech" else "volunteer_applications"
    candidature = await db[collection].find_one({"id": candidature_id})
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature non trouvee")

    if candidature.get("status") != "accepted":
        raise HTTPException(status_code=400, detail="Candidature non acceptee")

    # Find linked user
    user = await db.users.find_one({"email": candidature["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")

    user_id = user["id"]

    # Check no existing profile
    existing = await db.member_profiles.find_one({"user_id": user_id})
    if existing:
        raise HTTPException(status_code=409, detail="Profil deja existant")

    # Build profile
    display_name = f"{candidature.get('first_name', '')} {candidature.get('last_name', '')}".strip()
    skills_raw = candidature.get("skills", [])
    if isinstance(skills_raw, str):
        skills = [s.strip().lower() for s in skills_raw.split(",") if s.strip()]
    else:
        skills = [s.strip().lower() for s in skills_raw if s.strip()]

    # Generate unique slug
    base_slug = _slugify(display_name)
    slug = base_slug
    counter = 1
    while await db.member_profiles.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    now = datetime.utcnow()
    profile = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "display_name": display_name,
        "slug": slug,
        "bio": candidature.get("bio"),
        "avatar_url": candidature.get("avatar_url"),
        "city": candidature.get("city"),
        "region": candidature.get("region"),
        "department": candidature.get("department"),
        "project": candidature.get("project", "benevole"),
        "role_title": candidature.get("role_title"),
        "skills": skills,
        "experience_level": candidature.get("experience_level"),
        "availability": candidature.get("availability"),
        "age_range": candidature.get("age_range"),
        "professional_sector": candidature.get("professional_sector"),
        "gender": candidature.get("gender"),
        "contact_email": candidature.get("email"),
        "social_links": candidature.get("social_links", []),
        "visible": False,
        "visibility_overrides": {
            "contact_email": False,
            "city": True,
            "social_links": True,
            "age_range": False,
            "professional_sector": False,
        },
        "candidature_id": candidature_id,
        "candidature_type": body.candidature_type,
        "membership_status": "active",
        "joined_at": now,
        "created_at": now,
        "updated_at": now,
    }

    await db.member_profiles.insert_one(profile)

    # Mark user as member
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_member": True, "member_since": now}},
    )

    return {"profile_id": profile["id"], "slug": profile["slug"]}
