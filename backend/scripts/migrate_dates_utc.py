#!/usr/bin/env python3
"""
One-shot migration: convert all naive UTC datetimes in MongoDB to timezone-aware UTC.
Safe to re-run (idempotent).

Usage: cd backend && python -m scripts.migrate_dates_utc
"""
import asyncio
from datetime import timezone
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings

COLLECTIONS_FIELDS = {
    "users": ["created_at", "last_login", "member_since"],
    "user_sessions": ["created_at", "expires_at"],
    "episodes": ["created_at", "updated_at"],
    "video_progress": ["last_updated"],
    "episode_optins": ["created_at"],
    "events": ["created_at", "updated_at", "date", "date_end"],
    "tech_candidatures": ["created_at", "updated_at"],
    "volunteer_applications": ["created_at", "updated_at"],
    "student_applications": ["created_at", "updated_at"],
    "contact_messages": ["created_at"],
    "analytics_events": ["created_at"],
    "partners": ["created_at", "updated_at", "validated_at", "partnership_date"],
    "members": ["created_at", "updated_at"],
    "media_items": ["created_at", "updated_at"],
    "password_reset_tokens": ["created_at", "expires_at"],
    "pending_2fa": ["created_at", "expires_at"],
}


async def migrate():
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DB_NAME]

    total_updated = 0

    for collection_name, fields in COLLECTIONS_FIELDS.items():
        collection = db[collection_name]
        count = await collection.count_documents({})
        if count == 0:
            print(f"  {collection_name}: empty, skipping")
            continue

        updated = 0
        async for doc in collection.find({}):
            update = {}
            for field in fields:
                value = doc.get(field)
                if value is not None and hasattr(value, "tzinfo") and value.tzinfo is None:
                    update[field] = value.replace(tzinfo=timezone.utc)

            if update:
                await collection.update_one({"_id": doc["_id"]}, {"$set": update})
                updated += 1

        print(f"  {collection_name}: {updated}/{count} documents updated")
        total_updated += updated

    # Migrate start_date YYYY-MM → YYYY-MM-01
    student_col = db["student_applications"]
    start_date_count = 0
    async for doc in student_col.find({"start_date": {"$regex": r"^\d{4}-\d{2}$"}}):
        new_val = doc["start_date"] + "-01"
        await student_col.update_one({"_id": doc["_id"]}, {"$set": {"start_date": new_val}})
        start_date_count += 1
    if start_date_count:
        print(f"  student_applications: {start_date_count} start_date values normalized (YYYY-MM -> YYYY-MM-01)")

    print(f"\nTotal: {total_updated} documents updated with timezone-aware dates")
    client.close()


if __name__ == "__main__":
    print("Starting UTC timezone migration...")
    asyncio.run(migrate())
    print("Done!")
