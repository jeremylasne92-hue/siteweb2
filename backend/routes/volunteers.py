from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from models import VolunteerApplication, VolunteerApplicationRequest, VolunteerStatusUpdate, VolunteerBatchStatusUpdate, User
from routes.auth import get_db, require_admin, get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from email_service import send_email, send_volunteer_confirmation, send_volunteer_interview, send_volunteer_accepted, send_volunteer_rejected
from core.config import settings
from utils.rate_limit import anonymize_ip
import csv
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])

RATE_LIMIT_MAX = 3
RATE_LIMIT_WINDOW_HOURS = 1


@router.post("/apply")
async def submit_volunteer_application(
    data: VolunteerApplicationRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit a volunteer application (public, anti-spam protected)"""
    client_ip = request.client.host if request.client else "unknown"

    # Anti-spam: honeypot check (silent reject)
    if data.website:
        logger.info(f"Honeypot triggered from {client_ip}")
        return {"message": "Candidature bénévole envoyée avec succès"}

    # Anti-spam: rate limiting (max 3 per hour per IP)
    window_start = datetime.utcnow() - timedelta(hours=RATE_LIMIT_WINDOW_HOURS)
    recent_count = await db.volunteer_applications.count_documents({
        "ip_address": client_ip,
        "created_at": {"$gte": window_start}
    })
    if recent_count >= RATE_LIMIT_MAX:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return {"message": "Trop de soumissions récentes. Réessayez plus tard.", "rate_limited": True}

    # Store application
    application = VolunteerApplication(
        name=data.name,
        email=data.email,
        phone=data.phone,
        city=data.city,
        motivation=data.motivation,
        skills=data.skills,
        experience_level=data.experience_level,
        availability=data.availability,
        values_accepted=data.values_accepted,
        message=data.message,
        ip_address=anonymize_ip(client_ip),
    )
    await db.volunteer_applications.insert_one(application.model_dump())
    logger.info(f"New volunteer application from {data.name}")

    # Notify team via email
    email_body = f"Nom: {data.name}\nEmail: {data.email}\nVille: {data.city}"
    if data.phone:
        email_body += f"\nTéléphone: {data.phone}"
    email_body += f"\nCompétences: {', '.join(data.skills)}"
    email_body += f"\nNiveau: {data.experience_level}"
    email_body += f"\nDisponibilité: {data.availability}"
    if data.motivation:
        email_body += f"\nMotivations: {', '.join(data.motivation)}"
    if data.message:
        email_body += f"\n\nMessage:\n{data.message}"
    background_tasks.add_task(
        send_email,
        "mouvement.echo.france@gmail.com",
        "Nouvelle candidature bénévole — Mouvement ECHO",
        email_body,
    )
    background_tasks.add_task(send_volunteer_confirmation, data.email, data.name)

    return {"message": "Candidature bénévole envoyée avec succès"}


@router.get("/admin/all")
async def list_volunteer_applications(
    status: str = "all",
    availability: str = "all",
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all volunteer applications (admin only), optionally filtered by status and availability."""
    query = {}
    if status in ("pending", "entretien", "accepted", "rejected"):
        query["status"] = status
    if availability in ("punctual", "regular", "active"):
        query["availability"] = availability

    cursor = db.volunteer_applications.find(query).sort("created_at", -1)
    applications = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        applications.append(doc)
    return applications


@router.delete("/admin/{application_id}")
async def delete_volunteer_application(
    application_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a volunteer application (admin only)."""
    result = await db.volunteer_applications.delete_one({"id": application_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    logger.info(f"Admin {admin.id} deleted volunteer application {application_id}")
    return {"message": "Candidature supprimée"}


@router.get("/admin/export")
async def export_volunteer_applications(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Export all volunteer applications as CSV (admin only)."""
    cursor = db.volunteer_applications.find().sort("created_at", -1)
    applications = []
    async for doc in cursor:
        applications.append(doc)

    output = io.StringIO()
    output.write("\ufeff")  # BOM UTF-8
    writer = csv.writer(output)
    writer.writerow(["id", "name", "email", "phone", "city", "skills", "experience_level", "availability", "motivation", "message", "status", "status_note", "created_at"])
    for a in applications:
        created = a.get("created_at", "")
        if hasattr(created, "isoformat"):
            created = created.isoformat()
        skills = a.get("skills", [])
        if isinstance(skills, list):
            skills = ", ".join(skills)
        motivation = a.get("motivation", [])
        if isinstance(motivation, list):
            motivation = ", ".join(motivation)
        writer.writerow([
            a.get("id", ""),
            a.get("name", ""),
            a.get("email", ""),
            a.get("phone", ""),
            a.get("city", ""),
            skills,
            a.get("experience_level", ""),
            a.get("availability", ""),
            motivation,
            a.get("message", ""),
            a.get("status", "pending"),
            a.get("status_note", ""),
            created,
        ])

    output.seek(0)
    logger.info(f"Admin {admin.id} exported {len(applications)} volunteer application records")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=volunteers-export.csv"},
    )


@router.put("/admin/{application_id}/status")
async def update_volunteer_status(
    application_id: str,
    data: VolunteerStatusUpdate,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a volunteer application status (admin only)."""
    update_fields = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update_fields["status_note"] = data.status_note
    result = await db.volunteer_applications.update_one(
        {"id": application_id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    logger.info(f"Admin {admin.id} updated volunteer application {application_id} to {data.status}")

    # Send status notification email
    application = await db.volunteer_applications.find_one({"id": application_id})
    if application:
        a_email = application["email"]
        a_name = application["name"]
        if data.status == "entretien":
            background_tasks.add_task(send_volunteer_interview, a_email, a_name, settings.BOOKING_URL)
        elif data.status == "accepted":
            background_tasks.add_task(send_volunteer_accepted, a_email, a_name)
        elif data.status == "rejected":
            background_tasks.add_task(send_volunteer_rejected, a_email, a_name, data.status_note)

    return {"message": f"Statut mis à jour : {data.status}"}


@router.put("/admin/batch-status")
async def batch_update_volunteer_status(
    data: VolunteerBatchStatusUpdate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Batch update volunteer application statuses (admin only)."""
    update_fields = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update_fields["status_note"] = data.status_note
    result = await db.volunteer_applications.update_many(
        {"id": {"$in": data.ids}},
        {"$set": update_fields},
    )
    logger.info(f"Admin {admin.id} batch-updated {result.modified_count} volunteer applications to {data.status}")
    return {"message": f"{result.modified_count} candidature(s) mise(s) à jour", "count": result.modified_count}


@router.get("/me")
async def get_my_volunteer_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get volunteer applications for the current authenticated user (matched by email)."""
    cursor = db.volunteer_applications.find(
        {"email": current_user.email},
        {"_id": 0, "ip_address": 0},
    ).sort("created_at", -1)
    applications = []
    async for doc in cursor:
        applications.append(doc)
    return applications
