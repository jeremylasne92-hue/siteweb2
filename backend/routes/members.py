"""Member profiles public + authenticated endpoints."""
from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from routes.auth import get_db, get_current_user
from models import User
from models_member import MemberProfileUpdate, VisibilityUpdate
from datetime import datetime
import logging

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


@router.put("/me")
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
        query["$or"] = [
            {"display_name": {"$regex": search, "$options": "i"}},
            {"bio": {"$regex": search, "$options": "i"}},
            {"skills": {"$regex": search, "$options": "i"}},
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
