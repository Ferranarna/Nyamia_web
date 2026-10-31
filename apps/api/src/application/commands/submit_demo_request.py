"""SubmitDemoRequest: the only write use case of the website API (spec 001).

Order of checks (each step short-circuits):
1. honeypot filled        → HONEYPOT   (202, nothing stored, no notification)
2. domain invariants       → InvalidDemoRequest (422; also enforced at the edge)
3. per-IP / per-email rate → RateLimited (429 + Retry-After)
4. same email within 24 h → DUPLICATE  (202, not stored twice — no enumeration)
5. persist + notify        → ACCEPTED   (202)
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum

from domain.exceptions import RateLimited
from domain.models.demo_request import (
    ClientVolume,
    DemoRequest,
    Locale,
    Role,
)
from domain.models.rate_limit_policy import DEFAULT_RATE_LIMIT_POLICY, RateLimitPolicy
from domain.ports.clock import ClockPort
from domain.ports.demo_request_repository import DemoRequestRepositoryPort, RecentActivity
from domain.ports.lead_notifier import LeadNotifierPort


class SubmitOutcome(StrEnum):
    ACCEPTED = "accepted"
    DUPLICATE = "duplicate"
    HONEYPOT = "honeypot"


@dataclass(frozen=True, slots=True)
class SubmitDemoRequestCommand:
    name: str
    email: str
    role: Role | str
    locale: Locale | str
    consent: bool
    privacy_version: str
    ip_hash: str
    practice_name: str | None = None
    client_volume: ClientVolume | str | None = None
    message: str | None = None
    website: str | None = None  # honeypot
    user_agent: str | None = None


@dataclass(frozen=True, slots=True)
class SubmitDemoRequestResult:
    outcome: SubmitOutcome
    demo_request_id: str | None = None  # safe to log (UUID, not PII)


def _retry_after(activity: RecentActivity, window_seconds: float, now: datetime) -> int:
    if activity.oldest_at is None:
        return math.ceil(window_seconds)
    remaining = (activity.oldest_at - now).total_seconds() + window_seconds
    return max(1, math.ceil(remaining))


class SubmitDemoRequestHandler:
    def __init__(
        self,
        *,
        repository: DemoRequestRepositoryPort,
        notifier: LeadNotifierPort,
        clock: ClockPort,
        current_privacy_version: str,
        policy: RateLimitPolicy = DEFAULT_RATE_LIMIT_POLICY,
    ) -> None:
        self._repository = repository
        self._notifier = notifier
        self._clock = clock
        self._current_privacy_version = current_privacy_version
        self._policy = policy

    async def execute(self, command: SubmitDemoRequestCommand) -> SubmitDemoRequestResult:
        if command.website and command.website.strip():
            return SubmitDemoRequestResult(SubmitOutcome.HONEYPOT)

        now = self._clock.now()
        demo_request = DemoRequest.submit(
            name=command.name,
            email=command.email,
            role=command.role,
            practice_name=command.practice_name,
            client_volume=command.client_volume,
            message=command.message,
            locale=command.locale,
            consent=command.consent,
            privacy_version=command.privacy_version,
            current_privacy_version=self._current_privacy_version,
            ip_hash=command.ip_hash,
            user_agent=command.user_agent,
            now=now,
        )
        email = demo_request.email
        policy = self._policy

        by_ip = await self._repository.recent_by_ip_hash(
            command.ip_hash, now - policy.per_ip_window
        )
        if by_ip.count >= policy.per_ip_max:
            raise RateLimited(
                _retry_after(by_ip, policy.per_ip_window.total_seconds(), now), scope="ip"
            )

        by_email = await self._repository.recent_by_email(email, now - policy.per_email_window)
        if by_email.count >= policy.per_email_max:
            raise RateLimited(
                _retry_after(by_email, policy.per_email_window.total_seconds(), now),
                scope="email",
            )

        if await self._repository.exists_email_since(email, now - policy.duplicate_window):
            return SubmitDemoRequestResult(SubmitOutcome.DUPLICATE)

        await self._repository.add(demo_request)
        await self._notifier.notify_new_lead(demo_request)
        return SubmitDemoRequestResult(SubmitOutcome.ACCEPTED, str(demo_request.id))
