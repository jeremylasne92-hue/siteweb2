from fastapi import APIRouter, HTTPException, Depends, status
from models import Episode, User
from routes.auth import get_current_user, require_admin, get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
import logging

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
    
    episodes = await db.episodes.find(query).sort([("season", 1), ("episode", 1)]).to_list(1000)
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
    
    await db.episodes.insert_one(episode_data.dict())
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
    
    from datetime import datetime
    episode_data.updated_at = datetime.utcnow()
    
    await db.episodes.update_one(
        {"id": episode_id},
        {"$set": episode_data.dict()}
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
