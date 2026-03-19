from fastapi import APIRouter, Request, HTTPException, BackgroundTasks, Depends
from datetime import datetime, UTC
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from pymongo.errors import PyMongoError
from models import ContactMessageRequest, User
from email_service import send_email
from core.config import settings
from utils.rate_limit import anonymize_ip, check_rate_limit
from routes.auth import get_db, require_admin

router = APIRouter(tags=["contact"])
logger = logging.getLogger(__name__)

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
    await check_rate_limit(db, request, "contact", max_requests=3, window_minutes=60)

    # Store in MongoDB (normalize email for consistency)
    import uuid
    from utils.normalize import normalize_email
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name.strip(),
        "email": normalize_email(data.email),
        "subject": data.subject,
        "message": data.message,
        "ip_address": anonymize_ip(request.client.host if request.client else "unknown"),
        "created_at": datetime.now(UTC),
        "read": False,
        "status": "unread",
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
        settings.EMAIL_ALERT_TO,
        f"Nouveau message contact — {subject_label}",
        f"Nom : {data.name}\n"
        f"Email : {data.email}\n"
        f"Sujet : {subject_label}\n\n"
        f"Message :\n{data.message}",
    )

    return {"message": "Message envoyé avec succès"}


# ==============================================================================
# ADMIN ENDPOINTS
# ==============================================================================

@router.get("/contact/admin/all")
async def get_all_messages(
    status: str | None = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """List all contact messages for admin."""
    query: dict = {}
    if status:
        query["status"] = status
    cursor = db.contact_messages.find(query, {"_id": 0}).sort("created_at", -1)
    messages = await cursor.to_list(length=200)
    return messages


@router.put("/contact/admin/{message_id}/status")
async def update_message_status(
    message_id: str,
    data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Update message status (read/treated) and optional admin note."""
    allowed_statuses = {"unread", "read", "treated"}
    new_status = data.get("status", "read")
    if new_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    update_fields: dict = {"status": new_status}
    if "admin_note" in data:
        update_fields["admin_note"] = data["admin_note"]

    result = await db.contact_messages.update_one(
        {"id": message_id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")

    return {"success": True}
