from fastapi import APIRouter, Request, BackgroundTasks, status
from pydantic import ValidationError
import logging
import time
from typing import Dict, Any, Optional

from models import AnalyticsEventCreate, AnalyticsEvent

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)

# Simple in-memory cache for public stats (avoid DB hammering)
_stats_cache: Dict[str, Any] = {}
_CACHE_TTL_SECONDS = 1800  # 30 minutes

async def persist_event(db_instance, event_data: dict):
    """Save the event to the database without tracking IP or tokens."""
    try:
        event = AnalyticsEvent(**event_data)
        await db_instance["analytics_events"].insert_one(event.model_dump())
    except Exception as e:
        logger.error(f"Failed to save analytics event: {str(e)}")


@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
async def track_event(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint ultra-léger pour capturer des événements d'interface (SendBeacon friendly).
    Ne bloque pas la requête, l'écriture se fait en tâche de fond.
    RGPD Compliant : N'enregistre aucune IP ni Cookie/Session.
    """
    try:
        # Support sendBeacon (text/plain) ou JSON standard
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            data = await request.json()
        else:
            body_bytes = await request.body()
            import json
            data = json.loads(body_bytes.decode('utf-8'))
            
        # Validation Pydantic
        event_create = AnalyticsEventCreate(**data)
        
        # Enregistrement Asynchrone dans MongoDB
        background_tasks.add_task(persist_event, request.app.db, event_create.model_dump())
        
        return {"status": "accepted"}
        
    except (ValidationError, Exception) as e:
        # Toujours répondre 202 silencieusement pour ne pas bloquer le front
        logger.warning(f"Invalid analytics payload received: {str(e)}")
        return {"status": "dropped"}


@router.get("/stats/public")
async def get_public_stats(request: Request):
    """
    Retourne les compteurs communautaires publics (membres, partenaires, événements).
    Résultat mis en cache 30 minutes pour éviter de surcharger la DB.
    """
    global _stats_cache
    now = time.time()

    # Serve from cache if still fresh
    if _stats_cache.get("expires_at", 0) > now:
        return _stats_cache["data"]

    try:
        db = request.app.db

        # Count active partners
        partners_count = await db.partners.count_documents({"status": "approved"})

        # Count registered users (excluding admins)
        users_count = await db.users.count_documents({"role": {"$ne": "admin"}})

        # Count upcoming + past events
        events_count = await db.events.count_documents({})

        data = {
            "partners": partners_count,
            "members": users_count,
            "events": events_count,
        }

        # Update cache
        _stats_cache = {"data": data, "expires_at": now + _CACHE_TTL_SECONDS}

        return data

    except Exception as e:
        logger.error(f"Failed to get public stats: {e}")
        # Return fallback data on error
        return {"partners": 0, "members": 0, "events": 0}
