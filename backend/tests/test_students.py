"""
Comprehensive tests for student/intern application routes.

Covers:
- POST /api/students/apply (public)
- GET /api/students/admin/all (admin)
- PUT /api/students/admin/{id}/status (admin)
- PUT /api/students/admin/{id}/edit (admin)
- DELETE /api/students/admin/{id} (admin)
- GET /api/students/admin/export (admin)
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta, UTC

from server import app
from routes.auth import get_db, require_admin
from models import User


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

VALID_STUDENT_DATA = {
    "name": "Marie Dupont",
    "email": "marie.dupont@ecole.fr",
    "phone": "0612345678",
    "city": "Lyon",
    "school": "INSA Lyon",
    "study_field": "Audiovisuel et Multimédia",
    "skills": ["Montage vidéo", "Étalonnage"],
    "availability": "stage_long",
    "start_date": "2026-06-01",
    "message": "Très motivée pour rejoindre l'équipe de production.",
    "website": "",
}

ADMIN_USER = User(
    id="admin-001",
    username="admin_test",
    email="admin@echo.fr",
    password_hash="hashed",
    role="admin",
    is_2fa_enabled=False,
    created_at=datetime.now(UTC),
)

NON_ADMIN_USER = User(
    id="user-001",
    username="user_test",
    email="user@echo.fr",
    password_hash="hashed",
    role="user",
    is_2fa_enabled=False,
    created_at=datetime.now(UTC),
)


def _make_mock_db():
    """Create a fresh mock DB with all collections needed by student routes."""
    db = MagicMock()

    # rate_limits
    db.rate_limits.count_documents = AsyncMock(return_value=0)
    db.rate_limits.insert_one = AsyncMock()

    # student_applications
    db.student_applications.insert_one = AsyncMock()
    db.student_applications.find_one = AsyncMock(return_value=None)
    db.student_applications.delete_one = AsyncMock(
        return_value=MagicMock(deleted_count=1)
    )
    db.student_applications.update_one = AsyncMock(
        return_value=MagicMock(matched_count=1)
    )

    # find() returns an async cursor mock
    cursor_mock = MagicMock()
    cursor_mock.sort = MagicMock(return_value=cursor_mock)
    cursor_mock.to_list = AsyncMock(return_value=[])
    db.student_applications.find = MagicMock(return_value=cursor_mock)

    # audit_log
    db.audit_log = MagicMock()
    db.audit_log.insert_one = AsyncMock()

    # members (for auto_seed_member_profile)
    db.members = MagicMock()
    db.members.find_one = AsyncMock(return_value=None)
    db.members.insert_one = AsyncMock()
    db.members.update_one = AsyncMock()

    return db


# ===================================================================
# POST /api/students/apply (public)
# ===================================================================

class TestStudentApply:
    """Tests for the public student application endpoint."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_student_apply_success(self):
        """POST /api/students/apply with valid data returns 200 + success message."""
        client = TestClient(app)
        with patch("routes.students.send_email", new_callable=AsyncMock), \
             patch("routes.students.send_student_confirmation", new_callable=AsyncMock), \
             patch("routes.students.geocode_city", new_callable=AsyncMock, return_value=None):
            resp = client.post("/api/students/apply", json=VALID_STUDENT_DATA)

        assert resp.status_code == 200
        assert resp.json()["message"] == "Candidature envoyée avec succès"
        self.db.student_applications.insert_one.assert_called_once()

    def test_student_apply_missing_fields(self):
        """POST /api/students/apply with missing required fields returns 422."""
        client = TestClient(app)
        # Missing name, email, school, study_field, skills, availability
        resp = client.post("/api/students/apply", json={"city": "Lyon"})

        assert resp.status_code == 422

    def test_student_apply_invalid_email(self):
        """POST /api/students/apply with bad email returns 422."""
        client = TestClient(app)
        payload = {**VALID_STUDENT_DATA, "email": "not-an-email"}
        resp = client.post("/api/students/apply", json=payload)

        assert resp.status_code == 422

    def test_student_apply_honeypot(self):
        """POST /api/students/apply with filled honeypot returns 200 but does NOT store."""
        payload = {**VALID_STUDENT_DATA, "website": "http://spam.bot"}

        client = TestClient(app)
        with patch("routes.students.send_email", new_callable=AsyncMock), \
             patch("routes.students.send_student_confirmation", new_callable=AsyncMock), \
             patch("routes.students.geocode_city", new_callable=AsyncMock, return_value=None):
            resp = client.post("/api/students/apply", json=payload)

        assert resp.status_code == 200
        assert resp.json()["message"] == "Candidature envoyée avec succès"
        # Should NOT have stored the application
        self.db.student_applications.insert_one.assert_not_called()

    def test_student_apply_invalid_start_date(self):
        """POST /api/students/apply with bad start_date format returns 422."""
        client = TestClient(app)
        payload = {**VALID_STUDENT_DATA, "start_date": "June 2026"}
        resp = client.post("/api/students/apply", json=payload)

        assert resp.status_code == 422

    def test_student_apply_valid_start_date(self):
        """POST /api/students/apply with YYYY-MM-DD start_date is accepted."""
        client = TestClient(app)
        payload = {**VALID_STUDENT_DATA, "start_date": "2026-09-10"}
        with patch("routes.students.send_email", new_callable=AsyncMock), \
             patch("routes.students.send_student_confirmation", new_callable=AsyncMock), \
             patch("routes.students.geocode_city", new_callable=AsyncMock, return_value=None):
            resp = client.post("/api/students/apply", json=payload)

        assert resp.status_code == 200
        assert resp.json()["message"] == "Candidature envoyée avec succès"

    def test_student_apply_rate_limit(self):
        """POST /api/students/apply returns 429 when rate limit reached."""
        self.db.rate_limits.count_documents = AsyncMock(return_value=3)

        client = TestClient(app)
        with patch("routes.students.send_email", new_callable=AsyncMock), \
             patch("routes.students.send_student_confirmation", new_callable=AsyncMock), \
             patch("routes.students.geocode_city", new_callable=AsyncMock, return_value=None):
            resp = client.post("/api/students/apply", json=VALID_STUDENT_DATA)

        assert resp.status_code == 429
        self.db.student_applications.insert_one.assert_not_called()


