"""
Watchdog service — periodic monitoring of stale items.

Detects candidatures, partner applications, and contact messages that have been
pending without admin action beyond configured thresholds. Sends a single digest
alert email to all ALERT_EMAILS recipients.

Crash-resilient: persists last_run_at in MongoDB so missed cycles are caught
on startup after a process restart.
"""
import asyncio
import logging
from datetime import datetime, timedelta

from motor.motor_asyncio import AsyncIOMotorDatabase

from core.config import settings
from email_service import send_watchdog_alert

logger = logging.getLogger(__name__)

WATCHDOG_STATE_KEY = "watchdog_last_run"


async def _should_run_now(db: AsyncIOMotorDatabase) -> bool:
    """Check if watchdog should run immediately (missed cycle after restart)."""
    state = await db.system_state.find_one({"_id": WATCHDOG_STATE_KEY})
    if state is None or state.get("last_run_at") is None:
        return True
    elapsed = (datetime.utcnow() - state["last_run_at"]).total_seconds()
    interval = settings.WATCHDOG_INTERVAL_HOURS * 3600
    return elapsed >= interval


async def _record_run(db: AsyncIOMotorDatabase):
    """Persist last run timestamp in MongoDB."""
    await db.system_state.update_one(
        {"_id": WATCHDOG_STATE_KEY},
        {"$set": {"last_run_at": datetime.utcnow()}},
        upsert=True,
    )


async def _can_send_alert(db: AsyncIOMotorDatabase) -> bool:
    """Anti-spam: only send alert if cooldown has elapsed since last alert."""
    state = await db.system_state.find_one({"_id": WATCHDOG_STATE_KEY})
    if state is None or state.get("last_alert_at") is None:
        return True
    elapsed = (datetime.utcnow() - state["last_alert_at"]).total_seconds()
    cooldown = settings.WATCHDOG_ALERT_COOLDOWN_HOURS * 3600
    return elapsed >= cooldown


async def _record_alert(db: AsyncIOMotorDatabase, stale_count: int):
    """Record that an alert was sent, with the stale count for comparison."""
    await db.system_state.update_one(
        {"_id": WATCHDOG_STATE_KEY},
        {"$set": {
            "last_alert_at": datetime.utcnow(),
            "last_alert_stale_count": stale_count,
        }},
        upsert=True,
    )


async def check_stale_items(db: AsyncIOMotorDatabase):
    """Scan all collections for stale items and send a single digest alert."""
    now = datetime.utcnow()
    alerts = []
    total_stale = 0

    # 1. Partner applications pending > threshold
    partner_threshold = now - timedelta(days=settings.WATCHDOG_STALE_PARTNER_DAYS)
    stale_partners = await db.partners.count_documents({
        "status": "pending",
        "created_at": {"$lt": partner_threshold},
    })
    if stale_partners > 0:
        total_stale += stale_partners
        alerts.append(
            f"{stale_partners} candidature(s) partenaire en attente "
            f"depuis plus de {settings.WATCHDOG_STALE_PARTNER_DAYS} jours"
        )

    # 2. Tech candidatures pending > threshold
    tech_threshold = now - timedelta(days=settings.WATCHDOG_STALE_CANDIDATURE_DAYS)
    stale_tech = await db.tech_candidatures.count_documents({
        "status": "pending",
        "created_at": {"$lt": tech_threshold},
    })
    if stale_tech > 0:
        total_stale += stale_tech
        alerts.append(
            f"{stale_tech} candidature(s) technique(s) en attente "
            f"depuis plus de {settings.WATCHDOG_STALE_CANDIDATURE_DAYS} jours"
        )

    # 3. Volunteer applications pending > threshold (same as candidatures)
    stale_volunteers = await db.volunteer_applications.count_documents({
        "status": "pending",
        "created_at": {"$lt": tech_threshold},
    })
    if stale_volunteers > 0:
        total_stale += stale_volunteers
        alerts.append(
            f"{stale_volunteers} candidature(s) b\u00e9n\u00e9vole(s) en attente "
            f"depuis plus de {settings.WATCHDOG_STALE_CANDIDATURE_DAYS} jours"
        )

    # 4. Contact messages unread > threshold
    contact_threshold = now - timedelta(hours=settings.WATCHDOG_STALE_CONTACT_HOURS)
    stale_contacts = await db.contact_messages.count_documents({
        "read": False,
        "created_at": {"$lt": contact_threshold},
    })
    if stale_contacts > 0:
        total_stale += stale_contacts
        alerts.append(
            f"{stale_contacts} message(s) contact non lu(s) "
            f"depuis plus de {settings.WATCHDOG_STALE_CONTACT_HOURS}h"
        )

    # 5. Admin inactivity check
    last_admin = await db.users.find_one(
        {"role": "admin"},
        {"last_login": 1},
        sort=[("last_login", -1)],
    )
    if last_admin and last_admin.get("last_login"):
        days_since = (now - last_admin["last_login"]).days
        if days_since > settings.WATCHDOG_ADMIN_INACTIVE_DAYS:
            alerts.append(
                f"\u26a0\ufe0f Aucun admin connect\u00e9 depuis {days_since} jours"
            )
    elif last_admin and not last_admin.get("last_login"):
        alerts.append("\u26a0\ufe0f Admin existant mais aucune connexion enregistr\u00e9e")

    # Send alert if there are stale items and cooldown allows it
    if alerts:
        if await _can_send_alert(db):
            logger.warning(f"Watchdog: {total_stale} stale item(s) detected, sending alert")
            await send_watchdog_alert(alerts, total_stale)
            await _record_alert(db, total_stale)
        else:
            logger.info(f"Watchdog: {total_stale} stale item(s) but alert cooldown active")
    else:
        logger.info("Watchdog: no stale items detected")


async def watchdog_loop(db: AsyncIOMotorDatabase):
    """Main watchdog loop — crash-resilient periodic monitoring.

    Launched as an asyncio task from the FastAPI lifespan.
    Checks immediately on startup if a cycle was missed, then runs periodically.
    """
    interval_seconds = settings.WATCHDOG_INTERVAL_HOURS * 3600

    # Startup check: run immediately if a cycle was missed
    try:
        if await _should_run_now(db):
            logger.info("Watchdog: missed cycle detected, running immediately")
            await check_stale_items(db)
            await _record_run(db)
        else:
            logger.info("Watchdog: last cycle still recent, skipping startup check")
    except Exception as e:
        logger.error(f"Watchdog startup check failed: {e}")

    # Periodic loop
    while True:
        await asyncio.sleep(interval_seconds)
        try:
            await check_stale_items(db)
            await _record_run(db)
        except Exception as e:
            logger.error(f"Watchdog cycle failed: {e}")
