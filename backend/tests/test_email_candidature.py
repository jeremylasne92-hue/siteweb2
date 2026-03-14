"""Tests for candidature email functions."""
import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_send_candidature_confirmation():
    """Test confirmation email is sent on candidature submission."""
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_confirmation

        result = await send_candidature_confirmation("alice@example.com", "Alice", "cognisphere")
        assert result is True
        mock_log.assert_called_once()
        args = mock_log.call_args
        assert args[0][0] == "alice@example.com"
        assert "CogniSphère" in args[0][1]  # subject contains project label
        assert "Alice" in args[0][2]  # body contains name


@pytest.mark.asyncio
async def test_send_candidature_confirmation_echolink():
    """Test confirmation email with echolink project label."""
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_confirmation

        result = await send_candidature_confirmation("bob@example.com", "Bob", "echolink")
        assert result is True
        args = mock_log.call_args
        assert "ECHOLink" in args[0][1]


@pytest.mark.asyncio
async def test_send_candidature_interview():
    """Test interview invitation email with booking link."""
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_interview

        booking_url = "https://calendar.app.google/test123"
        result = await send_candidature_interview("alice@example.com", "Alice", booking_url)
        assert result is True
        mock_log.assert_called_once()
        args = mock_log.call_args
        assert args[0][0] == "alice@example.com"
        assert "entretien" in args[0][1].lower() or "Entretien" in args[0][1]
        assert booking_url in args[0][2]


@pytest.mark.asyncio
async def test_send_candidature_accepted():
    """Test acceptance notification email."""
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_accepted

        result = await send_candidature_accepted("alice@example.com", "Alice", "scenariste")
        assert result is True
        mock_log.assert_called_once()
        args = mock_log.call_args
        assert args[0][0] == "alice@example.com"
        assert "Alice" in args[0][2]
        assert "Scénariste" in args[0][2] or "Scénariste" in args[0][1]


@pytest.mark.asyncio
async def test_send_candidature_rejected_with_note():
    """Test rejection email with a status note."""
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_rejected

        result = await send_candidature_rejected(
            "alice@example.com", "Alice", "Profil incompatible avec le projet"
        )
        assert result is True
        mock_log.assert_called_once()
        args = mock_log.call_args
        assert args[0][0] == "alice@example.com"
        assert "Profil incompatible avec le projet" in args[0][2]


@pytest.mark.asyncio
async def test_send_candidature_rejected_without_note():
    """Test rejection email without a status note."""
    with patch("email_service._log_email", new_callable=AsyncMock, return_value=True) as mock_log:
        from email_service import send_candidature_rejected

        result = await send_candidature_rejected("alice@example.com", "Alice", None)
        assert result is True
        mock_log.assert_called_once()
        args = mock_log.call_args
        assert args[0][0] == "alice@example.com"
        # Should not contain a reason section when no note
        assert "Profil incompatible" not in args[0][2]
