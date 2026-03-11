"""Reusable IP-based rate limiting utility (MongoDB-backed).

Usage in endpoints:
    await check_rate_limit(db, request, "register", max_requests=5, window_minutes=15)

Records are stored in the `rate_limits` collection with a TTL index
on `created_at` for automatic cleanup (see ensure_rate_limit_indexes).
"""
from fastapi import HTTPException, Request


def anonymize_ip(ip: str) -> str:
    """Anonymize IP address: mask last octet for IPv4, last 80 bits for IPv6."""
    if not ip or ip == "unknown":
        return ip
    if '.' in ip:
        parts = ip.split('.')
        return '.'.join(parts[:3]) + '.0'
    if ':' in ip:
        parts = ip.split(':')
        return ':'.join(parts[:4]) + '::0'
    return ip
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


async def check_rate_limit(
    db: AsyncIOMotorDatabase,
    request: Request,
    action: str,
    max_requests: int,
    window_minutes: int,
) -> None:
    """Check and record a rate-limited action.

    Raises HTTPException 429 if the IP has exceeded max_requests
    within the last window_minutes for the given action.
    """
    client_ip = request.client.host if request.client else "unknown"
    window_start = datetime.utcnow() - timedelta(minutes=window_minutes)

    count = await db.rate_limits.count_documents({
        "ip": client_ip,
        "action": action,
        "created_at": {"$gte": window_start},
    })

    if count >= max_requests:
        logger.warning(f"Rate limit exceeded: {action} from {client_ip} ({count}/{max_requests})")
        raise HTTPException(
            status_code=429,
            detail="Trop de tentatives. Veuillez r\u00e9essayer plus tard.",
        )

    # Record this attempt
    await db.rate_limits.insert_one({
        "ip": client_ip,
        "action": action,
        "created_at": datetime.utcnow(),
    })


async def ensure_rate_limit_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create TTL index so old rate-limit records are cleaned automatically."""
    await db.rate_limits.create_index("created_at", expireAfterSeconds=3600)
    await db.rate_limits.create_index([("ip", 1), ("action", 1), ("created_at", 1)])
