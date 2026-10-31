"""Nyamia website API — demo-request intake (spec 001).

Run: `uvicorn main:app --app-dir src` (see README / Dockerfile).
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from infrastructure.api.exception_handlers import register_exception_handlers
from infrastructure.api.middleware import (
    BodySizeLimitMiddleware,
    RequestContextMiddleware,
    UnhandledErrorMiddleware,
)
from infrastructure.api.routers import demo_requests, health
from infrastructure.config.settings import Settings, get_settings
from infrastructure.logging.config import configure_logging
from infrastructure.persistence.database import build_engine, build_sessionmaker

API_PREFIX = "/api/v1"


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings.LOG_LEVEL)

    # One engine per process; it connects lazily (no DB needed at import).
    engine = build_engine(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        yield
        await engine.dispose()

    docs = settings.docs_enabled
    app = FastAPI(
        title="Nyamia website API",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs" if docs else None,
        redoc_url=None,
        openapi_url="/openapi.json" if docs else None,
        # W-M1: never answer 307 with a `Location` built from the origin host
        # (it would leak the Railway hostname and break the Vercel-proxied form,
        # since `trailingSlash: true` on the web may forward `/path/`). Routes
        # that matter declare an explicit slashed alias instead.
        redirect_slashes=False,
    )
    app.state.settings = settings
    app.state.engine = engine
    app.state.sessionmaker = build_sessionmaker(engine)

    app.include_router(demo_requests.router, prefix=API_PREFIX)
    app.include_router(health.router, prefix=API_PREFIX)
    register_exception_handlers(app)

    # add_middleware prepends: the last one added is the outermost.
    app.add_middleware(BodySizeLimitMiddleware)
    app.add_middleware(UnhandledErrorMiddleware)
    app.add_middleware(RequestContextMiddleware)
    return app


def __getattr__(name: str) -> FastAPI:
    # `main:app` is built on first access so importing this module (tests,
    # Alembic) never requires production environment variables.
    if name == "app":
        global app
        app = create_app()
        return app
    raise AttributeError(name)
