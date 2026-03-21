"""Onboarding email sequence — cron endpoint + admin stats."""
import logging
from datetime import datetime, timedelta, UTC
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import User
from routes.auth import get_db, require_admin
from routes.newsletter import _build_unsubscribe_url
from email_service import send_onboarding_coulisses, send_onboarding_candidature
from core.config import settings

logger = logging.getLogger(__name__)

# Module-level monitoring variable
_last_cron_run: Optional[datetime] = None

# Cron router — no auth dependency, uses X-Cron-Secret header
router = APIRouter(prefix="/cron", tags=["Cron"])

# Admin router — requires admin auth
admin_router = APIRouter(prefix="/admin/onboarding", tags=["Onboarding Admin"])


@router.post("/onboarding")
async def cron_onboarding(request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Process onboarding email queue. Protected by X-Cron-Secret header."""
    global _last_cron_run

    # Validate cron secret
    cron_secret = request.headers.get("X-Cron-Secret", "")
    if not cron_secret or cron_secret != settings.CRON_SECRET:
        raise HTTPException(status_code=403, detail="Invalid cron secret")

    now = datetime.now(UTC)

    # Fetch users ready for next onboarding step
    cursor = db.users.find(
        {
            "onboarding_step": {"$lt": 3},
            "onboarding_next_at": {"$lte": now},
            "email_opt_out": {"$ne": True},
        },
        {"id": 1, "email": 1, "username": 1, "onboarding_step": 1, "_id": 0},
    ).limit(20)

    users = await cursor.to_list(length=20)

    sent = 0
    errors = 0

    for user_doc in users:
        user_id = user_doc["id"]
        email = user_doc["email"]
        name = user_doc.get("username", email.split("@")[0])
        step = user_doc.get("onboarding_step", 0)
        unsubscribe_url = _build_unsubscribe_url(user_id)

        try:
            if step == 0:
                await send_onboarding_coulisses(email, name, unsubscribe_url)
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {
                        "onboarding_step": 1,
                        "onboarding_next_at": now + timedelta(days=7),
                    }},
                )
                sent += 1
            elif step == 1:
                await send_onboarding_candidature(email, name, unsubscribe_url)
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {
                        "onboarding_step": 3,
                        "onboarding_next_at": None,
                    }},
                )
                sent += 1
        except Exception as e:
            logger.error(f"Onboarding email failed for user {user_id} step {step}: {e}")
            errors += 1

    _last_cron_run = now
    logger.info(f"Onboarding cron: processed={len(users)}, sent={sent}, errors={errors}")

    return {"processed": len(users), "sent": sent, "errors": errors}


@admin_router.get("/stats")
async def onboarding_stats(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Return onboarding funnel stats by step."""
    pipeline = [
        {"$group": {"_id": "$onboarding_step", "count": {"$sum": 1}}},
    ]
    results = await db.users.aggregate(pipeline).to_list(length=100)

    step_counts = {r["_id"]: r["count"] for r in results}

    return {
        "step_0": step_counts.get(0, 0),
        "step_1": step_counts.get(1, 0),
        "step_3": step_counts.get(3, 0),
        "total": sum(step_counts.values()),
        "last_cron_run": _last_cron_run.isoformat() if _last_cron_run else None,
    }
