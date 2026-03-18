# Date Harmonization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harmonize all date formats across backend and frontend before launch (2026-03-20).

**Architecture:** Replace all 78+ `datetime.utcnow()` with `datetime.now(UTC)` (timezone-aware), add CSV date helper, fix frontend timezone issue, migrate MongoDB data. All changes are mechanical find-and-replace plus 2 new files.

**Tech Stack:** Python 3.12+ (datetime, UTC), FastAPI, MongoDB (Motor), Pydantic, React/TypeScript

---

## Task 1: Create `format_date_csv` helper

**Files:**
- Create: `backend/utils/date_helpers.py`
- Test: `backend/tests/utils/test_date_helpers.py`

**Step 1: Write the test file**

```python
# backend/tests/utils/test_date_helpers.py
from datetime import datetime, UTC
from backend.utils.date_helpers import format_date_csv, format_date_str_fr


def test_format_date_csv_with_datetime():
    dt = datetime(2026, 3, 17, 14, 30, 0, tzinfo=UTC)
    assert format_date_csv(dt) == "17/03/2026 14:30"


def test_format_date_csv_with_none():
    assert format_date_csv(None) == ""


def test_format_date_str_fr_yyyy_mm_dd():
    assert format_date_str_fr("2026-09-15") == "15/09/2026"


def test_format_date_str_fr_none():
    assert format_date_str_fr(None) == ""


def test_format_date_str_fr_empty():
    assert format_date_str_fr("") == ""
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/utils/test_date_helpers.py -p no:recording -v`
Expected: FAIL (module not found)

**Step 3: Write the helper module**

```python
# backend/utils/date_helpers.py
from datetime import datetime


def format_date_csv(dt: datetime | None) -> str:
    """Format datetime for CSV export: DD/MM/YYYY HH:MM"""
    return dt.strftime("%d/%m/%Y %H:%M") if dt else ""


def format_date_str_fr(date_str: str | None) -> str:
    """Convert YYYY-MM-DD string to DD/MM/YYYY for CSV export."""
    if not date_str:
        return ""
    try:
        parts = date_str.split("-")
        return f"{parts[2]}/{parts[1]}/{parts[0]}"
    except (IndexError, AttributeError):
        return date_str
```

**Step 4: Run test to verify it passes**

