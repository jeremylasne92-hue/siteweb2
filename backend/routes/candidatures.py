from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse
from models import TechCandidature, TechCandidatureRequest, TechCandidatureStatusUpdate, TechCandidatureBatchStatusUpdate, User
from routes.auth import get_db, require_admin, get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
from email_service import send_email
from utils.rate_limit import anonymize_ip
import csv
import io
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
        ip_address=anonymize_ip(client_ip),
    )
    await db.tech_candidatures.insert_one(candidature.model_dump())
    logger.info(f"New tech candidature from {data.name} for {data.project}")

    # Notify team via email
    project_label = "CogniSphère" if data.project == "cognisphere" else "ECHOLink"
    await send_email(
        "mouvement.echo.france@gmail.com",
        f"Nouvelle candidature technique — {project_label}",
        f"Nom: {data.name}\nEmail: {data.email}\nProjet: {project_label}\nCompétences: {data.skills}\n\nMessage:\n{data.message}"
    )

    return {"message": "Candidature envoyée avec succès"}


@router.get("/admin/all")
async def list_tech_candidatures(
    project: str = "all",
    status: str = "all",
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List all tech candidatures (admin only), optionally filtered by project and status."""
    query = {}
    if project in ("cognisphere", "echolink"):
        query["project"] = project
    if status in ("pending", "entretien", "accepted", "rejected"):
        query["status"] = status

    cursor = db.tech_candidatures.find(query).sort("created_at", -1)
    candidatures = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        candidatures.append(doc)
    return candidatures


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
    writer.writerow(["id", "name", "email", "project", "skills", "message", "status", "status_note", "created_at"])
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
