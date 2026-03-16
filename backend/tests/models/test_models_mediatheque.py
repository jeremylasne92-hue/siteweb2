"""Tests for Médiathèque Pydantic models."""
import pytest
from models_mediatheque import MediaResourceCreate, MediaResource, ResourceType


def test_resource_type_enum():
    assert ResourceType.DOCUMENT == "document"
    assert ResourceType.VIDEO == "video"
    assert ResourceType.LIVRE == "livre"
    assert ResourceType.OUTIL == "outil"


def test_create_minimal_resource():
    r = MediaResourceCreate(resource_type=ResourceType.VIDEO, title="Test", description="Desc")
    assert r.title == "Test"
    assert r.is_published is False
    assert r.tags == []


def test_create_video_resource():
    r = MediaResourceCreate(
        resource_type=ResourceType.VIDEO,
        title="Comprendre le GIEC",
        description="Une vidéo essentielle pour comprendre les rapports du GIEC.",
        external_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        source="GIEC",
        year=2024,
        tags=["climat", "science"]
    )
    assert r.external_url == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    assert r.year == 2024


def test_create_document_resource():
    r = MediaResourceCreate(
        resource_type=ResourceType.DOCUMENT,
        title="Manifeste ECHO",
        description="Le document fondateur du mouvement.",
        file_url="/uploads/media/manifeste.pdf",
        file_name="manifeste-echo.pdf",
        file_size=2500000,
        source="Mouvement ECHO"
    )
    assert r.file_size == 2500000


def test_create_livre_resource():
    r = MediaResourceCreate(
        resource_type=ResourceType.LIVRE,
        title="Sapiens",
        description="Un livre qui change la perspective sur l'humanité.",
        author="Yuval Noah Harari",
        year=2015,
        external_url="https://www.fnac.com/sapiens"
    )
    assert r.author == "Yuval Noah Harari"


def test_title_too_short():
    with pytest.raises(Exception):
        MediaResourceCreate(resource_type=ResourceType.VIDEO, title="", description="Desc")


def test_title_too_long():
    with pytest.raises(Exception):
        MediaResourceCreate(
            resource_type=ResourceType.VIDEO,
            title="A" * 201,
            description="Desc"
        )


def test_description_too_short():
    with pytest.raises(Exception):
        MediaResourceCreate(resource_type=ResourceType.VIDEO, title="Test", description="")


def test_description_too_long():
    with pytest.raises(Exception):
        MediaResourceCreate(
            resource_type=ResourceType.VIDEO,
            title="Test",
            description="A" * 5001
        )


def test_year_too_low():
    with pytest.raises(Exception):
        MediaResourceCreate(
            resource_type=ResourceType.VIDEO,
            title="Test",
            description="Desc",
            year=1899
        )


def test_year_too_high():
    with pytest.raises(Exception):
        MediaResourceCreate(
            resource_type=ResourceType.VIDEO,
            title="Test",
            description="Desc",
            year=2101
        )


def test_year_boundary_valid():
    r1 = MediaResourceCreate(
        resource_type=ResourceType.VIDEO, title="Test", description="Desc", year=1900
    )
    assert r1.year == 1900
    r2 = MediaResourceCreate(
        resource_type=ResourceType.VIDEO, title="Test", description="Desc", year=2100
    )
    assert r2.year == 2100


def test_defaults():
    r = MediaResourceCreate(resource_type=ResourceType.DOCUMENT, title="T", description="D")
    assert r.thumbnail_url is None
    assert r.external_url is None
    assert r.file_url is None
    assert r.file_name is None
    assert r.file_size is None
    assert r.tags == []
    assert r.source is None
    assert r.author is None
    assert r.year is None
    assert r.is_featured is False
    assert r.is_published is False
    assert r.sort_order == 0


def test_full_media_resource_model():
    r = MediaResource(
        id="abc123",
        resource_type=ResourceType.OUTIL,
        title="Calculateur Carbone",
        description="Un outil pour mesurer son empreinte.",
        external_url="https://nosgestesclimat.fr",
        is_published=True,
        sort_order=1,
        created_at="2026-03-16T00:00:00",
        updated_at="2026-03-16T00:00:00"
    )
    assert r.id == "abc123"
    assert r.is_published is True


def test_media_resource_has_timestamps():
    r = MediaResource(
        id="xyz",
        resource_type=ResourceType.VIDEO,
        title="Test",
        description="Desc",
        created_at="2026-01-01T12:00:00",
        updated_at="2026-01-01T12:00:00"
    )
    assert r.created_at is not None
    assert r.updated_at is not None


def test_media_resource_auto_timestamps():
    """MediaResource should auto-generate timestamps if not provided."""
    r = MediaResource(
        id="auto",
        resource_type=ResourceType.LIVRE,
        title="Auto",
        description="Auto timestamps"
    )
    assert r.created_at is not None
    assert r.updated_at is not None


def test_invalid_resource_type():
    with pytest.raises(Exception):
        MediaResourceCreate(resource_type="invalid", title="Test", description="Desc")


def test_missing_required_fields():
    with pytest.raises(Exception):
        MediaResourceCreate(resource_type=ResourceType.VIDEO)
