from __future__ import annotations

from domain.models.demo_request import DemoRequest


class NoOpLeadNotifier:
    """v1: the founder reads leads in the DB console. A real email adapter
    (Resend) arrives with roadmap 004 after the provider DPA checks. Logs
    nothing on purpose."""

    async def notify_new_lead(self, demo_request: DemoRequest) -> None:
        return None