# ===================================================================
# GET /api/students/admin/all (admin)
# ===================================================================

class TestAdminListStudents:
    """Tests for listing student applications (admin only)."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_admin_list_students(self):
        """GET /api/students/admin/all returns list of applications."""
        sample_doc = {
            "_id": "mongo-id",
            "id": "app-001",
            "name": "Marie Dupont",
            "email": "marie@ecole.fr",
            "status": "pending",
        }
        cursor_mock = MagicMock()
        cursor_mock.sort = MagicMock(return_value=cursor_mock)
        cursor_mock.to_list = AsyncMock(return_value=[sample_doc])
        self.db.student_applications.find = MagicMock(return_value=cursor_mock)

        client = TestClient(app)
        resp = client.get("/api/students/admin/all")

        assert resp.status_code == 200
        body = resp.json()
        assert isinstance(body, list)
        assert len(body) == 1
        assert body[0]["name"] == "Marie Dupont"
        # _id should be stringified
        assert body[0]["_id"] == "mongo-id"

    def test_admin_list_students_filter_status(self):
        """GET /api/students/admin/all?status=pending filters by status."""
        cursor_mock = MagicMock()
        cursor_mock.sort = MagicMock(return_value=cursor_mock)
        cursor_mock.to_list = AsyncMock(return_value=[])
        self.db.student_applications.find = MagicMock(return_value=cursor_mock)

        client = TestClient(app)
        resp = client.get("/api/students/admin/all?status=pending")

        assert resp.status_code == 200
        # Verify the query passed to find includes the status filter
        call_args = self.db.student_applications.find.call_args
        query = call_args[0][0]
        assert query.get("status") == "pending"

    def test_admin_list_students_unauthorized(self):
        """GET /api/students/admin/all without admin returns 403."""
        # Remove admin override so require_admin will run normally
        app.dependency_overrides.pop(require_admin, None)

        # No session cookie -> should get 401
        client = TestClient(app)
        resp = client.get("/api/students/admin/all")

        assert resp.status_code in (401, 403)


# ===================================================================
# PUT /api/students/admin/{id}/status (admin)
# ===================================================================

class TestAdminUpdateStudentStatus:
    """Tests for updating student application status (admin only)."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_admin_update_student_status(self):
        """PUT /api/students/admin/{id}/status changes status."""
        self.db.student_applications.find_one = AsyncMock(return_value={
            "id": "app-001",
            "email": "marie@ecole.fr",
            "name": "Marie Dupont",
            "status": "entretien",
        })

        client = TestClient(app)
        with patch("routes.students.send_student_interview", new_callable=AsyncMock), \
             patch("routes.students.send_student_accepted", new_callable=AsyncMock), \
             patch("routes.students.send_student_rejected", new_callable=AsyncMock), \
             patch("routes.students.auto_seed_member_profile", new_callable=AsyncMock), \
             patch("routes.students.deactivate_member_profile", new_callable=AsyncMock):
            resp = client.put(
                "/api/students/admin/app-001/status",
                json={"status": "entretien"},
            )

        assert resp.status_code == 200
        assert "entretien" in resp.json()["message"]
        self.db.student_applications.update_one.assert_called_once()

    def test_admin_update_student_status_with_note(self):
        """PUT /api/students/admin/{id}/status saves status_note."""
        self.db.student_applications.find_one = AsyncMock(return_value={
            "id": "app-001",
            "email": "marie@ecole.fr",
            "name": "Marie Dupont",
            "status": "rejected",
        })

        client = TestClient(app)
        with patch("routes.students.send_student_interview", new_callable=AsyncMock), \
             patch("routes.students.send_student_accepted", new_callable=AsyncMock), \
             patch("routes.students.send_student_rejected", new_callable=AsyncMock), \
             patch("routes.students.auto_seed_member_profile", new_callable=AsyncMock), \
             patch("routes.students.deactivate_member_profile", new_callable=AsyncMock):
            resp = client.put(
                "/api/students/admin/app-001/status",
                json={"status": "rejected", "status_note": "Profil incompatible"},
            )

        assert resp.status_code == 200
        # Verify status_note was included in the update
        call_args = self.db.student_applications.update_one.call_args
        update_set = call_args[0][1]["$set"]
        assert update_set["status_note"] == "Profil incompatible"


