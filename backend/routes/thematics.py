from fastapi import APIRouter, HTTPException, Depends, status
from models_extended import Thematic, Resource, Actor
from models import User
from routes.auth import get_current_user, require_admin, get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/thematics", tags=["Thematics"])


@router.get("/episode/{episode_id}", response_model=List[Thematic])
async def get_episode_thematics(
    episode_id: str,
    skip: int = 0,
    limit: int = 50,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all thematics for an episode with pagination"""
    thematics = await db.thematics.find(
        {"episode_id": episode_id}
    ).sort("order", 1).skip(skip).limit(limit).to_list(limit)
    
    return [Thematic(**t) for t in thematics]


@router.post("", response_model=Thematic)
async def create_thematic(
    thematic: Thematic,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create new thematic (admin only)"""
    await db.thematics.insert_one(thematic.dict())
    logger.info(f"Created thematic: {thematic.title}")
    return thematic


@router.put("/{thematic_id}", response_model=Thematic)
async def update_thematic(
    thematic_id: str,
    thematic: Thematic,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update thematic (admin only)"""
    result = await db.thematics.update_one(
        {"id": thematic_id},
        {"$set": thematic.dict()}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thematic not found"
        )
    
    return thematic


@router.delete("/{thematic_id}")
async def delete_thematic(
    thematic_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete thematic (admin only)"""
    result = await db.thematics.delete_one({"id": thematic_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thematic not found"
        )
    
    return {"message": "Thematic deleted"}
