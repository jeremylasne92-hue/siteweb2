# MongoDB Audit & Optimization — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Audit and optimize all MongoDB operations across the ECHO backend — add missing indexes, implement error handling middleware, add targeted try/except on critical routes, fix N+1 queries, add caps and projections.

**Architecture:** Option C (hybrid) — a global PyMongoError middleware as safety net + targeted try/except on 6 critical routes. 14 missing indexes added in `startup_indexes()`. Query optimizations (caps, projections, N+1 fix) applied surgically.

**Tech Stack:** FastAPI, Motor 3.3 (async MongoDB), pymongo exceptions, Pytest

---

## Task 1: Add 14 Missing Indexes in `startup_indexes()`

**Files:**
- Modify: `backend/server.py:102-152`

**Step 1: Write the new index block**

Add the following block after the existing "Performance indexes" block (after line 150) in the `startup_indexes()` function:

```python
    # Query indexes for hot paths (audit 2026-03-15)
    try:
        # Events: GET by id + public listing
        await db.events.create_index("id")
        await db.events.create_index([("is_published", 1), ("date", 1)])

        # Partners: partner account lookups + admin filtering
        await db.partners.create_index("user_id")
        await db.partners.create_index("status")

        # Video progress: user+episode compound (upsert pattern)
        await db.video_progress.create_index(
            [("user_id", 1), ("episode_id", 1)], unique=True
        )

        # Episode opt-ins: user lookup
        await db.episode_optins.create_index("user_id")

        # Tech candidatures: /me by email + admin filtering + rate limit
        await db.tech_candidatures.create_index("email")
        await db.tech_candidatures.create_index([("status", 1), ("project", 1)])
        await db.tech_candidatures.create_index([("ip_address", 1), ("created_at", 1)])

        # Volunteer applications: /me by email + admin filtering + rate limit
        await db.volunteer_applications.create_index("email")
        await db.volunteer_applications.create_index("status")
        await db.volunteer_applications.create_index([("ip_address", 1), ("created_at", 1)])

        # Contact messages: rate limiting
        await db.contact_messages.create_index([("ip_address", 1), ("created_at", 1)])

        # Pending 2FA: auto-expire codes after 10 minutes (security + cleanup)
        await db.pending_2fa.create_index("created_at", expireAfterSeconds=600)
    except Exception as e:
        logger.warning(f"Audit index creation: {e}")
```

**Step 2: Run backend tests to verify no regression**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All 128 tests PASS

**Step 3: Commit**

```bash
git add backend/server.py
git commit -m "perf: add 14 missing MongoDB indexes for hot query paths"
```

---

## Task 2: Add Global PyMongoError Middleware

**Files:**
- Modify: `backend/server.py` (add import + middleware class)

**Step 1: Add pymongo import at top of server.py**

After `import logging` (line 10), add:

```python
from pymongo.errors import PyMongoError
```

**Step 2: Add the middleware class after SecurityHeadersMiddleware**

After line 93 (`app.add_middleware(SecurityHeadersMiddleware)`), add:

```python

class MongoDBErrorMiddleware(BaseHTTPMiddleware):
    """Global safety net: catch unhandled MongoDB errors and return 503 instead of 500 with stack trace."""
    async def dispatch(self, request: StarletteRequest, call_next):
        try:
            return await call_next(request)
        except PyMongoError as e:
            logger.error(f"Unhandled MongoDB error on {request.method} {request.url.path}: {e}")
            from starlette.responses import JSONResponse
            return JSONResponse(
                status_code=503,
                content={"detail": "Service temporairement indisponible. Veuillez réessayer."},
            )

app.add_middleware(MongoDBErrorMiddleware)
```

**Step 3: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add backend/server.py
git commit -m "feat: add global PyMongoError middleware as safety net (option C)"
```

---

## Task 3: Add Targeted try/except on 6 Critical Routes

**Files:**
- Modify: `backend/routes/contact.py:48-58`
- Modify: `backend/routes/candidatures.py:51-64`
- Modify: `backend/routes/volunteers.py:63-71`
- Modify: `backend/routes/auth.py:82-87` (register)
- Modify: `backend/routes/auth.py:417-456` (delete_user)
- Modify: `backend/routes/partners.py:258-323` (apply_partnership, user+partner creation)

### Step 1: contact.py — wrap insert_one

In `backend/routes/contact.py`, add import at top:

```python
from pymongo.errors import PyMongoError
```

Replace the bare `await db.contact_messages.insert_one(doc)` (line 58) with:

```python
    try:
        await db.contact_messages.insert_one(doc)
    except PyMongoError as e:
        logger.error(f"Failed to save contact message: {e}")
        raise HTTPException(status_code=503, detail="Impossible d'envoyer votre message. Veuillez réessayer.")
