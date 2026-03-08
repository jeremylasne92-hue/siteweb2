"""Tests for server-side reCAPTCHA validation on /login endpoint."""
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from server import app
from routes.auth import get_db

mock_db = MagicMock()

mock_user = {
    "id": "user-1",
    "username": "testuser",
    "email": "test@example.com",
    "password_hash": "$2b$12$GP6R1LjTKb3qwjX2R0.tV.cshE9hkgHcLKm5BoO8NmxUQza1aaWi6",
    "role": "user",
    "is_2fa_enabled": False,
    "oauth_provider": None,
    "oauth_id": None,
    "picture": None,
    "totp_secret": None,
    "created_at": "2025-01-01T00:00:00",
    "last_login": None,
}


def setup_mock_db():
    mock_db.users = MagicMock()
    mock_db.users.find_one = AsyncMock(return_value=mock_user)
    mock_db.users.update_one = AsyncMock()
    mock_db.user_sessions = MagicMock()
    mock_db.user_sessions.insert_one = AsyncMock()
    mock_db.rate_limits = MagicMock()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=0)
    mock_db.rate_limits.insert_one = AsyncMock()
    app.dependency_overrides[get_db] = lambda: mock_db


def teardown():
    app.dependency_overrides.clear()


client = TestClient(app)


def test_login_rejects_missing_captcha_token():
    """Login should fail when captcha_token is empty."""
    setup_mock_db()
    try:
        res = client.post("/api/auth/login", json={
            "username": "testuser",
            "password": "Password1!",
        })
        assert res.status_code == 400
        assert "captcha" in res.json()["detail"].lower()
    finally:
        teardown()


@patch("routes.auth.httpx.AsyncClient")
def test_login_rejects_failed_captcha(mock_httpx_class):
    """Login should fail when reCAPTCHA verification fails."""
    setup_mock_db()

    mock_response = MagicMock()
    mock_response.json.return_value = {"success": False, "score": 0.1}
    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=False)
    mock_httpx_class.return_value = mock_client_instance

    try:
        with patch("routes.auth.settings") as mock_settings:
            mock_settings.RECAPTCHA_SECRET_KEY = "test-secret-key"
            mock_settings.is_production = False
            res = client.post("/api/auth/login", json={
                "username": "testuser",
                "password": "Password1!",
                "captcha_token": "fake-token",
            })
            assert res.status_code == 400
            assert "captcha" in res.json()["detail"].lower()
    finally:
        teardown()


@patch("routes.auth.httpx.AsyncClient")
def test_login_accepts_valid_captcha(mock_httpx_class):
    """Login should proceed when reCAPTCHA verification passes (may fail on password, that's OK)."""
    setup_mock_db()

    mock_response = MagicMock()
    mock_response.json.return_value = {"success": True, "score": 0.9}
    mock_client_instance = AsyncMock()
    mock_client_instance.post = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=False)
    mock_httpx_class.return_value = mock_client_instance

    try:
        with patch("routes.auth.settings") as mock_settings:
            mock_settings.RECAPTCHA_SECRET_KEY = "test-secret-key"
            mock_settings.is_production = False
            res = client.post("/api/auth/login", json={
                "username": "testuser",
                "password": "Password1!",
                "captcha_token": "valid-token",
            })
            # Should NOT fail on captcha — may fail on password hash mismatch (401), that's expected
            assert res.status_code != 400 or "captcha" not in res.json().get("detail", "").lower()
    finally:
        teardown()
