"""Pure-ASGI middleware: request id, security headers, body-size guard."""

from __future__ import annotations

import json
import logging
import uuid
from contextvars import ContextVar

from starlette.types import ASGIApp, Message, Receive, Scope, Send

MAX_BODY_BYTES = 8 * 1024

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

_DOCS_PATHS = ("/docs", "/redoc", "/openapi.json")

_SECURITY_HEADERS: tuple[tuple[bytes, bytes], ...] = (
    (b"x-content-type-options", b"nosniff"),
    (b"cache-control", b"no-store"),
    (b"referrer-policy", b"no-referrer"),
    (b"x-frame-options", b"DENY"),
    (b"cross-origin-resource-policy", b"same-origin"),
)
_API_CSP = (b"content-security-policy", b"default-src 'none'; frame-ancestors 'none'")


async def _send_json(send: Send, status: int, body: dict, extra: list | None = None) -> None:
    payload = json.dumps(body, separators=(",", ":")).encode()
    headers = [
        (b"content-type", b"application/json"),
        (b"content-length", str(len(payload)).encode()),
        *(extra or []),
    ]
    await send({"type": "http.response.start", "status": status, "headers": headers})
    await send({"type": "http.response.body", "body": payload})


class RequestContextMiddleware:
    """Assigns a server-generated request id (never trusts a client one),
    exposes it as `X-Request-ID` and adds security headers to every response."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = uuid.uuid4().hex
        token = request_id_var.set(request_id)
        is_docs = scope.get("path", "").startswith(_DOCS_PATHS)

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = [
                    (k, v)
                    for k, v in message.get("headers", [])
                    if k.lower() not in {name for name, _ in _SECURITY_HEADERS}
                ]
                headers.extend(_SECURITY_HEADERS)
                if not is_docs:
                    headers.append(_API_CSP)
                headers.append((b"x-request-id", request_id.encode()))
                message["headers"] = headers
            await send(message)

        try:
            await self.app(scope, receive, send_with_headers)
        finally:
            request_id_var.reset(token)


class UnhandledErrorMiddleware:
    """Last resort: any exception → 500 `internal_error`, logged by class name
    only (driver messages can quote row values), and *not* re-raised, so no
    traceback with lead data reaches the server logs."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        started = False

        async def tracking_send(message: Message) -> None:
            nonlocal started
            if message["type"] == "http.response.start":
                started = True
            await send(message)

        try:
            await self.app(scope, receive, tracking_send)
        except Exception as exc:  # noqa: BLE001
            logging.getLogger("nyamia_web_api.errors").error(
                "unhandled_error type=%s", type(exc).__name__
            )
            if not started:
                await _send_json(send, 500, {"detail": "internal_error"})


class BodySizeLimitMiddleware:
    """Rejects bodies over `max_bytes` with 413 *before* any parsing.

    Checks `Content-Length` up front, then buffers the stream (chunked
    uploads too) and stops reading at max_bytes + 1, so a lying or absent
    Content-Length cannot push more than that into memory.
    """

    def __init__(self, app: ASGIApp, max_bytes: int = MAX_BODY_BYTES) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def _too_large(self, send: Send) -> None:
        await _send_json(send, 413, {"detail": "payload_too_large"}, [(b"connection", b"close")])

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope.get("method") in ("GET", "HEAD", "OPTIONS"):
            await self.app(scope, receive, send)
            return

        for name, value in scope.get("headers", []):
            if name == b"content-length":
                try:
                    declared = int(value)
                except ValueError:
                    declared = self.max_bytes + 1
                if declared > self.max_bytes:
                    await self._too_large(send)
                    return

        chunks: list[bytes] = []
        size = 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            chunk = message.get("body", b"")
            size += len(chunk)
            if size > self.max_bytes:
                await self._too_large(send)
                return
            chunks.append(chunk)
            if not message.get("more_body", False):
                break

        body = b"".join(chunks)
        replayed = False

        async def replay() -> Message:
            nonlocal replayed
            if not replayed:
                replayed = True
                return {"type": "http.request", "body": body, "more_body": False}
            return await receive()

        await self.app(scope, replay, send)
