"""DemoRequest aggregate: a lead asking for a product demo.

Mirrors the frozen contract in
`.claude/spec/features/001-landing-and-demo-request/spec.md`. The API edge
validates the same rules (Pydantic); the entity re-checks them so no adapter
can ever persist an invalid lead.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID

from uuid6 import uuid7

from domain.exceptions import InvalidDemoRequest

NAME_MIN_LENGTH = 2
NAME_MAX_LENGTH = 100
EMAIL_MAX_LENGTH = 254
PRACTICE_NAME_MAX_LENGTH = 120
MESSAGE_MAX_LENGTH = 1000
PRIVACY_VERSION_MAX_LENGTH = 32
USER_AGENT_MAX_LENGTH = 200
IP_HASH_LENGTH = 64  # hex HMAC-SHA256

# Deliberately loose: full RFC/IDNA validation happens at the edge
# (email-validator); the domain only guards the shape it relies on.
_EMAIL_SHAPE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_IP_HASH_SHAPE = re.compile(r"^[0-9a-f]{64}$")

# Bidi embedding/override/isolate controls: they can make a stored value
# display differently from what it contains (DB console, CSV, future email).
_BIDI_CONTROLS = frozenset("\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069")
_MULTILINE_ALLOWED = frozenset("\n\r\t")


def has_forbidden_characters(value: str, *, multiline: bool = False) -> bool:
    """True if `value` holds control characters (Unicode Cc — NUL among them,
    which Postgres text columns reject) or bidi controls. `multiline` allows
    newline / carriage return / tab (free-text message)."""
    for char in value:
        if char in _BIDI_CONTROLS:
            return True
        if unicodedata.category(char) == "Cc" and not (multiline and char in _MULTILINE_ALLOWED):
            return True
    return False


class Role(StrEnum):
    DIETITIAN_PRIVATE = "dietitian_private"
    DIETITIAN_CLINICAL = "dietitian_clinical"
    CLINIC = "clinic"
    COACH = "coach"
    OTHER = "other"


class ClientVolume(StrEnum):
    UP_TO_15 = "1-15"
    FROM_16_TO_40 = "16-40"
    FROM_41_TO_80 = "41-80"
    OVER_80 = "80+"


class Locale(StrEnum):
    ES = "es"
    EN = "en"


def normalize_email(email: str) -> str:
    return email.strip().lower()


def _optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


@dataclass(frozen=True, slots=True)
class DemoRequest:
    id: UUID
    name: str
    email: str
    role: Role
    practice_name: str | None
    client_volume: ClientVolume | None
    message: str | None
    locale: Locale
    consent_at: datetime
    privacy_version: str
    ip_hash: str
    user_agent: str | None
    created_at: datetime

    @classmethod
    def submit(
        cls,
        *,
        name: str,
        email: str,
        role: Role | str,
        practice_name: str | None,
        client_volume: ClientVolume | str | None,
        message: str | None,
        locale: Locale | str,
        consent: bool,
        privacy_version: str,
        current_privacy_version: str,
        ip_hash: str,
        user_agent: str | None,
        now: datetime,
    ) -> DemoRequest:
        """Build a new lead, enforcing every invariant at once.

        Raises `InvalidDemoRequest` listing *all* offending field names.
        """
        errors: list[str] = []

        clean_name = name.strip() if isinstance(name, str) else ""
        if not NAME_MIN_LENGTH <= len(clean_name) <= NAME_MAX_LENGTH or has_forbidden_characters(
            clean_name
        ):
            errors.append("name")

        clean_email = normalize_email(email) if isinstance(email, str) else ""
        if (
            len(clean_email) > EMAIL_MAX_LENGTH
            or not _EMAIL_SHAPE.match(clean_email)
            or has_forbidden_characters(clean_email)
        ):
            errors.append("email")

        try:
            clean_role = Role(role)
        except ValueError:
            errors.append("role")
            clean_role = Role.OTHER

        clean_practice = _optional_text(practice_name)
        if clean_practice is not None and (
            len(clean_practice) > PRACTICE_NAME_MAX_LENGTH
            or has_forbidden_characters(clean_practice)
        ):
            errors.append("practice_name")

        clean_volume: ClientVolume | None = None
        if client_volume is not None:
            try:
                clean_volume = ClientVolume(client_volume)
            except ValueError:
                errors.append("client_volume")

        clean_message = _optional_text(message)
        if clean_message is not None and (
            len(clean_message) > MESSAGE_MAX_LENGTH
            or has_forbidden_characters(clean_message, multiline=True)
        ):
            errors.append("message")

        try:
            clean_locale = Locale(locale)
        except ValueError:
            errors.append("locale")
            clean_locale = Locale.ES

        if consent is not True:
            errors.append("consent")

        if privacy_version != current_privacy_version:
            errors.append("privacy_version")

        if not _IP_HASH_SHAPE.match(ip_hash or ""):
            # Server-computed; a bad value is a programming error, but keep
            # the invariant explicit rather than persisting garbage.
            errors.append("ip_hash")

        if now.tzinfo is None:
            errors.append("created_at")

        if errors:
            raise InvalidDemoRequest(errors)

        clean_agent = _optional_text(user_agent)
        if clean_agent is not None:
            # Caller-controlled header: drop control/bidi characters, then cut.
            kept = "".join(char for char in clean_agent if not has_forbidden_characters(char))
            clean_agent = kept[:USER_AGENT_MAX_LENGTH] or None

        return cls(
            id=uuid7(),
            name=clean_name,
            email=clean_email,
            role=clean_role,
            practice_name=clean_practice,
            client_volume=clean_volume,
            message=clean_message,
            locale=clean_locale,
            consent_at=now,
            privacy_version=privacy_version,
            ip_hash=ip_hash,
            user_agent=clean_agent,
            created_at=now,
        )
