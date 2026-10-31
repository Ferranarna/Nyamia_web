from datetime import datetime

import pytest

from domain.exceptions import InvalidDemoRequest, RateLimited
from domain.models.demo_request import ClientVolume, Locale, Role
from tests.fakes import FIXED_NOW, make_demo_request


def test_valid_request_is_normalised():
    lead = make_demo_request(
        name="  Ana Prueba  ",
        email="  Ana.Prueba@Example.COM ",
        practice_name="   ",
        message="  hola  ",
        client_volume="16-40",
        user_agent="x" * 500,
    )
    assert lead.name == "Ana Prueba"
    assert lead.email == "ana.prueba@example.com"
    assert lead.practice_name is None
    assert lead.message == "hola"
    assert lead.client_volume is ClientVolume.FROM_16_TO_40
    assert lead.role is Role.DIETITIAN_PRIVATE
    assert lead.locale is Locale.ES
    assert lead.consent_at == FIXED_NOW == lead.created_at
    assert len(lead.user_agent) == 200
    assert lead.id.version == 7


@pytest.mark.parametrize(
    ("overrides", "field"),
    [
        ({"name": "A"}, "name"),
        ({"name": "x" * 101}, "name"),
        ({"email": "not-an-email"}, "email"),
        ({"email": "a" * 250 + "@example.com"}, "email"),
        ({"role": "chef"}, "role"),
        ({"practice_name": "p" * 121}, "practice_name"),
        ({"client_volume": "1000"}, "client_volume"),
        ({"message": "m" * 1001}, "message"),
        ({"locale": "fr"}, "locale"),
        ({"consent": False}, "consent"),
        ({"privacy_version": "2020-01-01"}, "privacy_version"),
        ({"ip_hash": "127.0.0.1"}, "ip_hash"),
        ({"now": datetime(2026, 10, 30)}, "created_at"),
    ],
)
def test_invariants(overrides, field):
    with pytest.raises(InvalidDemoRequest) as exc:
        make_demo_request(**overrides)
    assert exc.value.fields == [field]


def test_all_failures_reported_without_values():
    with pytest.raises(InvalidDemoRequest) as exc:
        make_demo_request(name="A", email="secret-value", consent=False)
    assert exc.value.fields == ["name", "email", "consent"]
    assert "secret-value" not in str(exc.value)


def test_rate_limited_never_below_one_second():
    assert RateLimited(0, scope="ip").retry_after_seconds == 1


@pytest.mark.parametrize(
    ("overrides", "field"),
    [
        ({"name": "Ana\x00Prueba"}, "name"),
        ({"name": "Ana\nPrueba"}, "name"),
        ({"name": "Ana ‮abeurP"}, "name"),
        ({"email": "ana\x00@example.com"}, "email"),
        ({"practice_name": "Consulta\x07"}, "practice_name"),
        ({"message": "hola\x00"}, "message"),
        ({"message": "⁦oculto⁩"}, "message"),
    ],
)
def test_control_and_bidi_characters_rejected(overrides, field):
    # NUL would make Postgres raise (→ 500); bidi controls spoof display.
    with pytest.raises(InvalidDemoRequest) as exc:
        make_demo_request(**overrides)
    assert exc.value.fields == [field]


def test_message_keeps_newlines_and_user_agent_is_sanitised():
    lead = make_demo_request(message="línea 1\r\n\tlínea 2", user_agent="UA\x01‮" + "x" * 300)
    assert lead.message == "línea 1\r\n\tlínea 2"
    assert lead.user_agent == "UA" + "x" * 198
