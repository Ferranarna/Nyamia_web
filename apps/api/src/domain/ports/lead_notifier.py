from __future__ import annotations

from typing import Protocol

from domain.models.demo_request import DemoRequest


class LeadNotifierPort(Protocol):
    """Tells the founder a new lead arrived. v1 ships a no-op adapter; a real
    email adapter waits for the provider DPA checks (roadmap 004)."""

    async def notify_new_lead(self, demo_request: DemoRequest) -> None: ...
