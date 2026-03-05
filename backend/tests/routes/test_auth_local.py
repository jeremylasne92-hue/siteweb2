"""
Tests for Story 1.2: Authentification Classique Sécurisée.
Tests register and login-local endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from server import app
from routes.auth import get_db

client = TestClient(app)


def make_mock_db():
    """Create a mock database with async collection methods."""
    db = MagicMock()
    db.users.find_one = AsyncMock(return_value=None)
    db.users.insert_one = AsyncMock()
    db.users.update_one = AsyncMock()
    db.user_sessions.insert_one = AsyncMock()
    return db


# ==================== REGISTER ====================


def test_register_success():
    """Register with valid data creates user and returns success."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "StrongP@ss1",
        "password_confirm": "StrongP@ss1",
        "age_consent": True
    })

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data
    db.users.insert_one.assert_called_once()


def test_register_duplicate_email():
    """Register with existing email returns 400 with generic message (H2)."""
    db = make_mock_db()
    db.users.find_one = AsyncMock(return_value={
        "email": "test@example.com",
        "username": "otheruser"
    })
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/register", json={
        "username": "newuser",
        "email": "test@example.com",
        "password": "StrongP@ss1",
        "password_confirm": "StrongP@ss1",
        "age_consent": True
    })

    app.dependency_overrides.clear()
    assert response.status_code == 400
    # H2 — generic message, should NOT reveal if email or username is the issue
    assert "existe déjà" in response.json()["detail"].lower()


def test_register_password_mismatch():
    """Register with mismatched passwords returns 400 (M4)."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "StrongP@ss1",
        "password_confirm": "DifferentP@ss2",
        "age_consent": True
    })

    app.dependency_overrides.clear()
    assert response.status_code == 400
    assert "correspondent" in response.json()["detail"].lower()


def test_register_weak_password():
    """Register with weak password returns 400."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "weak",
        "password_confirm": "weak",
        "age_consent": True
    })

    app.dependency_overrides.clear()
    assert response.status_code == 400
    assert "mot de passe" in response.json()["detail"].lower()


# ==================== LOGIN-LOCAL ====================


def test_login_local_success():
    """Login with correct credentials returns user and sets cookie."""
    from auth_utils import hash_password
    hashed = hash_password("StrongP@ss1")

    db = make_mock_db()
    db.users.find_one = AsyncMock(return_value={
        "id": "user-123",
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": hashed,
        "role": "user",
        "picture": None,
        "oauth_provider": None,
        "oauth_id": None,
        "is_2fa_enabled": False,
        "totp_secret": None,
        "created_at": "2026-01-01T00:00:00",
        "last_login": None
    })
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/login-local", json={
        "identifier": "test@example.com",
        "password": "StrongP@ss1"
    })

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["email"] == "test@example.com"
    # M5 — session_token should NOT be in JSON body, only in httpOnly cookie
    assert "session_token" not in data
    assert response.cookies.get("session_token") is not None


def test_login_local_wrong_password():
    """Login with wrong password returns 401."""
    from auth_utils import hash_password
    hashed = hash_password("CorrectP@ss1")

    db = make_mock_db()
    db.users.find_one = AsyncMock(return_value={
        "id": "user-123",
        "username": "testuser",
        "email": "test@example.com",
        "password_hash": hashed,
        "role": "user",
        "picture": None,
        "oauth_provider": None,
        "oauth_id": None,
        "is_2fa_enabled": False,
        "totp_secret": None,
        "created_at": "2026-01-01T00:00:00",
        "last_login": None
    })
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/login-local", json={
        "identifier": "test@example.com",
        "password": "WrongP@ss1"
    })

    app.dependency_overrides.clear()
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_login_local_unknown_user():
    """Login with unknown email returns 401."""
    db = make_mock_db()
    db.users.find_one = AsyncMock(return_value=None)
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/login-local", json={
        "identifier": "unknown@example.com",
        "password": "AnyP@ss1"
    })

    app.dependency_overrides.clear()
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()
