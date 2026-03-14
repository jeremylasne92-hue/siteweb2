"""
Tests for Story 2.3: Candidatures Techniques Anti-Spam + Status Workflow.
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from server import app
from routes.auth import get_db, require_admin, get_current_user
from models import User, UserRole
from datetime import datetime

client = TestClient(app)

VALID_DATA = {
    "name": "John Doe",
    "email": "john@example.com",
    "project": "cognisphere",
    "skills": "React, TypeScript, Python",
    "message": "Je souhaite contribuer au développement de Cognisphère.",
    "website": "",
}

VALID_SCENARISTE_DATA = {
    "name": "Marie Dupont",
    "email": "marie@example.com",
    "project": "scenariste",
    "skills": "Écriture créative, dramaturgie, dialogue",
    "message": "Je souhaite contribuer à l'écriture de la série ECHO car je partage les valeurs du Mouvement.",
    "website": "",
    "portfolio_url": "https://marie-portfolio.com",
    "creative_interests": "Fiction, Écologie, Philosophie",
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


# --- Status workflow tests ---

ADMIN_USER = User(
    id="admin-test-id",
    username="admin",
    email="admin@echo.fr",
    role=UserRole.ADMIN,
    created_at=datetime.utcnow(),
)

REGULAR_USER = User(
    id="user-test-id",
    username="testuser",
    email="john@example.com",
    role=UserRole.USER,
    created_at=datetime.utcnow(),
)


def test_update_candidature_status():
    """PUT /candidatures/admin/{id}/status updates status."""
    db = MagicMock()
    update_result = MagicMock()
    update_result.matched_count = 1
    db.tech_candidatures.update_one = AsyncMock(return_value=update_result)
    db.tech_candidatures.find_one = AsyncMock(return_value={
        "id": "cand-123",
        "email": "alice@example.com",
        "name": "Alice",
        "project": "cognisphere",
    })

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.put(
        "/api/candidatures/admin/cand-123/status",
        json={"status": "entretien", "status_note": "Profil intéressant"},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert "entretien" in response.json()["message"]
    db.tech_candidatures.update_one.assert_called_once()


def test_batch_update_candidature_status():
    """PUT /candidatures/admin/batch-status updates multiple candidatures."""
    db = MagicMock()
    update_result = MagicMock()
    update_result.modified_count = 3
    db.tech_candidatures.update_many = AsyncMock(return_value=update_result)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.put(
        "/api/candidatures/admin/batch-status",
        json={"ids": ["id-1", "id-2", "id-3"], "status": "entretien"},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["count"] == 3


def test_get_my_candidatures():
    """GET /candidatures/me returns candidatures matching user email."""
    db = MagicMock()
    fake_docs = [
        {"id": "c1", "name": "John Doe", "email": "john@example.com", "project": "cognisphere",
         "skills": "React", "message": "Motivation", "status": "pending", "created_at": datetime.utcnow()},
    ]

    class AsyncCursorMock:
        def __init__(self, docs):
            self._docs = docs
        def sort(self, *args, **kwargs):
            return self
        async def __aiter__(self):
            for doc in self._docs:
                yield doc

    db.tech_candidatures.find = MagicMock(return_value=AsyncCursorMock(fake_docs))

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER

    response = client.get("/api/candidatures/me")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["project"] == "cognisphere"


def test_scenariste_candidature_success():
    """POST /candidatures/tech with scenariste project and portfolio_url stores candidature."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    with patch("routes.candidatures.send_email", new_callable=AsyncMock):
        response = client.post("/api/candidatures/tech", json=VALID_SCENARISTE_DATA)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Candidature envoyée avec succès"
    db.tech_candidatures.insert_one.assert_called_once()
    stored = db.tech_candidatures.insert_one.call_args[0][0]
    assert stored["project"] == "scenariste"
    assert stored["portfolio_url"] == "https://marie-portfolio.com"
    assert stored["creative_interests"] == "Fiction, Écologie, Philosophie"


def test_scenariste_invalid_portfolio_url():
    """POST /candidatures/tech with javascript: URL returns 422."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_SCENARISTE_DATA, "portfolio_url": "javascript:alert(1)"}
    response = client.post("/api/candidatures/tech", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 422


def test_scenariste_without_portfolio():
    """POST /candidatures/tech with scenariste and no portfolio_url succeeds."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    data = {**VALID_SCENARISTE_DATA, "portfolio_url": None, "creative_interests": None}

    with patch("routes.candidatures.send_email", new_callable=AsyncMock):
        response = client.post("/api/candidatures/tech", json=data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["message"] == "Candidature envoyée avec succès"


def test_update_status_unauthorized():
    """PUT /candidatures/admin/{id}/status without admin returns 401/403."""
    db = MagicMock()
    app.dependency_overrides[get_db] = lambda: db
    # Don't override require_admin — will fail auth

    response = client.put(
        "/api/candidatures/admin/cand-123/status",
        json={"status": "entretien"},
    )

    app.dependency_overrides.clear()

    assert response.status_code in (401, 403)
