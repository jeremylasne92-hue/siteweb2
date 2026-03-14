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


def make_mock_db(recent_count=0):
    """Create a mock database for volunteer applications."""
    db = MagicMock()
    db.volunteer_applications.insert_one = AsyncMock()
    db.volunteer_applications.count_documents = AsyncMock(return_value=recent_count)
    return db


def test_submit_volunteer_application():
    """POST /volunteers/apply with valid data returns 200 + succès."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.volunteers.send_email", new_callable=AsyncMock):
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
