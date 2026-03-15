"""
Tests for volunteer application feature: submission, honeypot, validation, and admin auth.
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from server import app
from routes.auth import get_db, require_admin

client = TestClient(app)

VALID_DATA = {
    "name": "Alice Martin",
    "email": "alice@example.com",
    "phone": "0612345678",
    "city": "Lyon",
    "motivation": ["environnement", "communauté"],
    "skills": ["communication", "design"],
    "experience_level": "professional",
    "availability": "regular",
    "values_accepted": True,
    "message": "Je souhaite m'engager pour la transition écologique.",
    "website": "",
}


def make_mock_db():
    """Create a mock database for volunteer applications."""
    db = MagicMock()
    db.volunteer_applications.insert_one = AsyncMock()
    return db


def test_submit_volunteer_application():
    """POST /volunteers/apply with valid data returns 200 + succès."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.volunteers.send_email", new_callable=AsyncMock), \
         patch("routes.volunteers.check_rate_limit", new_callable=AsyncMock):
        response = client.post("/api/volunteers/apply", json=VALID_DATA)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert "succès" in response.json()["message"]
    db.volunteer_applications.insert_one.assert_called_once()


def test_submit_volunteer_honeypot_reject():
    """POST /volunteers/apply with honeypot filled silently rejects (200 but no store)."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "website": "http://spam.bot"}

    with patch("routes.volunteers.send_email", new_callable=AsyncMock) as mock_email:
        response = client.post("/api/volunteers/apply", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    db.volunteer_applications.insert_one.assert_not_called()
    mock_email.assert_not_called()


def test_submit_volunteer_values_required():
    """POST /volunteers/apply with values_accepted=False returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "values_accepted": False}
    response = client.post("/api/volunteers/apply", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_submit_volunteer_skills_required():
    """POST /volunteers/apply with empty skills=[] returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "skills": []}
    response = client.post("/api/volunteers/apply", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_admin_list_volunteers_unauthorized():
    """GET /volunteers/admin/all without admin auth returns 401 or 403."""
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/volunteers/admin/all")

    app.dependency_overrides.clear()

    assert response.status_code in (401, 403)


def test_admin_export_volunteers_unauthorized():
    """GET /volunteers/admin/export without admin auth returns 401 or 403."""
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/volunteers/admin/export")

    app.dependency_overrides.clear()

    assert response.status_code in (401, 403)


def test_accept_volunteer_triggers_auto_seed():
    """PUT /volunteers/admin/{id}/status with accepted triggers auto_seed_member_profile."""
    from models import User, UserRole
    from datetime import datetime

    mock_admin = User(
        id="admin-1",
        username="admin",
        email="admin@example.com",
        password_hash="hashed",
        role=UserRole.ADMIN,
    )

    candidature_doc = {
        "id": "vol-1",
        "name": "Alice Martin",
        "email": "alice@example.com",
        "phone": "0612345678",
        "city": "Lyon",
        "skills": ["communication"],
        "experience_level": "professional",
        "availability": "regular",
        "status": "accepted",
        "created_at": datetime(2026, 1, 1),
    }

    db = MagicMock()
    update_result = MagicMock()
    update_result.matched_count = 1
    db.volunteer_applications.update_one = AsyncMock(return_value=update_result)
    db.volunteer_applications.find_one = AsyncMock(return_value=candidature_doc)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: mock_admin

    with patch("routes.volunteers.auto_seed_member_profile", new_callable=AsyncMock) as mock_seed:
        response = client.put("/api/volunteers/admin/vol-1/status", json={"status": "accepted"})

    app.dependency_overrides.clear()

    assert response.status_code == 200
    mock_seed.assert_called_once_with(db, candidature_doc, "volunteer")


def test_reject_volunteer_triggers_deactivate():
    """PUT /volunteers/admin/{id}/status with rejected deactivates member profile."""
    from models import User, UserRole

    mock_admin = User(
        id="admin-1",
        username="admin",
        email="admin@example.com",
        password_hash="hashed",
        role=UserRole.ADMIN,
    )

    application_doc = {
        "id": "vol-2",
        "name": "Bob Martin",
        "email": "bob@example.com",
        "skills": ["communication"],
    }

    db = MagicMock()
    update_result = MagicMock()
    update_result.matched_count = 1
    db.volunteer_applications.update_one = AsyncMock(return_value=update_result)
    db.volunteer_applications.find_one = AsyncMock(return_value=application_doc)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: mock_admin

    with patch("routes.volunteers.deactivate_member_profile", new_callable=AsyncMock) as mock_deactivate:
        response = client.put("/api/volunteers/admin/vol-2/status", json={"status": "rejected"})

    app.dependency_overrides.clear()

    assert response.status_code == 200
    mock_deactivate.assert_called_once_with(db, "vol-2")


def test_full_admin_lifecycle_accept_reject_reaccept():
    """Full lifecycle: accept → profile created → reject → profile deactivated → re-accept → reactivated."""
    from models import User, UserRole
    from datetime import datetime

    mock_admin = User(
        id="admin-1",
        username="admin",
        email="admin@example.com",
        password_hash="hashed",
        role=UserRole.ADMIN,
    )

    application_doc = {
        "id": "vol-lifecycle",
        "name": "Lifecycle Test",
        "email": "lifecycle@example.com",
        "phone": "0600000000",
        "city": "Paris",
        "skills": ["communication"],
        "experience_level": "professional",
        "availability": "regular",
        "status": "pending",
        "created_at": datetime(2026, 1, 1),
    }

    # Track member_profiles state in-memory
    profiles_store = {}

    async def mock_find_one_profile(query):
        cid = query.get("candidature_id")
        if cid and cid in profiles_store:
            return profiles_store[cid].copy()
        slug = query.get("slug")
        if slug:
            for p in profiles_store.values():
                if p.get("slug") == slug:
                    return p.copy()
        return None

    async def mock_insert_one_profile(doc):
        profiles_store[doc["candidature_id"]] = doc.copy()
        result = MagicMock()
        result.inserted_id = "new-id"
        return result

    async def mock_update_one_profile(query, update):
        cid = query.get("candidature_id")
        result = MagicMock()
        if cid and cid in profiles_store:
            for key, val in update.get("$set", {}).items():
                profiles_store[cid][key] = val
            result.matched_count = 1
        else:
            result.matched_count = 0
        return result

    update_result = MagicMock()
    update_result.matched_count = 1

    db = MagicMock()
    db.volunteer_applications.update_one = AsyncMock(return_value=update_result)
    db.volunteer_applications.find_one = AsyncMock(return_value=application_doc)
    db.member_profiles.find_one = AsyncMock(side_effect=mock_find_one_profile)
    db.member_profiles.insert_one = AsyncMock(side_effect=mock_insert_one_profile)
    db.member_profiles.update_one = AsyncMock(side_effect=mock_update_one_profile)
    db.users.find_one = AsyncMock(return_value=None)
    db.users.update_one = AsyncMock()
    # Mock the find().to_list() chain used by slug uniqueness check
    find_cursor = MagicMock()
    find_cursor.to_list = AsyncMock(return_value=[])
    db.member_profiles.find = MagicMock(return_value=find_cursor)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: mock_admin

    try:
        # Step 1: ACCEPT — profile should be created
        with patch("routes.volunteers.send_volunteer_accepted", new_callable=AsyncMock):
            resp = client.put("/api/volunteers/admin/vol-lifecycle/status", json={"status": "accepted"})
        assert resp.status_code == 200, f"Accept failed: {resp.json()}"
        assert "vol-lifecycle" in profiles_store, "Profile was NOT created on accept"
        assert profiles_store["vol-lifecycle"]["visible"] is True
        assert profiles_store["vol-lifecycle"]["membership_status"] == "active"

        # Step 2: REJECT — profile should be deactivated
        with patch("routes.volunteers.send_volunteer_rejected", new_callable=AsyncMock):
            resp = client.put("/api/volunteers/admin/vol-lifecycle/status", json={"status": "rejected"})
        assert resp.status_code == 200, f"Reject failed: {resp.json()}"
        assert profiles_store["vol-lifecycle"]["visible"] is False, "Profile still visible after reject!"
        assert profiles_store["vol-lifecycle"]["membership_status"] == "inactive", "Profile still active after reject!"

        # Step 3: RE-ACCEPT — profile should be reactivated
        with patch("routes.volunteers.send_volunteer_accepted", new_callable=AsyncMock):
            resp = client.put("/api/volunteers/admin/vol-lifecycle/status", json={"status": "accepted"})
        assert resp.status_code == 200, f"Re-accept failed: {resp.json()}"
        assert profiles_store["vol-lifecycle"]["visible"] is True, "Profile not reactivated!"
        assert profiles_store["vol-lifecycle"]["membership_status"] == "active", "Profile not reactivated!"

    finally:
        app.dependency_overrides.clear()
