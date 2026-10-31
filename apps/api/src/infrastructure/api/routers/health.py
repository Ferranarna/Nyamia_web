from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from infrastructure.api.dependencies import get_db_health

router = APIRouter(tags=["health"], redirect_slashes=False)


@router.get("/health")
# W-M1 alias: same handler, served directly (no redirect), hidden from OpenAPI.
@router.get("/health/", include_in_schema=False)
async def health(db_ok: Annotated[bool, Depends(get_db_health)]) -> JSONResponse:
    if db_ok:
        return JSONResponse({"status": "ok"})
    return JSONResponse({"status": "unavailable"}, status_code=503)
