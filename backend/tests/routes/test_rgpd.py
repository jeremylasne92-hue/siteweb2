"""
Tests for RGPD-related endpoints:
- Data export (right to portability)
- Unsubscribe (email opt-out with HMAC token)
- Account deletion (right to erasure, cascade)
- Security headers
"""
import hmac
import hashlib
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from server import app
from routes.auth import get_db
from core.config import settings


client = TestClient(app)


def make_mock_db():
    """Create a mock database with async collection methods."""
    db = MagicMock()
    db.users.find_one = AsyncMock(return_value=None)
    db.users.insert_one = AsyncMock()
    db.users.update_one = AsyncMock()
    db.users.delete_one = AsyncMock()
    db.user_sessions.find_one = AsyncMock(return_value=None)
    db.user_sessions.insert_one = AsyncMock()
    db.user_sessions.delete_many = AsyncMock()
    db.video_progress.delete_many = AsyncMock()
    db.pending_2fa.delete_many = AsyncMock()
    db.partners.delete_many = AsyncMock()
    db.tech_candidatures.delete_many = AsyncMock()
    db.episode_optins.find = MagicMock()
    db.episode_optins.find.return_value.to_list = AsyncMock(return_value=[])
    db.episode_optins.delete_many = AsyncMock()
    db.partners.find_one = AsyncMock(return_value=None)
    # Rate limiting support
    db.rate_limits.count_documents = AsyncMock(return_value=0)
    db.rate_limits.insert_one = AsyncMock()
    return db


def _make_authenticated_db(db, user_id="user-123", email="test@example.com", role="user"):
    """Set up mock db so that session + user lookup succeeds for cookie auth."""
    from datetime import datetime, timedelta

    db.user_sessions.find_one = AsyncMock(return_value={
        "session_token": "valid-session-token",
        "user_id": user_id,
        "expires_at": datetime.utcnow() + timedelta(days=1),
    })
    db.users.find_one = AsyncMock(return_value={
        "id": user_id,
        "username": "testuser",
        "email": email,
        "password_hash": "hashed",
        "role": role,
        "picture": None,
        "oauth_provider": None,
        "oauth_id": None,
        "is_2fa_enabled": False,
        "totp_secret": None,
        "created_at": "2026-01-01T00:00:00",
        "last_login": None,
    })
    return db


# ==================== DATA EXPORT ====================


def test_export_my_data_requires_auth():
    """GET /api/auth/me/export without auth returns 401."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/auth/me/export")

    app.dependency_overrides.clear()
    assert response.status_code == 401


def test_export_my_data_authenticated():
    """GET /api/auth/me/export with valid session returns user data."""
    db = make_mock_db()
    _make_authenticated_db(db)

    # Override find_one to return different results based on query
    user_doc = {
        "id": "user-123",
        "username": "testuser",
        "email": "test@example.com",
        "role": "user",
        "picture": None,
        "oauth_provider": None,
        "oauth_id": None,
        "is_2fa_enabled": False,
        "created_at": "2026-01-01T00:00:00",
        "last_login": None,
    }
    session_doc = {
        "session_token": "valid-session-token",
        "user_id": "user-123",
    }
    from datetime import datetime, timedelta
    session_with_expiry = {
        **session_doc,
        "expires_at": datetime.utcnow() + timedelta(days=1),
    }

    # find_one is called multiple times: session lookup, user lookup, export user, export partner
    db.user_sessions.find_one = AsyncMock(return_value=session_with_expiry)
    db.users.find_one = AsyncMock(return_value=user_doc)
    db.user_sessions.find = MagicMock()
    db.user_sessions.find.return_value.to_list = AsyncMock(return_value=[session_doc])
    db.partners.find_one = AsyncMock(return_value=None)

    app.dependency_overrides[get_db] = lambda: db

    response = client.get(
        "/api/auth/me/export",
        cookies={"session_token": "valid-session-token"},
    )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "exported_at" in data
    assert "sessions" in data


# ==================== UNSUBSCRIBE ====================


def test_unsubscribe_requires_token():
    """GET /api/auth/unsubscribe/fake-id without token returns 403."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/auth/unsubscribe/fake-id")

    app.dependency_overrides.clear()
    assert response.status_code == 403