```

### Step 2: candidatures.py — wrap insert_one in _process_candidature

In `backend/routes/candidatures.py`, add import at top:

```python
from pymongo.errors import PyMongoError
```

Replace the bare `await db.tech_candidatures.insert_one(candidature.model_dump())` (line 64) with:

```python
    try:
        await db.tech_candidatures.insert_one(candidature.model_dump())
    except PyMongoError as e:
        logger.error(f"Failed to save candidature: {e}")
        raise HTTPException(status_code=503, detail="Impossible d'enregistrer votre candidature. Veuillez réessayer.")
```

### Step 3: volunteers.py — wrap insert_one

In `backend/routes/volunteers.py`, add import at top:

```python
from pymongo.errors import PyMongoError
```

Replace the bare `await db.volunteer_applications.insert_one(application.model_dump())` (line 71) with:

```python
    try:
        await db.volunteer_applications.insert_one(application.model_dump())
    except PyMongoError as e:
        logger.error(f"Failed to save volunteer application: {e}")
        raise HTTPException(status_code=503, detail="Impossible d'enregistrer votre candidature. Veuillez réessayer.")
```

### Step 4: auth.py register — wrap service call

In `backend/routes/auth.py`, add import at top:

```python
from pymongo.errors import PyMongoError
```

Replace the register route body (lines 85-87):

```python
    await check_rate_limit(db, request, "register", max_requests=5, window_minutes=15)
    result = await register_user(user_data, db)
    return result
```

With:

```python
    await check_rate_limit(db, request, "register", max_requests=5, window_minutes=15)
    try:
        result = await register_user(user_data, db)
    except PyMongoError as e:
        logger.error(f"Failed to register user: {e}")
        raise HTTPException(status_code=503, detail="Impossible de créer votre compte. Veuillez réessayer.")
    return result
```

### Step 5: auth.py delete_user — wrap cascade deletes

Replace the cascade deletion block in `delete_user` (lines 432-443):

```python
    # Delete user data
    await db.users.delete_one({"id": user_id})
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.video_progress.delete_many({"user_id": user_id})
    await db.pending_2fa.delete_many({"user_id": user_id})
    # Cascade: delete partner data
    await db.partners.delete_many({"user_id": user_id})
    # Cascade: delete tech candidatures by email
    if current_user.email:
        await db.tech_candidatures.delete_many({"email": current_user.email})
    # Cascade: delete episode optins
    await db.episode_optins.delete_many({"user_id": user_id})
```

With:

```python
    # Delete user data (cascade)
    try:
        await db.users.delete_one({"id": user_id})
        await db.user_sessions.delete_many({"user_id": user_id})
        await db.video_progress.delete_many({"user_id": user_id})
        await db.pending_2fa.delete_many({"user_id": user_id})
        await db.partners.delete_many({"user_id": user_id})
        if current_user.email:
            await db.tech_candidatures.delete_many({"email": current_user.email})
        await db.episode_optins.delete_many({"user_id": user_id})
    except PyMongoError as e:
        logger.error(f"Failed to delete user data for {user_id}: {e}")
        raise HTTPException(status_code=503, detail="Impossible de supprimer votre compte. Veuillez réessayer.")
```

### Step 6: partners.py apply — wrap user+partner creation

In `backend/routes/partners.py`, add import at top:

```python
from pymongo.errors import PyMongoError
```

Wrap the user creation + partner creation block (lines 265-323). Replace:

```python
    await db.users.insert_one(user_doc.model_dump())
```

With:

```python
    try:
        await db.users.insert_one(user_doc.model_dump())
    except PyMongoError as e:
        logger.error(f"Failed to create partner user account: {e}")
        raise HTTPException(status_code=503, detail="Impossible de créer votre compte. Veuillez réessayer.")
```

And wrap the partner insert (line 323):

```python
    await db.partners.insert_one(partner.model_dump())
```

With:

```python
    try:
        await db.partners.insert_one(partner.model_dump())
    except PyMongoError as e:
        # Rollback: delete the user we just created
        await db.users.delete_one({"id": user_doc.id})
        logger.error(f"Failed to create partner record, rolled back user: {e}")
        raise HTTPException(status_code=503, detail="Impossible de soumettre votre candidature. Veuillez réessayer.")
```

### Step 7: Run backend tests

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

### Step 8: Commit

```bash
git add backend/routes/contact.py backend/routes/candidatures.py backend/routes/volunteers.py backend/routes/auth.py backend/routes/partners.py
git commit -m "feat: add targeted try/except on 6 critical routes (option C)"
```

---

## Task 4: Fix N+1 Query in members.py (slug uniqueness)

**Files:**
- Modify: `backend/routes/members.py:370-373`

**Step 1: Replace the slug uniqueness loop**

Replace the while loop (lines 370-373):

```python
    while await db.member_profiles.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1
