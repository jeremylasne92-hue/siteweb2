"""Tests for rate limiting utility."""
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from utils.rate_limit import check_rate_limit


# Minimal FastAPI app for testing
test_app = FastAPI()

# Mock DB
mock_db = MagicMock()


@test_app.post("/test-endpoint")
async def rate_limited_endpoint(request: Request):
    await check_rate_limit(mock_db, request, "test_action", max_requests=3, window_minutes=15)
    return {"ok": True}


client = TestClient(test_app)


def setup_function():
    """Reset mock before each test."""
    mock_db.reset_mock()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=0)
    mock_db.rate_limits.insert_one = AsyncMock()


def test_rate_limit_allows_under_limit():
    """Request under limit should succeed."""
    setup_function()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=2)

    response = client.post("/test-endpoint")
    assert response.status_code == 200
    assert response.json() == {"ok": True}
    mock_db.rate_limits.insert_one.assert_called_once()


def test_rate_limit_blocks_at_limit():
    """Request at limit should return 429."""
    setup_function()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=3)

    response = client.post("/test-endpoint")
    assert response.status_code == 429
    assert "Trop de tentatives" in response.json()["detail"]
    mock_db.rate_limits.insert_one.assert_not_called()


def test_rate_limit_blocks_over_limit():
    """Request over limit should return 429."""
    setup_function()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=10)

    response = client.post("/test-endpoint")
    assert response.status_code == 429
    mock_db.rate_limits.insert_one.assert_not_called()


def test_rate_limit_records_attempt():
    """Should record the attempt in the database when under limit."""
    setup_function()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=0)

    response = client.post("/test-endpoint")
    assert response.status_code == 200
    mock_db.rate_limits.insert_one.assert_called_once()
    call_args = mock_db.rate_limits.insert_one.call_args[0][0]
    assert call_args["action"] == "test_action"
    assert "ip" in call_args
    assert "created_at" in call_args


def test_rate_limit_queries_correct_action():
    """Should query for the correct action name."""
    setup_function()
    mock_db.rate_limits.count_documents = AsyncMock(return_value=0)

    client.post("/test-endpoint")
    call_args = mock_db.rate_limits.count_documents.call_args[0][0]
    assert call_args["action"] == "test_action"
    assert "ip" in call_args
    assert "created_at" in call_args
