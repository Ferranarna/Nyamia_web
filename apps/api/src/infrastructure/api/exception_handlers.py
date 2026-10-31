"""Map errors to the contract's generic bodies. Never echo submitted values,
never return stack traces, never log exception messages (DB driver errors can
quote row values)."""

from __future__ import annotations

import re

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from domain.exceptions import InvalidDemoRequest, RateLimited
from infrastructure.api.schemas import CONTRACT_FIELDS
from infrastructure.logging.config import get_logger

logger = get_logger("errors")

# Unknown keys are caller-chosen strings: only echo short identifier-like ones.
_SAFE_FIELD_NAME = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,39}$")
_UNKNOWN_FIELD = "unknown_field"


def _field_names(exc: RequestValidationError) -> list[str]:
    fields: list[str] = []
    for error in exc.errors():
        loc = error.get("loc", ())
        if len(loc) < 2 or loc[0] != "body" or not isinstance(loc[1], str):
            continue  # malformed JSON / non-object body → no field to name
        name = loc[1]
        if name not in CONTRACT_FIELDS and not _SAFE_FIELD_NAME.match(name):
            name = _UNKNOWN_FIELD
        fields.append(name)
    return list(dict.fromkeys(fields))


def _invalid(fields: list[str]) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": "invalid_request", "fields": fields})


async def _request_validation(request: Request, exc: RequestValidationError) -> JSONResponse:
    fields = _field_names(exc)
    logger.info("demo_request outcome=invalid fields=%s", ",".join(fields) or "-")
    return _invalid(fields)


async def _invalid_demo_request(request: Request, exc: InvalidDemoRequest) -> JSONResponse:
    logger.info("demo_request outcome=invalid fields=%s", ",".join(exc.fields))
    return _invalid(exc.fields)


async def _rate_limited(request: Request, exc: RateLimited) -> JSONResponse:
    logger.info("demo_request outcome=rate_limited scope=%s", exc.scope)
    return JSONResponse(
        status_code=429,
        content={"detail": "too_many_requests"},
        headers={"Retry-After": str(exc.retry_after_seconds)},
    )


_HTTP_DETAILS = {
    404: "not_found",
    405: "method_not_allowed",
    413: "payload_too_large",
}


async def _http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = _HTTP_DETAILS.get(exc.status_code, "error")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail},
        headers=getattr(exc, "headers", None),
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, _request_validation)  # type: ignore[arg-type]
    app.add_exception_handler(InvalidDemoRequest, _invalid_demo_request)  # type: ignore[arg-type]
    app.add_exception_handler(RateLimited, _rate_limited)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, _http_exception)  # type: ignore[arg-type]
    # Unhandled exceptions: see `middleware.UnhandledErrorMiddleware` (a
    # plain `Exception` handler would let Starlette re-raise and the server
    # print a traceback whose message may quote lead data).
