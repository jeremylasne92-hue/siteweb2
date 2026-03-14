# Auto-Seed Member Profiles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically create a visible member profile when an admin accepts a candidature (volunteer or tech/scénariste).

**Architecture:** Extract the seed logic from `admin_seed_profile` into a reusable async helper `auto_seed_member_profile(db, candidature, candidature_type)`. Call it from both `volunteers.py` and `candidatures.py` status-update endpoints when `status == "accepted"`. Remove the manual seed button from the frontend. Fix the `name` field mapping (candidatures use `name`, not `first_name`/`last_name`).

**Tech Stack:** FastAPI, MongoDB (Motor), React/TypeScript, Pytest

**Design doc:** `docs/plans/2026-03-14-auto-seed-members-design.md`

---

### Task 1: Fix `display_name` bug in seed logic + extract helper

The existing `admin_seed_profile` endpoint uses `first_name`/`last_name` but candidatures only have a `name` field. This produces an empty `display_name`. Fix this and extract the core logic into a reusable helper.

**Files:**
- Modify: `backend/routes/members.py:263-353` (seed endpoint + new helper)
- Test: `backend/tests/routes/test_members.py` (add auto-seed helper test)

**Step 1: Write the failing test**

Add to `backend/tests/routes/test_members.py`:

```python
import pytest
from unittest.mock import AsyncMock, MagicMock
from routes.members import auto_seed_member_profile


@pytest.mark.asyncio
async def test_auto_seed_creates_profile_with_name_field():
    """auto_seed_member_profile uses 'name' field as display_name."""
    db = MagicMock()
    db.member_profiles.find_one = AsyncMock(return_value=None)
    db.member_profiles.insert_one = AsyncMock()
    db.users.find_one = AsyncMock(return_value=None)
    db.users.update_one = AsyncMock()

    candidature = {
        "id": "cand-1",
        "name": "Alice Martin",
        "email": "alice@example.com",
        "skills": ["communication", "design"],
        "city": "Lyon",
        "experience_level": "professional",
        "availability": "regular",
        "status": "accepted",
    }

    result = await auto_seed_member_profile(db, candidature, "volunteer")

    assert result is not None
    insert_call = db.member_profiles.insert_one.call_args[0][0]
    assert insert_call["display_name"] == "Alice Martin"
    assert insert_call["visible"] is True
    assert insert_call["membership_status"] == "active"
    assert insert_call["candidature_type"] == "volunteer"
    assert insert_call["slug"] == "alice-martin"


@pytest.mark.asyncio
async def test_auto_seed_skips_if_profile_exists():
    """auto_seed_member_profile returns None if profile already exists for this candidature."""
    db = MagicMock()
    db.member_profiles.find_one = AsyncMock(return_value={"id": "existing"})

    candidature = {
        "id": "cand-1",
        "name": "Alice Martin",
        "email": "alice@example.com",
        "skills": [],
        "status": "accepted",
    }

    result = await auto_seed_member_profile(db, candidature, "volunteer")

    assert result is None
    db.member_profiles.insert_one.assert_not_called()
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_members.py::test_auto_seed_creates_profile_with_name_field tests/routes/test_members.py::test_auto_seed_skips_if_profile_exists -v`
Expected: FAIL with `ImportError: cannot import name 'auto_seed_member_profile'`

**Step 3: Implement the helper and fix seed endpoint**

In `backend/routes/members.py`, add the `auto_seed_member_profile` helper function (before the `admin_seed_profile` endpoint):

