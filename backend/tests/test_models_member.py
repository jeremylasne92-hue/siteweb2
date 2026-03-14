"""Tests for member profile Pydantic models."""
from models_member import MemberProfile, MemberProfileCreate, MemberProfileUpdate, SocialLink, VisibilityOverrides


def test_member_profile_create_minimal():
    """Minimal creation requires display_name + project."""
    profile = MemberProfileCreate(display_name="Alice", project="cognisphere")
    assert profile.display_name == "Alice"
    assert profile.project == "cognisphere"
    assert profile.skills == []
    assert profile.social_links == []


def test_member_profile_create_with_social_links():
    """Social links are validated as list of SocialLink objects."""
    profile = MemberProfileCreate(
        display_name="Bob",
        project="echolink",
        social_links=[
            SocialLink(platform="linkedin", url="https://linkedin.com/in/bob"),
            SocialLink(platform="instagram", url="https://instagram.com/bob"),
        ],
    )
    assert len(profile.social_links) == 2
    assert profile.social_links[0].platform == "linkedin"


def test_member_profile_slug_auto_generated():
    """Slug is auto-generated from display_name if not provided."""
    profile = MemberProfileCreate(display_name="Élise Dupont-Martin", project="benevole")
    assert profile.slug == "elise-dupont-martin"


def test_member_profile_display_name_max_length():
    """display_name is capped at 50 characters."""
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        MemberProfileCreate(display_name="A" * 51, project="cognisphere")


def test_member_profile_bio_max_length():
    """bio is capped at 300 characters."""
    from pydantic import ValidationError
    import pytest
    with pytest.raises(ValidationError):
        MemberProfileCreate(display_name="Alice", project="cognisphere", bio="A" * 301)


def test_visibility_overrides_defaults():
    """Default visibility: contact_email=False, city=True, social_links=True, age_range=False, professional_sector=False."""
    v = VisibilityOverrides()
    assert v.contact_email is False
    assert v.city is True
    assert v.social_links is True
    assert v.age_range is False
    assert v.professional_sector is False


def test_social_link_platform_enum():
    """Social link platform must be one of the allowed values."""
    link = SocialLink(platform="github", url="https://github.com/alice")
    assert link.platform == "github"


def test_member_profile_update_partial():
    """Update model allows partial updates."""
    update = MemberProfileUpdate(bio="New bio text")
    assert update.bio == "New bio text"
    assert update.display_name is None
