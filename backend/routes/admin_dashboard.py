from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models import User
from routes.auth import get_db, require_admin
import asyncio

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/pending")
async def get_pending_counts(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Aggregated counts of items pending admin action."""
    (
        partners_pending,
        candidatures_pending,
        volunteers_pending,
        members_pending,
        messages_unread,
        recent_actions,
    ) = await asyncio.gather(
        db.partners.count_documents({"status": "pending"}),
        db.tech_candidatures.count_documents({"status": "pending"}),
        db.volunteer_applications.count_documents({"status": "pending"}),
        db.member_profiles.count_documents({"membership_status": "pending"}),
        db.contact_messages.count_documents(
            {"$or": [{"status": "unread"}, {"status": {"$exists": False}}]}
        ),
        db.admin_actions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(length=5),
    )

    total = (
        partners_pending
        + candidatures_pending
        + volunteers_pending
        + members_pending
        + messages_unread
    )

    return {
        "partners": partners_pending,
        "candidatures": candidatures_pending,
        "volunteers": volunteers_pending,
        "members": members_pending,
        "messages": messages_unread,
        "total": total,
        "recent_actions": recent_actions,
    }
