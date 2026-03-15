from fastapi import APIRouter, Request, HTTPException, BackgroundTasks, Depends
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from pymongo.errors import PyMongoError
from models import ContactMessageRequest
from email_service import send_email
from utils.rate_limit import anonymize_ip
from routes.auth import get_db

router = APIRouter(tags=["contact"])
logger = logging.getLogger(__name__)

RATE_LIMIT_MAX = 3
RATE_LIMIT_WINDOW_HOURS = 1

SUBJECT_LABELS = {
    "question_generale": "Question générale",
    "presse_media": "Presse & Média",
    "partenariat": "Partenariat",
    "autre": "Autre",
}


@router.post("/contact")
async def submit_contact(
    data: ContactMessageRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # Honeypot check — silent reject
    if data.website:
        return {"message": "Message envoyé avec succès"}

    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    anon_ip = anonymize_ip(client_ip)
    window_start = datetime.utcnow() - timedelta(hours=RATE_LIMIT_WINDOW_HOURS)
    recent_count = await db.contact_messages.count_documents({
        "ip_address": anon_ip,
        "created_at": {"$gte": window_start},
    })
    if recent_count >= RATE_LIMIT_MAX:
        logger.warning(f"Contact rate limit exceeded for {anon_ip}")
        raise HTTPException(status_code=429, detail="Trop de messages récents. Réessayez plus tard.")

    # Store in MongoDB
    doc = {
        "name": data.name,
        "email": data.email,
        "subject": data.subject,
        "message": data.message,
        "ip_address": anon_ip,
        "created_at": datetime.utcnow(),
        "read": False,
    }
    try:
        await db.contact_messages.insert_one(doc)
    except PyMongoError as e:
        logger.error(f"Failed to save contact message: {e}")
        raise HTTPException(status_code=503, detail="Impossible d'envoyer votre message. Veuillez réessayer.")

    subject_label = SUBJECT_LABELS.get(data.subject, data.subject)

    # Email 1: confirmation to sender
    background_tasks.add_task(
        send_email,
        data.email,
        "Votre message a bien été reçu — Mouvement ECHO",
        f"Bonjour {data.name},\n\n"
        f"Nous avons bien reçu votre message concernant « {subject_label} ».\n"
        f"Notre équipe vous répondra dans les plus brefs délais.\n\n"
        f"Cordialement,\n"
        f"L'équipe Mouvement ECHO",
    )

    # Email 2: alert to team
    background_tasks.add_task(
        send_email,
        "mouvement.echo.france@gmail.com",
        f"Nouveau message contact — {subject_label}",
        f"Nom : {data.name}\n"
        f"Email : {data.email}\n"
        f"Sujet : {subject_label}\n\n"
        f"Message :\n{data.message}",
    )

    return {"message": "Message envoyé avec succès"}
