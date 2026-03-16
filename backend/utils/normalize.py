"""Data normalization utilities for consistent storage across collections."""


def normalize_email(email: str | None) -> str | None:
    """Normalize email to lowercase + strip whitespace."""
    if not email:
        return email
    return email.strip().lower()


def normalize_skills(skills: list[str] | str | None) -> list[str]:
    """Normalize skills: lowercase, strip, deduplicate, remove empties."""
    if not skills:
        return []
    if isinstance(skills, str):
        skills = [s for s in skills.split(",") if s.strip()]
    return list(dict.fromkeys(s.strip().lower() for s in skills if s.strip()))


def normalize_phone(phone: str | None) -> str | None:
    """Normalize phone: strip whitespace, remove decorative chars."""
    if not phone:
        return phone
    # Remove spaces, dots, dashes (keep + and digits)
    cleaned = "".join(c for c in phone.strip() if c.isdigit() or c == "+")
    return cleaned or phone.strip()
