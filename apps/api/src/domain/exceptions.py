"""Domain exceptions. They carry field names / numbers only — never values."""

from __future__ import annotations


class DomainError(Exception):
    """Base class for every domain-level error."""


class InvalidDemoRequest(DomainError):
    """One or more fields break a DemoRequest invariant.

    `fields` lists contract field names only, so the API can echo them without
    leaking any submitted value.
    """

    def __init__(self, fields: list[str]) -> None:
        self.fields = list(dict.fromkeys(fields))
        super().__init__(f"invalid demo request fields: {', '.join(self.fields)}")


class RateLimited(DomainError):
    """The caller (by IP hash or by email) exceeded a submission window."""

    def __init__(self, retry_after_seconds: int, scope: str) -> None:
        self.retry_after_seconds = max(1, int(retry_after_seconds))
        self.scope = scope  # "ip" | "email" — safe to log, not PII
        super().__init__(f"rate limited ({scope}), retry after {self.retry_after_seconds}s")
