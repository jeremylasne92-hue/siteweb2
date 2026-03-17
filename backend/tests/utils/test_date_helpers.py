from datetime import datetime, UTC
from utils.date_helpers import format_date_csv, format_date_str_fr


def test_format_date_csv_with_datetime():
    dt = datetime(2026, 3, 17, 14, 30, 0, tzinfo=UTC)
    assert format_date_csv(dt) == "17/03/2026 14:30"


def test_format_date_csv_with_none():
    assert format_date_csv(None) == ""


def test_format_date_str_fr_yyyy_mm_dd():
    assert format_date_str_fr("2026-09-15") == "15/09/2026"


def test_format_date_str_fr_none():
    assert format_date_str_fr(None) == ""


def test_format_date_str_fr_empty():
    assert format_date_str_fr("") == ""
