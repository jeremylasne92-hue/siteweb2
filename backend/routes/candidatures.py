from fastapi import APIRouter, Request, Depends
from models import TechCandidature, TechCandidatureRequest
from routes.auth import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from email_service import send_email
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/candidatures", tags=["Candidatures"])

RATE_LIMIT_MAX = 3
RATE_LIMIT_WINDOW_HOURS = 1


@router.post("/tech")
async def submit_tech_candidature(
    data: TechCandidatureRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Submit a tech candidature for CogniSphère or ECHOLink (public, anti-spam protected)"""
    client_ip = request.client.host if request.client else "unknown"

    # Anti-spam: honeypot check (silent reject)
    if data.website:
        logger.info(f"Honeypot triggered from {client_ip}")
        return {"message": "Candidature envoyée avec succès"}

    # Anti-spam: rate limiting (max 3 per hour per IP)
    window_start = datetime.utcnow() - timedelta(hours=RATE_LIMIT_WINDOW_HOURS)
    recent_count = await db.tech_candidatures.count_documents({
        "ip_address": client_ip,
        "created_at": {"$gte": window_start}
    })
    if recent_count >= RATE_LIMIT_MAX:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return {"message": "Trop de soumissions récentes. Réessayez plus tard.", "rate_limited": True}

    # Store candidature
    candidature = TechCandidature(
        name=data.name,
        email=data.email,
        project=data.project,
        skills=data.skills,
        message=data.message,
        ip_address=client_ip,
    )
    await db.tech_candidatures.insert_one(candidature.model_dump())
    logger.info(f"New tech candidature from {data.name} for {data.project}")

    # Notify team via email
    project_label = "CogniSphère" if data.project == "cognisphere" else "ECHOLink"
    await send_email(
        "contact@projet-echo.fr",
        f"Nouvelle candidature technique — {project_label}",
        f"Nom: {data.name}\nEmail: {data.email}\nProjet: {project_label}\nCompétences: {data.skills}\n\nMessage:\n{data.message}"
    )

    return {"message": "Candidature envoyée avec succès"}
