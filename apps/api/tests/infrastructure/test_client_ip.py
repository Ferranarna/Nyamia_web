from infrastructure.security.client_ip import UNKNOWN_CLIENT, rate_limit_key


def test_rate_limit_key():
    assert rate_limit_key("203.0.113.5") == "203.0.113.5"
    assert rate_limit_key("::ffff:203.0.113.5") == "203.0.113.5"
    assert rate_limit_key("2001:db8:1:2:aaaa::1") == "2001:db8:1:2::/64"
    assert rate_limit_key(UNKNOWN_CLIENT) == UNKNOWN_CLIENT
