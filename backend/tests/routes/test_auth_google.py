import pytest
from fastapi.testclient import TestClient
from server import app
from unittest.mock import patch, AsyncMock

client = TestClient(app)


@pytest.fixture
def mock_db():
    with patch("routes.auth.get_db") as mock:
        yield mock


def test_google_login_redirect():
    """Verify /google/login redirects to Google with state parameter."""
    response = client.get("/api/auth/google/login", follow_redirects=False)
    assert response.status_code == 307  # Temporary Redirect
    location = response.headers["location"]
    assert "accounts.google.com/o/oauth2/v2/auth" in location
    assert "client_id=" in location
    assert "redirect_uri=" in location
    assert "state=" in location  # CSRF state must be present


@patch("services.auth_service.google_callback_service")
@patch("services.auth_service.verify_oauth_state", return_value=True)
def test_google_callback_success(mock_verify, mock_callback, mock_db):
    """Verify callback sets cookie and redirects WITHOUT token in URL."""
    mock_callback.return_value = {
        "user": {"id": "123", "email": "test@gmail.com", "role": "user", "picture": None},
        "session_token": "fake-jwt",
        "requires_2fa": False
    }
    response = client.get(
        "/api/auth/google/callback?code=fake-auth-code&state=valid-state",
        follow_redirects=False
    )
    assert response.status_code == 307
    location = response.headers["location"]
    # Token must NOT be in the URL (security fix H2)
    assert "token=" not in location
    assert "/auth/google/success" in location
    # Token must be in an httpOnly cookie
    assert response.cookies.get("session_token") == "fake-jwt"


@patch("services.auth_service.google_callback_service")
@patch("services.auth_service.verify_oauth_state", return_value=True)
def test_google_callback_invalid_code(mock_verify, mock_callback):
    """Verify callback handles invalid code gracefully."""
    mock_callback.side_effect = Exception("Invalid code")
    response = client.get(
        "/api/auth/google/callback?code=invalid-code&state=valid-state",
        follow_redirects=False
    )
    assert response.status_code == 307
    assert "error=oauth_failed" in response.headers["location"]


def test_google_callback_missing_state():
    """Verify callback rejects requests without state (CSRF fix H3)."""
    response = client.get(
        "/api/auth/google/callback?code=some-code",
        follow_redirects=False
    )
    assert response.status_code == 307
    assert "error=invalid_state" in response.headers["location"]


@patch("services.auth_service.verify_oauth_state", return_value=False)
def test_google_callback_invalid_state(mock_verify):
    """Verify callback rejects requests with invalid state."""
    response = client.get(
        "/api/auth/google/callback?code=some-code&state=tampered-state",
        follow_redirects=False
    )
    assert response.status_code == 307
    assert "error=invalid_state" in response.headers["location"]
