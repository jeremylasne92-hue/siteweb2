"""
Programme de tests — Console Admin ECHO
Couvre : Dashboard, Membres, Candidatures Tech, Bénévoles, Étudiants,
         Partenaires, Événements, Contact, Exports, Analytics, Utilisateurs.

Utilise TestClient + mocks (pas besoin de serveur backend actif).
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, UTC

from server import app
from routes.auth import get_db, require_admin
from models import User


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

ADMIN_USER = User(
    id="admin-001",
    username="admin_test",
    email="admin@echo.fr",
    password_hash="hashed",
    role="admin",
    is_2fa_enabled=False,
    created_at=datetime.now(UTC),
)


def _make_cursor(docs):
    """Create a mock async cursor that supports chaining and iteration."""
    cursor = MagicMock()
    cursor.sort = MagicMock(return_value=cursor)
    cursor.skip = MagicMock(return_value=cursor)
    cursor.limit = MagicMock(return_value=cursor)
    cursor.to_list = AsyncMock(return_value=docs)

    async def _aiter(self_cursor):
        for doc in docs:
            yield doc

    cursor.__aiter__ = _aiter
    return cursor


def _make_mock_db():
    """Create a mock DB with all collections used by admin routes."""
    db = MagicMock()

    collections = [
        "member_profiles", "tech_candidatures", "volunteer_applications",
        "student_applications", "contact_messages", "events", "users",
        "user_sessions", "admin_actions", "episode_optins", "partners",
        "audit_log", "rate_limits", "analytics_events",
    ]

    for coll_name in collections:
        coll = MagicMock()
        coll.insert_one = AsyncMock()
        coll.find_one = AsyncMock(return_value=None)
        coll.delete_one = AsyncMock(return_value=MagicMock(deleted_count=1))
        coll.update_one = AsyncMock(return_value=MagicMock(matched_count=1))
        coll.update_many = AsyncMock(return_value=MagicMock(modified_count=0))
        coll.count_documents = AsyncMock(return_value=0)
        # aggregate returns a cursor-like object
        coll.aggregate = MagicMock(return_value=_make_cursor([]))
        # find returns a cursor
        coll.find = MagicMock(return_value=_make_cursor([]))
        setattr(db, coll_name, coll)

    return db


# ═══════════════════════════════════════════════════════════
# 1. DASHBOARD ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminDashboard:
    """Tests du dashboard admin (compteurs pending)."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_get_pending_counts(self):
        """GET /admin/pending — retourne les compteurs."""
        r = self.client.get("/api/admin/pending")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_dashboard_requires_admin(self):
        """GET /admin/pending — 401 sans auth."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/admin/pending")
        assert r.status_code in (401, 403)

    def test_dashboard_non_admin_rejected(self):
        """GET /admin/pending — 403 avec un cookie invalide."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/admin/pending", cookies={"session_token": "fake"})
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 2. MEMBRES ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminMembers:
    """Tests gestion des membres."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_list_members(self):
        """GET /admin/members/ — liste paginée."""
        sample = [{"id": "m1", "display_name": "Alice", "project": "benevole",
                   "membership_status": "active", "visible": True, "city": "Paris"}]
        self.db.member_profiles.find = MagicMock(return_value=_make_cursor(sample))
        self.db.member_profiles.count_documents = AsyncMock(return_value=1)

        r = self.client.get("/api/admin/members/?limit=5")
        assert r.status_code == 200
        data = r.json()
        assert "members" in data
        assert "total" in data

    def test_list_members_filter_project(self):
        """GET /admin/members/?project=benevole — filtre par projet."""
        sample = [{"id": "m1", "display_name": "Alice", "project": "benevole",
                   "membership_status": "active", "visible": True}]
        self.db.member_profiles.find = MagicMock(return_value=_make_cursor(sample))
        self.db.member_profiles.count_documents = AsyncMock(return_value=1)

        r = self.client.get("/api/admin/members/?project=benevole")
        assert r.status_code == 200
        for m in r.json()["members"]:
            assert m["project"] == "benevole"

    def test_list_members_filter_status(self):
        """GET /admin/members/?status=active — filtre par statut."""
        sample = [{"id": "m1", "display_name": "Alice", "project": "tech",
                   "membership_status": "active", "visible": True}]
        self.db.member_profiles.find = MagicMock(return_value=_make_cursor(sample))
        self.db.member_profiles.count_documents = AsyncMock(return_value=1)

        r = self.client.get("/api/admin/members/?status=active")
        assert r.status_code == 200
        for m in r.json()["members"]:
            assert m["membership_status"] == "active"

    def test_status_cycle_inactive_active(self):
        """PATCH status: active → inactive → active."""
        # → inactive
        r = self.client.patch(
            "/api/admin/members/m1/status",
            json={"membership_status": "inactive"},
        )
        assert r.status_code == 200

        # → active
        r = self.client.patch(
            "/api/admin/members/m1/status",
            json={"membership_status": "active"},
        )
        assert r.status_code == 200

    def test_status_suspended_hides(self):
        """PATCH status: → suspended."""
        r = self.client.patch(
            "/api/admin/members/m1/status",
            json={"membership_status": "suspended"},
        )
        assert r.status_code == 200

    def test_edit_member_city_geocodes(self):
        """PATCH member city — geocoding appelé."""
        updated_doc = {"id": "m1", "display_name": "Alice", "city": "Tokyo",
                       "latitude": 35.6762, "longitude": 139.6503}
        self.db.member_profiles.find_one = AsyncMock(return_value=updated_doc)

        with patch("utils.geocode.geocode_city", new_callable=AsyncMock,
                    return_value=(35.6762, 139.6503)):
            r = self.client.patch(
                "/api/admin/members/m1",
                json={"city": "Tokyo"},
            )
        assert r.status_code == 200

    def test_edit_member_no_changes(self):
        """PATCH member with empty body → 400."""
        r = self.client.patch("/api/admin/members/m1", json={})
        assert r.status_code == 400

    def test_edit_nonexistent_member(self):
        """PATCH /admin/members/fake-id → 404."""
        self.db.member_profiles.update_one = AsyncMock(
            return_value=MagicMock(matched_count=0)
        )

        with patch("utils.geocode.geocode_city", new_callable=AsyncMock, return_value=None):
            r = self.client.patch(
                "/api/admin/members/00000000-0000-0000-0000-000000000000",
                json={"city": "Paris"},
            )
        assert r.status_code == 404

    def test_member_analytics(self):
        """GET /admin/members/analytics — stats agrégées."""
        r = self.client.get("/api/admin/members/analytics")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_status_invalid_value(self):
        """PATCH status with invalid value → 422."""
        r = self.client.patch(
            "/api/admin/members/m1/status",
            json={"membership_status": "invalid_status"},
        )
        assert r.status_code == 422

    def test_backfill_visibility(self):
        """POST /admin/members/backfill-visibility — fix active+invisible members."""
        self.db.member_profiles.update_many = AsyncMock(
            return_value=MagicMock(modified_count=2)
        )

        r = self.client.post("/api/admin/members/backfill-visibility")
        assert r.status_code == 200
        data = r.json()
        assert "fixed" in data

    def test_map_endpoint_only_visible(self):
        """GET /members/map — only visible+active members returned."""
        map_data = [{"display_name": "Alice", "latitude": 48.8566, "longitude": 2.3522,
                     "city": "Paris", "project": "tech"}]
        self.db.member_profiles.find = MagicMock(return_value=_make_cursor(map_data))

        r = self.client.get("/api/members/map")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ═══════════════════════════════════════════════════════════
# 3. CANDIDATURES TECH ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminCandidatures:
    """Tests gestion des candidatures tech."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_list_candidatures(self):
        """GET /candidatures/admin/all — liste."""
        sample = [{"_id": "mongo-id", "id": "c1", "name": "Test", "email": "t@t.com",
                   "project": "cognisphere", "status": "pending",
                   "created_at": datetime.now(UTC).isoformat()}]
        self.db.tech_candidatures.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/candidatures/admin/all")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_candidatures_filter_status(self):
        """GET /candidatures/admin/all?status=pending — filtre."""
        self.db.tech_candidatures.find = MagicMock(return_value=_make_cursor([]))

        r = self.client.get("/api/candidatures/admin/all?status=pending")
        assert r.status_code == 200

    def test_export_csv(self):
        """GET /candidatures/admin/export — CSV export."""
        sample = [{"id": "c1", "name": "Test", "email": "t@t.com",
                   "project": "cognisphere", "skills": "React",
                   "message": "Msg", "portfolio_url": None,
                   "creative_interests": None, "experience_level": None,
                   "status": "pending", "status_note": "",
                   "created_at": datetime.now(UTC)}]
        self.db.tech_candidatures.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/candidatures/admin/export")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")

    def test_candidature_requires_admin(self):
        """GET /candidatures/admin/all — 401 sans auth."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/candidatures/admin/all")
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 4. BÉNÉVOLES ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminVolunteers:
    """Tests gestion des candidatures bénévoles."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_list_volunteers(self):
        """GET /volunteers/admin/all — liste."""
        sample = [{"id": "v1", "name": "Vol Test", "status": "pending",
                   "_id": "mid", "created_at": datetime.now(UTC).isoformat()}]
        self.db.volunteer_applications.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/volunteers/admin/all")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_volunteers_filter(self):
        """GET /volunteers/admin/all?status=pending."""
        self.db.volunteer_applications.find = MagicMock(return_value=_make_cursor([]))

        r = self.client.get("/api/volunteers/admin/all?status=pending")
        assert r.status_code == 200

    def test_export_volunteers_csv(self):
        """GET /volunteers/admin/export — CSV."""
        sample = [{"id": "v1", "name": "Vol", "email": "v@t.com",
                   "phone": "06", "city": "Paris", "availability": "weekends",
                   "skills": ["photo"], "experience_level": "beginner",
                   "message": "Motivé", "motivation": "Motivation",
                   "status": "pending", "status_note": "",
                   "created_at": datetime.now(UTC)}]
        self.db.volunteer_applications.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/volunteers/admin/export")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")


