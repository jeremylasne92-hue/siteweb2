"""
Integration E2E tests for critical user flows.

Tests 3 critical paths:
1. Register -> Login -> Profile -> Logout
2. Tech candidature submission (valid, honeypot, rate limit)
3. Contact form submission (valid, honeypot, rate limit)
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta

from server import app
from routes.auth import get_db


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_mock_db():
    """Create a fresh mock DB with all collections needed by the flows."""
    db = MagicMock()

    # rate_limits (used by check_rate_limit)
    db.rate_limits.count_documents = AsyncMock(return_value=0)
    db.rate_limits.insert_one = AsyncMock()

    # users
    db.users.find_one = AsyncMock(return_value=None)
    db.users.insert_one = AsyncMock()
    db.users.update_one = AsyncMock()

    # user_sessions
    db.user_sessions.find_one = AsyncMock(return_value=None)
    db.user_sessions.insert_one = AsyncMock()
    db.user_sessions.delete_one = AsyncMock()

    # tech_candidatures
    db.tech_candidatures.count_documents = AsyncMock(return_value=0)
    db.tech_candidatures.insert_one = AsyncMock()

    # contact_messages
    db.contact_messages.count_documents = AsyncMock(return_value=0)
    db.contact_messages.insert_one = AsyncMock()

    return db


# ===================================================================
# Flow 1: Register -> Login -> Profile (/me) -> Logout
# ===================================================================

class TestAuthFlow:
    """E2E auth flow: register, login-local, get profile, logout."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db

    def teardown_method(self):
        app.dependency_overrides.clear()

    # -- Step 1: Register -------------------------------------------------

    def test_register_creates_user(self):
        """POST /api/auth/register returns user info on success."""
        # No existing user
        self.db.users.find_one = AsyncMock(return_value=None)

        client = TestClient(app)
        resp = client.post("/api/auth/register", json={
            "username": "alice_test",
            "email": "alice@example.com",
            "password": "Str0ng!Pass",
            "password_confirm": "Str0ng!Pass",
            "age_consent": True,
            "interests": ["ecologie-climat"],
        })

        assert resp.status_code == 200
        body = resp.json()
        assert body["username"] == "alice_test"
        assert body["email"] == "alice@example.com"
        assert "message" in body
        self.db.users.insert_one.assert_called_once()

    # -- Step 2: Login-local ----------------------------------------------

    def test_login_local_sets_cookie(self):
        """POST /api/auth/login-local sets httpOnly session cookie."""
        from auth_utils import hash_password

        user_doc = {
            "id": "user-123",
            "username": "alice_test",
            "email": "alice@example.com",
            "password_hash": hash_password("Str0ng!Pass"),
            "role": "user",
            "picture": None,
            "is_2fa_enabled": False,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "oauth_provider": None,
            "oauth_id": None,
            "totp_secret": None,
            "email_opt_out": False,
            "bio": None,
            "interests": [],
            "avatar_url": None,
            "notification_prefs": {"newsletter": True, "episodes": True, "events": True, "partners": False},
            "is_member": False,
            "member_since": None,
        }
        self.db.users.find_one = AsyncMock(return_value=user_doc)

        client = TestClient(app)
        resp = client.post("/api/auth/login-local", json={
            "identifier": "alice@example.com",
            "password": "Str0ng!Pass",
        })

        assert resp.status_code == 200
        body = resp.json()
        assert body["user"]["username"] == "alice_test"
        # Session token must NOT be in the JSON body (cookie-only)
        assert "session_token" not in body
        # Cookie must be set
        assert "session_token" in resp.cookies

    # -- Step 3: GET /me with session cookie ------------------------------

    def test_get_me_with_cookie(self):
        """GET /api/auth/me returns profile when valid session cookie is sent."""
        user_doc = {
            "id": "user-123",
            "username": "alice_test",
            "email": "alice@example.com",
            "password_hash": "hashed",
            "role": "user",
            "picture": None,
            "is_2fa_enabled": False,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "oauth_provider": None,
            "oauth_id": None,
            "totp_secret": None,
            "email_opt_out": False,
            "bio": None,
            "interests": [],
            "avatar_url": None,
            "notification_prefs": {"newsletter": True, "episodes": True, "events": True, "partners": False},
            "is_member": False,
            "member_since": None,
        }
        session_doc = {
            "user_id": "user-123",
            "session_token": "tok_abc",
            "expires_at": datetime.utcnow() + timedelta(days=7),
        }
        self.db.user_sessions.find_one = AsyncMock(return_value=session_doc)
        self.db.users.find_one = AsyncMock(return_value=user_doc)

        client = TestClient(app, cookies={"session_token": "tok_abc"})
        resp = client.get("/api/auth/me")

        assert resp.status_code == 200
        body = resp.json()
        assert body["username"] == "alice_test"
        assert body["email"] == "alice@example.com"
        assert "password_hash" not in body

    # -- Step 4: Logout ---------------------------------------------------

    def test_logout_clears_cookie(self):
        """POST /api/auth/logout deletes session and clears cookie."""
        user_doc = {
            "id": "user-123",
            "username": "alice_test",
            "email": "alice@example.com",
            "password_hash": "hashed",
            "role": "user",
            "picture": None,
            "is_2fa_enabled": False,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "oauth_provider": None,
            "oauth_id": None,
            "totp_secret": None,
            "email_opt_out": False,
            "bio": None,
            "interests": [],
            "avatar_url": None,
            "notification_prefs": {"newsletter": True, "episodes": True, "events": True, "partners": False},
            "is_member": False,
            "member_since": None,
        }
        session_doc = {
            "user_id": "user-123",
            "session_token": "tok_abc",
            "expires_at": datetime.utcnow() + timedelta(days=7),
        }
        self.db.user_sessions.find_one = AsyncMock(return_value=session_doc)
        self.db.users.find_one = AsyncMock(return_value=user_doc)

        client = TestClient(app, cookies={"session_token": "tok_abc"})
        resp = client.post("/api/auth/logout")

        assert resp.status_code == 200
        assert resp.json()["message"] == "Logged out successfully"
        self.db.user_sessions.delete_one.assert_called_once()
        # Cookie should be cleared (set to empty / max-age=0)
        cookie_header = resp.headers.get("set-cookie", "")
        assert "session_token" in cookie_header

    # -- Full sequential flow ---------------------------------------------

    def test_full_auth_flow(self):
        """Register -> login-local -> /me -> logout in sequence."""
        from auth_utils import hash_password

        # 1. Register
        self.db.users.find_one = AsyncMock(return_value=None)
        client = TestClient(app)
        resp = client.post("/api/auth/register", json={
            "username": "flow_user",
            "email": "flow@example.com",
            "password": "Str0ng!Pass",
            "password_confirm": "Str0ng!Pass",
            "age_consent": True,
        })
        assert resp.status_code == 200
        registered_id = resp.json()["id"]

        # 2. Login-local — need to return the registered user
        user_doc = {
            "id": registered_id,
            "username": "flow_user",
            "email": "flow@example.com",
            "password_hash": hash_password("Str0ng!Pass"),
            "role": "user",
            "picture": None,
            "is_2fa_enabled": False,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "oauth_provider": None,
            "oauth_id": None,
            "totp_secret": None,
            "email_opt_out": False,
            "bio": None,
            "interests": [],
            "avatar_url": None,
            "notification_prefs": {"newsletter": True, "episodes": True, "events": True, "partners": False},
            "is_member": False,
            "member_since": None,
        }
        self.db.users.find_one = AsyncMock(return_value=user_doc)

        resp = client.post("/api/auth/login-local", json={
            "identifier": "flow@example.com",
            "password": "Str0ng!Pass",
        })
        assert resp.status_code == 200
        session_token = resp.cookies.get("session_token")
        assert session_token is not None

        # 3. GET /me with session cookie
        # Mock session lookup to return a valid session
        self.db.user_sessions.find_one = AsyncMock(return_value={
            "user_id": registered_id,
            "session_token": session_token,
            "expires_at": datetime.utcnow() + timedelta(days=7),
        })

        me_client = TestClient(app, cookies={"session_token": session_token})
        resp = me_client.get("/api/auth/me")
        assert resp.status_code == 200
        assert resp.json()["username"] == "flow_user"

        # 4. Logout
        resp = me_client.post("/api/auth/logout")
        assert resp.status_code == 200
        self.db.user_sessions.delete_one.assert_called()


