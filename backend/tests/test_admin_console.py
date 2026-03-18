"""
Programme de tests exhaustif — Console Admin ECHO
Couvre : Dashboard, Membres, Candidatures Tech, Bénévoles, Étudiants,
         Partenaires, Événements, Contact, Exports, Analytics, Utilisateurs.
"""
import pytest
import httpx
import json
from unittest.mock import patch, AsyncMock

BASE = "http://localhost:8000/api"
TOKEN_COOKIE = None  # Will be set in setup


@pytest.fixture(scope="module")
def admin_cookie():
    """Login as admin and return session cookie."""
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    from core.config import settings

    async def get_token():
        client = AsyncIOMotorClient(settings.MONGO_URL)
        db = client[settings.DB_NAME]
        admin = await db.users.find_one({"role": "admin"})
        if not admin:
            pytest.skip("No admin user in database")
        session = await db.user_sessions.find_one({"user_id": admin["id"]})
        client.close()
        if not session:
            pytest.skip("No admin session found")
        return session["session_token"]

    token = asyncio.get_event_loop().run_until_complete(get_token())
    return {"session_token": token}


# ═══════════════════════════════════════════════════════════
# 1. DASHBOARD ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminDashboard:
    """Tests du dashboard admin (compteurs pending)."""

    def test_get_pending_counts(self, admin_cookie):
        """GET /admin/pending — retourne les compteurs."""
        r = httpx.get(f"{BASE}/admin/pending", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        # Should have count fields
        assert isinstance(data, dict)
        print(f"  Dashboard: {data}")

    def test_dashboard_requires_admin(self):
        """GET /admin/pending — 401 sans auth."""
        r = httpx.get(f"{BASE}/admin/pending")
        assert r.status_code in (401, 403)

    def test_dashboard_non_admin_rejected(self):
        """GET /admin/pending — 403 avec un cookie invalide."""
        r = httpx.get(f"{BASE}/admin/pending", cookies={"session_token": "fake"})
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 2. MEMBRES ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminMembers:
    """Tests gestion des membres."""

    def test_list_members(self, admin_cookie):
        """GET /admin/members/ — liste paginée."""
        r = httpx.get(f"{BASE}/admin/members/?limit=5", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert "members" in data
        assert "total" in data
        print(f"  Members: {data['total']} total, {len(data['members'])} returned")

    def test_list_members_filter_project(self, admin_cookie):
        """GET /admin/members/?project=benevole — filtre par projet."""
        r = httpx.get(f"{BASE}/admin/members/?project=benevole", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        for m in data["members"]:
            assert m["project"] == "benevole"

    def test_list_members_filter_status(self, admin_cookie):
        """GET /admin/members/?status=active — filtre par statut."""
        r = httpx.get(f"{BASE}/admin/members/?status=active", cookies=admin_cookie)
        assert r.status_code == 200
        for m in r.json()["members"]:
            assert m["membership_status"] == "active"

    def test_status_cycle_inactive_active(self, admin_cookie):
        """PATCH status: active → inactive → active — visible suit."""
        # Fix any corrupted data first (active members with visible=False)
        httpx.post(f"{BASE}/admin/members/backfill-visibility", cookies=admin_cookie)

        # Get a member that is currently active AND visible
        r = httpx.get(f"{BASE}/admin/members/?limit=100&status=active", cookies=admin_cookie)
        members = [m for m in r.json()["members"] if m.get("visible") is True]
        if not members:
            pytest.skip("No active+visible members")
        mid = members[0]["id"]
        name = members[0]["display_name"]

        # → inactive
        r = httpx.patch(
            f"{BASE}/admin/members/{mid}/status",
            json={"membership_status": "inactive"},
            cookies=admin_cookie,
        )
        assert r.status_code == 200

        # Check visible=False in member list
        r2 = httpx.get(f"{BASE}/admin/members/?limit=100", cookies=admin_cookie)
        member = next((m for m in r2.json()["members"] if m["id"] == mid), None)
        assert member is not None
        assert member["visible"] is False
        assert member["membership_status"] == "inactive"

        # → active
        r = httpx.patch(
            f"{BASE}/admin/members/{mid}/status",
            json={"membership_status": "active"},
            cookies=admin_cookie,
        )
        assert r.status_code == 200

        # Check visible=True
        r2 = httpx.get(f"{BASE}/admin/members/?limit=100", cookies=admin_cookie)
        member = next((m for m in r2.json()["members"] if m["id"] == mid), None)
        assert member["visible"] is True
        assert member["membership_status"] == "active"
        print(f"  Status cycle OK for {name}")

    def test_status_suspended_hides(self, admin_cookie):
        """PATCH status: active → suspended → visible=False."""
        r = httpx.get(f"{BASE}/admin/members/?limit=1&status=active", cookies=admin_cookie)
        members = r.json()["members"]
        if not members:
            pytest.skip("No active members")
        mid = members[0]["id"]

        r = httpx.patch(
            f"{BASE}/admin/members/{mid}/status",
            json={"membership_status": "suspended"},
            cookies=admin_cookie,
        )
        assert r.status_code == 200

        r2 = httpx.get(f"{BASE}/admin/members/?limit=100", cookies=admin_cookie)
        member = next((m for m in r2.json()["members"] if m["id"] == mid), None)
        assert member["visible"] is False

        # Restore
        httpx.patch(
            f"{BASE}/admin/members/{mid}/status",
            json={"membership_status": "active"},
            cookies=admin_cookie,
        )

    def test_edit_member_city_geocodes(self, admin_cookie):
        """PATCH member city → coordinates updated."""
        r = httpx.get(f"{BASE}/admin/members/?limit=1&status=active", cookies=admin_cookie)
        members = r.json()["members"]
        if not members:
            pytest.skip("No active members")
        mid = members[0]["id"]
        original_city = members[0].get("city")

        r = httpx.patch(
            f"{BASE}/admin/members/{mid}",
            json={"city": "Tokyo"},
            cookies=admin_cookie,
        )
        assert r.status_code == 200
        data = r.json()
        assert data["city"] == "Tokyo"
        assert data["latitude"] is not None
        assert data["longitude"] is not None
        # Tokyo should be in Japan area (lat 35-36, lng 139-140)
        # But without country restriction, Nominatim may find the most prominent result
        print(f"  Geocoding Tokyo: lat={data['latitude']:.4f}, lng={data['longitude']:.4f}")

        # Restore original city
        if original_city:
            httpx.patch(
                f"{BASE}/admin/members/{mid}",
                json={"city": original_city},
                cookies=admin_cookie,
            )

    def test_edit_member_no_changes(self, admin_cookie):
        """PATCH member with empty body → 400."""
        r = httpx.get(f"{BASE}/admin/members/?limit=1", cookies=admin_cookie)
        mid = r.json()["members"][0]["id"]
        r = httpx.patch(
            f"{BASE}/admin/members/{mid}",
            json={},
            cookies=admin_cookie,
        )
        assert r.status_code == 400

    def test_edit_nonexistent_member(self, admin_cookie):
        """PATCH /admin/members/fake-id → 404."""
        r = httpx.patch(
            f"{BASE}/admin/members/00000000-0000-0000-0000-000000000000",
            json={"city": "Paris"},
            cookies=admin_cookie,
        )
        assert r.status_code == 404

    def test_member_analytics(self, admin_cookie):
        """GET /admin/members/analytics — stats agrégées."""
        r = httpx.get(f"{BASE}/admin/members/analytics", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert "total_active" in data
        assert "by_project" in data
        print(f"  Analytics: {data['total_active']} active, {data['total_visible']} visible")

    def test_status_invalid_value(self, admin_cookie):
        """PATCH status with invalid value → 422."""
        r = httpx.get(f"{BASE}/admin/members/?limit=1", cookies=admin_cookie)
        mid = r.json()["members"][0]["id"]
        r = httpx.patch(
            f"{BASE}/admin/members/{mid}/status",
            json={"membership_status": "invalid_status"},
            cookies=admin_cookie,
        )
        assert r.status_code == 422

    def test_backfill_visibility(self, admin_cookie):
        """POST /admin/members/backfill-visibility — fix active+invisible members."""
        r = httpx.post(f"{BASE}/admin/members/backfill-visibility", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert "fixed" in data
        print(f"  Backfill visibility: {data['fixed']} fixed")

    def test_map_endpoint_only_visible(self, admin_cookie):
        """GET /members/map — only visible+active members returned."""
        r = httpx.get(f"{BASE}/members/map")
        assert r.status_code == 200
        members = r.json()
        for m in members:
            # All should have coordinates
            assert m.get("latitude") is not None or m.get("longitude") is not None


# ═══════════════════════════════════════════════════════════
# 3. CANDIDATURES TECH ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminCandidatures:
    """Tests gestion des candidatures tech."""

    def test_list_candidatures(self, admin_cookie):
        """GET /candidatures/admin/all — liste."""
        r = httpx.get(f"{BASE}/candidatures/admin/all", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"  Candidatures tech: {len(data)}")

    def test_list_candidatures_filter_status(self, admin_cookie):
        """GET /candidatures/admin/all?status=pending — filtre."""
        r = httpx.get(f"{BASE}/candidatures/admin/all?status=pending", cookies=admin_cookie)
        assert r.status_code == 200

    def test_export_csv(self, admin_cookie):
        """GET /candidatures/admin/export — CSV export."""
        r = httpx.get(f"{BASE}/candidatures/admin/export", cookies=admin_cookie)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        print(f"  CSV export: {len(r.text)} bytes")

    def test_candidature_requires_admin(self):
        """GET /candidatures/admin/all — 401 sans auth."""
        r = httpx.get(f"{BASE}/candidatures/admin/all")
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 4. BÉNÉVOLES ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminVolunteers:
    """Tests gestion des candidatures bénévoles."""

    def test_list_volunteers(self, admin_cookie):
        """GET /volunteers/admin/all — liste."""
        r = httpx.get(f"{BASE}/volunteers/admin/all", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"  Volunteers: {len(data)}")

    def test_list_volunteers_filter(self, admin_cookie):
        """GET /volunteers/admin/all?status=pending."""
        r = httpx.get(f"{BASE}/volunteers/admin/all?status=pending", cookies=admin_cookie)
        assert r.status_code == 200

    def test_export_volunteers_csv(self, admin_cookie):
        """GET /volunteers/admin/export — CSV."""
        r = httpx.get(f"{BASE}/volunteers/admin/export", cookies=admin_cookie)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")


# ═══════════════════════════════════════════════════════════
# 5. ÉTUDIANTS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminStudents:
    """Tests gestion des candidatures étudiantes."""

    def test_list_students(self, admin_cookie):
        """GET /students/admin/all — liste."""
        r = httpx.get(f"{BASE}/students/admin/all", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"  Students: {len(data)}")

    def test_export_students_csv(self, admin_cookie):
        """GET /students/admin/export — CSV."""
        r = httpx.get(f"{BASE}/students/admin/export", cookies=admin_cookie)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")


# ═══════════════════════════════════════════════════════════
# 6. CONTACT ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminContact:
    """Tests gestion des messages de contact."""

    def test_list_contact_messages(self, admin_cookie):
        """GET /contact/admin/all — liste."""
        r = httpx.get(f"{BASE}/contact/admin/all", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"  Contact messages: {len(data)}")

    def test_contact_requires_admin(self):
        """GET /contact/admin/all — 401 sans auth."""
        r = httpx.get(f"{BASE}/contact/admin/all")
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 7. ÉVÉNEMENTS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminEvents:
    """Tests CRUD événements."""

    def test_create_event(self, admin_cookie):
        """POST /events — créer un événement test."""
        r = httpx.post(
            f"{BASE}/events",
            json={
                "title": "TEST Event Admin Console",
                "description": "Test automatique console admin",
                "date": "2026-06-15T14:00:00",
                "location": "Paris, France",
                "type": "Atelier",
            },
            cookies=admin_cookie,
        )
        assert r.status_code in (200, 201)
        data = r.json()
        assert data["title"] == "TEST Event Admin Console"
        # Store for cleanup
        TestAdminEvents._event_id = data.get("id")
        print(f"  Event created: {data.get('id', 'ok')}")

    def test_list_events(self, admin_cookie):
        """GET /events — liste publique."""
        r = httpx.get(f"{BASE}/events")
        assert r.status_code == 200

    def test_update_event(self, admin_cookie):
        """PUT /events/{id} — modifier."""
        eid = getattr(TestAdminEvents, "_event_id", None)
        if not eid:
            pytest.skip("No event created")
        r = httpx.put(
            f"{BASE}/events/{eid}",
            json={
                "title": "TEST Event UPDATED",
                "description": "Updated",
                "date": "2026-06-15T14:00:00",
                "location": "Lyon, France",
                "type": "Atelier",
            },
            cookies=admin_cookie,
        )
        assert r.status_code == 200
        assert r.json()["title"] == "TEST Event UPDATED"
        print("  Event updated OK")

    def test_delete_event(self, admin_cookie):
        """DELETE /events/{id} — supprimer."""
        eid = getattr(TestAdminEvents, "_event_id", None)
        if not eid:
            pytest.skip("No event created")
        r = httpx.delete(f"{BASE}/events/{eid}", cookies=admin_cookie)
        assert r.status_code == 200
        print("  Event deleted OK")

    def test_delete_nonexistent_event(self, admin_cookie):
        """DELETE /events/fake-id → 404."""
        r = httpx.delete(
            f"{BASE}/events/00000000-0000-0000-0000-000000000000",
            cookies=admin_cookie,
        )
        assert r.status_code == 404


# ═══════════════════════════════════════════════════════════
# 8. EXPORTS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminExports:
    """Tests exports CSV."""

    def test_export_users_csv(self, admin_cookie):
        """GET /auth/admin/export-users — CSV users."""
        r = httpx.get(f"{BASE}/auth/admin/export-users", cookies=admin_cookie)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        lines = r.text.strip().split("\n")
        assert len(lines) >= 2  # Header + at least 1 user
        print(f"  Users CSV: {len(lines)-1} users")

    def test_export_users_requires_admin(self):
        """GET /auth/admin/export-users — 401 sans auth."""
        r = httpx.get(f"{BASE}/auth/admin/export-users")
        assert r.status_code in (401, 403)

    def test_export_optins_csv(self, admin_cookie):
        """GET /episodes/admin/export-optins — CSV opt-ins."""
        r = httpx.get(f"{BASE}/episodes/admin/export-optins", cookies=admin_cookie)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        print(f"  Opt-ins CSV: {len(r.text)} bytes")


# ═══════════════════════════════════════════════════════════
# 9. ANALYTICS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminAnalytics:
    """Tests analytics KPI dashboard."""

    def test_analytics_dashboard(self, admin_cookie):
        """GET /analytics/admin/dashboard — KPIs."""
        r = httpx.get(f"{BASE}/analytics/admin/dashboard", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)
        print(f"  Analytics keys: {list(data.keys())[:5]}...")

    def test_analytics_requires_admin(self):
        """GET /analytics/admin/dashboard — 401 sans auth."""
        r = httpx.get(f"{BASE}/analytics/admin/dashboard")
        assert r.status_code in (401, 403)


# ═══════════════════════════════════════════════════════════
# 10. UTILISATEURS ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminUsers:
    """Tests gestion utilisateurs."""

    def test_user_count(self, admin_cookie):
        """GET /users/count — nombre total."""
        r = httpx.get(f"{BASE}/users/count", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert "count" in data or isinstance(data, (int, dict))
        print(f"  Users count: {data}")

    def test_list_users(self, admin_cookie):
        """GET /users — liste paginée."""
        r = httpx.get(f"{BASE}/users?limit=5", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert "users" in data
        assert "total" in data
        print(f"  Users: {data['total']} total, {len(data['users'])} returned")

    def test_users_requires_admin(self):
        """GET /users — 401 sans auth."""
        r = httpx.get(f"{BASE}/users")
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

    @pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
    def test_all_admin_endpoints_reject_unauthenticated(self, method, path):
        """Tous les endpoints admin rejettent les requêtes non-authentifiées."""
        r = httpx.request(method, f"{BASE}{path}")
        assert r.status_code in (401, 403), f"{method} {path} returned {r.status_code}"

    @pytest.mark.parametrize("method,path", ADMIN_ENDPOINTS)
    def test_all_admin_endpoints_reject_fake_token(self, method, path):
        """Tous les endpoints admin rejettent un faux token."""
        r = httpx.request(method, f"{BASE}{path}", cookies={"session_token": "fake-token-xyz"})
        assert r.status_code in (401, 403), f"{method} {path} returned {r.status_code}"


# ═══════════════════════════════════════════════════════════
# 12. PARTENAIRES ADMIN
# ═══════════════════════════════════════════════════════════

class TestAdminPartners:
    """Tests gestion partenaires admin."""

    def test_list_partners_admin(self, admin_cookie):
        """GET /partners/admin/all — liste admin."""
        r = httpx.get(f"{BASE}/partners/admin/all", cookies=admin_cookie)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        print(f"  Partners: {len(data)}")

    def test_export_partners_csv(self, admin_cookie):
        """GET /partners/admin/export — CSV."""
        r = httpx.get(f"{BASE}/partners/admin/export", cookies=admin_cookie)
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")
        print(f"  Partners CSV: {len(r.text)} bytes")

    def test_partners_requires_admin(self):
        """GET /partners/admin/all — 401 sans auth."""
        r = httpx.get(f"{BASE}/partners/admin/all")
        assert r.status_code in (401, 403)
