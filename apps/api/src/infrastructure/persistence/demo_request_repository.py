"""Postgres adapter for DemoRequestRepositoryPort (ORM only, no raw SQL)."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.models.demo_request import DemoRequest
from domain.ports.demo_request_repository import RecentActivity
from infrastructure.persistence.models import DemoRequestModel


class PostgresDemoRequestRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, demo_request: DemoRequest) -> None:
        self._session.add(
            DemoRequestModel(
                id=demo_request.id,
                name=demo_request.name,
                email=demo_request.email,
                role=demo_request.role.value,
                practice_name=demo_request.practice_name,
                client_volume=(
                    demo_request.client_volume.value if demo_request.client_volume else None
                ),
                message=demo_request.message,
                locale=demo_request.locale.value,
                consent=True,
                consent_at=demo_request.consent_at,
                privacy_version=demo_request.privacy_version,
                ip_hash=demo_request.ip_hash,
                user_agent=demo_request.user_agent,
                created_at=demo_request.created_at,
            )
        )
        await self._session.flush()

    async def _recent(self, column, value: str, since: datetime) -> RecentActivity:
        stmt = select(func.count(), func.min(DemoRequestModel.created_at)).where(
            column == value, DemoRequestModel.created_at >= since
        )
        count, oldest = (await self._session.execute(stmt)).one()
        return RecentActivity(count=int(count), oldest_at=oldest)

    async def recent_by_ip_hash(self, ip_hash: str, since: datetime) -> RecentActivity:
        return await self._recent(DemoRequestModel.ip_hash, ip_hash, since)

    async def recent_by_email(self, email: str, since: datetime) -> RecentActivity:
        return await self._recent(DemoRequestModel.email, email, since)

    async def exists_email_since(self, email: str, since: datetime) -> bool:
        stmt = select(
            exists().where(DemoRequestModel.email == email, DemoRequestModel.created_at >= since)
        )
        return bool((await self._session.execute(stmt)).scalar())