Run: `cd backend && python -m pytest tests/utils/test_date_helpers.py -p no:recording -v`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/utils/date_helpers.py backend/tests/utils/test_date_helpers.py
git commit -m "feat: add date formatting helpers for CSV exports"
```

---

## Task 2: Migrate models — `datetime.utcnow()` → `datetime.now(UTC)`

**Files:**
- Modify: `backend/models.py` (lines 3, 38, 89, 97, 110, 111, 136, 154, 176, 248, 249, 272, 298)
- Modify: `backend/models_extended.py` (lines 3, 25, 47, 57)
- Modify: `backend/models_partner.py` (all `datetime.utcnow` occurrences)
- Modify: `backend/models_member.py` (all `datetime.utcnow` occurrences)
- Modify: `backend/models_mediatheque.py` (all `datetime.utcnow` occurrences)

**Step 1: Update `backend/models.py`**

The import on line 3 already has `from datetime import datetime, UTC`.

Replace every `default_factory=datetime.utcnow` with `default_factory=lambda: datetime.now(UTC)` in all model fields.

Affected fields (11 occurrences):
- `User.created_at` (line 38)
- `UserSession.created_at`, `UserSession.expires_at` context (line 89)
- `PasswordResetToken.created_at` (line 97)
- `Episode.created_at`, `Episode.updated_at` (lines 110-111)
- `VideoProgress.last_updated` (line 136)
- `EpisodeOptIn.created_at` (line 154)
- `TechCandidature.created_at` (line 176)
- `Event.created_at`, `Event.updated_at` (lines 248-249)
- `Pending2FA.created_at` (line 272)
- `ContactMessage.created_at` (line 298)

**Do NOT touch** `StudentApplication.created_at` (line 434) — it already uses `datetime.now(UTC)`.

**Step 2: Update `backend/models_extended.py`**

Add `UTC` to import line 3: `from datetime import datetime, UTC`

Replace `default_factory=datetime.utcnow` → `default_factory=lambda: datetime.now(UTC)` in:
- `Thematic.created_at` (line 25)
- `Resource.created_at` (line 47)
- `Actor.created_at` (line 57)

**Step 3: Update `backend/models_partner.py`**

Add `UTC` to datetime import.
Replace all `datetime.utcnow` with `lambda: datetime.now(UTC)`.

**Step 4: Update `backend/models_member.py`**

Same pattern as Step 3.

**Step 5: Update `backend/models_mediatheque.py`**

Same pattern as Steps 3-4.

**Step 6: Run tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All existing tests pass (models are backward compatible)

**Step 7: Commit**

```bash
git add backend/models.py backend/models_extended.py backend/models_partner.py backend/models_member.py backend/models_mediatheque.py
git commit -m "refactor: migrate all Pydantic models from utcnow() to now(UTC)"
```

---

## Task 3: Migrate routes — `datetime.utcnow()` → `datetime.now(UTC)`

**Files:**
- Modify: `backend/routes/auth.py` (10 occurrences + 2 `.isoformat()` on utcnow)
- Modify: `backend/routes/partners.py` (11 occurrences)
- Modify: `backend/routes/members.py` (7 occurrences)
- Modify: `backend/routes/candidatures.py` (3 occurrences)
- Modify: `backend/routes/volunteers.py` (3 occurrences)
- Modify: `backend/routes/mediatheque.py` (3 occurrences)
- Modify: `backend/routes/episodes.py` (1 occurrence)
- Modify: `backend/routes/contact.py` (1 occurrence)
- Modify: `backend/routes/progress.py` (1 occurrence)
- Modify: `backend/routes/analytics.py` (1 occurrence)
- Modify: `backend/routes/events.py` (1 occurrence)

**Step 1: For each route file**

Add `UTC` to the datetime import:
```python
# Before
from datetime import datetime, timedelta
# After
from datetime import datetime, timedelta, UTC
```

Then find-and-replace `datetime.utcnow()` → `datetime.now(UTC)` across the file.

Special case in `auth.py` lines 528 and 590:
```python
# Before
"exported_at": datetime.utcnow().isoformat(),
# After
"exported_at": datetime.now(UTC).isoformat(),
```

**Step 2: Run tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: PASS

**Step 3: Commit**

```bash
git add backend/routes/
git commit -m "refactor: migrate all routes from utcnow() to now(UTC)"
```

---

## Task 4: Migrate services & utils — `datetime.utcnow()` → `datetime.now(UTC)`

**Files:**
- Modify: `backend/services/auth_service.py` (3 occurrences)
- Modify: `backend/services/auth_local_service.py` (2 occurrences)
- Modify: `backend/services/password_reset_service.py` (2 occurrences)
- Modify: `backend/utils/rate_limit.py` (2 occurrences)
- Modify: `backend/utils/audit.py` (1 occurrence)
- Modify: `backend/seed_partners.py` (2 occurrences)

**Step 1: For each file**

Add `UTC` to the datetime import, then replace `datetime.utcnow()` → `datetime.now(UTC)`.

**Step 2: Run tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: PASS

**Step 3: Commit**

```bash
git add backend/services/ backend/utils/rate_limit.py backend/utils/audit.py backend/seed_partners.py
git commit -m "refactor: migrate services and utils from utcnow() to now(UTC)"
```

---

## Task 5: Migrate test files — `datetime.utcnow()` → `datetime.now(UTC)`

**Files (9):**
- Modify: `backend/tests/routes/test_password_reset.py` (4 occurrences)
- Modify: `backend/tests/routes/test_rgpd.py` (2 occurrences)
- Modify: `backend/tests/routes/test_mediatheque.py` (2 occurrences)
- Modify: `backend/tests/test_integration_flows.py` (7 occurrences)
- Modify: `backend/tests/routes/test_candidatures.py` (3 occurrences)
- Modify: `backend/tests/routes/test_members.py` (5 occurrences)
- Modify: `backend/tests/routes/test_analytics_dashboard.py` (2 occurrences)
- Modify: `backend/tests/routes/test_events.py` (2 occurrences)
- Modify: `backend/tests/routes/test_episodes_export.py` (1 occurrence)

**Step 1: For each test file**

Add `UTC` to the datetime import, then replace `datetime.utcnow()` → `datetime.now(UTC)`.

**Step 2: Run full test suite**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: ALL tests PASS

**Step 3: Commit**

```bash
git add backend/tests/
git commit -m "refactor: align test files with now(UTC) convention"
```

---

## Task 6: CSV exports — use `format_date_csv` helper

**Files:**
- Modify: `backend/routes/auth.py` (lines 769-774 CSV, lines 386-394 JSON profile)
- Modify: `backend/routes/candidatures.py` (lines 176-178)
- Modify: `backend/routes/students.py` (lines 165-167, 183)
- Modify: `backend/routes/volunteers.py` (lines ~152-154)
- Modify: `backend/routes/partners.py` (lines ~853-858)
- Modify: `backend/routes/episodes.py` (lines ~197-199)

**Step 1: Update CSV exports in each route file**

Add import at top of each file:
```python
from utils.date_helpers import format_date_csv, format_date_str_fr
```

Replace the CSV date pattern:
```python
# Before
created = c.get("created_at", "")
if hasattr(created, "isoformat"):
    created = created.isoformat()

