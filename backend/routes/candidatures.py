from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pymongo.errors import PyMongoError
from models import TechCandidature, TechCandidatureRequest, TechCandidatureStatusUpdate, TechCandidatureBatchStatusUpdate, User
from routes.auth import get_db, require_admin, get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from email_service import send_email, send_candidature_confirmation, send_candidature_interview, send_candidature_accepted, send_candidature_rejected
from routes.members import auto_seed_member_profile, deactivate_member_profile
from core.config import settings
from utils.rate_limit import anonymize_ip, check_rate_limit
import asyncio
import csv
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/candidatures", tags=["Candidatures"])

PROJECT_LABELS = {"cognisphere": "CogniSphère", "echolink": "ECHOLink", "scenariste": "Scénariste"}
EXPERIENCE_LABELS = {"professional": "Professionnel", "student": "Étudiant", "self_taught": "Autodidacte", "motivated": "Motivé"}


async def _process_candidature(
    data: TechCandidatureRequest,
    project_override: str | None,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase,
) -> dict:
    """Shared logic for submitting a candidature (anti-spam, storage, notification)."""
    client_ip = request.client.host if request.client else "unknown"

    # Anti-spam: honeypot check (silent reject)
    if data.website:
        logger.info(f"Honeypot triggered from {client_ip}")
        return {"message": "Candidature envoyée avec succès"}

    # Anti-spam: rate limiting (max 3 per hour per IP)
    await check_rate_limit(db, request, "candidature", max_requests=3, window_minutes=60)

    # Store candidature
    project = project_override or data.project
    candidature = TechCandidature(
        name=data.name,
        email=data.email,
        project=project,
        skills=data.skills,
        message=data.message,
        portfolio_url=data.portfolio_url,
        creative_interests=data.creative_interests,
        experience_level=data.experience_level,
        ip_address=anonymize_ip(client_ip),
    )
    try:
        await db.tech_candidatures.insert_one(candidature.model_dump())
    except PyMongoError as e:
        logger.error(f"Failed to save candidature: {e}")
        raise HTTPException(status_code=503, detail="Impossible d'enregistrer votre candidature. Veuillez réessayer.")
    logger.info(f"New candidature from {data.name} for {project}")

    # Notify team via email
    project_label = PROJECT_LABELS.get(project, project)
    email_body = f"Nom: {data.name}\nEmail: {data.email}\nProjet: {project_label}\nCompétences: {data.skills}"
    if data.portfolio_url:
        email_body += f"\nPortfolio: {data.portfolio_url}"
    if data.creative_interests:
        email_body += f"\nIntérêts créatifs: {data.creative_interests}"
    if data.experience_level:
        email_body += f"\nNiveau d'expérience: {EXPERIENCE_LABELS.get(data.experience_level, data.experience_level)}"
    email_body += f"\n\nMessage:\n{data.message}"
    background_tasks.add_task(
        send_email,
        "mouvement.echo.france@gmail.com",
        f"Nouvelle candidature — {project_label}",
        email_body,
    )
    background_tasks.add_task(send_candidature_confirmation, data.email, data.name, project)

    return {"message": "Candidature envoyée avec succès"}


