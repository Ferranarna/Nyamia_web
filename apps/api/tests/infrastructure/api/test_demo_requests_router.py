import logging

import pytest

from infrastructure.security.client_ip import hash_ip
from tests.infrastructure.api.conftest import (
    PEER_IP,
    TEST_IP_SECRET,
    Harness,
    make_settings,
    valid_payload,
)

URL = "/api/v1/demo-requests"


async def test_valid_request_returns_202_and_is_stored(client, harness):
    response = await client.post(URL, json=valid_payload(email="Ana@Example.com"))
    assert response.status_code == 202
    assert response.json() == {"status": "received"}
    [lead] = harness.repo.items
    assert lead.email == "ana@example.com"
    assert lead.ip_hash == hash_ip(PEER_IP, TEST_IP_SECRET)
    assert harness.notifier.notified == [lead]


async def test_minimal_payload_optional_fields_absent(client, harness):
    payload = valid_payload()
    for optional in ("practice_name", "client_volume", "message", "website"):
        payload.pop(optional)
    response = await client.post(URL, json=payload)
    assert response.status_code == 202
    assert harness.repo.items[0].practice_name is None


@pytest.mark.parametrize(
    ("overrides", "field"),
    [
        ({"name": " A "}, "name"),
        ({"name": "x" * 101}, "name"),
        ({"name": 123}, "name"),
        ({"email": "not-an-email"}, "email"),
        ({"email": "Ana <ana@example.com>"}, "email"),
        ({"email": "a" * 250 + "@example.com"}, "email"),
        ({"role": "chef"}, "role"),
        ({"practice_name": "p" * 121}, "practice_name"),
        ({"client_volume": "100"}, "client_volume"),
        ({"message": "m" * 1001}, "message"),
        ({"locale": "fr"}, "locale"),
        ({"consent": False}, "consent"),
        ({"consent": "true"}, "consent"),
        ({"privacy_version": ""}, "privacy_version"),
        ({"privacy_version": "2020-01-01"}, "privacy_version"),
        ({"website": 5}, "website"),
    ],
)
async def test_validation_failures_list_field_names_only(client, harness, overrides, field):
    response = await client.post(URL, json=valid_payload(**overrides))
    assert response.status_code == 422
    assert response.json() == {"detail": "invalid_request", "fields": [field]}
    assert harness.repo.items == []


@pytest.mark.parametrize(
    "missing", ["name", "email", "role", "locale", "consent", "privacy_version"]
)
async def test_missing_required_field(client, missing):
    payload = valid_payload()
    payload.pop(missing)
    response = await client.post(URL, json=payload)
    assert response.status_code == 422
    assert response.json()["fields"] == [missing]


async def test_multiple_failures_and_no_values_echoed(client):
    response = await client.post(
        URL, json=valid_payload(name="Z", email="secret@@nope", consent=False)
    )
    assert response.status_code == 422
    assert response.json()["fields"] == ["name", "email", "consent"]
    assert "secret" not in response.text


async def test_unknown_field_rejected(client, harness):
    response = await client.post(URL, json=valid_payload(phone="600000000"))
    assert response.status_code == 422
    assert response.json() == {"detail": "invalid_request", "fields": ["phone"]}
    assert harness.repo.items == []


async def test_unknown_field_with_hostile_name_not_echoed(client):
    response = await client.post(URL, json=valid_payload(**{"<script>alert(1)</script>": "x"}))
    assert response.status_code == 422
    assert response.json()["fields"] == ["unknown_field"]


@pytest.mark.parametrize("body", ["not json", "[]", '"str"', "{"])
async def test_malformed_body(client, body):
    response = await client.post(URL, content=body, headers={"content-type": "application/json"})
    assert response.status_code == 422
    assert response.json()["detail"] == "invalid_request"