def test_unsubscribe_rejects_invalid_token():
    """GET /api/auth/unsubscribe/fake-id with bad token returns 403."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/auth/unsubscribe/fake-id?token=bad-token")

    app.dependency_overrides.clear()
    assert response.status_code == 403


def test_unsubscribe_with_valid_token():
    """GET /api/auth/unsubscribe/{user_id} with valid HMAC token sets email_opt_out."""
    db = make_mock_db()
    user_id = "user-unsub-123"

    # Generate valid HMAC token
    token = hmac.new(
        settings.UNSUBSCRIBE_SECRET.encode(),
        user_id.encode(),
        hashlib.sha256,
    ).hexdigest()

    # Mock update_one to indicate a matched document
    mock_result = MagicMock()
    mock_result.matched_count = 1
    db.users.update_one = AsyncMock(return_value=mock_result)

    app.dependency_overrides[get_db] = lambda: db

    response = client.get(f"/api/auth/unsubscribe/{user_id}?token={token}")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert "desinscrits" in response.json()["message"].lower()

    # Verify update_one was called with email_opt_out=True
    db.users.update_one.assert_called_once()
    call_args = db.users.update_one.call_args
    assert call_args[0][0] == {"id": user_id}
    assert call_args[0][1] == {"$set": {"email_opt_out": True}}


def test_unsubscribe_user_not_found():
    """Unsubscribe with valid token but non-existent user returns 404."""
    db = make_mock_db()
    user_id = "nonexistent-user"

    token = hmac.new(
        settings.UNSUBSCRIBE_SECRET.encode(),
        user_id.encode(),
        hashlib.sha256,
    ).hexdigest()

    mock_result = MagicMock()
    mock_result.matched_count = 0
    db.users.update_one = AsyncMock(return_value=mock_result)

    app.dependency_overrides[get_db] = lambda: db

    response = client.get(f"/api/auth/unsubscribe/{user_id}?token={token}")

    app.dependency_overrides.clear()
    assert response.status_code == 404


# ==================== SECURITY HEADERS ====================


def test_security_headers_present():
    """Any GET request should include security headers."""
    response = client.get("/api/")

    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


# ==================== DELETE USER (CASCADE) ====================


def test_delete_user_requires_auth():
    """DELETE /api/auth/user/{id} without auth returns 401."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    response = client.delete("/api/auth/user/some-id")

    app.dependency_overrides.clear()
    assert response.status_code == 401


def test_delete_user_cascades():
    """DELETE /api/auth/user/{id} deletes user and cascades to related collections."""
    db = make_mock_db()
    user_id = "user-del-456"
    _make_authenticated_db(db, user_id=user_id, email="del@example.com")

    app.dependency_overrides[get_db] = lambda: db

    response = client.delete(
        f"/api/auth/user/{user_id}",
        cookies={"session_token": "valid-session-token"},
    )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert "deleted" in response.json()["message"].lower()

    # Verify cascade deletions
    db.users.delete_one.assert_called_once_with({"id": user_id})
    db.user_sessions.delete_many.assert_called_with({"user_id": user_id})
    db.video_progress.delete_many.assert_called_with({"user_id": user_id})
    db.pending_2fa.delete_many.assert_called_with({"user_id": user_id})
    db.partners.delete_many.assert_called_with({"user_id": user_id})
    db.tech_candidatures.delete_many.assert_called_with({"email": "del@example.com"})
    db.episode_optins.delete_many.assert_called_with({"user_id": user_id})


def test_delete_user_cannot_delete_other():
    """Users cannot delete another user's account."""
    db = make_mock_db()
    _make_authenticated_db(db, user_id="user-me")

    app.dependency_overrides[get_db] = lambda: db

    response = client.delete(
        "/api/auth/user/user-other",
        cookies={"session_token": "valid-session-token"},
    )

    app.dependency_overrides.clear()
    assert response.status_code == 403
