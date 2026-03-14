"""
Tests for Story 4.3: Gestion de l'Agenda Evenements (CRUD).
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from server import app
from routes.auth import get_db, get_current_user, require_admin
from models import User, UserRole
from datetime import datetime

client = TestClient(app)

ADMIN_USER = User(
    id="admin-test-id",
    username="admin",
    email="admin@echo.fr",
    role=UserRole.ADMIN,
    created_at=datetime.utcnow(),
)

VALID_EVENT = {
    "title": "Avant-première Saison 1",
    "description": "Projection de lancement de la Saison 1 en présence de l'équipe.",
    "date": "2026-05-15T20:00:00",
    "time": "20:00",
    "location": "Paris, Le Grand Rex",
    "type": "Projection",
}

CREATED_EVENT_DOC = {
    "id": "evt-test-123",
    "title": "Avant-première Saison 1",
    "description": "Projection de lancement de la Saison 1 en présence de l'équipe.",
    "date": datetime(2026, 5, 15, 20, 0),
    "date_end": None,
    "time": "20:00",
    "location": "Paris, Le Grand Rex",
    "type": "Projection",
    "image_url": None,
    "images": [],
    "booking_enabled": False,
    "booking_url": None,
    "is_published": True,
    "created_at": datetime.utcnow(),
    "updated_at": datetime.utcnow(),
}


def make_mock_db(events=None):
    """Create a mock database for event tests."""
    db = MagicMock()
    mock_find = MagicMock()
    mock_find.sort = MagicMock(return_value=mock_find)
    mock_find.to_list = AsyncMock(return_value=events or [])
    db.events.find = MagicMock(return_value=mock_find)
    db.events.find_one = AsyncMock(return_value=None)
    db.events.insert_one = AsyncMock()
    db.events.update_one = AsyncMock()
    db.events.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
    return db


def test_create_event_admin():
    """POST /events with admin token creates event successfully."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.post("/api/events", json=VALID_EVENT)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == VALID_EVENT["title"]
    assert data["location"] == VALID_EVENT["location"]
    db.events.insert_one.assert_called_once()


def test_list_events_public():
    """GET /events returns published events without auth."""
    db = make_mock_db(events=[CREATED_EVENT_DOC])
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/events")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Avant-première Saison 1"


def test_create_event_unauthorized():
    """POST /events without auth returns 401."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    # Don't override require_admin — will fail auth

    response = client.post("/api/events", json=VALID_EVENT)

    app.dependency_overrides.clear()

    assert response.status_code in (401, 403)


def test_delete_event_admin():
    """DELETE /events/{id} with admin token deletes event."""
    db = make_mock_db()
    db.events.find_one = AsyncMock(return_value=CREATED_EVENT_DOC)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.delete("/api/events/evt-test-123")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert "deleted" in response.json()["message"].lower()
    db.events.delete_one.assert_called_once()


def test_update_event_admin():
    """PUT /events/{id} with admin token updates event."""
    db = make_mock_db()
    db.events.find_one = AsyncMock(return_value=CREATED_EVENT_DOC)
    # After update, return updated doc
    updated_doc = {**CREATED_EVENT_DOC, "title": "Titre modifié"}
    db.events.find_one = AsyncMock(side_effect=[CREATED_EVENT_DOC, updated_doc])
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    updated_data = {**VALID_EVENT, "title": "Titre modifié"}
    response = client.put("/api/events/evt-test-123", json=updated_data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["title"] == "Titre modifié"
    db.events.update_one.assert_called_once()
