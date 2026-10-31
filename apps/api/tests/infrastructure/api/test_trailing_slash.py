"""W-M1: the web uses Astro `trailingSlash: true`, so behind the Vercel rewrite
the API may receive `/path/`. It must serve both forms directly and never emit
a redirect (a `Location` would leak the Railway origin and break the form)."""

import pytest

from tests.infrastructure.api.conftest import valid_payload

DEMO_PATHS = ["/api/v1/demo-requests", "/api/v1/demo-requests/"]
HEALTH_PATHS = ["/api/v1/health", "/api/v1/health/"]


def assert_no_redirect(response) -> None:
    assert not response.is_redirect
    assert not 300 <= response.status_code < 400
    assert "location" not in response.headers


@pytest.mark.parametrize("path", DEMO_PATHS)
async def test_demo_request_accepted_with_and_without_trailing_slash(client, harness, path):
    response = await client.post(path, json=valid_payload())
    assert_no_redirect(response)
    assert response.status_code == 202
    assert response.json() == {"status": "received"}
    assert len(harness.repo.items) == 1


@pytest.mark.parametrize("path", DEMO_PATHS)
async def test_validation_error_with_and_without_trailing_slash(client, path):
    response = await client.post(path, json={})
    assert_no_redirect(response)
    assert response.status_code == 422
    assert response.json()["detail"] == "invalid_request"


@pytest.mark.parametrize("path", HEALTH_PATHS)
async def test_health_with_and_without_trailing_slash(client, path):
    response = await client.get(path)
    assert_no_redirect(response)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("GET", "/api/v1/leads"),
        ("GET", "/api/v1/leads/"),
        ("POST", "/api/v1/unknown/"),
        ("GET", "/api/v1"),
        ("GET", "/api/v1/"),
        ("GET", "/"),
        ("GET", "/docs/"),
        ("GET", "/openapi.json/"),
        ("POST", "/api/v1/demo-requests//"),
    ],
)
async def test_unknown_paths_are_json_404_without_redirect(client, method, path):
    response = await client.request(method, path)
    assert_no_redirect(response)
    assert response.status_code == 404
    assert response.json() == {"detail": "not_found"}


@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("GET", "/api/v1/demo-requests"),
        ("GET", "/api/v1/demo-requests/"),
        ("POST", "/api/v1/health/"),
    ],
)
async def test_wrong_method_never_redirects(client, method, path):
    response = await client.request(method, path)
    assert_no_redirect(response)
    assert response.status_code == 405


async def test_slash_aliases_hidden_from_openapi(client):
    paths = (await client.get("/openapi.json")).json()["paths"]
    assert set(paths) == {"/api/v1/demo-requests", "/api/v1/health"}
    assert list(paths["/api/v1/demo-requests"]) == ["post"]
