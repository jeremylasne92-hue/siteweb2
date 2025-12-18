from fastapi import APIRouter, HTTPException, Depends, status
from models_extended import Resource, Actor
from models import User
from routes.auth import get_current_user, require_admin, get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/episode/{episode_id}", response_model=List[Resource])
async def get_episode_resources(
    episode_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all resources for an episode"""
    resources = await db.resources.find(
        {"episode_id": episode_id}
    ).sort("order", 1).to_list(1000)
    
    return [Resource(**r) for r in resources]


@router.post("", response_model=Resource)
async def create_resource(
    resource: Resource,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create new resource (admin only)"""
    await db.resources.insert_one(resource.dict())
    logger.info(f"Created resource: {resource.title}")
    return resource


@router.delete("/{resource_id}")
async def delete_resource(
    resource_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete resource (admin only)"""
    result = await db.resources.delete_one({"id": resource_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    return {"message": "Resource deleted"}


# Actors endpoints
actors_router = APIRouter(prefix="/actors", tags=["Actors"])


@actors_router.get("", response_model=List[Actor])
async def get_all_actors(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all actors"""
    actors = await db.actors.find().sort("order", 1).to_list(1000)
    return [Actor(**a) for a in actors]


@actors_router.post("", response_model=Actor)
async def create_actor(
    actor: Actor,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create new actor (admin only)"""
    await db.actors.insert_one(actor.dict())
    return actor


@actors_router.delete("/{actor_id}")
async def delete_actor(
    actor_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete actor (admin only)"""
    result = await db.actors.delete_one({"id": actor_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actor not found"
        )
    
    return {"message": "Actor deleted"}
