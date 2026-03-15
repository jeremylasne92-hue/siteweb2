"""Structured logging configuration for the ECHO backend.

In production: JSON-formatted logs with request_id correlation.
In development: human-readable text format with DEBUG level.
"""
import json
import logging
import traceback
from datetime import datetime, timezone


class JsonFormatter(logging.Formatter):
    """Format log records as single-line JSON objects."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include request_id if available (set by RequestLoggingMiddleware)
        request_id = getattr(record, "request_id", None)
        if request_id:
            log_entry["request_id"] = request_id

        # Include exception info if present
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exc_info"] = "".join(
                traceback.format_exception(*record.exc_info)
            )

        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging(environment: str) -> None:
    """Configure the root logger based on the environment.

    Args:
        environment: "production" for JSON output at INFO level,
                     anything else for text output at DEBUG level.
    """
    root_logger = logging.getLogger()

    # Remove any existing handlers to avoid duplicate output
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler()

    if environment == "production":
        handler.setFormatter(JsonFormatter())
        root_logger.setLevel(logging.INFO)
    else:
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
        )
        root_logger.setLevel(logging.DEBUG)

    root_logger.addHandler(handler)
