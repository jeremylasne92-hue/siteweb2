"""Minimal audit trail -- logs admin actions to MongoDB."""
import logging
from datetime import datetime, UTC
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


async def log_admin_action(
    db: AsyncIOMotorDatabase,
    admin_id: str,
    action: str,
    target_type: str,
    target_id: str,
    changes: dict | None = None,
) -> None:
    """Write an audit entry. Fire-and-forget, never raises."""
    try:
        await db.admin_actions.insert_one({
            "admin_id": admin_id,
            "action": action,
            "target_type": target_type,
            "target_id": target_id,
            "changes": changes,
            "timestamp": datetime.now(UTC),
        })
    except Exception as e:
        logger.warning(f"Audit log failed: {e}")