# ═══════════════════════════════════════════════════════════
# 5. ÉTUDIANTS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminStudents:
    """Tests gestion des candidatures étudiantes."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_list_students(self):
        """GET /students/admin/all — liste."""
        sample = [{"id": "s1", "_id": "mid", "name": "Student Test", "status": "pending"}]
        self.db.student_applications.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/students/admin/all")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_export_students_csv(self):
        """GET /students/admin/export — CSV."""
        sample = [{"id": "s1", "name": "Student", "email": "s@t.com",
                   "phone": "06", "city": "Lyon", "school": "INSA",
                   "study_field": "Info", "skills": ["Python"],
                   "availability": "stage_long", "start_date": "2026-06-01",
                   "status": "pending", "message": "Motivé",
                   "admin_notes": "", "created_at": datetime.now(UTC)}]
        self.db.student_applications.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/students/admin/export")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")


# ═══════════════════════════════════════════════════════════
# 6. CONTACT ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminContact:
    """Tests gestion des messages de contact."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_list_contact_messages(self):
        """GET /contact/admin/all — liste."""
        sample = [{"id": "ct1", "name": "Contact Test", "email": "c@t.com",
                   "message": "Hello", "status": "unread"}]
        self.db.contact_messages.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/contact/admin/all")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contact_requires_admin(self):
        """GET /contact/admin/all — 401 sans auth."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/contact/admin/all")
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 7. ÉVÉNEMENTS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminEvents:
    """Tests CRUD événements."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_create_event(self):
        """POST /events — créer un événement test."""
        r = self.client.post(
            "/api/events",
            json={
                "title": "TEST Event Admin Console",
                "description": "Test automatique console admin",
                "date": "2026-06-15T14:00:00",
                "location": "Paris, France",
                "type": "Atelier",
            },
        )
        assert r.status_code in (200, 201)
        data = r.json()
        assert data["title"] == "TEST Event Admin Console"

    def test_list_events(self):
        """GET /events — liste publique."""
        sample = [{"id": "e1", "title": "Event 1", "date": "2026-06-15T14:00:00",
                   "location": "Paris", "type": "Atelier", "description": "Desc",
                   "is_published": True}]
        self.db.events.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/events")
        assert r.status_code == 200

    def test_update_event(self):
        """PUT /events/{id} — modifier."""
        self.db.events.find_one = AsyncMock(return_value={
            "id": "e1", "title": "Old", "description": "Old",
            "date": "2026-06-15T14:00:00", "location": "Paris", "type": "Atelier",
        })

        r = self.client.put(
            "/api/events/e1",
            json={
                "title": "TEST Event UPDATED",
                "description": "Updated",
                "date": "2026-06-15T14:00:00",
                "location": "Lyon, France",
                "type": "Atelier",
            },
        )
        assert r.status_code == 200

    def test_delete_event(self):
        """DELETE /events/{id} — supprimer."""
        self.db.events.find_one = AsyncMock(return_value={
            "id": "e1", "title": "Test", "images": [],
        })

        r = self.client.delete("/api/events/e1")
        assert r.status_code == 200

    def test_delete_nonexistent_event(self):
        """DELETE /events/fake-id → 404."""
        self.db.events.find_one = AsyncMock(return_value=None)

        r = self.client.delete("/api/events/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404


# ═══════════════════════════════════════════════════════════
# 8. EXPORTS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminExports:
    """Tests exports CSV."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_export_users_csv(self):
        """GET /auth/admin/export-users — CSV users."""
        sample = [{"id": "u1", "username": "admin", "email": "a@echo.fr",
                   "role": "admin", "created_at": datetime.now(UTC)}]
        self.db.users.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/auth/admin/export-users")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        lines = r.text.strip().split("\n")
        assert len(lines) >= 2  # Header + at least 1 user

    def test_export_users_requires_admin(self):
        """GET /auth/admin/export-users — 401 sans auth."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/auth/admin/export-users")
        assert r.status_code in (401, 403)

    def test_export_optins_csv(self):
        """GET /episodes/admin/export-optins — CSV opt-ins."""
        optins = [{"user_id": "u1", "episode_id": "ep1",
                   "season": 1, "episode": 1,
                   "created_at": datetime.now(UTC)}]
        users = [{"id": "u1", "email": "fan@echo.fr"}]

        self.db.episode_optins.find = MagicMock(return_value=_make_cursor(optins))
        self.db.users.find = MagicMock(return_value=_make_cursor(users))

        r = self.client.get("/api/episodes/admin/export-optins")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")


