from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol

from domain.models.demo_request import DemoRequest


@dataclass(frozen=True, slots=True)
class RecentActivity:
    """How many stored requests fall inside a window, and the oldest one's
    timestamp (used to compute Retry-After)."""

    count: int
    oldest_at: datetime | None


class DemoRequestRepositoryPort(Protocol):
    async def add(self, demo_request: DemoRequest) -> None: ...

    async def recent_by_ip_hash(self, ip_hash: str, since: datetime) -> RecentActivity: ...

    async def recent_by_email(self, email: str, since: datetime) -> RecentActivity: ...

    async def exists_email_since(self, email: str, since: datetime) -> bool: ...
