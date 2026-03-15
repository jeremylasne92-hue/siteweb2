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


@router.get("/map")
async def list_members_for_map(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return geocoded members for map display (public, minimal data)."""
    cursor = db.member_profiles.find(
        {
            "visible": True,
            "membership_status": "active",
            "latitude": {"$ne": None},
            "longitude": {"$ne": None},
        },
        {"_id": 0, "city": 1, "latitude": 1, "longitude": 1},
    )
    members = await cursor.to_list(length=500)
    return members


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
    candidature_type: Literal["tech", "volunteer", "scenariste"]


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


@admin_router.patch("/{profile_id}")
async def admin_update_member(
    profile_id: str,
    data: MemberProfileUpdate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Full update of a member profile. Admin only."""
    update_data = data.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour")
    update_data["updated_at"] = datetime.utcnow()

    result = await db.member_profiles.update_one(
        {"id": profile_id},
        {"$set": update_data},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profil non trouvé")

    updated = await db.member_profiles.find_one({"id": profile_id})
    updated.pop("_id", None)
    logger.info(f"Admin {admin.id} updated member profile {profile_id}")
    return updated


# ---- auto_seed helper ----


def _map_role_title(candidature: dict, candidature_type: str) -> str:
    """Map candidature_type to an appropriate role_title."""
    if candidature_type == "volunteer":
        return "Bénévole"
    if candidature_type == "scenariste":
        return "Scénariste"
    # tech: use the project name from candidature
    return candidature.get("project", "tech")


def _map_project(candidature: dict, candidature_type: str) -> str:
    """Map candidature_type to project field."""
    if candidature_type == "volunteer":
        return "benevole"
    return candidature.get("project", "benevole")


async def auto_seed_member_profile(
    db: AsyncIOMotorDatabase,
    candidature: dict,
    candidature_type: str,
) -> dict | None:
    """Create or reactivate a member profile from a candidature dict.

    If a profile already exists for this candidature_id and is inactive,
    reactivate it. Returns the profile dict, or None if already active.
    """
    candidature_id = candidature["id"]

    # Check for existing profile by candidature_id
    existing = await db.member_profiles.find_one({"candidature_id": candidature_id})
    if existing:
        if existing.get("membership_status") == "active" and existing.get("visible"):
            return None  # Already active, nothing to do
        # Reactivate the existing profile
        await db.member_profiles.update_one(
            {"candidature_id": candidature_id},
            {"$set": {"visible": True, "membership_status": "active", "updated_at": datetime.utcnow()}},
        )
        logger.info("Member profile reactivated for candidature %s", candidature_id)
        existing["visible"] = True
        existing["membership_status"] = "active"
        return existing

    # Build display_name from name field, fallback to email prefix
    display_name = (candidature.get("name") or "").strip()
    if not display_name:
        email = candidature.get("email", "")
        display_name = email.split("@")[0] if email else "membre"

    # Normalize skills
    skills_raw = candidature.get("skills", [])
    if isinstance(skills_raw, str):
        skills = [s.strip().lower() for s in skills_raw.split(",") if s.strip()]
    else:
        skills = [s.strip().lower() for s in skills_raw if s.strip()]

    # Generate unique slug
    base_slug = _slugify(display_name)
    slug = base_slug
    counter = 1
    # Check slug uniqueness with a single query instead of N+1
    existing_slugs_docs = await db.member_profiles.find(
        {"slug": {"$regex": f"^{re.escape(base_slug)}(-\\d+)?$"}},
        {"slug": 1, "_id": 0},
    ).to_list(length=100)
    existing_slugs = {doc["slug"] for doc in existing_slugs_docs}
    while slug in existing_slugs:
        slug = f"{base_slug}-{counter}"
        counter += 1

    now = datetime.utcnow()
    profile = {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "display_name": display_name,
        "slug": slug,
        "bio": candidature.get("bio"),
        "avatar_url": candidature.get("avatar_url"),
        "city": candidature.get("city"),
        "region": candidature.get("region"),
        "department": candidature.get("department"),
        "latitude": candidature.get("latitude"),
        "longitude": candidature.get("longitude"),
        "project": _map_project(candidature, candidature_type),
        "role_title": _map_role_title(candidature, candidature_type),
        "skills": skills,
        "experience_level": candidature.get("experience_level"),
        "availability": candidature.get("availability"),
        "age_range": candidature.get("age_range"),
        "professional_sector": candidature.get("professional_sector"),
        "gender": candidature.get("gender"),
        "contact_email": candidature.get("email"),
        "social_links": candidature.get("social_links", []),
        "visible": True,
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
        "joined_at": now,
        "created_at": now,
        "updated_at": now,
    }

    # Look up user by email — if found, link profile and mark as member
    email = candidature.get("email")
    if email:
        user = await db.users.find_one({"email": email})
        if user:
            profile["user_id"] = user["id"]
            await db.users.update_one(
                {"id": user["id"]},
                {"$set": {"is_member": True, "member_since": now}},
            )
        else:
            logger.warning("No user account for email %s — profile created without user link", email)

    await db.member_profiles.insert_one(profile)
    logger.info("Member profile created: %s (slug=%s)", display_name, slug)

    return profile


async def deactivate_member_profile(
    db: AsyncIOMotorDatabase,
    candidature_id: str,
) -> bool:
    """Deactivate (hide) a member profile linked to a candidature.

    Returns True if a profile was deactivated, False if none found.
    """
    result = await db.member_profiles.update_one(
        {"candidature_id": candidature_id},
        {"$set": {"visible": False, "membership_status": "inactive", "updated_at": datetime.utcnow()}},
    )
    if result.matched_count > 0:
        logger.info("Member profile deactivated for candidature %s", candidature_id)
        return True
    return False


@admin_router.post("/seed/{candidature_id}", status_code=201)
async def admin_seed_profile(
    candidature_id: str,
    body: SeedRequest,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a member profile from an accepted candidature. Admin only."""
    # Look up candidature
    collection_map = {
        "tech": "tech_candidatures",
        "volunteer": "volunteer_applications",
        "scenariste": "scenariste_candidatures",
    }
    collection = collection_map.get(body.candidature_type, "volunteer_applications")
    candidature = await db[collection].find_one({"id": candidature_id})
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature non trouvee")

    if candidature.get("status") != "accepted":
        raise HTTPException(status_code=400, detail="Candidature non acceptee")

    result = await auto_seed_member_profile(db, candidature, body.candidature_type)
    if result is None:
        raise HTTPException(status_code=409, detail="Profil deja existant")

    return {"profile_id": result["id"], "slug": result["slug"]}


@admin_router.post("/backfill-geocoding")
async def admin_backfill_geocoding(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Geocode all members and volunteer applications that have a city but no coordinates. Admin only."""
    from utils.geocode import geocode_city

    updated_members = 0
    updated_volunteers = 0

    # Backfill member profiles
    cursor = db.member_profiles.find({
        "city": {"$ne": None, "$ne": ""},
        "$or": [{"latitude": None}, {"latitude": {"$exists": False}}],
    })
    async for doc in cursor:
        coords = await geocode_city(doc["city"])
        if coords:
            await db.member_profiles.update_one(
                {"id": doc["id"]},
                {"$set": {"latitude": coords[0], "longitude": coords[1]}},
            )
            updated_members += 1
        await asyncio.sleep(1.1)  # Nominatim rate limit: 1 req/sec

    # Backfill volunteer applications
    cursor = db.volunteer_applications.find({
        "city": {"$ne": None, "$ne": ""},
        "$or": [{"latitude": None}, {"latitude": {"$exists": False}}],
    })
    async for doc in cursor:
        coords = await geocode_city(doc["city"])
        if coords:
            await db.volunteer_applications.update_one(
                {"id": doc["id"]},
                {"$set": {"latitude": coords[0], "longitude": coords[1]}},
            )
            updated_volunteers += 1
        await asyncio.sleep(1.1)  # Nominatim rate limit: 1 req/sec

    logger.info(f"Admin {admin.id} backfilled geocoding: {updated_members} members, {updated_volunteers} volunteers")
    return {
        "message": f"Géocodage terminé : {updated_members} membres, {updated_volunteers} bénévoles mis à jour",
        "updated_members": updated_members,
        "updated_volunteers": updated_volunteers,
    }
