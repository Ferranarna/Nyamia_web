"""Repository against the real local Postgres (`make api-db-up && make
api-db-migrate`). Skipped cleanly when the DB is unreachable. Each test runs
inside a transaction that is rolled back, so the dev DB is left untouched."""

from __future__ import annotations

from datetime import timedelta

import pytest
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from infrastructure.config.settings import Settings
from infrastructure.persistence.demo_request_repository import PostgresDemoRequestRepository
from tests.fakes import FIXED_NOW, make_demo_request

pytestmark = pytest.mark.postgres


def _database_url() -> str | None:
    try:
        return Settings().DATABASE_URL.get_secret_value()  # type: ignore[call-arg]
    except Exception:  # noqa: BLE001 — no .env / env vars → skip
        return None


@pytest.fixture
async def session():
    url = _database_url()
    if url is None:
        pytest.skip("DATABASE_URL not configured")
    engine = create_async_engine(url)
    try:
        connection = await engine.connect()
    except Exception:  # noqa: BLE001
        await engine.dispose()
        pytest.skip("Postgres not reachable")
    has_table = await connection.run_sync(
        lambda sync_conn: inspect(sync_conn).has_table("demo_request")
    )
    await connection.rollback()  # end the autobegun inspection transaction
    if not has_table:
        await connection.close()
        await engine.dispose()
        pytest.skip("demo_request table missing (run `make api-db-migrate`)")
    transaction = await connection.begin()
    db_session = AsyncSession(bind=connection, join_transaction_mode="create_savepoint")
    try:
        yield db_session
    finally:
        await db_session.close()
        await transaction.rollback()
        await connection.close()
        await engine.dispose()


async def test_add_and_count_by_ip_and_email(session):
    repo = PostgresDemoRequestRepository(session)
    ip = "e" * 64
    email = "repo-test@example.com"
    for minutes_ago in (50, 30, 10):
        await repo.add(
            make_demo_request(
                email=email, ip_hash=ip, now=FIXED_NOW - timedelta(minutes=minutes_ago)
            )
        )
    await repo.add(make_demo_request(email=email, ip_hash=ip, now=FIXED_NOW - timedelta(hours=3)))

    by_ip = await repo.recent_by_ip_hash(ip, FIXED_NOW - timedelta(hours=1))
    assert by_ip.count == 3
    assert by_ip.oldest_at == FIXED_NOW - timedelta(minutes=50)

    by_email = await repo.recent_by_email(email, FIXED_NOW - timedelta(hours=24))
    assert by_email.count == 4

    assert await repo.exists_email_since(email, FIXED_NOW - timedelta(hours=24))
    assert not await repo.exists_email_since("other@example.com", FIXED_NOW - timedelta(hours=24))
    empty = await repo.recent_by_ip_hash("f" * 64, FIXED_NOW - timedelta(hours=1))
    assert empty.count == 0 and empty.oldest_at is None


async def test_row_round_trip(session):
    repo = PostgresDemoRequestRepository(session)
    lead = make_demo_request(
        email="roundtrip@example.com", client_volume="80+", message="hola", ip_hash="d" * 64
    )
    await repo.add(lead)
    row = (
        await session.execute(
            text(
                "SELECT email, role, client_volume, locale, consent, privacy_version, ip_hash "
                "FROM demo_request WHERE id = :id"
            ),
            {"id": lead.id},
        )
    ).one()
    assert tuple(row) == (
        "roundtrip@example.com",
        "dietitian_private",
        "80+",
        "es",
        True,
        "2026-10-30",
        "d" * 64,
    )
