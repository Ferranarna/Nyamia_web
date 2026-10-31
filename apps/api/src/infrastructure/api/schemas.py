"""Edge validation for the frozen demo-request contract (spec 001)."""

from __future__ import annotations

from typing import Annotated

from email_validator import EmailNotValidError, validate_email
from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    Field,
    StrictBool,
    StrictStr,
    StringConstraints,
)

from domain.models.demo_request import (
    EMAIL_MAX_LENGTH,
    MESSAGE_MAX_LENGTH,
    NAME_MAX_LENGTH,
    NAME_MIN_LENGTH,
    PRACTICE_NAME_MAX_LENGTH,
    PRIVACY_VERSION_MAX_LENGTH,
    ClientVolume,
    Locale,
    Role,
    has_forbidden_characters,
    normalize_email,
)

CONTRACT_FIELDS = frozenset(
    {
        "name",
        "email",
        "role",
        "practice_name",
        "client_volume",
        "message",
        "locale",
        "consent",
        "privacy_version",
        "website",
    }
)


def _valid_email(value: str) -> str:
    value = normalize_email(value)
    if len(value) > EMAIL_MAX_LENGTH:
        raise ValueError("too long")
    try:
        # Syntax only; no DNS lookups from the request path.
        validate_email(value, check_deliverability=False)
    except EmailNotValidError as exc:
        raise ValueError("invalid email") from exc
    return value


def _single_line(value: str | None) -> str | None:
    if value is not None and has_forbidden_characters(value):
        raise ValueError("forbidden characters")
    return value


def _multiline(value: str | None) -> str | None:
    if value is not None and has_forbidden_characters(value, multiline=True):
        raise ValueError("forbidden characters")
    return value


def _must_be_true(value: bool) -> bool:
    if value is not True:
        raise ValueError("consent required")
    return value


def _empty_to_none(value: str | None) -> str | None:
    return value or None


Name = Annotated[
    StrictStr,
    StringConstraints(
        strip_whitespace=True, min_length=NAME_MIN_LENGTH, max_length=NAME_MAX_LENGTH
    ),
    AfterValidator(_single_line),
]
Email = Annotated[StrictStr, Field(max_length=EMAIL_MAX_LENGTH + 8), AfterValidator(_valid_email)]
PracticeName = Annotated[
    StrictStr | None,
    StringConstraints(strip_whitespace=True, max_length=PRACTICE_NAME_MAX_LENGTH),
    AfterValidator(_single_line),
    AfterValidator(_empty_to_none),
]
Message = Annotated[
    StrictStr | None,
    StringConstraints(strip_whitespace=True, max_length=MESSAGE_MAX_LENGTH),
    AfterValidator(_multiline),
    AfterValidator(_empty_to_none),
]
PrivacyVersion = Annotated[
    StrictStr,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=PRIVACY_VERSION_MAX_LENGTH),
    AfterValidator(_single_line),
]


class DemoRequestIn(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: Name
    email: Email
    role: Role
    practice_name: PracticeName = None
    client_volume: ClientVolume | None = None
    message: Message = None
    locale: Locale
    consent: Annotated[StrictBool, AfterValidator(_must_be_true)]
    # Must equal Settings.PRIVACY_VERSION; checked by the domain entity
    # (the edge does not know the configured value).
    privacy_version: PrivacyVersion
    # Honeypot: humans never see it; any non-blank value → 202, nothing stored.
    website: StrictStr | None = Field(default=None, max_length=2000)
