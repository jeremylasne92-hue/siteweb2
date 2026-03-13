"""
Tests for POST /api/contact endpoint.
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from server import app
from routes.auth import get_db

client = TestClient(app)

VALID_DATA = {
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "subject": "question_generale",
    "message": "Bonjour, je souhaite en savoir plus sur le mouvement ECHO.",
    "consent_rgpd": True,
    "website": "",
}


def make_mock_db(recent_count=0):
    db = MagicMock()
    db.contact_messages.insert_one = AsyncMock()
    db.contact_messages.count_documents = AsyncMock(return_value=recent_count)
    return db


def test_contact_success():
    """POST /api/contact with valid data stores message and returns success."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.contact.send_email", new_callable=AsyncMock):
        response = client.post("/api/contact", json=VALID_DATA)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Message envoyé avec succès"
    db.contact_messages.insert_one.assert_called_once()
    stored = db.contact_messages.insert_one.call_args[0][0]
    assert stored["name"] == "Jean Dupont"
    assert stored["email"] == "jean@example.com"
    assert stored["subject"] == "question_generale"
    assert stored["read"] is False


def test_contact_honeypot_rejected():
    """POST /api/contact with honeypot filled does NOT store message."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "website": "http://spam.com"}

    with patch("routes.contact.send_email", new_callable=AsyncMock) as mock_email:
        response = client.post("/api/contact", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Message envoyé avec succès"
    db.contact_messages.insert_one.assert_not_called()
    mock_email.assert_not_called()


def test_contact_rate_limited():
    """POST /api/contact when rate limit exceeded returns 429."""
    db = make_mock_db(recent_count=3)
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.contact.send_email", new_callable=AsyncMock):
        response = client.post("/api/contact", json=VALID_DATA)

    app.dependency_overrides.clear()

    assert response.status_code == 429


def test_contact_validation_short_name():
    """POST /api/contact with too short name returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "name": "J"}
    response = client.post("/api/contact", json=data)

    app.dependency_overrides.clear()
    assert response.status_code == 422


def test_contact_validation_short_message():
    """POST /api/contact with too short message returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "message": "Bonjour"}
    response = client.post("/api/contact", json=data)

    app.dependency_overrides.clear()
    assert response.status_code == 422


def test_contact_validation_invalid_subject():
    """POST /api/contact with invalid subject returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "subject": "invalid_subject"}
    response = client.post("/api/contact", json=data)

    app.dependency_overrides.clear()
    assert response.status_code == 422


def test_contact_without_consent():
    """POST /api/contact without RGPD consent returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "consent_rgpd": False}
    response = client.post("/api/contact", json=data)

    app.dependency_overrides.clear()
    assert response.status_code == 422
