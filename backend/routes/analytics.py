from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, status
from pydantic import ValidationError
import asyncio
import logging
import time
from datetime import datetime, timedelta, UTC
from typing import Dict, Any, Optional

from models import AnalyticsEventCreate, AnalyticsEvent, User
from routes.auth import require_admin, get_db
from utils.rate_limit import check_rate_limit

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
    # Rate limit: max 100 events per minute per IP
    try:
        db = request.app.db
        await check_rate_limit(db, request, "analytics", max_requests=100, window_minutes=1)
    except HTTPException:
        raise  # Re-raise 429 rate limit errors
    except Exception:
        pass  # Silently skip rate limiting if DB unavailable (e.g. tests)

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


@router.get("/admin/dashboard")
async def get_admin_dashboard(
    request: Request,
    period: int = 7,
    admin: User = Depends(require_admin),
):
    """
    Admin-only analytics dashboard with KPIs.
    Returns acquisition, engagement, conversion, and partner metrics.
    """
    db = request.app.db
    cutoff = datetime.now(UTC) - timedelta(days=period)

    # Run all queries in parallel
    _results = await asyncio.gather(
        # Page views (total)
        db.analytics_events.count_documents({
            "category": "page_view", "created_at": {"$gte": cutoff}
        }),
        # CTA clicks
        db.analytics_events.find(
            {"category": "cta_click", "created_at": {"$gte": cutoff}}
        ).to_list(length=1000),
        # UTM sources
        db.analytics_events.aggregate([
            {"$match": {"utm_source": {"$ne": None}, "created_at": {"$gte": cutoff}}},
            {"$group": {"_id": "$utm_source", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10},
        ]).to_list(length=1000),
        # Landing pages (first page_view per session)
        db.analytics_events.aggregate([
            {"$match": {"category": "page_view", "session_id": {"$ne": None}, "created_at": {"$gte": cutoff}}},
            {"$sort": {"created_at": 1}},
            {"$group": {"_id": "$session_id", "path": {"$first": "$path"}}},
            {"$group": {"_id": "$path", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10},
        ]).to_list(length=1000),
        # Session data (for bounce rate + pages/session)
        db.analytics_events.aggregate([
            {"$match": {"category": "page_view", "session_id": {"$ne": None}, "created_at": {"$gte": cutoff}}},
            {"$group": {"_id": "$session_id", "page_count": {"$sum": 1}}},
        ]).to_list(length=1000),
        # Conversion: registrations in period
        db.users.count_documents({"created_at": {"$gte": cutoff}, "role": {"$ne": "admin"}}),
        # Conversion: volunteers
        db.volunteer_applications.count_documents({"created_at": {"$gte": cutoff}}),
        # Conversion: partner applications
        db.partners.count_documents({"created_at": {"$gte": cutoff}}),
        # Conversion: scenariste candidatures
        db.tech_candidatures.count_documents({"project": "scenariste", "created_at": {"$gte": cutoff}}),
        # Conversion: HelloAsso clicks
        db.analytics_events.count_documents({
            "category": "cta_click",
            "action": {"$regex": "^soutenir_helloasso"},
            "created_at": {"$gte": cutoff},
        }),
        # Conversion: contact submissions
        db.contact_messages.count_documents({"created_at": {"$gte": cutoff}}),
        # Partner: profile views
        db.analytics_events.count_documents({
            "action": "partner_view", "created_at": {"$gte": cutoff}
        }),
        # Partner: website clicks
        db.analytics_events.count_documents({
            "action": "partner_click_website", "created_at": {"$gte": cutoff}
        }),
        # Partner totals
        db.partners.count_documents({}),
        db.partners.count_documents({"status": "approved"}),
        return_exceptions=True,
    )

    page_views = _results[0] if not isinstance(_results[0], Exception) else 0
    cta_clicks = _results[1] if not isinstance(_results[1], Exception) else []
    utm_sources = _results[2] if not isinstance(_results[2], Exception) else []
    landing_pages = _results[3] if not isinstance(_results[3], Exception) else []
    session_data = _results[4] if not isinstance(_results[4], Exception) else []
    users_count = _results[5] if not isinstance(_results[5], Exception) else 0
    volunteers_count = _results[6] if not isinstance(_results[6], Exception) else 0
    partners_count = _results[7] if not isinstance(_results[7], Exception) else 0
    scenaristes_count = _results[8] if not isinstance(_results[8], Exception) else 0
    helloasso_clicks = _results[9] if not isinstance(_results[9], Exception) else 0
    contact_count = _results[10] if not isinstance(_results[10], Exception) else 0
    partner_views = _results[11] if not isinstance(_results[11], Exception) else 0
    partner_clicks = _results[12] if not isinstance(_results[12], Exception) else 0
    partners_total = _results[13] if not isinstance(_results[13], Exception) else 0
    partners_approved = _results[14] if not isinstance(_results[14], Exception) else 0

    # Compute session metrics
    unique_sessions = len(session_data)
    bounce_sessions = sum(1 for s in session_data if s["page_count"] == 1)
    bounce_rate = round(bounce_sessions / unique_sessions, 2) if unique_sessions > 0 else 0
    avg_pages = round(sum(s["page_count"] for s in session_data) / unique_sessions, 1) if unique_sessions > 0 else 0

    # Top pages
    top_pages_agg = await db.analytics_events.aggregate([
        {"$match": {"category": "page_view", "created_at": {"$gte": cutoff}}},
        {"$group": {"_id": "$path", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}},
        {"$limit": 10},
    ]).to_list(length=1000)

    # Top CTAs
    cta_summary: Dict[str, int] = {}
    for click in cta_clicks:
        lbl = click.get("label") or click.get("action", "unknown")
        cta_summary[lbl] = cta_summary.get(lbl, 0) + 1
    top_ctas = sorted(
        [{"label": k, "clicks": v} for k, v in cta_summary.items()],
        key=lambda x: x["clicks"], reverse=True
    )[:10]

    return {
        "period_days": period,
        "acquisition": {
            "total_visits": page_views,
            "unique_sessions": unique_sessions,
            "by_source": [{"source": s["_id"], "count": s["count"]} for s in utm_sources],
            "by_landing_page": [{"path": lp["_id"], "count": lp["count"]} for lp in landing_pages],
            "bounce_rate": bounce_rate,
        },
        "engagement": {
            "avg_pages_per_session": avg_pages,
            "top_pages": [{"path": p["_id"], "views": p["views"]} for p in top_pages_agg],
            "top_ctas": top_ctas,
        },
        "conversion": {
            "registrations": users_count,
            "volunteers": volunteers_count,
            "partner_applications": partners_count,
            "scenariste_applications": scenaristes_count,
            "helloasso_clicks": helloasso_clicks,
            "contact_submissions": contact_count,
        },
        "partners": {
            "total_profile_views": partner_views,
            "total_website_clicks": partner_clicks,
            "conversion_rate": round(partners_approved / partners_total, 2) if partners_total > 0 else 0,
        },
    }
