"""Submission limits for demo requests (spec 001, frozen contract)."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta


@dataclass(frozen=True, slots=True)
class RateLimitPolicy:
    # > 5 requests / hour from one client IP → 429
    per_ip_max: int = 5
    per_ip_window: timedelta = timedelta(hours=1)
    # > 3 requests / 24 h for one email → 429
    per_email_max: int = 3
    per_email_window: timedelta = timedelta(hours=24)
    # Same email again within this window → 202 but not stored twice.
    duplicate_window: timedelta = timedelta(hours=24)


DEFAULT_RATE_LIMIT_POLICY = RateLimitPolicy()