@router.post("/tech")
async def submit_tech_candidature(
    data: TechCandidatureRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit a tech candidature for CogniSphère or ECHOLink (public, anti-spam protected)"""
    return await _process_candidature(data, None, request, background_tasks, db)


@router.post("/scenariste")
async def submit_scenariste_candidature(
    data: TechCandidatureRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Submit a scenarist candidature (public, anti-spam protected)"""
    return await _process_candidature(data, "scenariste", request, background_tasks, db)


@router.get("/admin/all")
async def list_tech_candidatures(
    project: str = "all",
    status: str = "all",
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all tech candidatures (admin only), optionally filtered by project and status."""
    query = {}
    if project in ("cognisphere", "echolink", "scenariste"):
        query["project"] = project
    if status in ("pending", "entretien", "accepted", "rejected"):
        query["status"] = status

    cursor = db.tech_candidatures.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=500)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs


@router.delete("/admin/{candidature_id}")
async def delete_tech_candidature(
    candidature_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a tech candidature (admin only)."""
    result = await db.tech_candidatures.delete_one({"id": candidature_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    logger.info(f"Admin {admin.id} deleted tech candidature {candidature_id}")
    return {"message": "Candidature supprimée"}


@router.get("/admin/export")
async def export_tech_candidatures(
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Export all tech candidatures as CSV (admin only)."""
    cursor = db.tech_candidatures.find().sort("created_at", -1)
    candidatures = []
    async for doc in cursor:
        candidatures.append(doc)

    output = io.StringIO()
    output.write("\ufeff")  # BOM UTF-8
    writer = csv.writer(output)
    writer.writerow(["id", "name", "email", "project", "skills", "message", "portfolio_url", "creative_interests", "experience_level", "status", "status_note", "created_at"])
    for c in candidatures:
        created = c.get("created_at", "")
        if hasattr(created, "isoformat"):
            created = created.isoformat()
        writer.writerow([
            c.get("id", ""),
            c.get("name", ""),
            c.get("email", ""),
            c.get("project", ""),
            c.get("skills", ""),
            c.get("message", ""),
            c.get("portfolio_url", ""),
            c.get("creative_interests", ""),
            c.get("experience_level", ""),
            c.get("status", "pending"),
            c.get("status_note", ""),
            created,
        ])

    output.seek(0)
    logger.info(f"Admin {admin.id} exported {len(candidatures)} tech candidature records")

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=candidatures-tech-export.csv"},
    )


@router.put("/admin/{candidature_id}/status")
async def update_candidature_status(
    candidature_id: str,
    data: TechCandidatureStatusUpdate,
    background_tasks: BackgroundTasks,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update a tech candidature status (admin only)."""
    update_fields = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update_fields["status_note"] = data.status_note
    result = await db.tech_candidatures.update_one(
        {"id": candidature_id},
        {"$set": update_fields},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Candidature non trouvée")
    logger.info(f"Admin {admin.id} updated candidature {candidature_id} to {data.status}")

    # Send status notification email
    candidature = await db.tech_candidatures.find_one({"id": candidature_id})
    if candidature:
        c_email = candidature["email"]
        c_name = candidature["name"]
        c_project = candidature.get("project", "")
        if data.status == "entretien":
            background_tasks.add_task(send_candidature_interview, c_email, c_name, settings.BOOKING_URL)
        elif data.status == "accepted":
            background_tasks.add_task(send_candidature_accepted, c_email, c_name, c_project)
        elif data.status == "rejected":
            background_tasks.add_task(send_candidature_rejected, c_email, c_name, data.status_note)

        # Auto-seed member profile on acceptance
        if data.status == "accepted":
            candidature_type = c_project if c_project == "scenariste" else "tech"
            try:
                await auto_seed_member_profile(db, candidature, candidature_type)
            except Exception as e:
                logger.error(f"Auto-seed failed for candidature {candidature_id}: {e}")

        # Deactivate member profile on rejection
        if data.status == "rejected":
            try:
                await deactivate_member_profile(db, candidature_id)
            except Exception as e:
                logger.error(f"Deactivate profile failed for candidature {candidature_id}: {e}")

    return {"message": f"Statut mis à jour : {data.status}"}


@router.put("/admin/batch-status")
async def batch_update_candidature_status(
    data: TechCandidatureBatchStatusUpdate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Batch update tech candidature statuses (admin only)."""
    update_fields = {"status": data.status, "updated_at": datetime.utcnow()}
    if data.status_note is not None:
        update_fields["status_note"] = data.status_note
    result = await db.tech_candidatures.update_many(
        {"id": {"$in": data.ids}},
        {"$set": update_fields},
    )
    logger.info(f"Admin {admin.id} batch-updated {result.modified_count} candidatures to {data.status}")
    return {"message": f"{result.modified_count} candidature(s) mise(s) à jour", "count": result.modified_count}


@router.get("/members")
async def get_accepted_members(
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Public endpoint: list accepted members (name, project, skills only)."""
    projection = {"_id": 0, "name": 1, "project": 1, "skills": 1, "experience_level": 1, "created_at": 1}

    # Fetch both collections in parallel
    tech_docs, volunteer_docs = await asyncio.gather(
        db.tech_candidatures.find({"status": "accepted"}, projection).sort("created_at", -1).to_list(length=None),
        db.volunteer_applications.find({"status": "accepted"}, projection).sort("created_at", -1).to_list(length=None),
    )

    members = [{**doc, "type": "candidature"} for doc in tech_docs]
    for doc in volunteer_docs:
        skills = doc.get("skills", [])
        members.append({
            "name": doc["name"],
            "project": "benevole",
            "skills": ", ".join(skills) if isinstance(skills, list) else skills,
            "experience_level": doc.get("experience_level"),
            "created_at": doc.get("created_at"),
            "type": "volunteer",
        })

    return members


@router.get("/me")
async def get_my_candidatures(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Get candidatures for the current authenticated user (matched by email)."""
    cursor = db.tech_candidatures.find(
        {"email": current_user.email},
        {"_id": 0, "ip_address": 0},
    ).sort("created_at", -1)
    candidatures = []
    async for doc in cursor:
        candidatures.append(doc)
    return candidatures
