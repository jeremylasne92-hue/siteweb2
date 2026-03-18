from fastapi import APIRouter, HTTPException, Depends, status
from starlette.responses import StreamingResponse
from models import Episode, EpisodeOptIn, EpisodeOptInRequest, User
from routes.auth import get_current_user, require_admin, get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
import csv
import io
import logging
from utils.date_helpers import format_date_csv

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/episodes", tags=["Episodes"])


@router.get("/stats")
async def get_episode_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get episode statistics"""
    total = await db.episodes.count_documents({})
    published = await db.episodes.count_documents({"is_published": True})
    
    return {
        "total": total,
        "published": published,
        "unpublished": total - published
    }


@router.get("", response_model=List[Episode])
async def get_episodes(season: Optional[int] = None, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all episodes, optionally filtered by season"""
    query = {}
    if season:
        query["season"] = season
    
    episodes = await db.episodes.find(query).sort([("season", 1), ("episode", 1)]).to_list(length=100)
    return [Episode(**ep) for ep in episodes]


@router.get("/{episode_id}", response_model=Episode)
async def get_episode(episode_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get specific episode"""
    episode_doc = await db.episodes.find_one({"id": episode_id})
    
    if not episode_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episode not found"
        )
    
    return Episode(**episode_doc)


@router.post("", response_model=Episode)
async def create_episode(
    episode_data: Episode,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create new episode (admin only)"""
    # Check if episode already exists
    existing = await db.episodes.find_one({
        "season": episode_data.season,
        "episode": episode_data.episode
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Episode already exists"
        )
    
    await db.episodes.insert_one(episode_data.model_dump())
    logger.info(f"Created episode S{episode_data.season}E{episode_data.episode}")
    
    return episode_data


@router.put("/{episode_id}", response_model=Episode)
async def update_episode(
    episode_id: str,
    episode_data: Episode,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update episode (admin only)"""
    existing = await db.episodes.find_one({"id": episode_id})
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episode not found"
        )
    
    from datetime import datetime, UTC
    episode_data.updated_at = datetime.now(UTC)
    
    await db.episodes.update_one(
        {"id": episode_id},
        {"$set": episode_data.model_dump()}
    )
    
    logger.info(f"Updated episode {episode_id}")
    return episode_data


@router.delete("/{episode_id}")
async def delete_episode(
    episode_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete episode (admin only)"""
    result = await db.episodes.delete_one({"id": episode_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Episode not found"
        )
    
    logger.info(f"Deleted episode {episode_id}")
    return {"message": "Episode deleted successfully"}


# ==================== OPT-IN ROUTES ====================

@router.post("/opt-in")
async def create_optin(
    data: EpisodeOptInRequest,
    user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Subscribe to episode release notification (auth required)"""
    # Check if already opted in (idempotent)
    existing = await db.episode_optins.find_one({
        "user_id": user.id,
        "season": data.season,
        "episode": data.episode
    })
    if existing:
        return {"message": "Already subscribed", "already_subscribed": True}

    optin = EpisodeOptIn(
        user_id=user.id,
        season=data.season,
        episode=data.episode
    )
    await db.episode_optins.insert_one(optin.model_dump())
    logger.info(f"User {user.id} opted in for S{data.season}E{data.episode}")
    return {"message": "Subscribed successfully", "already_subscribed": False}


@router.get("/opt-in/me")
async def get_my_optins(
    user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all opt-ins for the current user"""
    optins = await db.episode_optins.find(
        {"user_id": user.id}
    ).to_list(100)
    return [{"season": o["season"], "episode": o["episode"]} for o in optins]


def _sanitize_csv_cell(value) -> str:
    """Escape CSV injection characters for Excel safety."""
    s = str(value) if value is not None else ""
    if s and s[0] in ('=', '+', '-', '@', '\t', '\r'):
        return "'" + s
    return s


# ==================== ADMIN EXPORT ROUTES ====================

@router.get("/admin/export-optins")
async def export_optins_csv(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Export all opt-in emails as CSV (admin only)"""
    optins = await db.episode_optins.find().to_list(length=10000)

    # Build user_id -> email lookup
    user_ids = list({o["user_id"] for o in optins})
    emails_map = {}
    if user_ids:
        users = await db.users.find({"id": {"$in": user_ids}}).to_list(length=10000)
        emails_map = {u["id"]: u.get("email", "") for u in users}

    # Generate CSV with UTF-8 BOM for Excel compatibility
    output = io.StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(["email", "season", "episode", "created_at"])
    for o in optins:
        created = format_date_csv(o.get("created_at"))
        writer.writerow([
            _sanitize_csv_cell(emails_map.get(o["user_id"], "")),
            o["season"],
            o["episode"],
            created,
        ])

    output.seek(0)
    logger.info(f"Admin {admin.id} exported {len(optins)} opt-in records")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=optins-export.csv"}
    )
