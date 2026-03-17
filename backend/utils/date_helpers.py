from datetime import datetime


def format_date_csv(dt: datetime | None) -> str:
    """Format datetime for CSV export: DD/MM/YYYY HH:MM"""
    return dt.strftime("%d/%m/%Y %H:%M") if dt else ""


def format_date_str_fr(date_str: str | None) -> str:
    """Convert YYYY-MM-DD string to DD/MM/YYYY for CSV export."""
    if not date_str:
        return ""
    try:
        parts = date_str.split("-")
        return f"{parts[2]}/{parts[1]}/{parts[0]}"
    except (IndexError, AttributeError):
        return date_str
