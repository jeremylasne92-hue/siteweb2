from fastapi import APIRouter, HTTPException, Depends, status
from models import VideoProgress, VideoProgressCreate, User
from routes.auth import get_current_user, get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/progress", tags=["Video Progress"])


@router.get("/last-watched")
async def get_last_watched(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get last watched episode for user"""
    progress_doc = await db.video_progress.find_one(
        {"user_id": current_user.id},
        sort=[("last_updated", -1)]
    )
    
    if not progress_doc:
        return None
    
    # Get episode details
    episode = await db.episodes.find_one({"id": progress_doc["episode_id"]})
    
    return {
        "episode_id": progress_doc["episode_id"],
        "season": progress_doc["season"],
        "episode": progress_doc["episode"],
        "current_time": progress_doc["current_time"],
        "duration": progress_doc["duration"],
        "progress_percent": progress_doc["progress_percent"],
        "title": episode["title"] if episode else "Unknown"
    }


@router.get("/{episode_id}")
async def get_episode_progress(
    episode_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get progress for specific episode"""
    progress_doc = await db.video_progress.find_one({
        "user_id": current_user.id,
        "episode_id": episode_id
    })
    
    if not progress_doc:
        return None
    
    return VideoProgress(**progress_doc)


@router.post("")
async def save_progress(
    progress_data: VideoProgressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Save or update video progress"""
    # Calculate progress percent
    progress_percent = 0
    if progress_data.duration > 0:
        progress_percent = (progress_data.current_time / progress_data.duration) * 100
    
    # Delete if < 5% or > 95%
    if progress_percent < 5 or progress_percent > 95:
        await db.video_progress.delete_one({
            "user_id": current_user.id,
            "episode_id": progress_data.episode_id
        })
        return {"message": "Progress cleared"}
    
    # Create full VideoProgress object
    full_progress = VideoProgress(
        user_id=current_user.id,
        episode_id=progress_data.episode_id,
        season=progress_data.season,
        episode=progress_data.episode,
        current_time=progress_data.current_time,
        duration=progress_data.duration,
        progress_percent=progress_percent,
        last_updated=datetime.utcnow()
    )
    
    # Upsert progress
    await db.video_progress.update_one(
        {
            "user_id": current_user.id,
            "episode_id": progress_data.episode_id
        },
        {"$set": full_progress.dict()},
        upsert=True
    )
    
    return {"message": "Progress saved"}
