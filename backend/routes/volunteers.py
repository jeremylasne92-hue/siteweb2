from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pymongo.errors import PyMongoError
from models import VolunteerApplication, VolunteerApplicationRequest, VolunteerStatusUpdate, VolunteerBatchStatusUpdate, VolunteerEditUpdate, User
from routes.auth import get_db, require_admin, get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from email_service import send_email, send_volunteer_confirmation, send_volunteer_interview, send_volunteer_accepted, send_volunteer_rejected
from core.config import settings
from utils.rate_limit import anonymize_ip, check_rate_limit
from utils.audit import log_admin_action
from utils.geocode import geocode_city
from routes.members import auto_seed_member_profile, deactivate_member_profile
import csv
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


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
    await check_rate_limit(db, request, "volunteer", max_requests=3, window_minutes=60)

    # Store application (normalize data for consistency)
    from utils.normalize import normalize_email, normalize_skills, normalize_phone
    application = VolunteerApplication(
        name=data.name.strip(),
        email=normalize_email(data.email),
        phone=normalize_phone(data.phone),
        city=data.city.strip() if data.city else data.city,
        motivation=data.motivation,
        skills=normalize_skills(data.skills),
        experience_level=data.experience_level,
        availability=data.availability,
        values_accepted=data.values_accepted,
        message=data.message,
        ip_address=anonymize_ip(client_ip),
    )

    # Geocode city → GPS coordinates (non-blocking, failure is acceptable)
    coords = await geocode_city(data.city)
    if coords:
        application.latitude = coords[0]
        application.longitude = coords[1]

    try:
        await db.volunteer_applications.insert_one(application.model_dump())
    except PyMongoError as e:
        logger.error(f"Failed to save volunteer application: {e}")
        raise HTTPException(status_code=503, detail="Impossible d'enregistrer votre candidature. Veuillez réessayer.")
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
        "benevoles@mouvementecho.fr",
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
    docs = await cursor.to_list(length=500)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


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
    await log_admin_action(db, admin.id, "delete", "volunteer", application_id)
    logger.info(f"Admin {admin.id} deleted volunteer application {application_id}")
    return {"message": "Candidature supprimée"}


def _sanitize_csv_cell(value) -> str:
    """Escape CSV injection characters for Excel safety."""
    s = str(value) if value is not None else ""
    if s and s[0] in ('=', '+', '-', '@', '\t', '\r'):
        return "'" + s
    return s


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
            _sanitize_csv_cell(a.get("id", "")),
            _sanitize_csv_cell(a.get("name", "")),
            _sanitize_csv_cell(a.get("email", "")),
            _sanitize_csv_cell(a.get("phone", "")),
            _sanitize_csv_cell(a.get("city", "")),
            _sanitize_csv_cell(skills),
            _sanitize_csv_cell(a.get("experience_level", "")),
            _sanitize_csv_cell(a.get("availability", "")),
            _sanitize_csv_cell(motivation),
            _sanitize_csv_cell(a.get("message", "")),
            _sanitize_csv_cell(a.get("status", "pending")),
            _sanitize_csv_cell(a.get("status_note", "")),
            created,
        ])

    output.seek(0)
    logger.info(f"Admin {admin.id} exported {len(applications)} volunteer application records")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=volunteers-export.csv"},
    )


@router.put("/admin/{application_id}/edit")
async def edit_volunteer_application(
    application_id: str,
    data: VolunteerEditUpdate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Edit volunteer application fields (admin only)."""
    update_fields = data.model_dump(exclude_none=True)
    if not update_fields:
        raise HTTPException(status_code=400, detail="Aucun champ à mettre à jour")
    update_fields["updated_at"] = datetime.utcnow()

    # Re-geocode if city changed
    if "city" in update_fields:
        coords = await geocode_city(update_fields["city"])
        if coords:
            update_fields["latitude"] = coords[0]
            update_fields["longitude"] = coords[1]

    result = await db.volunteer_applications.update_one(
        {"id": application_id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    logger.info(f"Admin {admin.id} edited volunteer application {application_id}")
    return {"message": "Candidature mise à jour"}


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
    await log_admin_action(db, admin.id, "status_change", "volunteer", application_id, {"new_status": data.status})
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

        # Auto-seed member profile on acceptance
        if data.status == "accepted":
            try:
                await auto_seed_member_profile(db, application, "volunteer")
            except Exception as e:
                logger.error(f"Auto-seed failed for volunteer {application_id}: {e}")

        # Deactivate member profile on rejection
        if data.status == "rejected":
            try:
                await deactivate_member_profile(db, application_id)
            except Exception as e:
                logger.error(f"Deactivate profile failed for volunteer {application_id}: {e}")

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
    await log_admin_action(db, admin.id, "batch_status", "volunteer", ",".join(data.ids), {"new_status": data.status})
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
