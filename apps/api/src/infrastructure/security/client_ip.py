"""Proxy-aware client IP + HMAC hashing (only the hash is ever stored).

`TRUSTED_PROXY_HOP_COUNT` = number of reverse proxies in front of the app
that each *append* the address of their peer to `X-Forwarded-For`.

- 0 (default, local dev / nothing in front): XFF is ignored entirely — it is
  fully caller-controlled — and the TCP peer address is used.
- N > 0: the client is the N-th entry counted from the right
  (`hops[-N]`); anything further left was supplied by the caller and is
  untrusted. If the header has fewer than N entries, fall back to the peer.

Uvicorn must NOT rewrite the peer address from XFF itself (see Dockerfile:
`--no-proxy-headers`): with `--forwarded-allow-ips='*'` it would take the
*leftmost*, spoofable entry.
"""

from __future__ import annotations

import hashlib
import hmac
import ipaddress

from starlette.requests import Request

UNKNOWN_CLIENT = "unknown"


def _normalise(candidate: str) -> str | None:
    candidate = candidate.strip()
    if candidate.startswith("[") and "]" in candidate:  # "[::1]:443"
        candidate = candidate[1 : candidate.index("]")]
    elif candidate.count(":") == 1:  # "1.2.3.4:5678"
        candidate = candidate.split(":", 1)[0]
    try:
        return str(ipaddress.ip_address(candidate))
    except ValueError:
        return None


def resolve_client_ip(request: Request, trusted_proxy_hop_count: int) -> str:
    if trusted_proxy_hop_count > 0:
        header = ",".join(request.headers.getlist("x-forwarded-for"))
        hops = [hop.strip() for hop in header.split(",") if hop.strip()]
        if len(hops) >= trusted_proxy_hop_count:
            ip = _normalise(hops[-trusted_proxy_hop_count])
            if ip is not None:
                return ip
    peer = request.client.host if request.client else None
    return (_normalise(peer) if peer else None) or UNKNOWN_CLIENT


IPV6_RATE_LIMIT_PREFIX = 64


def rate_limit_key(ip: str) -> str:
    """Value that identifies one client for rate limiting.

    IPv4 (and IPv4-mapped IPv6): the address. Other IPv6: its /64 network,
    because a single subscriber normally controls a whole /64 and could
    otherwise rotate addresses to escape the per-IP limit.
    """
    try:
        address = ipaddress.ip_address(ip)
    except ValueError:
        return ip  # UNKNOWN_CLIENT
    if isinstance(address, ipaddress.IPv6Address):
        if address.ipv4_mapped is not None:
            return str(address.ipv4_mapped)
        network = ipaddress.IPv6Network(f"{address}/{IPV6_RATE_LIMIT_PREFIX}", strict=False)
        return str(network)
    return str(address)


def hash_ip(ip: str, secret: str) -> str:
    """Hex HMAC-SHA256 — keyed so the hash cannot be reversed by brute-forcing
    the (small) IPv4 space without the server secret."""
    return hmac.new(secret.encode(), ip.encode(), hashlib.sha256).hexdigest()
