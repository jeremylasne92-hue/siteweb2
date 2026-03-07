"""
Tests for Story 3.1: Formulaire de Candidature Partenaire.
"""
import io
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from PIL import Image
from server import app
from routes.auth import get_db

client = TestClient(app)

VALID_FORM = {
    "name": "Asso Test",
    "category": "expert",
    "thematics": '["ENV", "SOC"]',
    "description": "Une association de test pour les partenaires.",
    "address": "10 rue de la Paix",
    "city": "Paris",
    "postal_code": "75001",
    "latitude": "48.8566",
    "longitude": "2.3522",
    "contact_name": "Jean Dupont",
    "contact_email": "jean@asso-test.fr",
    "password": "SecurePass123!",
}


def make_valid_logo(size_bytes=1024):
    """Create a valid PNG image in memory."""
    img = Image.new("RGB", (100, 100), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def make_mock_db(existing_user=None, recent_partner_count=0):
    """Create a mock database for partner apply tests."""
    db = MagicMock()
    db.users.find_one = AsyncMock(return_value=existing_user)
    db.users.insert_one = AsyncMock()
    db.partners.find_one = AsyncMock(return_value=None)
    db.partners.insert_one = AsyncMock()
    db.partners.count_documents = AsyncMock(return_value=recent_partner_count)
    return db


def test_apply_success():
    """POST /partners/apply with valid data creates partner with PENDING status."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    logo = make_valid_logo()

    with patch("routes.partners.send_email", new_callable=AsyncMock) as mock_email:
        response = client.post(
            "/api/partners/apply",
            data=VALID_FORM,
            files={"logo": ("logo.png", logo, "image/png")},
        )

    app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json()["success"] is True
    db.partners.insert_one.assert_called_once()
    db.users.insert_one.assert_called_once()
    # FR12 + FR13: both candidate and team emails sent
    assert mock_email.call_count == 2


def test_apply_duplicate_email():
    """POST /partners/apply with existing email returns 400."""
    db = make_mock_db(existing_user={"email": "jean@asso-test.fr"})
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/partners/apply", data=VALID_FORM)

    app.dependency_overrides.clear()

    assert response.status_code == 400
    assert "existe déjà" in response.json()["detail"]


def test_apply_invalid_logo_content():
    """POST /partners/apply with non-image file returns 400."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    fake_file = io.BytesIO(b"not an image content at all")

    with patch("routes.partners.send_email", new_callable=AsyncMock):
        response = client.post(
            "/api/partners/apply",
            data=VALID_FORM,
            files={"logo": ("malware.png", fake_file, "image/png")},
        )

    app.dependency_overrides.clear()

    assert response.status_code == 400
    assert "image valide" in response.json()["detail"]


def test_apply_logo_too_large():
    """POST /partners/apply with logo > 2 Mo returns 400."""
    db = make_mock_db()
    app.dependency_overrides[get_db] = lambda: db

    # Create a valid image then pad it beyond 2 Mo
    img = Image.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    # Pad to exceed 2 Mo
    buf.write(b"\x00" * (2 * 1024 * 1024 + 1))
    buf.seek(0)

    with patch("routes.partners.send_email", new_callable=AsyncMock):
        response = client.post(
            "/api/partners/apply",
            data=VALID_FORM,
            files={"logo": ("big.png", buf, "image/png")},
        )

    app.dependency_overrides.clear()

    assert response.status_code == 400
    assert "2 Mo" in response.json()["detail"]


def test_apply_rate_limited():
    """POST /partners/apply when rate limit exceeded returns 429."""
    db = make_mock_db(recent_partner_count=3)
    app.dependency_overrides[get_db] = lambda: db

    response = client.post("/api/partners/apply", data=VALID_FORM)

    app.dependency_overrides.clear()

    assert response.status_code == 429
    assert "Trop de soumissions" in response.json()["detail"]
    db.partners.insert_one.assert_not_called()
