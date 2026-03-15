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
