"""Async engine + request-scoped sessions (one engine per process)."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from fastapi import Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from infrastructure.config.settings import Settings


def build_engine(settings: Settings) -> AsyncEngine:
    return create_async_engine(
        settings.DATABASE_URL.get_secret_value(),
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=5,
        # Never echo SQL: bound parameters would contain lead PII.
        echo=False,
        hide_parameters=True,
    )


def build_sessionmaker(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)


async def get_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Request-scoped unit of work: commit on success, rollback on error.

    Routes depend on it with `scope="function"` so the commit happens
    *before* the response is sent — a 202 is never returned for a lead that
    failed to commit.
    """
    sessionmaker: async_sessionmaker[AsyncSession] = request.app.state.sessionmaker
    async with sessionmaker() as session:
        try:
            yield session
            await session.commit()
        except BaseException:
            await session.rollback()
            raise


async def database_is_reachable(engine: AsyncEngine) -> bool:
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception:  # noqa: BLE001 — health check must never raise
        return False
