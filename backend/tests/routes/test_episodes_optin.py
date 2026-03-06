"""
Tests for Story 2.2: Episode Opt-in (notification subscription).
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from server import app
from routes.auth import get_db, get_current_user
from models import User

client = TestClient(app)

FAKE_USER = User(
    id="user-123",
    username="testuser",
    email="test@example.com",
)


def make_mock_db():
    """Create a mock database with async collection methods."""
    db = MagicMock()
    db.episode_optins.find_one = AsyncMock(return_value=None)
    db.episode_optins.insert_one = AsyncMock()
    db.episode_optins.find = MagicMock()
    return db


def override_auth():
    """Override get_current_user to return a fake user."""
    return FAKE_USER


# ==================== OPT-IN ====================


def test_optin_requires_auth():
    """POST /episodes/opt-in without auth returns 401."""
    app.dependency_overrides.clear()
    response = client.post("/api/episodes/opt-in", json={
        "season": 1,
        "episode": 1
    })
    assert response.status_code == 401


def test_optin_success():
    """POST /episodes/opt-in with auth creates opt-in."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = override_auth

    response = client.post("/api/episodes/opt-in", json={
        "season": 1,
        "episode": 3
    })

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["already_subscribed"] is False
    db.episode_optins.insert_one.assert_called_once()


def test_optin_duplicate_is_idempotent():
    """POST /episodes/opt-in when already subscribed returns already_subscribed=True."""
    db = make_mock_db()
    db.episode_optins.find_one = AsyncMock(return_value={
        "user_id": "user-123",
        "season": 1,
        "episode": 3
    })
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = override_auth

    response = client.post("/api/episodes/opt-in", json={
        "season": 1,
        "episode": 3
    })

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["already_subscribed"] is True
    db.episode_optins.insert_one.assert_not_called()


def test_get_my_optins():
    """GET /episodes/opt-in/me returns user's opt-ins."""
    db = make_mock_db()
    mock_cursor = MagicMock()
    mock_cursor.to_list = AsyncMock(return_value=[
        {"user_id": "user-123", "season": 1, "episode": 1},
        {"user_id": "user-123", "season": 1, "episode": 5},
    ])
    db.episode_optins.find = MagicMock(return_value=mock_cursor)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = override_auth

    response = client.get("/api/episodes/opt-in/me")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert {"season": 1, "episode": 1} in data
    assert {"season": 1, "episode": 5} in data
