"""
Tests for member profiles public + authenticated endpoints.
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from server import app
from routes.auth import get_db, get_current_user
from models import User, UserRole
from datetime import datetime

client = TestClient(app)

REGULAR_USER = User(
    id="user-test-id",
    username="testuser",
    email="test@example.com",
    role=UserRole.USER,
    created_at=datetime.utcnow(),
)

SAMPLE_PROFILE = {
    "_id": "mongo-object-id",
    "id": "profile-1",
    "user_id": "user-test-id",
    "display_name": "Alice Martin",
    "slug": "alice-martin",
    "bio": "Passionnee d'ecologie",
    "avatar_url": "https://example.com/avatar.jpg",
    "city": "Lyon",
    "region": "auvergne_rhone_alpes",
    "department": "69",
    "project": "cognisphere",
    "role_title": "Dev Frontend",
    "skills": ["react", "typescript"],
    "experience_level": "professional",
    "availability": "regular",
    "age_range": "26-35",
    "professional_sector": "tech",
    "gender": "woman",
    "contact_email": "alice@example.com",
    "social_links": [{"platform": "linkedin", "url": "https://linkedin.com/in/alice"}],
    "visible": True,
    "visibility_overrides": {
        "contact_email": False,
        "city": True,
        "social_links": True,
        "age_range": False,
        "professional_sector": False,
    },
    "candidature_id": "cand-123",
    "candidature_type": "tech",
    "membership_status": "active",
    "joined_at": datetime.utcnow().isoformat(),
    "created_at": datetime.utcnow().isoformat(),
    "updated_at": datetime.utcnow().isoformat(),
}


def _make_cursor_mock(docs):
    """Create a mock cursor that supports chaining: .sort().skip().limit().to_list()"""
    cursor = MagicMock()
    cursor.sort = MagicMock(return_value=cursor)
    cursor.skip = MagicMock(return_value=cursor)
    cursor.limit = MagicMock(return_value=cursor)
    cursor.to_list = AsyncMock(return_value=docs)
    return cursor


def test_list_members_public():
    """GET /api/members returns visible profiles with private fields stripped."""
    db = MagicMock()
    db.member_profiles.count_documents = AsyncMock(return_value=1)
    db.member_profiles.find = MagicMock(return_value=_make_cursor_mock([SAMPLE_PROFILE]))

    app.dependency_overrides[get_db] = lambda: db
    response = client.get("/api/members")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["page"] == 1
    assert len(data["members"]) == 1

    member = data["members"][0]
    # Private fields must be stripped
    assert "age_range" not in member
    assert "gender" not in member
    assert "professional_sector" not in member
    assert "user_id" not in member
    assert "candidature_id" not in member
    assert "candidature_type" not in member
    assert "_id" not in member
    # contact_email hidden by default (visibility_overrides.contact_email=False)
    assert "contact_email" not in member
    # visibility_overrides itself should be stripped
    assert "visibility_overrides" not in member
    # Public fields present
    assert member["display_name"] == "Alice Martin"
    assert member["city"] == "Lyon"
    assert member["slug"] == "alice-martin"


def test_get_member_by_slug():
    """GET /api/members/{slug} returns single visible profile."""
    db = MagicMock()
    db.member_profiles.find_one = AsyncMock(return_value=SAMPLE_PROFILE)

    app.dependency_overrides[get_db] = lambda: db
    response = client.get("/api/members/alice-martin")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    member = response.json()
    assert member["display_name"] == "Alice Martin"
    # Private fields stripped
    assert "user_id" not in member
    assert "age_range" not in member
    assert "gender" not in member
    assert "_id" not in member


def test_get_member_not_found():
    """GET /api/members/{slug} returns 404 if not found."""
    db = MagicMock()
    db.member_profiles.find_one = AsyncMock(return_value=None)

    app.dependency_overrides[get_db] = lambda: db
    response = client.get("/api/members/does-not-exist")
    app.dependency_overrides.clear()

    assert response.status_code == 404


def test_get_my_profile():
    """GET /api/members/me with auth returns own full profile."""
    db = MagicMock()
    db.member_profiles.find_one = AsyncMock(return_value=SAMPLE_PROFILE)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER
    response = client.get("/api/members/me")
    app.dependency_overrides.clear()

    assert response.status_code == 200
    data = response.json()
    # Full profile returned (includes private fields)
    assert data["user_id"] == "user-test-id"
    assert data["display_name"] == "Alice Martin"
    assert "_id" not in data  # _id always stripped


def test_get_my_profile_not_found():
    """GET /api/members/me returns 404 if no profile exists for user."""
    db = MagicMock()
    db.member_profiles.find_one = AsyncMock(return_value=None)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER
    response = client.get("/api/members/me")
    app.dependency_overrides.clear()

    assert response.status_code == 404


def test_update_my_profile():
    """PATCH /api/members/me updates profile and returns updated doc."""
    db = MagicMock()
    updated_profile = {**SAMPLE_PROFILE, "bio": "Updated bio"}
    update_result = MagicMock()
    update_result.matched_count = 1
    db.member_profiles.update_one = AsyncMock(return_value=update_result)
    db.member_profiles.find_one = AsyncMock(return_value=updated_profile)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER
    response = client.patch("/api/members/me", json={"bio": "Updated bio"})
    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["bio"] == "Updated bio"
    db.member_profiles.update_one.assert_called_once()


def test_update_my_profile_not_found():
    """PATCH /api/members/me returns 404 if no profile exists."""
    db = MagicMock()
    update_result = MagicMock()
    update_result.matched_count = 0
    db.member_profiles.update_one = AsyncMock(return_value=update_result)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER
    response = client.patch("/api/members/me", json={"bio": "New bio"})
    app.dependency_overrides.clear()

    assert response.status_code == 404


def test_update_visibility():
    """PATCH /api/members/me/visibility toggles visibility settings."""
    db = MagicMock()
    updated_profile = {**SAMPLE_PROFILE, "visible": True}
    update_result = MagicMock()
    update_result.matched_count = 1
    db.member_profiles.update_one = AsyncMock(return_value=update_result)
    db.member_profiles.find_one = AsyncMock(return_value=updated_profile)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER
    response = client.patch(
        "/api/members/me/visibility",
        json={"visible": True, "visibility_overrides": {"contact_email": True}},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 200
    db.member_profiles.update_one.assert_called_once()


def test_update_visibility_not_found():
    """PATCH /api/members/me/visibility returns 404 if no profile."""
    db = MagicMock()
    update_result = MagicMock()
    update_result.matched_count = 0
    db.member_profiles.update_one = AsyncMock(return_value=update_result)

    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[get_current_user] = lambda: REGULAR_USER
    response = client.patch(
        "/api/members/me/visibility",
        json={"visible": False},
    )
    app.dependency_overrides.clear()

    assert response.status_code == 404
