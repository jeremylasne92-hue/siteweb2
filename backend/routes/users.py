from datetime import datetime
from typing import Literal, Optional, List

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import User
from routes.auth import get_current_user, require_admin, get_db
from auth_utils import hash_password
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["User Management"])


class UsernameUpdateRequest(BaseModel):
    new_username: str


class PasswordResetRequest(BaseModel):
    new_password: str


class RoleUpdateRequest(BaseModel):
    role: Literal["user", "admin"]


@router.get("/admin")
async def list_users_admin(
    role: Optional[str] = Query(None, description="Filter by role: user, admin, partner"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List users with optional role filter (admin only)."""
    query: dict = {}
    if role:
        query["role"] = role

    users = await db.users.find(
        query,
        {"password_hash": 0, "totp_secret": 0},
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)

    total = await db.users.count_documents(query)

    return {"users": users, "total": total, "skip": skip, "limit": limit}


@router.put("/admin/{user_id}/role")
async def update_user_role(
    user_id: str,
    body: RoleUpdateRequest,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a user's role (admin only). 6 security guards enforced."""
    # Guard 1: require_admin (via Depends) — non-admins get 403

    # Guard 2: no self-modification
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role",
        )

    # Guard 3: target must exist
    target = await db.users.find_one({"id": user_id}, {"role": 1, "email": 1, "username": 1})
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    old_role = target.get("role", "user")

    # Guard 4: no-op check
    if old_role == body.role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User already has role '{body.role}'",
        )

    # Guard 5: partner role managed via partner workflow
    if old_role == "partner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Partner role is managed via partner application workflow",
        )

    # Guard 6: protect last admin
    if old_role == "admin" and body.role != "admin":
        admin_count = await db.users.count_documents({"role": "admin"})
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove the last admin",
            )

    # Apply role change
    await db.users.update_one({"id": user_id}, {"$set": {"role": body.role}})

    # Persistent audit log
    await db.admin_audit.insert_one({
        "action": "role_change",
        "admin_id": admin.id,
        "admin_email": admin.email,
        "target_user_id": user_id,
        "target_email": target.get("email"),
        "old_role": old_role,
        "new_role": body.role,
        "created_at": datetime.utcnow(),
    })

    logger.info(
        f"Admin {admin.id} changed role of user {user_id} "
        f"from '{old_role}' to '{body.role}'"
    )

    return {
        "message": f"Role updated from '{old_role}' to '{body.role}'",
        "user_id": user_id,
        "old_role": old_role,
        "new_role": body.role,
    }


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
    body: UsernameUpdateRequest,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update user's username (admin only)"""
    # Check if username already exists
    existing = await db.users.find_one({"username": body.new_username, "id": {"$ne": user_id}})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"username": body.new_username}}
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
    body: PasswordResetRequest,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reset user's password (admin only)"""
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": hash_password(body.new_password)}}
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