```

With a single `$in` query:

```python
    # Check slug uniqueness with a single query instead of N+1
    existing_slugs_docs = await db.member_profiles.find(
        {"slug": {"$regex": f"^{re.escape(base_slug)}(-\\d+)?$"}},
        {"slug": 1, "_id": 0},
    ).to_list(length=100)
    existing_slugs = {doc["slug"] for doc in existing_slugs_docs}
    while slug in existing_slugs:
        slug = f"{base_slug}-{counter}"
        counter += 1
```

**Step 2: Run backend tests**

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS (including test_members.py)

**Step 3: Commit**

```bash
git add backend/routes/members.py
git commit -m "perf: fix N+1 slug uniqueness query in auto_seed_member_profile"
```

---

## Task 5: Add Caps on Unbounded `to_list(None)` (non-export)

**Files:**
- Modify: `backend/routes/candidatures.py:126-131` (admin list)
- Modify: `backend/routes/volunteers.py:110-115` (admin list)
- Modify: `backend/routes/partners.py:526-527` (admin list)
- Modify: `backend/routes/episodes.py:36` (public list)

### Step 1: candidatures.py admin list — add cap

Replace (lines 126-131):

```python
    cursor = db.tech_candidatures.find(query).sort("created_at", -1)
    candidatures = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        candidatures.append(doc)
    return candidatures
```

With:

```python
    cursor = db.tech_candidatures.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=500)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs
```

### Step 2: volunteers.py admin list — add cap

Replace (lines 110-115):

```python
    cursor = db.volunteer_applications.find(query).sort("created_at", -1)
    applications = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        applications.append(doc)
    return applications
```

With:

```python
    cursor = db.volunteer_applications.find(query).sort("created_at", -1)
    docs = await cursor.to_list(length=500)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return docs
```

### Step 3: episodes.py public list — already has cap=1000, reduce to 100

Replace line 36:

```python
    episodes = await db.episodes.find(query).sort([("season", 1), ("episode", 1)]).to_list(1000)
```

With:

```python
    episodes = await db.episodes.find(query).sort([("season", 1), ("episode", 1)]).to_list(length=100)
```

### Step 4: Run backend tests

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

### Step 5: Commit

```bash
git add backend/routes/candidatures.py backend/routes/volunteers.py backend/routes/episodes.py
git commit -m "perf: add caps on unbounded to_list() for admin and public endpoints"
```

---

## Task 6: Add Projections on Heavy Queries

**Files:**
- Modify: `backend/routes/partners.py:526` (admin list — exclude ip_address)
- Modify: `backend/routes/candidatures.py:295-298` (/me — already has projection ✓)
- Modify: `backend/routes/events.py:23-24` (public list — exclude _id)
- Modify: `backend/routes/analytics.py:77` (count only, no change needed)

### Step 1: partners.py admin list — exclude ip_address from response

Replace (line 526):

```python
    cursor = db.partners.find(query).sort("created_at", -1)
```

With:

```python
    cursor = db.partners.find(query, {"_id": 0, "ip_address": 0}).sort("created_at", -1)
```

And remove the manual `doc.pop("_id", None)` loop below (lines 529-532), replace with simpler:

```python
    results = await cursor.to_list(length=500)
    for doc in results:
        if "id" not in doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
    return results
```

### Step 2: events.py public list — add projection

Replace line 24:

```python
    events = await db.events.find({"is_published": True}).sort("date", 1).to_list(100)
```

With:

```python
    events = await db.events.find({"is_published": True}, {"_id": 0}).sort("date", 1).to_list(length=100)
