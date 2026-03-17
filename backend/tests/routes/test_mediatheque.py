"""
Tests for the Médiathèque (media resources CRUD).
"""
import io
from datetime import datetime, UTC
from unittest.mock import AsyncMock, MagicMock

from bson import ObjectId
from fastapi.testclient import TestClient

from models import User, UserRole
from routes.auth import get_db, require_admin
from server import app

client = TestClient(app)

ADMIN_USER = User(
    id="admin-test-id",
    username="admin",
    email="admin@echo.fr",
    role=UserRole.ADMIN,
    created_at=datetime.now(UTC),
)

FAKE_OID = ObjectId()

VALID_RESOURCE = {
    "resource_type": "document",
    "title": "Guide de la transition",
    "description": "Un guide pratique pour la transition écologique.",
    "tags": ["transition", "guide"],
    "is_published": False,
    "sort_order": 0,
}

PUBLISHED_DOC = {
    "_id": FAKE_OID,
    "resource_type": "document",
    "title": "Guide de la transition",
    "description": "Un guide pratique pour la transition écologique.",
    "thumbnail_url": None,
    "external_url": None,
    "file_url": None,
    "file_name": None,
    "file_size": None,
    "tags": ["transition", "guide"],
    "source": None,
    "author": None,
    "year": None,
    "is_featured": False,
    "is_published": True,
    "sort_order": 0,
    "created_at": datetime.now(UTC),
    "updated_at": datetime.now(UTC),
}

UNPUBLISHED_DOC = {
    **PUBLISHED_DOC,
    "_id": ObjectId(),
    "title": "Brouillon privé",
    "is_published": False,
}


class AsyncCursorMock:
    """Mock for Motor's async cursor supporting async for and sort."""
    def __init__(self, docs):
        self._docs = list(docs)

    def sort(self, *args, **kwargs):
        return self

    async def __aiter__(self):
        for doc in self._docs:
            yield doc


def make_mock_db(docs=None):
    """Create a mock database for media resource tests."""
    db = MagicMock()
    db.media_resources.find = MagicMock(return_value=AsyncCursorMock(docs or []))
    db.media_resources.find_one = AsyncMock(return_value=None)
    db.media_resources.insert_one = AsyncMock(
        return_value=MagicMock(inserted_id=FAKE_OID)
    )
    db.media_resources.find_one_and_update = AsyncMock(return_value=None)
    db.media_resources.delete_one = AsyncMock(
        return_value=MagicMock(deleted_count=1)
    )
    return db


# --- Admin: Create ---

def test_create_resource_admin():
    """POST /api/admin/mediatheque creates resource with admin auth."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.post("/api/admin/mediatheque", json=VALID_RESOURCE)

    app.dependency_overrides.clear()

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == VALID_RESOURCE["title"]
    assert data["id"] == str(FAKE_OID)
    db.media_resources.insert_one.assert_called_once()


# --- Public: List ---

def test_list_resources_public():
    """GET /api/mediatheque returns only published resources."""
    db = make_mock_db(docs=[{**PUBLISHED_DOC}])
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/mediatheque")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Guide de la transition"
    # Verify query filter includes is_published: True
    call_args = db.media_resources.find.call_args
    assert call_args[0][0]["is_published"] is True


def test_list_resources_filter_by_type():
    """GET /api/mediatheque?type=video filters by resource type."""
    db = make_mock_db(docs=[])
    app.dependency_overrides[get_db] = lambda: db

    response = client.get("/api/mediatheque?type=video")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    call_args = db.media_resources.find.call_args
    query = call_args[0][0]
    assert query["is_published"] is True
    assert query["resource_type"] == "video"


# --- Admin: List all ---

def test_admin_list_resources():
    """GET /api/admin/mediatheque returns all resources including unpublished."""
    db = make_mock_db(docs=[{**PUBLISHED_DOC}, {**UNPUBLISHED_DOC}])
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.get("/api/admin/mediatheque")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


# --- Admin: Update ---

def test_update_resource_admin():
    """PUT /api/admin/mediatheque/{id} updates resource."""
    updated_doc = {**PUBLISHED_DOC, "title": "Titre modifié"}
    db = make_mock_db()
    db.media_resources.find_one_and_update = AsyncMock(return_value=updated_doc)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    updated_data = {**VALID_RESOURCE, "title": "Titre modifié"}
    response = client.put(f"/api/admin/mediatheque/{FAKE_OID}", json=updated_data)

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["title"] == "Titre modifié"
    db.media_resources.find_one_and_update.assert_called_once()


# --- Admin: Delete ---

def test_delete_resource_admin():
    """DELETE /api/admin/mediatheque/{id} deletes resource."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.delete(f"/api/admin/mediatheque/{FAKE_OID}")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert "deleted" in response.json()["message"].lower()
    db.media_resources.delete_one.assert_called_once()


# --- Admin: Toggle publish ---

def test_toggle_publish_admin():
    """PATCH /api/admin/mediatheque/{id}/publish toggles is_published."""
    doc = {**PUBLISHED_DOC, "is_published": False}
    toggled_doc = {**PUBLISHED_DOC, "is_published": True}
    db = make_mock_db()
    db.media_resources.find_one = AsyncMock(return_value=doc)
    db.media_resources.find_one_and_update = AsyncMock(return_value=toggled_doc)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.patch(f"/api/admin/mediatheque/{FAKE_OID}/publish")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["is_published"] is True
    db.media_resources.find_one_and_update.assert_called_once()


# --- Admin: Upload PDF ---

def test_upload_pdf_admin():
    """POST /api/admin/mediatheque/upload accepts PDF files."""
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    pdf_content = b"%PDF-1.4 fake pdf content for test"
    response = client.post(
        "/api/admin/mediatheque/upload",
        files={"file": ("guide.pdf", io.BytesIO(pdf_content), "application/pdf")},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["file_name"] == "guide.pdf"
    assert data["file_size"] == len(pdf_content)
    assert data["file_url"].startswith("/api/uploads/media/")
    assert data["file_url"].endswith(".pdf")


def test_upload_non_pdf_rejected():
    """POST /api/admin/mediatheque/upload rejects non-PDF files."""
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    txt_content = b"This is not a PDF"
    response = client.post(
        "/api/admin/mediatheque/upload",
        files={"file": ("notes.txt", io.BytesIO(txt_content), "text/plain")},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 400
    assert "PDF" in response.json()["detail"]