async def test_honeypot_returns_202_and_stores_nothing(client, harness):
    response = await client.post(URL, json=valid_payload(website="https://spam.example"))
    assert response.status_code == 202
    assert response.json() == {"status": "received"}
    assert harness.repo.items == [] and harness.notifier.notified == []


async def test_duplicate_email_returns_202_and_is_stored_once(client, harness):
    first = await client.post(URL, json=valid_payload())
    second = await client.post(URL, json=valid_payload(email="ANA@example.com"))
    assert first.status_code == second.status_code == 202
    assert second.json() == {"status": "received"}
    assert len(harness.repo.items) == 1


async def test_ip_rate_limit_returns_429_with_retry_after(client, harness):
    for i in range(5):
        response = await client.post(URL, json=valid_payload(email=f"lead{i}@example.com"))
        assert response.status_code == 202
    response = await client.post(URL, json=valid_payload(email="sixth@example.com"))
    assert response.status_code == 429
    assert response.json() == {"detail": "too_many_requests"}
    assert response.headers["retry-after"] == "3600"
    assert len(harness.repo.items) == 5


async def test_email_rate_limit_returns_429(client, harness):
    from datetime import timedelta

    from tests.fakes import make_demo_request

    for hours_ago in (23, 12, 6):
        harness.repo.items.append(
            make_demo_request(
                ip_hash=f"{hours_ago:02d}" * 32,
                now=harness.clock.now() - timedelta(hours=hours_ago),
            )
        )
    response = await client.post(URL, json=valid_payload())
    assert response.status_code == 429
    assert response.json() == {"detail": "too_many_requests"}
    assert response.headers["retry-after"] == "3600"


async def test_oversize_body_returns_413_before_parsing(client, harness):
    response = await client.post(URL, json=valid_payload(message="m" * 9000))
    assert response.status_code == 413
    assert response.json() == {"detail": "payload_too_large"}
    assert harness.repo.items == []


async def test_oversize_chunked_body_without_content_length(client, harness):
    async def chunks():
        for _ in range(10):
            yield b"x" * 1024

    response = await client.post(
        URL, content=chunks(), headers={"content-type": "application/json"}
    )
    assert response.status_code == 413
    assert response.json() == {"detail": "payload_too_large"}


async def test_body_at_limit_is_parsed(client):
    payload = valid_payload(message="m" * 1000)
    response = await client.post(URL, json=payload)
    assert response.status_code == 202


async def test_xff_ignored_with_hop_count_zero(client, harness):
    for i in range(5):
        await client.post(
            URL,
            json=valid_payload(email=f"lead{i}@example.com"),
            headers={"X-Forwarded-For": f"203.0.113.{i}"},
        )
    # Spoofing a fresh XFF per request does not escape the per-IP limit.
    response = await client.post(
        URL,
        json=valid_payload(email="six@example.com"),
        headers={"X-Forwarded-For": "203.0.113.99"},
    )
    assert response.status_code == 429
    assert {lead.ip_hash for lead in harness.repo.items} == {hash_ip(PEER_IP, TEST_IP_SECRET)}


async def test_xff_hop_count_one_uses_rightmost_entry():
    harness = Harness(make_settings(TRUSTED_PROXY_HOP_COUNT=1))
    async with harness.client() as client:
        response = await client.post(
            URL,
            json=valid_payload(),
            # Caller-forged leftmost entry; the proxy appended the real peer.
            headers={"X-Forwarded-For": "1.2.3.4, 203.0.113.50"},
        )
    assert response.status_code == 202
    assert harness.repo.items[0].ip_hash == hash_ip("203.0.113.50", TEST_IP_SECRET)


async def test_xff_hop_count_one_spoofing_does_not_escape_limit():
    harness = Harness(make_settings(TRUSTED_PROXY_HOP_COUNT=1))
    async with harness.client() as client:
        statuses = []
        for i in range(6):
            response = await client.post(
                URL,
                json=valid_payload(email=f"lead{i}@example.com"),
                headers={"X-Forwarded-For": f"10.0.0.{i}, 203.0.113.50"},
            )
            statuses.append(response.status_code)
    assert statuses == [202] * 5 + [429]


