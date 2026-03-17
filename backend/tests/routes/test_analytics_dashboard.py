"""
Tests for admin analytics dashboard endpoint.
"""
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from server import app
from routes.auth import get_current_user, require_admin
from models import User, UserRole
from datetime import datetime, UTC

client = TestClient(app)

MOCK_ADMIN = User(
    id="admin-analytics-1",
    username="admin_analytics",
    email="admin-analytics@test.com",
    role=UserRole.ADMIN,
    created_at=datetime.now(UTC),
)

MOCK_USER = User(
    id="user-analytics-1",
    username="user_analytics",
    email="user-analytics@test.com",
    role=UserRole.USER,
    created_at=datetime.now(UTC),
)


def make_mock_db():
    """Create a mock database for analytics dashboard queries."""
    db = MagicMock()

    # count_documents returns 0 for all collections
    db.analytics_events.count_documents = AsyncMock(return_value=0)
    db.users.count_documents = AsyncMock(return_value=0)
    db.volunteer_applications.count_documents = AsyncMock(return_value=0)
    db.partners.count_documents = AsyncMock(return_value=0)
    db.tech_candidatures.count_documents = AsyncMock(return_value=0)
    db.contact_messages.count_documents = AsyncMock(return_value=0)

    # aggregate returns empty lists
    mock_aggregate_cursor = MagicMock()
    mock_aggregate_cursor.to_list = AsyncMock(return_value=[])
    db.analytics_events.aggregate = MagicMock(return_value=mock_aggregate_cursor)

    # find returns empty list
    mock_find_cursor = MagicMock()
    mock_find_cursor.to_list = AsyncMock(return_value=[])
    db.analytics_events.find = MagicMock(return_value=mock_find_cursor)

    return db


def test_analytics_dashboard_returns_structure():
    """Dashboard endpoint returns the expected JSON structure."""
    db = make_mock_db()
    app.db = db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    app.dependency_overrides[get_current_user] = lambda: MOCK_ADMIN

    try:
        resp = client.get("/api/analytics/admin/dashboard?period=7")
        assert resp.status_code == 200
        data = resp.json()

        # Verify top-level structure
        assert "period_days" in data
        assert "acquisition" in data
        assert "engagement" in data
        assert "conversion" in data
        assert "partners" in data

        # Verify acquisition sub-keys
        acq = data["acquisition"]
        assert "total_visits" in acq
        assert "unique_sessions" in acq
        assert "by_source" in acq
        assert "by_landing_page" in acq
        assert "bounce_rate" in acq

        # Verify engagement sub-keys
        eng = data["engagement"]
        assert "avg_pages_per_session" in eng
        assert "top_pages" in eng
        assert "top_ctas" in eng

        # Verify conversion sub-keys
        conv = data["conversion"]
        assert "registrations" in conv
        assert "volunteers" in conv
        assert "partner_applications" in conv
        assert "contact_submissions" in conv

        # Verify partners sub-keys
        p = data["partners"]
        assert "total_profile_views" in p
        assert "total_website_clicks" in p
        assert "conversion_rate" in p
    finally:
        app.dependency_overrides.pop(require_admin, None)
        app.dependency_overrides.pop(get_current_user, None)


def test_analytics_dashboard_requires_admin():
    """Dashboard endpoint rejects non-admin users."""
    # No auth overrides — should fail with 401
    app.dependency_overrides.pop(require_admin, None)
    app.dependency_overrides.pop(get_current_user, None)

    resp = client.get("/api/analytics/admin/dashboard?period=7")
    assert resp.status_code in [401, 403]


def test_analytics_dashboard_default_period():
    """Dashboard defaults to 7-day period."""
    db = make_mock_db()
    app.db = db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    app.dependency_overrides[get_current_user] = lambda: MOCK_ADMIN

    try:
        resp = client.get("/api/analytics/admin/dashboard")
        assert resp.status_code == 200
        assert resp.json()["period_days"] == 7
    finally:
        app.dependency_overrides.pop(require_admin, None)
        app.dependency_overrides.pop(get_current_user, None)


def test_analytics_dashboard_custom_period():
    """Dashboard accepts custom period parameter."""
    db = make_mock_db()
    app.db = db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    app.dependency_overrides[get_current_user] = lambda: MOCK_ADMIN

    try:
        resp = client.get("/api/analytics/admin/dashboard?period=30")
        assert resp.status_code == 200
        assert resp.json()["period_days"] == 30
    finally:
        app.dependency_overrides.pop(require_admin, None)
        app.dependency_overrides.pop(get_current_user, None)


def test_analytics_dashboard_zero_division_safety():
    """Dashboard handles zero sessions/partners without errors."""
    db = make_mock_db()
    app.db = db
    app.dependency_overrides[require_admin] = lambda: MOCK_ADMIN
    app.dependency_overrides[get_current_user] = lambda: MOCK_ADMIN

    try:
        resp = client.get("/api/analytics/admin/dashboard?period=7")
        assert resp.status_code == 200
        data = resp.json()
        # Should not crash on zero division
        assert data["acquisition"]["bounce_rate"] == 0
        assert data["engagement"]["avg_pages_per_session"] == 0
        assert data["partners"]["conversion_rate"] == 0
    finally:
        app.dependency_overrides.pop(require_admin, None)
        app.dependency_overrides.pop(get_current_user, None)