```

### Step 3: Run backend tests

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

### Step 4: Commit

```bash
git add backend/routes/partners.py backend/routes/events.py
git commit -m "perf: add projections to reduce document transfer on heavy queries"
```

---

## Task 7: Write Tests for Middleware + Critical Error Handling

**Files:**
- Create: `backend/tests/test_mongodb_error_handling.py`

### Step 1: Write the test file

```python
"""
Tests for MongoDB error handling — middleware + targeted try/except.
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from pymongo.errors import ServerSelectionTimeoutError
from server import app
from routes.auth import get_db

client = TestClient(app)


def make_failing_db():
    """Create a mock DB where insert_one raises a PyMongoError."""
    db = MagicMock()
    error = ServerSelectionTimeoutError("MongoDB unreachable")
    db.contact_messages.count_documents = AsyncMock(return_value=0)
    db.contact_messages.insert_one = AsyncMock(side_effect=error)
    return db


def test_contact_mongodb_error_returns_503():
    """POST /api/contact when MongoDB fails returns 503 with clean message."""
    db = make_failing_db()
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.contact.send_email", new_callable=AsyncMock):
        response = client.post("/api/contact", json={
            "name": "Test User",
            "email": "test@example.com",
            "subject": "question_generale",
            "message": "Ce message devrait échouer proprement.",
            "consent_rgpd": True,
            "website": "",
        })

    app.dependency_overrides.clear()

    assert response.status_code == 503
    body = response.json()
    assert "detail" in body
    # Verify no stack trace leaked
    assert "Traceback" not in body.get("detail", "")
    assert "PyMongo" not in body.get("detail", "")


def test_candidature_mongodb_error_returns_503():
    """POST /api/candidatures/tech when MongoDB fails returns 503."""
    db = MagicMock()
    error = ServerSelectionTimeoutError("MongoDB unreachable")
    db.tech_candidatures.count_documents = AsyncMock(return_value=0)
    db.tech_candidatures.insert_one = AsyncMock(side_effect=error)
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.candidatures.send_email", new_callable=AsyncMock), \
         patch("routes.candidatures.send_candidature_confirmation", new_callable=AsyncMock):
        response = client.post("/api/candidatures/tech", json={
            "name": "Dev Test",
            "email": "dev@example.com",
            "project": "cognisphere",
            "skills": "Python, FastAPI",
            "message": "Test candidature.",
            "website": "",
        })

    app.dependency_overrides.clear()

    assert response.status_code == 503
    assert "stack" not in response.text.lower()


def test_volunteer_mongodb_error_returns_503():
    """POST /api/volunteers/apply when MongoDB fails returns 503."""
    db = MagicMock()
    error = ServerSelectionTimeoutError("MongoDB unreachable")
    db.volunteer_applications.count_documents = AsyncMock(return_value=0)
    db.volunteer_applications.insert_one = AsyncMock(side_effect=error)
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.volunteers.send_email", new_callable=AsyncMock), \
         patch("routes.volunteers.send_volunteer_confirmation", new_callable=AsyncMock), \
         patch("routes.volunteers.geocode_city", new_callable=AsyncMock, return_value=None):
        response = client.post("/api/volunteers/apply", json={
            "name": "Volunteer Test",
            "email": "vol@example.com",
            "city": "Paris",
            "skills": ["communication"],
            "experience_level": "motivated",
            "availability": "punctual",
            "values_accepted": True,
            "website": "",
        })

    app.dependency_overrides.clear()

    assert response.status_code == 503
```

### Step 2: Run the new tests

Run: `cd backend && python -m pytest tests/test_mongodb_error_handling.py -p no:recording -v`
Expected: 3 tests PASS

### Step 3: Run full test suite

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS (131 total — 128 existing + 3 new)

### Step 4: Commit

```bash
git add backend/tests/test_mongodb_error_handling.py
git commit -m "test: add MongoDB error handling tests (middleware + targeted 503)"
```

---

## Task 8: Final Quality Workflow

Run all 4 quality checks in order:

### Step 1: ESLint

Run: `cd frontend && npx eslint .`
Expected: 0 errors

### Step 2: Vitest

Run: `cd frontend && npx vitest run`
Expected: All 18 tests PASS

### Step 3: Pytest

Run: `cd backend && python -m pytest -p no:recording -q`
Expected: All tests PASS

### Step 4: Production build

Run: `cd frontend && npm run build`
Expected: Build succeeds

### Step 5: Final commit (if any remaining fixes)

```bash
git add -A
git commit -m "chore: final quality pass for MongoDB audit"
```

---

## Summary

| Task | Chantier | Files | Risk |
|------|----------|-------|------|
| 1 | 14 index manquants | server.py | 🟢 Aucun (non-destructif) |
| 2 | Middleware global PyMongoError | server.py | 🟢 Faible |
| 3 | Try/except ciblés (6 routes) | auth, contact, candidatures, volunteers, partners | 🟡 Modéré |
| 4 | Fix N+1 slug | members.py | 🟢 Faible |
| 5 | Caps to_list | candidatures, volunteers, episodes | 🟢 Faible |
| 6 | Projections | partners, events | 🟢 Faible |
| 7 | Tests error handling | test_mongodb_error_handling.py | 🟢 Aucun |
| 8 | Quality workflow | — | 🟢 Aucun |

**Total estimated time:** 30-45 minutes
**Independent tasks (parallelizable):** Tasks 1-6 are mostly independent (different files). Task 7 depends on Tasks 2-3. Task 8 is final.