# ===================================================================
# Flow 2: Tech candidature (valid, honeypot, rate limit)
# ===================================================================

class TestCandidatureFlow:
    """E2E candidature flow: valid submit, honeypot rejection, rate limiting."""

    VALID_PAYLOAD = {
        "name": "Bob Dev",
        "email": "bob@example.com",
        "project": "cognisphere",
        "skills": "Python, React, TypeScript",
        "message": "Je souhaite rejoindre le projet CogniSphère.",
        "website": "",
    }

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_valid_candidature_succeeds(self):
        """POST /api/candidatures/tech with valid data returns 200."""
        client = TestClient(app)
        with patch("routes.candidatures.send_email", new_callable=AsyncMock), \
             patch("routes.candidatures.send_candidature_confirmation", new_callable=AsyncMock):
            resp = client.post("/api/candidatures/tech", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        assert resp.json()["message"] == "Candidature envoyée avec succès"
        self.db.tech_candidatures.insert_one.assert_called_once()

    def test_honeypot_silently_rejects(self):
        """POST /api/candidatures/tech with honeypot filled returns 200 but does NOT store."""
        payload = {**self.VALID_PAYLOAD, "website": "http://spam.bot"}

        client = TestClient(app)
        with patch("routes.candidatures.send_email", new_callable=AsyncMock), \
             patch("routes.candidatures.send_candidature_confirmation", new_callable=AsyncMock):
            resp = client.post("/api/candidatures/tech", json=payload)

        assert resp.status_code == 200
        assert resp.json()["message"] == "Candidature envoyée avec succès"
        # Should NOT have stored the candidature
        self.db.tech_candidatures.insert_one.assert_not_called()

    def test_under_rate_limit_succeeds(self):
        """POST /api/candidatures/tech under rate limit succeeds."""
        # check_rate_limit uses db.rate_limits, simulate 2 recent attempts
        self.db.rate_limits.count_documents = AsyncMock(return_value=2)

        client = TestClient(app)
        with patch("routes.candidatures.send_email", new_callable=AsyncMock), \
             patch("routes.candidatures.send_candidature_confirmation", new_callable=AsyncMock):
            resp = client.post("/api/candidatures/tech", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        self.db.tech_candidatures.insert_one.assert_called_once()

    def test_rate_limit_blocks_at_max(self):
        """POST /api/candidatures/tech returns 429 when rate limit reached."""
        # check_rate_limit uses db.rate_limits with max_requests=3
        self.db.rate_limits.count_documents = AsyncMock(return_value=3)

        client = TestClient(app)
        with patch("routes.candidatures.send_email", new_callable=AsyncMock), \
             patch("routes.candidatures.send_candidature_confirmation", new_callable=AsyncMock):
            resp = client.post("/api/candidatures/tech", json=self.VALID_PAYLOAD)

        assert resp.status_code == 429
        assert "Trop de tentatives" in resp.json()["detail"]
        self.db.tech_candidatures.insert_one.assert_not_called()


# ===================================================================
# Flow 3: Contact form (valid, honeypot, rate limit)
# ===================================================================

class TestContactFlow:
    """E2E contact flow: valid submit, honeypot rejection, rate limiting."""

    VALID_PAYLOAD = {
        "name": "Claire Dupont",
        "email": "claire@example.com",
        "subject": "question_generale",
        "message": "Bonjour, j'aimerais en savoir plus sur le projet.",
        "consent_rgpd": True,
        "website": "",
    }

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_valid_contact_succeeds(self):
        """POST /api/contact with valid data returns 200 and stores message."""
        client = TestClient(app)
        with patch("routes.contact.send_email", new_callable=AsyncMock):
            resp = client.post("/api/contact", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        assert resp.json()["message"] == "Message envoyé avec succès"
        self.db.contact_messages.insert_one.assert_called_once()

    def test_honeypot_silently_rejects(self):
        """POST /api/contact with honeypot filled returns 200 but does NOT store."""
        payload = {**self.VALID_PAYLOAD, "website": "http://spam.bot"}

        client = TestClient(app)
        with patch("routes.contact.send_email", new_callable=AsyncMock):
            resp = client.post("/api/contact", json=payload)

        assert resp.status_code == 200
        assert resp.json()["message"] == "Message envoyé avec succès"
        self.db.contact_messages.insert_one.assert_not_called()

    def test_under_rate_limit_succeeds(self):
        """POST /api/contact under rate limit succeeds."""
        # check_rate_limit uses db.rate_limits, simulate 2 recent attempts
        self.db.rate_limits.count_documents = AsyncMock(return_value=2)

        client = TestClient(app)
        with patch("routes.contact.send_email", new_callable=AsyncMock):
            resp = client.post("/api/contact", json=self.VALID_PAYLOAD)

        assert resp.status_code == 200
        self.db.contact_messages.insert_one.assert_called_once()

    def test_rate_limit_blocks_at_max(self):
        """POST /api/contact returns 429 when rate limit reached."""
        # check_rate_limit uses db.rate_limits with max_requests=3
        self.db.rate_limits.count_documents = AsyncMock(return_value=3)

        client = TestClient(app)
        with patch("routes.contact.send_email", new_callable=AsyncMock):
            resp = client.post("/api/contact", json=self.VALID_PAYLOAD)

        assert resp.status_code == 429
        assert "Trop de tentatives" in resp.json()["detail"]
        self.db.contact_messages.insert_one.assert_not_called()
