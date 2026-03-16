"""Routes for the Médiathèque (media resources CRUD)."""
import os
import uuid
from datetime import datetime
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase

from models_mediatheque import MediaResource, MediaResourceCreate, ResourceType
from routes.auth import require_admin, get_db
from services.ai_enrichment import enrich_url

router = APIRouter(prefix="/mediatheque", tags=["Médiathèque"])
admin_router = APIRouter(prefix="/admin/mediatheque", tags=["Médiathèque Admin"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "media")
ALLOWED_MIME_TYPES = {"application/pdf"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


def _doc_to_resource(doc: dict) -> dict:
    """Convert MongoDB document to API response."""
    doc["id"] = str(doc.pop("_id"))
    return doc


# --- Public endpoints ---

@router.get("")
async def list_resources(
    type: Optional[ResourceType] = Query(None),
    tag: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List published media resources, optionally filtered by type or tag."""
    query = {"is_published": True}
    if type:
        query["resource_type"] = type.value
    if tag:
        query["tags"] = tag

    cursor = db.media_resources.find(query).sort([
        ("is_featured", -1),
        ("sort_order", 1),
        ("created_at", -1)
    ])
    resources = []
    async for doc in cursor:
        resources.append(_doc_to_resource(doc))
    return resources


@router.get("/{resource_id}")
async def get_resource(resource_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a single published resource by ID."""
    doc = await db.media_resources.find_one({
        "_id": ObjectId(resource_id),
        "is_published": True
    })
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _doc_to_resource(doc)


# --- Admin endpoints ---

@admin_router.get("")
async def admin_list_resources(
    admin=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """List ALL resources (including unpublished) for admin."""
    cursor = db.media_resources.find().sort([("sort_order", 1), ("created_at", -1)])
    resources = []
    async for doc in cursor:
        resources.append(_doc_to_resource(doc))
    return resources


@admin_router.post("", status_code=201)
async def create_resource(
    resource: MediaResourceCreate,
    admin=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a new media resource."""
    now = datetime.utcnow()
    doc = resource.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now

    result = await db.media_resources.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_resource(doc)


@admin_router.put("/{resource_id}")
async def update_resource(
    resource_id: str,
    resource: MediaResourceCreate,
    admin=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Update an existing media resource."""
    doc = resource.model_dump()
    doc["updated_at"] = datetime.utcnow()

    result = await db.media_resources.find_one_and_update(
        {"_id": ObjectId(resource_id)},
        {"$set": doc},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Resource not found")
    return _doc_to_resource(result)


@admin_router.delete("/{resource_id}")
async def delete_resource(
    resource_id: str,
    admin=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Delete a media resource."""
    result = await db.media_resources.delete_one({"_id": ObjectId(resource_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return {"message": "Resource deleted"}


@admin_router.patch("/{resource_id}/publish")
async def toggle_publish(
    resource_id: str,
    admin=Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Toggle the is_published status of a resource."""
    doc = await db.media_resources.find_one({"_id": ObjectId(resource_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Resource not found")

    new_status = not doc.get("is_published", False)
    result = await db.media_resources.find_one_and_update(
        {"_id": ObjectId(resource_id)},
        {"$set": {"is_published": new_status, "updated_at": datetime.utcnow()}},
        return_document=True
    )
    return _doc_to_resource(result)


@admin_router.post("/ai-enrich")
async def ai_enrich(data: dict, admin=Depends(require_admin)):
    """Enrich a URL with AI-extracted metadata."""
    url = data.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    result = await enrich_url(url)
    return result


# --- Upload endpoint ---

@admin_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    admin=Depends(require_admin),
):
    """Upload a PDF file for a media resource."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20 MB)")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "file.pdf")[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    return {
        "file_url": f"/api/uploads/media/{filename}",
        "file_name": file.filename,
        "file_size": len(content)
    }