```python
async def auto_seed_member_profile(
    db: AsyncIOMotorDatabase,
    candidature: dict,
    candidature_type: str,
) -> dict | None:
    """Create a member profile from a candidature dict.

    Returns the created profile dict, or None if profile already exists.
    Sets visible=True (admin acceptance = validation).
    Does NOT require a user account — creates profile from candidature data.
    """
    candidature_id = candidature["id"]

    # Check no existing profile for this candidature
    existing = await db.member_profiles.find_one({"candidature_id": candidature_id})
    if existing:
        logger.info(f"Profile already exists for candidature {candidature_id}")
        return None

    # Build display_name from 'name' field (not first_name/last_name)
    display_name = candidature.get("name", "").strip()
    if not display_name:
        display_name = candidature.get("email", "membre").split("@")[0]

    # Normalize skills
    skills_raw = candidature.get("skills", [])
    if isinstance(skills_raw, str):
        skills = [s.strip().lower() for s in skills_raw.split(",") if s.strip()]
    else:
        skills = [s.strip().lower() for s in skills_raw if s.strip()]

    # Generate unique slug
    base_slug = _slugify(display_name)
    slug = base_slug
    counter = 1
    while await db.member_profiles.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Role title based on candidature type
    role_titles = {
        "volunteer": "Bénévole",
        "tech": candidature.get("project", "Tech"),
        "scenariste": "Scénariste",
    }
    project_map = {
        "volunteer": "benevole",
    }

    now = datetime.utcnow()
    profile = {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "display_name": display_name,
        "slug": slug,
        "bio": candidature.get("bio"),
        "avatar_url": candidature.get("avatar_url"),
        "city": candidature.get("city"),
        "region": candidature.get("region"),
        "department": candidature.get("department"),
        "project": project_map.get(candidature_type, candidature.get("project", "benevole")),
        "role_title": role_titles.get(candidature_type, candidature_type),
        "skills": skills,
        "experience_level": candidature.get("experience_level"),
        "availability": candidature.get("availability"),
        "age_range": candidature.get("age_range"),
        "professional_sector": candidature.get("professional_sector"),
        "gender": candidature.get("gender"),
        "contact_email": candidature.get("email"),
        "social_links": candidature.get("social_links", []),
        "visible": True,
        "visibility_overrides": {
            "contact_email": False,
            "city": True,
            "social_links": True,
            "age_range": False,
            "professional_sector": False,
        },
        "candidature_id": candidature_id,
        "candidature_type": candidature_type,
        "membership_status": "active",
        "joined_at": now,
        "created_at": now,
        "updated_at": now,
    }

    await db.member_profiles.insert_one(profile)

    # Link user account if exists
    user = await db.users.find_one({"email": candidature.get("email")})
    if user:
        profile["user_id"] = user["id"]
        await db.member_profiles.update_one(
            {"id": profile["id"]},
            {"$set": {"user_id": user["id"]}},
        )
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"is_member": True, "member_since": now}},
        )
    else:
        logger.warning(f"No user account for {candidature.get('email')} — profile created without user_id")

    logger.info(f"Auto-seeded member profile {profile['id']} for candidature {candidature_id}")
    return profile
```

Also update `admin_seed_profile` to use the helper internally (keeping backward compat):

```python
@admin_router.post("/seed/{candidature_id}", status_code=201)
async def admin_seed_profile(
    candidature_id: str,
    body: SeedRequest,
    admin: User = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Create a member profile from an accepted candidature. Admin only."""
    collection = "tech_candidatures" if body.candidature_type == "tech" else "volunteer_applications"
    candidature = await db[collection].find_one({"id": candidature_id})
    if not candidature:
        raise HTTPException(status_code=404, detail="Candidature non trouvee")
    if candidature.get("status") != "accepted":
        raise HTTPException(status_code=400, detail="Candidature non acceptee")

    result = await auto_seed_member_profile(db, candidature, body.candidature_type)
    if result is None:
        raise HTTPException(status_code=409, detail="Profil deja existant")

    return {"profile_id": result["id"], "slug": result["slug"]}
```

**Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_members.py -v`
Expected: ALL PASS

**Step 5: Run full backend test suite**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add backend/routes/members.py backend/tests/routes/test_members.py
git commit -m "feat: extract auto_seed_member_profile helper with name field fix

Use 'name' field instead of 'first_name'/'last_name' for display_name.
Set visible=True on auto-seed (admin acceptance = validation).
Don't require user account — create profile from candidature data."
```

---

### Task 2: Call auto-seed from volunteer status update

When an admin sets a volunteer candidature status to `accepted`, automatically create the member profile.

**Files:**
- Modify: `backend/routes/volunteers.py:173-205` (update_volunteer_status)
- Test: `backend/tests/routes/test_volunteers.py` (add auto-seed-on-accept test)

**Step 1: Write the failing test**

Add to `backend/tests/routes/test_volunteers.py`:

```python
from unittest.mock import patch

MOCK_ADMIN = User(
    id="admin-1",
    username="admin",
    email="admin@echo.fr",
    role=UserRole.ADMIN,
    created_at=datetime.utcnow(),
)

def test_accept_volunteer_triggers_auto_seed():
    """PUT /volunteers/admin/{id}/status to 'accepted' calls auto_seed_member_profile."""
    db = make_mock_db()
    # Mock find_one to return the candidature after update
    candidature_doc = {**VALID_DATA, "id": "vol-1", "status": "accepted"}
    db.volunteer_applications.find_one = AsyncMock(return_value=candidature_doc)
    db.volunteer_applications.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN

    with patch("routes.volunteers.auto_seed_member_profile", new_callable=AsyncMock) as mock_seed, \
         patch("routes.volunteers.send_volunteer_accepted", new_callable=AsyncMock):
        response = client.put(
            "/api/volunteers/admin/vol-1/status",
            json={"status": "accepted"},
        )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    mock_seed.assert_called_once_with(db, candidature_doc, "volunteer")
```

Add required imports at top of test file:

```python
from models import User, UserRole
from routes.auth import require_admin
from datetime import datetime
```

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_volunteers.py::test_accept_volunteer_triggers_auto_seed -v`
Expected: FAIL (auto_seed not imported or called in volunteers.py)

**Step 3: Add auto-seed call to volunteer status update**

In `backend/routes/volunteers.py`:

1. Add import at top:
```python
from routes.members import auto_seed_member_profile
```

2. In `update_volunteer_status`, after the email sending block (line ~203), add:
```python
        # Auto-seed member profile on acceptance
        if data.status == "accepted":
            try:
                await auto_seed_member_profile(db, application, "volunteer")
            except Exception as e:
                logger.error(f"Auto-seed failed for volunteer {application_id}: {e}")
```

**Step 4: Run test to verify it passes**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_volunteers.py -v`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add backend/routes/volunteers.py backend/tests/routes/test_volunteers.py
git commit -m "feat: auto-seed member profile when volunteer is accepted"
```

---

### Task 3: Call auto-seed from tech candidature status update

Same logic for tech/scénariste candidatures.

**Files:**
- Modify: `backend/routes/candidatures.py:190-223` (update_candidature_status)
- Test: `backend/tests/routes/test_candidatures.py` (add auto-seed-on-accept test)

**Step 1: Write the failing test**

Add to `backend/tests/routes/test_candidatures.py`:

```python
from unittest.mock import patch

def test_accept_tech_candidature_triggers_auto_seed():
    """PUT /candidatures/admin/{id}/status to 'accepted' calls auto_seed_member_profile."""
    db = make_mock_db()
    candidature_doc = {**VALID_DATA, "id": "tech-1", "status": "accepted", "project": "cognisphere"}
    db.tech_candidatures.find_one = AsyncMock(return_value=candidature_doc)
    db.tech_candidatures.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN

    with patch("routes.candidatures.auto_seed_member_profile", new_callable=AsyncMock) as mock_seed, \
         patch("routes.candidatures.send_candidature_accepted", new_callable=AsyncMock):
        response = client.put(
            "/api/candidatures/admin/tech-1/status",
            json={"status": "accepted"},
        )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    mock_seed.assert_called_once_with(db, candidature_doc, "tech")
```

NOTE: Check what `VALID_DATA`, `make_mock_db`, and `MOCK_ADMIN` look like in the existing test file and adapt accordingly. The test needs the `require_admin` override and the mock db's `tech_candidatures` collection.

**Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_candidatures.py::test_accept_tech_candidature_triggers_auto_seed -v`
Expected: FAIL

**Step 3: Add auto-seed call to candidature status update**

In `backend/routes/candidatures.py`:

1. Add import at top:
```python
from routes.members import auto_seed_member_profile
```

2. In `update_candidature_status`, after the email sending block (line ~221), add:
```python
        # Auto-seed member profile on acceptance
        if data.status == "accepted":
            candidature_type = c_project if c_project == "scenariste" else "tech"
            try:
                await auto_seed_member_profile(db, candidature, candidature_type)
            except Exception as e:
                logger.error(f"Auto-seed failed for candidature {candidature_id}: {e}")
```

**Step 4: Run test to verify it passes**

Run: `cd backend && python -m pytest -p no:recording tests/routes/test_candidatures.py -v`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add backend/routes/candidatures.py backend/tests/routes/test_candidatures.py
git commit -m "feat: auto-seed member profile when tech candidature is accepted"
```

---

### Task 4: Remove manual seed button from AdminVolunteers frontend

The manual "Créer le profil membre" button is no longer needed since profiles are auto-created.

**Files:**
- Modify: `frontend/src/pages/AdminVolunteers.tsx:1-715`

**Step 1: Remove seed-related code**

Remove from `AdminVolunteers.tsx`:

1. Remove `UserPlus` from the lucide-react import (line 7)
2. Remove `seedStatus` state (line 99):
   ```tsx
   // DELETE: const [seedStatus, setSeedStatus] = useState<...>('idle');
   ```
3. Remove `handleSeedProfile` function (lines 221-240)
4. Remove `setSeedStatus('idle')` from modal close handlers (lines 487, 501)
5. Remove the entire "Seed Member Profile" section in the modal (lines 643-673)

**Step 2: Run frontend lint**

Run: `cd frontend && npx eslint .`
Expected: No new errors (UserPlus should no longer be imported unused)

**Step 3: Run frontend build**

Run: `cd frontend && npm run build`
Expected: BUILD SUCCESS

**Step 4: Commit**

```bash
git add frontend/src/pages/AdminVolunteers.tsx
git commit -m "refactor: remove manual seed button from AdminVolunteers

Auto-seed on acceptance makes the manual button unnecessary."
```

---

### Task 5: Run full test suite and verify

**Step 1: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: ALL PASS

**Step 2: Run frontend tests**

Run: `cd frontend && npx vitest run`
Expected: ALL PASS

**Step 3: Run frontend build**

Run: `cd frontend && npm run build`
Expected: BUILD SUCCESS

**Step 4: Run frontend lint**

Run: `cd frontend && npx eslint .`
Expected: No errors
