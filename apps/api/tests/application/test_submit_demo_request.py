from datetime import timedelta

import pytest

from application.commands.submit_demo_request import (
    SubmitDemoRequestCommand,
    SubmitDemoRequestHandler,
    SubmitOutcome,
)
from domain.exceptions import InvalidDemoRequest, RateLimited
from tests.fakes import (
    IP_HASH,
    PRIVACY_VERSION,
    FakeClock,
    InMemoryDemoRequestRepository,
    RecordingNotifier,
)


@pytest.fixture
def repo():
    return InMemoryDemoRequestRepository()


@pytest.fixture
def notifier():
    return RecordingNotifier()


@pytest.fixture
def clock():
    return FakeClock()


@pytest.fixture
def handler(repo, notifier, clock):
    return SubmitDemoRequestHandler(
        repository=repo, notifier=notifier, clock=clock, current_privacy_version=PRIVACY_VERSION
    )


def command(**overrides) -> SubmitDemoRequestCommand:
    values = dict(
        name="Ana Prueba",
        email="ana@example.com",
        role="dietitian_private",
        locale="es",
        consent=True,
        privacy_version=PRIVACY_VERSION,
        ip_hash=IP_HASH,
    )
    values.update(overrides)
    return SubmitDemoRequestCommand(**values)


async def test_accepts_persists_and_notifies(handler, repo, notifier):
    result = await handler.execute(command())
    assert result.outcome is SubmitOutcome.ACCEPTED
    assert len(repo.items) == 1
    assert notifier.notified == repo.items
    assert result.demo_request_id == str(repo.items[0].id)


async def test_honeypot_accepts_silently(handler, repo, notifier):
    result = await handler.execute(command(website="http://spam.example"))
    assert result.outcome is SubmitOutcome.HONEYPOT
    assert repo.items == [] and notifier.notified == []


async def test_blank_honeypot_is_ignored(handler, repo):
    result = await handler.execute(command(website="   "))
    assert result.outcome is SubmitOutcome.ACCEPTED


async def test_duplicate_email_within_24h_not_stored_twice(handler, repo, clock, notifier):
    await handler.execute(command())
    clock.advance(timedelta(hours=2))
    result = await handler.execute(command(email="  ANA@example.com", ip_hash="b" * 64))
    assert result.outcome is SubmitOutcome.DUPLICATE
    assert len(repo.items) == 1 and len(notifier.notified) == 1


async def test_same_email_after_24h_is_stored(handler, repo, clock):
    await handler.execute(command())
    clock.advance(timedelta(hours=24, seconds=1))
    result = await handler.execute(command())
    assert result.outcome is SubmitOutcome.ACCEPTED
    assert len(repo.items) == 2


async def test_ip_rate_limit_after_five_per_hour(handler, repo, clock):
    for i in range(5):
        await handler.execute(command(email=f"lead{i}@example.com"))
        clock.advance(timedelta(minutes=1))
    with pytest.raises(RateLimited) as exc:
        await handler.execute(command(email="sixth@example.com"))
    assert exc.value.scope == "ip"
    # Oldest was 5 minutes ago → frees up in 55 minutes.
    assert exc.value.retry_after_seconds == 55 * 60
    assert len(repo.items) == 5


async def test_ip_window_slides(handler, clock):
    for i in range(5):
        await handler.execute(command(email=f"lead{i}@example.com"))
    clock.advance(timedelta(hours=1, seconds=1))
    result = await handler.execute(command(email="later@example.com"))
    assert result.outcome is SubmitOutcome.ACCEPTED


async def test_email_rate_limit_after_three_per_day(handler, repo, clock):
    # Seed 3 stored requests for one email inside 24 h (e.g. from different
    # IPs before the duplicate window applied) — the 4th is rate limited.
    from tests.fakes import make_demo_request

    for hours_ago in (20, 10, 1):
        repo.items.append(
            make_demo_request(
                ip_hash=f"{hours_ago:02d}" * 32, now=clock.now() - timedelta(hours=hours_ago)
            )
        )
    with pytest.raises(RateLimited) as exc:
        await handler.execute(command(ip_hash="c" * 64))
    assert exc.value.scope == "email"
    assert exc.value.retry_after_seconds == 4 * 3600


async def test_invalid_privacy_version_rejected_before_anything(handler, repo):
    with pytest.raises(InvalidDemoRequest) as exc:
        await handler.execute(command(privacy_version="2025-01-01"))
    assert exc.value.fields == ["privacy_version"]
    assert repo.items == []


async def test_consent_false_rejected(handler):
    with pytest.raises(InvalidDemoRequest) as exc:
        await handler.execute(command(consent=False))
    assert exc.value.fields == ["consent"]
