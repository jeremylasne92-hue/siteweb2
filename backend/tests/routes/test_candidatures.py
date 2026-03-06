"""
Tests for Story 2.3: Candidatures Techniques Anti-Spam.
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from server import app
from routes.auth import get_db

client = TestClient(app)

VALID_DATA = {
    "name": "John Doe",
    "email": "john@example.com",
    "project": "cognisphere",
    "skills": "React, TypeScript, Python",
    "message": "Je souhaite contribuer au développement de Cognisphère.",
    "website": "",
}


def make_mock_db(recent_count=0):
    """Create a mock database for candidatures."""
    db = MagicMock()
    db.tech_candidatures.insert_one = AsyncMock()
    db.tech_candidatures.count_documents = AsyncMock(return_value=recent_count)
    return db


def test_candidature_success():
    """POST /candidatures/tech with valid data stores candidature."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.candidatures.send_email", new_callable=AsyncMock) as mock_email:
        response = client.post("/api/candidatures/tech", json=VALID_DATA)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Candidature envoyée avec succès"
    db.tech_candidatures.insert_one.assert_called_once()
    mock_email.assert_called_once()


def test_candidature_honeypot_rejected():
    """POST /candidatures/tech with honeypot filled does NOT store candidature."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "website": "http://spam.com"}

    with patch("routes.candidatures.send_email", new_callable=AsyncMock) as mock_email:
        response = client.post("/api/candidatures/tech", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    # Returns success to not inform the bot, but does NOT store
    assert response.json()["message"] == "Candidature envoyée avec succès"
    db.tech_candidatures.insert_one.assert_not_called()
    mock_email.assert_not_called()


def test_candidature_rate_limited():
    """POST /candidatures/tech when rate limit exceeded returns rate_limited."""
    db = make_mock_db(recent_count=3)
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.candidatures.send_email", new_callable=AsyncMock):
        response = client.post("/api/candidatures/tech", json=VALID_DATA)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["rate_limited"] is True
    db.tech_candidatures.insert_one.assert_not_called()


def test_candidature_validation_short_name():
    """POST /candidatures/tech with too short name returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "name": "J"}
    response = client.post("/api/candidatures/tech", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_candidature_validation_short_message():
    """POST /candidatures/tech with too short message returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_DATA, "message": "Bonjour"}
    response = client.post("/api/candidatures/tech", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 422
