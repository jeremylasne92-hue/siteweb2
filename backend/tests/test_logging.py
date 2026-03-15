"""Tests for structured logging configuration."""
import json
import logging

from utils.logging_config import JsonFormatter, setup_logging


def test_json_formatter_produces_valid_json():
    """JsonFormatter output must be parseable JSON with required fields."""
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="test.logger",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="hello %s",
        args=("world",),
        exc_info=None,
    )

    output = formatter.format(record)
    parsed = json.loads(output)

    assert parsed["level"] == "INFO"
    assert parsed["logger"] == "test.logger"
    assert parsed["message"] == "hello world"
    assert "timestamp" in parsed


def test_json_formatter_includes_request_id():
    """JsonFormatter should include request_id when present on the record."""
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="with id",
        args=(),
        exc_info=None,
    )
    record.request_id = "abc12345"

    parsed = json.loads(formatter.format(record))
    assert parsed["request_id"] == "abc12345"


def test_json_formatter_omits_request_id_when_absent():
    """JsonFormatter should not include request_id when not set."""
    formatter = JsonFormatter()
    record = logging.LogRecord(
        name="test",
        level=logging.INFO,
        pathname="test.py",
        lineno=1,
        msg="no id",
        args=(),
        exc_info=None,
    )

    parsed = json.loads(formatter.format(record))
    assert "request_id" not in parsed


def test_json_formatter_includes_exc_info():
    """JsonFormatter should include formatted exception when exc_info is set."""
    formatter = JsonFormatter()
    try:
        raise ValueError("boom")
    except ValueError:
        import sys
        exc_info = sys.exc_info()

    record = logging.LogRecord(
        name="test",
        level=logging.ERROR,
        pathname="test.py",
        lineno=1,
        msg="error occurred",
        args=(),
        exc_info=exc_info,
    )

    parsed = json.loads(formatter.format(record))
    assert "exc_info" in parsed
    assert "ValueError: boom" in parsed["exc_info"]


def test_setup_logging_production_uses_json_formatter():
    """In production mode, the root logger should use JsonFormatter."""
    setup_logging("production")

    root = logging.getLogger()
    assert root.level == logging.INFO
    assert len(root.handlers) >= 1
    assert isinstance(root.handlers[0].formatter, JsonFormatter)


def test_setup_logging_dev_uses_text_formatter():
    """In development mode, the root logger should use standard text format."""
    setup_logging("development")

    root = logging.getLogger()
    assert root.level == logging.DEBUG
    assert len(root.handlers) >= 1
    assert not isinstance(root.handlers[0].formatter, JsonFormatter)
