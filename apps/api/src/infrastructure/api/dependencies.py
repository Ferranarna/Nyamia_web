"""DI wiring. Tests override `get_demo_request_handler`, `get_client_ip_hash`
and `get_db_health` with fakes."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from application.commands.submit_demo_request import SubmitDemoRequestHandler
from infrastructure.clock.system_clock import SystemClock
from infrastructure.config.settings import Settings
from infrastructure.notification.noop_notifier import NoOpLeadNotifier
from infrastructure.persistence.database import database_is_reachable, get_session
from infrastructure.persistence.demo_request_repository import PostgresDemoRequestRepository
from infrastructure.security.client_ip import hash_ip, rate_limit_key, resolve_client_ip


def get_app_settings(request: Request) -> Settings:
    return request.app.state.settings


SettingsDep = Annotated[Settings, Depends(get_app_settings)]


def get_client_ip_hash(request: Request, settings: SettingsDep) -> str:
    ip = resolve_client_ip(request, settings.TRUSTED_PROXY_HOP_COUNT)
    return hash_ip(rate_limit_key(ip), settings.IP_HASH_SECRET.get_secret_value())


def get_demo_request_handler(
    settings: SettingsDep,
    # scope="function": commit/rollback runs before the response is sent.
    session: Annotated[AsyncSession, Depends(get_session, scope="function")],
) -> SubmitDemoRequestHandler:
    return SubmitDemoRequestHandler(
        repository=PostgresDemoRequestRepository(session),
        notifier=NoOpLeadNotifier(),
        clock=SystemClock(),
        current_privacy_version=settings.PRIVACY_VERSION,
    )


async def get_db_health(request: Request) -> bool:
    return await database_is_reachable(request.app.state.engine)