async def test_xff_hop_count_one_missing_header_falls_back_to_peer():
    harness = Harness(make_settings(TRUSTED_PROXY_HOP_COUNT=1))
    async with harness.client() as client:
        await client.post(URL, json=valid_payload())
    assert harness.repo.items[0].ip_hash == hash_ip(PEER_IP, TEST_IP_SECRET)


async def test_no_pii_in_logs(client, caplog):
    caplog.set_level(logging.DEBUG)
    pii = {
        "name": "Zacarías Únicolog",
        "email": "zacarias.unicolog@example.com",
        "message": "mensaje-secreto-unico",
        "practice_name": "Clínica Secreta",
    }
    await client.post(URL, json=valid_payload(**pii), headers={"User-Agent": "UA-unique-123"})
    await client.post(URL, json=valid_payload(**pii))  # duplicate
    await client.post(URL, json=valid_payload(**{**pii, "consent": False}))  # invalid
    await client.post(URL, json=valid_payload(**{**pii, "website": "bot"}))  # honeypot
    text = "\n".join(record.getMessage() for record in caplog.records)
    assert "outcome=accepted" in text
    assert "outcome=duplicate" in text
    assert "outcome=invalid" in text
    assert "outcome=honeypot" in text
    for value in [*pii.values(), "UA-unique-123", PEER_IP]:
        assert value not in text


async def test_unhandled_error_returns_generic_500_without_leaking(harness, caplog):
    from infrastructure.api.dependencies import get_demo_request_handler

    class Boom:
        async def execute(self, command):
            raise RuntimeError(f"duplicate key (email)=({command.email})")

    harness.app.dependency_overrides[get_demo_request_handler] = lambda: Boom()
    caplog.set_level(logging.DEBUG)
    async with harness.client() as client:
        response = await client.post(URL, json=valid_payload())
    assert response.status_code == 500
    assert response.json() == {"detail": "internal_error"}
    assert response.headers["x-content-type-options"] == "nosniff"
    assert "ana@example.com" not in caplog.text
    assert "unhandled_error type=RuntimeError" in caplog.text


async def test_security_headers_on_responses(client):
    response = await client.post(URL, json=valid_payload())
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["cache-control"] == "no-store"
    assert "default-src 'none'" in response.headers["content-security-policy"]
    assert len(response.headers["x-request-id"]) == 32


async def test_get_on_post_route_is_generic(client):
    response = await client.get(URL)
    assert response.status_code == 405
    assert response.json() == {"detail": "method_not_allowed"}


@pytest.mark.parametrize(
    ("overrides", "field"),
    [
        ({"name": "Ana\u0000Prueba"}, "name"),
        ({"practice_name": "Consulta ‮X"}, "practice_name"),
        ({"message": "hola\u0000"}, "message"),
    ],
)
async def test_control_characters_rejected_at_the_edge(client, harness, overrides, field):
    response = await client.post(URL, json=valid_payload(**overrides))
    assert response.status_code == 422
    assert response.json() == {"detail": "invalid_request", "fields": [field]}
    assert harness.repo.items == []


async def test_ipv6_clients_share_a_limit_per_64():
    harness = Harness(make_settings(TRUSTED_PROXY_HOP_COUNT=1))
    async with harness.client() as client:
        statuses = []
        for i in range(6):
            response = await client.post(
                URL,
                json=valid_payload(email=f"v6-{i}@example.com"),
                headers={"X-Forwarded-For": f"2001:db8:1:2::{i + 1:x}"},
            )
            statuses.append(response.status_code)
    assert statuses == [202] * 5 + [429]
    assert {lead.ip_hash for lead in harness.repo.items} == {
        hash_ip("2001:db8:1:2::/64", TEST_IP_SECRET)
    }
