"""
Tests for Story 1.3: Réinitialisation de Mot de Passe.
Tests forgot-password and reset-password endpoints.
"""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from server import app
from routes.auth import get_db

client = TestClient(app)


def make_mock_db():
    """Create a mock database with async collection methods."""
    db = MagicMock()
    db.users.find_one = AsyncMock(return_value=None)
    db.users.update_one = AsyncMock()
    db.password_reset_tokens.find_one = AsyncMock(return_value=None)
    db.password_reset_tokens.insert_one = AsyncMock()
    db.password_reset_tokens.update_one = AsyncMock()
    db.password_reset_tokens.update_many = AsyncMock()
    # Rate limiting support
    db.rate_limits.count_documents = AsyncMock(return_value=0)
    db.rate_limits.insert_one = AsyncMock()
    return db


# ==================== FORGOT PASSWORD ====================


def test_forgot_password_known_email():
    """Forgot password with known email sends token and returns generic message."""
    db = make_mock_db()
    db.users.find_one = AsyncMock(return_value={
        "id": "user-123",
        "email": "test@example.com",
        "password_hash": "$2b$12$hashedpassword"
    })
    app.dependency_overrides[get_db] = lambda: db

    with patch("services.password_reset_service.send_password_reset", new_callable=AsyncMock) as mock_email:
        mock_email.return_value = True
        response = client.post("/api/auth/forgot-password", json={
            "email": "test@example.com"
        })

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert "si un compte" in response.json()["message"].lower()
    db.password_reset_tokens.insert_one.assert_called_once()


def test_forgot_password_unknown_email():
    """Forgot password with unknown email returns same generic message (anti-enumeration)."""
    db = make_mock_db()
    db.users.find_one = AsyncMock(return_value=None)
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/forgot-password", json={
        "email": "unknown@example.com"
    })

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert "si un compte" in response.json()["message"].lower()
    # Should NOT create a token for unknown email
    db.password_reset_tokens.insert_one.assert_not_called()


# ==================== VERIFY TOKEN ====================


def test_verify_token_valid():
    """Verify a valid, non-expired token returns valid: true."""
    db = make_mock_db()
    db.password_reset_tokens.find_one = AsyncMock(return_value={
        "token": "valid-token-123",
        "user_id": "user-123",
        "used": False,
        "expires_at": datetime.utcnow() + timedelta(hours=1)
    })
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/auth/reset-password/valid-token-123")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["valid"] is True


def test_verify_token_expired():
    """Verify an expired token returns 400."""
    db = make_mock_db()
    db.password_reset_tokens.find_one = AsyncMock(return_value={
        "token": "expired-token-123",
        "user_id": "user-123",
        "used": False,
        "expires_at": datetime.utcnow() - timedelta(hours=1)
    })
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/auth/reset-password/expired-token-123")

    app.dependency_overrides.clear()
    assert response.status_code == 400
    assert "expiré" in response.json()["detail"].lower()


# ==================== RESET PASSWORD ====================


def test_reset_password_success():
    """Reset password with valid token and strong password succeeds."""
    db = make_mock_db()
    db.password_reset_tokens.find_one = AsyncMock(return_value={
        "token": "valid-token-123",
        "user_id": "user-123",
        "used": False,
        "expires_at": datetime.utcnow() + timedelta(hours=1)
    })
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/reset-password/valid-token-123", json={
        "password": "NewStr0ng@Pass",
        "password_confirm": "NewStr0ng@Pass"
    })

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert "succès" in response.json()["message"].lower()
    # Verify password was updated and token was invalidated
    db.users.update_one.assert_called_once()
    db.password_reset_tokens.update_one.assert_called_once()


def test_reset_password_weak():
    """Reset with weak password returns 400."""
    db = make_mock_db()
    db.password_reset_tokens.find_one = AsyncMock(return_value={
        "token": "valid-token-123",
        "user_id": "user-123",
        "used": False,
        "expires_at": datetime.utcnow() + timedelta(hours=1)
    })
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/auth/reset-password/valid-token-123", json={
        "password": "weak",
        "password_confirm": "weak"
    })

    app.dependency_overrides.clear()
    assert response.status_code == 400
    assert "mot de passe" in response.json()["detail"].lower()
