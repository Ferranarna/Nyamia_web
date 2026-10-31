import pytest
from pydantic import SecretStr, ValidationError

from tests.infrastructure.api.conftest import Harness, make_settings


async def test_health_ok(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["cache-control"] == "no-store"


async def test_health_db_down(harness):
    harness.db_ok = False
    async with harness.client() as client:
        response = await client.get("/api/v1/health")
    assert response.status_code == 503
    assert response.json() == {"status": "unavailable"}


async def test_unknown_route_is_generic_404(client):
    response = await client.get("/api/v1/leads")
    assert response.status_code == 404
    assert response.json() == {"detail": "not_found"}


async def test_docs_enabled_outside_production(client):
    assert (await client.get("/openapi.json")).status_code == 200


async def test_docs_disabled_in_production():
    settings = make_settings(ENVIRONMENT="production", IP_HASH_SECRET=SecretStr("s" * 48))
    async with Harness(settings).client() as client:
        assert (await client.get("/docs")).status_code == 404
        assert (await client.get("/openapi.json")).status_code == 404


def test_production_rejects_weak_ip_secret():
    with pytest.raises(ValidationError):
        make_settings(ENVIRONMENT="production", IP_HASH_SECRET=SecretStr("change-me-short"))


def test_postgres_scheme_rewritten_to_asyncpg():
    settings = make_settings(DATABASE_URL=SecretStr("postgresql://u:p@h:5432/db"))
    assert settings.DATABASE_URL.get_secret_value().startswith("postgresql+asyncpg://")
