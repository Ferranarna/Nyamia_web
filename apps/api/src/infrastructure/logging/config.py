"""Logging: one line per event, request id + outcome only — never lead PII
(name, email, message, IP, user agent) and never exception messages from
the DB driver (they can quote row values)."""

from __future__ import annotations

import logging

from infrastructure.api.middleware import request_id_var

LOGGER_NAME = "nyamia_web_api"


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


def configure_logging(level: str = "INFO") -> None:
    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(level.upper())
    if not any(getattr(h, "_nyamia", False) for h in logger.handlers):
        handler = logging.StreamHandler()
        handler._nyamia = True  # type: ignore[attr-defined]
        handler.addFilter(RequestIdFilter())
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s %(name)s request_id=%(request_id)s %(message)s"
            )
        )
        logger.addHandler(handler)
    # SQLAlchemy engine logs can include bound parameters; keep them quiet.
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str = "") -> logging.Logger:
    return logging.getLogger(f"{LOGGER_NAME}.{name}" if name else LOGGER_NAME)
