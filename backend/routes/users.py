from fastapi import APIRouter, HTTPException, Depends, status
from models import User
from routes.auth import get_current_user, require_admin, get_db
from auth_utils import hash_password
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/count")
async def count_users(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get total user count (admin only)"""
    total = await db.users.count_documents({})
    return {"total": total}


@router.get("")
async def get_all_users(
    skip: int = 0,
    limit: int = 30,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all users with pagination (admin only)"""
    users = await db.users.find(
        {},
        {"password_hash": 0, "totp_secret": 0}  # Exclude sensitive fields
    ).skip(skip).limit(limit).to_list(limit)
    
    total = await db.users.count_documents({})
    
    return {
        "users": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.put("/{user_id}/username")
async def update_username(
    user_id: str,
    new_username: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update user's username (admin only)"""
    # Check if username already exists
    existing = await db.users.find_one({"username": new_username, "id": {"$ne": user_id}})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"username": new_username}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"Admin updated username for user {user_id}")
    return {"message": "Username updated"}


@router.put("/{user_id}/password")
async def reset_user_password(
    user_id: str,
    new_password: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reset user's password (admin only)"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": hash_password(new_password)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"Admin reset password for user {user_id}")
    return {"message": "Password reset"}


@router.delete("/{user_id}")
async def delete_user_by_admin(
    user_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete user (admin only)"""
    # Prevent admin from deleting themselves
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Delete user and related data
    await db.users.delete_one({"id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.video_progress.delete_many({"user_id": user_id})
    await db.pending_2fa.delete_many({"user_id": user_id})
    
    logger.info(f"Admin deleted user {user_id}")
    return {"message": "User deleted"}
