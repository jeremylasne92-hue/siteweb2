"""
Tests for Story 4.4: Export de la base email opt-in (CSV admin).
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from server import app
from routes.auth import get_db, require_admin
from models import User, UserRole
from datetime import datetime, UTC

client = TestClient(app)

ADMIN_USER = User(
    id="admin-test-id",
    username="admin",
    email="admin@echo.fr",
    role=UserRole.ADMIN,
    created_at=datetime.now(UTC),
)

FAKE_OPTINS = [
    {"user_id": "user-1", "season": 1, "episode": 1, "created_at": datetime(2026, 3, 1, 10, 0)},
    {"user_id": "user-2", "season": 1, "episode": 2, "created_at": datetime(2026, 3, 2, 14, 0)},
    {"user_id": "user-1", "season": 2, "episode": 1, "created_at": datetime(2026, 3, 3, 9, 0)},
]

FAKE_USERS = [
    {"id": "user-1", "email": "alice@example.com"},
    {"id": "user-2", "email": "bob@example.com"},
]


def make_mock_db(optins=None, users=None):
    """Create a mock database for export tests."""
    db = MagicMock()

    # episode_optins.find() -> to_list()
    mock_optins_find = MagicMock()
    mock_optins_find.to_list = AsyncMock(return_value=optins if optins is not None else [])
    db.episode_optins.find = MagicMock(return_value=mock_optins_find)

    # users.find() -> to_list()
    mock_users_find = MagicMock()
    mock_users_find.to_list = AsyncMock(return_value=users if users is not None else [])
    db.users.find = MagicMock(return_value=mock_users_find)

    return db


def test_export_requires_admin():
    """GET /episodes/admin/export-optins without admin returns 401/403."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db
    # Don't override require_admin — will fail auth

    response = client.get("/api/episodes/admin/export-optins")

    app.dependency_overrides.clear()

    assert response.status_code in (401, 403)


def test_export_csv_success():
    """GET /episodes/admin/export-optins returns CSV with correct data."""
    db = make_mock_db(optins=FAKE_OPTINS, users=FAKE_USERS)
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.get("/api/episodes/admin/export-optins")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "attachment" in response.headers.get("content-disposition", "")

    text = response.text.lstrip("\ufeff")
    lines = [l.strip() for l in text.strip().splitlines()]
    assert len(lines) == 4  # 1 header + 3 data rows
    assert lines[0] == "email,season,episode,created_at"
    assert "alice@example.com" in lines[1]
    assert "bob@example.com" in lines[2]


def test_export_csv_orphan_user():
    """GET /episodes/admin/export-optins handles orphan user_id (user deleted)."""
    orphan_optin = [{"user_id": "deleted-user", "season": 1, "episode": 5, "created_at": datetime(2026, 3, 5)}]
    db = make_mock_db(optins=orphan_optin, users=[])
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.get("/api/episodes/admin/export-optins")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    text = response.text.lstrip("\ufeff")
    lines = [l.strip() for l in text.strip().splitlines()]
    assert len(lines) == 2  # header + 1 data row
    # Email should be empty for orphan user
    assert lines[1].startswith(",1,5,")


def test_export_csv_empty():
    """GET /episodes/admin/export-optins returns CSV with headers only when no opt-ins."""
    db = make_mock_db(optins=[], users=[])
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER

    response = client.get("/api/episodes/admin/export-optins")

    app.dependency_overrides.clear()

    assert response.status_code == 200
    text = response.text.lstrip("\ufeff")
    lines = [l.strip() for l in text.strip().splitlines()]
    assert len(lines) == 1  # Only header row
    assert lines[0] == "email,season,episode,created_at"
