from fastapi import APIRouter, HTTPException, Depends, status
from models import Event, EventCreate, User
from routes.auth import require_admin, get_db
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("", response_model=List[Event])
async def get_events(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get all published events, sorted by date ascending"""
    events = await db.events.find({"is_published": True}).sort("date", 1).to_list(100)
    return [Event(**e) for e in events]


@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a specific event by ID"""
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return Event(**event)


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
        time=data.time,
        location=data.location,
        type=data.type,
        image_url=data.image_url,
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
    update_data["updated_at"] = datetime.utcnow()

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
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    logger.info(f"Admin {admin.id} deleted event {event_id}")
    return {"message": "Event deleted successfully"}
