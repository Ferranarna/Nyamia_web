from __future__ import annotations

import httpx
import pytest
from pydantic import SecretStr

from application.commands.submit_demo_request import SubmitDemoRequestHandler
from infrastructure.api.dependencies import get_db_health, get_demo_request_handler
from infrastructure.config.settings import Settings
from main import create_app
from tests.fakes import PRIVACY_VERSION, FakeClock, InMemoryDemoRequestRepository, RecordingNotifier

PEER_IP = "198.51.100.7"
TEST_IP_SECRET = "test-ip-hash-secret"


def make_settings(**overrides) -> Settings:
    values = dict(
        ENVIRONMENT="test",
        DATABASE_URL=SecretStr("postgresql+asyncpg://user:pw@127.0.0.1:1/unused"),
        IP_HASH_SECRET=SecretStr(TEST_IP_SECRET),
        TRUSTED_PROXY_HOP_COUNT=0,
        PRIVACY_VERSION=PRIVACY_VERSION,
    )
    values.update(overrides)
    return Settings(_env_file=None, **values)  # type: ignore[call-arg]


class Harness:
    def __init__(self, settings: Settings) -> None:
        self.repo = InMemoryDemoRequestRepository()
        self.notifier = RecordingNotifier()
        self.clock = FakeClock()
        self.db_ok = True
        self.app = create_app(settings)
        self.app.dependency_overrides[get_demo_request_handler] = lambda: SubmitDemoRequestHandler(
            repository=self.repo,
            notifier=self.notifier,
            clock=self.clock,
            current_privacy_version=settings.PRIVACY_VERSION,
        )
        self.app.dependency_overrides[get_db_health] = lambda: self.db_ok

    def client(self) -> httpx.AsyncClient:
        transport = httpx.ASGITransport(app=self.app, client=(PEER_IP, 50000))
        return httpx.AsyncClient(transport=transport, base_url="http://testserver")


@pytest.fixture
def harness() -> Harness:
    return Harness(make_settings())


@pytest.fixture
async def client(harness):
    async with harness.client() as c:
        yield c


def valid_payload(**overrides) -> dict:
    payload = {
        "name": "Ana Prueba",
        "email": "ana@example.com",
        "role": "dietitian_private",
        "practice_name": "Consulta Ana",
        "client_volume": "16-40",
        "message": "Quiero ver una demo.",
        "locale": "es",
        "consent": True,
        "privacy_version": PRIVACY_VERSION,
        "website": "",
    }
    payload.update(overrides)
    return payload
