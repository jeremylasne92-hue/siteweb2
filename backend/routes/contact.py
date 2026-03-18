from fastapi import APIRouter, Request, HTTPException, BackgroundTasks, Depends, Query
from datetime import datetime, timedelta
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from pymongo.errors import PyMongoError
from models import ContactMessageRequest, User
from email_service import send_email
from utils.rate_limit import anonymize_ip
from routes.auth import get_db, require_admin

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


# --- Admin endpoints ---

VALID_SUBJECTS = {"question_generale", "presse_media", "partenariat", "autre"}


@router.get("/admin/contacts")
async def list_contacts_admin(
    subject: Optional[str] = Query(None, description="Filter by subject type"),
    read: Optional[bool] = Query(None, description="Filter by read status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List contact messages sorted by unread first, then newest (admin only)."""
    query: dict = {}
    if subject and subject in VALID_SUBJECTS:
        query["subject"] = subject
    if read is not None:
        query["read"] = read

    messages = await db.contact_messages.find(
        query,
        {"ip_address": 0},  # Never expose IP to frontend
    ).sort([("read", 1), ("created_at", -1)]).skip(skip).limit(limit).to_list(limit)

    total = await db.contact_messages.count_documents(query)
    unread_count = await db.contact_messages.count_documents({"read": False})

    return {
        "messages": messages,
        "total": total,
        "unread_count": unread_count,
        "skip": skip,
        "limit": limit,
    }


@router.put("/admin/contacts/{message_id}/read")
async def mark_contact_read(
    message_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Mark a contact message as read (admin only)."""
    result = await db.contact_messages.update_one(
        {"_id": message_id},
        {"$set": {
            "read": True,
            "read_at": datetime.utcnow(),
            "read_by": admin.id,
        }},
    )

    # Fallback: try matching on the 'id' field if _id didn't match
    if result.matched_count == 0:
        result = await db.contact_messages.update_one(
            {"id": message_id},
            {"$set": {
                "read": True,
                "read_at": datetime.utcnow(),
                "read_by": admin.id,
            }},
        )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")

    logger.info(f"Admin {admin.id} marked contact message {message_id} as read")

    return {"message": "Contact marked as read", "message_id": message_id}