# ═══════════════════════════════════════════════════════════
# 9. ANALYTICS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminAnalytics:
    """Tests analytics KPI dashboard."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        # Analytics route uses request.app.db
        app.db = self.db
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()
        if hasattr(app, "db"):
            delattr(app, "db")

    def test_analytics_dashboard(self):
        """GET /analytics/admin/dashboard — KPIs."""
        r = self.client.get("/api/analytics/admin/dashboard")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_analytics_requires_admin(self):
        """GET /analytics/admin/dashboard — 401 sans auth."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/analytics/admin/dashboard")
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 10. UTILISATEURS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminUsers:
    """Tests gestion utilisateurs."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_user_count(self):
        """GET /users/count — nombre total."""
        self.db.users.count_documents = AsyncMock(return_value=42)

        r = self.client.get("/api/users/count")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, (int, dict))

    def test_list_users(self):
        """GET /users — liste paginée."""
        sample = [{"id": "u1", "username": "test", "email": "t@t.com",
                   "role": "user", "created_at": datetime.now(UTC).isoformat()}]
        self.db.users.find = MagicMock(return_value=_make_cursor(sample))
        self.db.users.count_documents = AsyncMock(return_value=1)

        r = self.client.get("/api/users?limit=5")
        assert r.status_code == 200
        data = r.json()
        assert "users" in data
        assert "total" in data

    def test_users_requires_admin(self):
        """GET /users — 401 sans auth."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/users")
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 11. SÉCURITÉ — CONTRÔLE D'ACCÈS
# ═══════════════════════════════════════════════════════════

