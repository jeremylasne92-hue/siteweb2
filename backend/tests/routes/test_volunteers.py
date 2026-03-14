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
