"""In-memory fakes for the domain ports."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from domain.models.demo_request import DemoRequest
from domain.ports.demo_request_repository import RecentActivity

FIXED_NOW = datetime(2026, 10, 30, 12, 0, tzinfo=UTC)
PRIVACY_VERSION = "2026-10-30"
IP_HASH = "a" * 64


class FakeClock:
    def __init__(self, now: datetime = FIXED_NOW) -> None:
        self.current = now

    def now(self) -> datetime:
        return self.current

    def advance(self, delta: timedelta) -> None:
        self.current += delta


class InMemoryDemoRequestRepository:
    def __init__(self) -> None:
        self.items: list[DemoRequest] = []

    async def add(self, demo_request: DemoRequest) -> None:
        self.items.append(demo_request)

    def _recent(self, matches, since: datetime) -> RecentActivity:
        hits = [r.created_at for r in self.items if matches(r) and r.created_at >= since]
        return RecentActivity(count=len(hits), oldest_at=min(hits) if hits else None)

    async def recent_by_ip_hash(self, ip_hash: str, since: datetime) -> RecentActivity:
        return self._recent(lambda r: r.ip_hash == ip_hash, since)

    async def recent_by_email(self, email: str, since: datetime) -> RecentActivity:
        return self._recent(lambda r: r.email == email, since)

    async def exists_email_since(self, email: str, since: datetime) -> bool:
        return any(r.email == email and r.created_at >= since for r in self.items)


class RecordingNotifier:
    def __init__(self) -> None:
        self.notified: list[DemoRequest] = []

    async def notify_new_lead(self, demo_request: DemoRequest) -> None:
        self.notified.append(demo_request)


def make_demo_request(**overrides) -> DemoRequest:
    values = dict(
        name="Ana Prueba",
        email="ana@example.com",
        role="dietitian_private",
        practice_name=None,
        client_volume=None,
        message=None,
        locale="es",
        consent=True,
        privacy_version=PRIVACY_VERSION,
        current_privacy_version=PRIVACY_VERSION,
        ip_hash=IP_HASH,
        user_agent="pytest",
        now=FIXED_NOW,
    )
    values.update(overrides)
    return DemoRequest.submit(**values)