class TestAdminSecurity:
    """Tests de sécurité transversaux."""

    ADMIN_ENDPOINTS = [
        ("GET", "/admin/pending"),
        ("GET", "/admin/members/"),
        ("GET", "/admin/members/analytics"),
        ("GET", "/candidatures/admin/all"),
        ("GET", "/candidatures/admin/export"),
        ("GET", "/volunteers/admin/all"),
        ("GET", "/volunteers/admin/export"),
        ("GET", "/students/admin/all"),
        ("GET", "/students/admin/export"),
        ("GET", "/contact/admin/all"),
        ("GET", "/analytics/admin/dashboard"),
        ("GET", "/auth/admin/export-users"),
        ("GET", "/users/count"),
        ("GET", "/users"),
    ]

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        # No require_admin override — tests unauthenticated access
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    @pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
    def test_all_admin_endpoints_reject_unauthenticated(self, method, path):
        """Tous les endpoints admin rejettent les requêtes non-authentifiées."""
        r = self.client.request(method, f"/api{path}")
        assert r.status_code in (401, 403), f"{method} {path} returned {r.status_code}"

    @pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
    def test_all_admin_endpoints_reject_fake_token(self, method, path):
        """Tous les endpoints admin rejettent un faux token."""
        r = self.client.request(method, f"/api{path}",
                                cookies={"session_token": "fake-token-xyz"})
        assert r.status_code in (401, 403), f"{method} {path} returned {r.status_code}"


# ═══════════════════════════════════════════════════════════
# 12. PARTENAIRES ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminPartners:
    """Tests gestion partenaires admin."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER
        self.client = TestClient(app)

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_list_partners_admin(self):
        """GET /partners/admin/all — liste admin."""
        sample = [{"id": "p1", "organization_name": "Org Test", "status": "pending",
                   "_id": "mid"}]
        self.db.partners.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/partners/admin/all")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_export_partners_csv(self):
        """GET /partners/admin/export — CSV."""
        sample = [{"id": "p1", "organization_name": "Org", "contact_name": "Test",
                   "email": "p@t.com", "phone": "06", "partnership_type": "media",
                   "message": "Hello", "status": "pending", "status_note": "",
                   "website": "https://org.com", "description": "Desc",
                   "created_at": datetime.now(UTC)}]
        self.db.partners.find = MagicMock(return_value=_make_cursor(sample))

        r = self.client.get("/api/partners/admin/export")
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")

    def test_partners_requires_admin(self):
        """GET /partners/admin/all — 401 sans auth."""
        app.dependency_overrides.pop(require_admin, None)
        r = self.client.get("/api/partners/admin/all")
        assert r.status_code in (401, 403)