# After
created = format_date_csv(c.get("created_at"))
```

For `students.py`, also format `start_date`:
```python
# Before
_sanitize_csv_cell(a.get("start_date", "")),
# After
_sanitize_csv_cell(format_date_str_fr(a.get("start_date", ""))),
```

For `partners.py`, apply to both `created_at` and `validated_at`.

**Step 2: Update auth.py JSON profile** (lines 386-394)

Keep `.isoformat()` for JSON API responses — these are consumed by the frontend, not CSV.
Only change CSV export endpoints.

**Step 3: Update `_serialize_for_json`** (auth.py line 534-542)

Keep as-is — JSON exports should stay ISO 8601 for machine readability.

**Step 4: Run tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: PASS

**Step 5: Commit**

```bash
git add backend/routes/ backend/utils/date_helpers.py
git commit -m "feat: format CSV export dates as DD/MM/YYYY HH:MM"
```

---

## Task 7: `start_date` strict YYYY-MM-DD validation

**Files:**
- Modify: `backend/models.py` (lines 405-413 — `validate_start_date`)
- Modify: `frontend/src/pages/AdminStudents.tsx` (line 649)

**Step 1: Update the Pydantic validator**

```python
# backend/models.py — StudentApplicationRequest.validate_start_date
@field_validator("start_date")
@classmethod
def validate_start_date(cls, v):
    if v is None:
        return v
    import re
    if not re.match(r"^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$", v):
        raise ValueError("Le format doit être YYYY-MM-DD (ex: 2026-09-10)")
    return v
```

Changes from original:
- Removed `?` making the day group required
- Updated error message to remove "ou YYYY-MM"

**Step 2: Update AdminStudents.tsx start_date display**

```typescript
// Before (line 649)
{s.start_date || '—'}

// After
{s.start_date ? new Date(s.start_date + 'T00:00:00').toLocaleDateString('fr-FR') : '—'}
```

Note: Adding `T00:00:00` avoids timezone parsing issues.

**Step 3: Run tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Run: `cd frontend && npx vitest run`
Expected: PASS

**Step 4: Commit**

```bash
git add backend/models.py frontend/src/pages/AdminStudents.tsx
git commit -m "fix: enforce strict YYYY-MM-DD for start_date, display as DD/MM/YYYY"
```

---

## Task 8: Fix AdminEvents.tsx timezone issue

**Files:**
- Modify: `frontend/src/pages/AdminEvents.tsx` (lines 144-145)

**Step 1: Fix date serialization**

```typescript
// Before (lines 144-145)
date: new Date(form.date).toISOString(),
date_end: form.date_end ? new Date(form.date_end).toISOString() : null,

// After
date: new Date(form.date + 'T00:00:00').toISOString(),
date_end: form.date_end ? new Date(form.date_end + 'T00:00:00').toISOString() : null,
```

This ensures midnight local time is used instead of midnight UTC, which prevents the date shifting back one day for UTC+ timezones.

**Step 2: Run frontend tests and build**

Run: `cd frontend && npx vitest run`
Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/pages/AdminEvents.tsx
git commit -m "fix: prevent timezone date shift in AdminEvents date inputs"
```

---

## Task 9: MongoDB data migration script

**Files:**
- Create: `backend/scripts/migrate_dates_utc.py`

**Step 1: Write the migration script**

```python
#!/usr/bin/env python3
"""
One-shot migration: convert all naive UTC datetimes in MongoDB to timezone-aware UTC.
Safe to re-run (idempotent).

Usage: python -m scripts.migrate_dates_utc
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
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]

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
        print(f"  student_applications: {start_date_count} start_date values normalized (YYYY-MM → YYYY-MM-01)")

    print(f"\nTotal: {total_updated} documents updated with timezone-aware dates")
    client.close()


if __name__ == "__main__":
    print("Starting UTC timezone migration...")
    asyncio.run(migrate())
    print("Done!")
```

**Step 2: Test the script locally**

Run: `cd backend && python -m scripts.migrate_dates_utc`
Expected: Output showing document counts per collection

**Step 3: Commit**

```bash
git add backend/scripts/migrate_dates_utc.py
git commit -m "feat: add MongoDB date migration script (naive → timezone-aware UTC)"
```

---

## Task 10: Final verification

**Step 1: Run full backend test suite**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: ALL PASS

**Step 2: Run frontend tests**

Run: `cd frontend && npx vitest run`
Expected: ALL PASS

**Step 3: Run lint**

Run: `cd frontend && npx eslint .`
Expected: No errors

**Step 4: Run build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

**Step 5: Verify no remaining `datetime.utcnow`**

Run: `grep -r "datetime.utcnow" backend/ --include="*.py" | grep -v __pycache__`
Expected: Zero results

**Step 6: Final commit if any fixes were needed**

```bash
git commit -m "chore: date harmonization complete — all dates timezone-aware UTC"
```