# ===================================================================
# PUT /api/students/admin/{id}/edit (admin)
# ===================================================================

class TestAdminEditStudent:
    """Tests for editing student application fields (admin only)."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_admin_edit_student(self):
        """PUT /api/students/admin/{id}/edit updates fields."""
        client = TestClient(app)
        with patch("routes.students.geocode_city", new_callable=AsyncMock, return_value=None):
            resp = client.put(
                "/api/students/admin/app-001/edit",
                json={"name": "Marie Dupont-Martin", "city": "Paris"},
            )

        assert resp.status_code == 200
        assert resp.json()["message"] == "Candidature mise à jour"
        self.db.student_applications.update_one.assert_called_once()

    def test_admin_edit_student_empty_body(self):
        """PUT /api/students/admin/{id}/edit with no fields returns 400."""
        client = TestClient(app)
        with patch("routes.students.geocode_city", new_callable=AsyncMock, return_value=None):
            resp = client.put(
                "/api/students/admin/app-001/edit",
                json={},
            )

        assert resp.status_code == 400


# ===================================================================
# DELETE /api/students/admin/{id} (admin)
# ===================================================================

class TestAdminDeleteStudent:
    """Tests for deleting a student application (admin only)."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_admin_delete_student(self):
        """DELETE /api/students/admin/{id} removes the application."""
        client = TestClient(app)
        resp = client.delete("/api/students/admin/app-001")

        assert resp.status_code == 200
        assert resp.json()["message"] == "Candidature supprimée"
        self.db.student_applications.delete_one.assert_called_once()

    def test_admin_delete_student_not_found(self):
        """DELETE /api/students/admin/{id} returns 404 if not found."""
        self.db.student_applications.delete_one = AsyncMock(
            return_value=MagicMock(deleted_count=0)
        )

        client = TestClient(app)
        resp = client.delete("/api/students/admin/nonexistent")

        assert resp.status_code == 404


# ===================================================================
# GET /api/students/admin/export (admin)
# ===================================================================

class TestAdminExportCSV:
    """Tests for CSV export of student applications (admin only)."""

    def setup_method(self):
        self.db = _make_mock_db()
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    def teardown_method(self):
        app.dependency_overrides.clear()

    def test_admin_export_csv(self):
        """GET /api/students/admin/export returns CSV with correct headers."""
        sample_doc = {
            "id": "app-001",
            "name": "Marie Dupont",
            "email": "marie@ecole.fr",
            "phone": "0612345678",
            "city": "Lyon",
            "school": "INSA Lyon",
            "study_field": "Audiovisuel",
            "skills": ["Montage vidéo"],
            "availability": "stage_long",
            "start_date": "2026-06-01",
            "status": "pending",
            "message": "Motivée",
            "admin_notes": "",
            "created_at": datetime.now(UTC),
        }

        # Mock async cursor iteration
        async def mock_aiter(self_cursor):
            for doc in [sample_doc]:
                yield doc

        cursor_mock = MagicMock()
        cursor_mock.sort = MagicMock(return_value=cursor_mock)
        cursor_mock.__aiter__ = mock_aiter
        self.db.student_applications.find = MagicMock(return_value=cursor_mock)

        client = TestClient(app)
        resp = client.get("/api/students/admin/export")

        assert resp.status_code == 200
        assert "text/csv" in resp.headers["content-type"]
        assert "students-export.csv" in resp.headers.get("content-disposition", "")

        # Parse CSV content
        content = resp.text
        lines = content.strip().split("\n")
        # First line (after BOM) should be headers
        header_line = lines[0].lstrip("\ufeff")
        assert "Nom" in header_line
        assert "Email" in header_line
        assert "École" in header_line
        assert "Statut" in header_line

        # Should have at least 2 lines (header + 1 data row)
        assert len(lines) >= 2
