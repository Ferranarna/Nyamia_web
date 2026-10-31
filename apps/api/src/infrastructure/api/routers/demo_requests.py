from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from application.commands.submit_demo_request import (
    SubmitDemoRequestCommand,
    SubmitDemoRequestHandler,
)
from infrastructure.api.dependencies import get_client_ip_hash, get_demo_request_handler
from infrastructure.api.schemas import DemoRequestIn
from infrastructure.logging.config import get_logger

router = APIRouter(prefix="/demo-requests", tags=["demo-requests"], redirect_slashes=False)
logger = get_logger("demo_requests")


@router.post("", status_code=202)
# W-M1 alias: same handler, served directly (no redirect), hidden from OpenAPI.
@router.post("/", status_code=202, include_in_schema=False)
async def submit_demo_request(
    payload: DemoRequestIn,
    request: Request,
    handler: Annotated[SubmitDemoRequestHandler, Depends(get_demo_request_handler)],
    ip_hash: Annotated[str, Depends(get_client_ip_hash)],
) -> JSONResponse:
    result = await handler.execute(
        SubmitDemoRequestCommand(
            name=payload.name,
            email=payload.email,
            role=payload.role,
            practice_name=payload.practice_name,
            client_volume=payload.client_volume,
            message=payload.message,
            locale=payload.locale,
            consent=payload.consent,
            privacy_version=payload.privacy_version,
            website=payload.website,
            ip_hash=ip_hash,
            user_agent=request.headers.get("user-agent"),
        )
    )
    # Outcome + server-generated id only. Honeypot/duplicate look identical
    # to the caller (no enumeration).
    logger.info(
        "demo_request outcome=%s id=%s", result.outcome.value, result.demo_request_id or "-"
    )
    return JSONResponse(status_code=202, content={"status": "received"})
