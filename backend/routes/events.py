from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from models import Event, EventCreate, User
from routes.auth import require_admin, get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, UTC
from typing import List
import logging
import os
import uuid as uuid_mod
from pathlib import Path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/events", tags=["Events"])

UPLOAD_DIR = Path(__file__).parent.parent / "uploads" / "events"
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.get("", response_model=List[Event])
async def get_events(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all published events, sorted by date ascending"""
    events = await db.events.find({"is_published": True}, {"_id": 0}).sort("date", 1).to_list(length=100)
    return [Event(**e) for e in events]


@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a specific event by ID"""
    event = await db.events.find_one({"id": event_id, "is_published": True})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return Event(**event)


@router.post("/upload-image")
async def upload_event_image(
    image: UploadFile = File(...),
    admin: User = Depends(require_admin),
):
    """Upload an event image (admin only). Returns the image URL."""
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez JPEG, PNG ou WebP.")

    contents = await image.read()
    if len(contents) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image trop lourde (max 5 Mo).")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    ext = image.filename.rsplit(".", 1)[-1].lower() if image.filename and "." in image.filename else "jpg"
    safe_filename = f"{uuid_mod.uuid4().hex}.{ext}"
    file_path = UPLOAD_DIR / safe_filename

    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/api/uploads/events/{safe_filename}"
    logger.info(f"Admin {admin.id} uploaded event image: {safe_filename}")
    return {"url": image_url}


@router.post("", response_model=Event)
async def create_event(
    data: EventCreate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new event (admin only)"""
    event = Event(
        title=data.title,
        description=data.description,
        date=data.date,
        date_end=data.date_end,
        time=data.time,
        location=data.location,
        type=data.type,
        image_url=data.image_url,
        images=data.images[:10],
        booking_enabled=data.booking_enabled,
        booking_url=data.booking_url,
        organizer=data.organizer,
    )
    await db.events.insert_one(event.model_dump())
    logger.info(f"Admin {admin.id} created event: {event.title}")
    return event


@router.put("/{event_id}", response_model=Event)
async def update_event(
    event_id: str,
    data: EventCreate,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update an existing event (admin only)"""
    existing = await db.events.find_one({"id": event_id})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    update_data = data.model_dump()
    update_data["images"] = update_data.get("images", [])[:10]
    update_data["updated_at"] = datetime.now(UTC)

    await db.events.update_one({"id": event_id}, {"$set": update_data})
    updated = await db.events.find_one({"id": event_id})
    logger.info(f"Admin {admin.id} updated event {event_id}")
    return Event(**updated)


@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete an event (admin only)"""
    existing = await db.events.find_one({"id": event_id})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Clean up uploaded images
    for img_url in existing.get("images", []):
        img_path = img_url.replace("/api/uploads/", "uploads/")
        if os.path.exists(img_path):
            os.remove(img_path)
    if existing.get("image_url") and existing["image_url"].startswith("/api/uploads/"):
        legacy_path = existing["image_url"].replace("/api/uploads/", "uploads/")
        if os.path.exists(legacy_path):
            os.remove(legacy_path)

    await db.events.delete_one({"id": event_id})
    logger.info(f"Admin {admin.id} deleted event {event_id}")
    return {"message": "Event deleted successfully"}
