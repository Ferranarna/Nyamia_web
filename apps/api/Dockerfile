# syntax=docker/dockerfile:1
# Nyamia website API (apps/api). Build context: apps/api (Railway service root).

FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /bin/
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project
COPY . .
RUN uv sync --frozen --no-dev


FROM python:3.12-slim AS runtime
RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --no-create-home --shell /usr/sbin/nologin app
WORKDIR /app
# Code and venv stay root-owned (read-only for the app user): a compromised
# process cannot rewrite the code it runs.
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
COPY --from=builder /app/alembic /app/alembic
COPY --from=builder /app/alembic.ini /app/alembic.ini
ENV PATH="/app/.venv/bin:${PATH}" \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENVIRONMENT=production
USER app
EXPOSE 8000

# Pre-deploy (Railway, see railway.json): `alembic upgrade head`.
#
# --no-proxy-headers: the app resolves the client IP itself from
#   X-Forwarded-For using TRUSTED_PROXY_HOP_COUNT (rightmost-N rule). Uvicorn's
#   own handling with --forwarded-allow-ips='*' would take the *leftmost*,
#   caller-forgeable entry, and with its default (127.0.0.1) it is a no-op
#   behind Railway anyway — so it is disabled explicitly.
# --no-access-log: uvicorn access lines contain the client IP (PII); the app
#   logs request id + outcome instead.
# --no-server-header: do not advertise the server software/version.
CMD ["sh", "-c", "exec uvicorn main:app --app-dir src --host 0.0.0.0 --port ${PORT:-8000} --no-proxy-headers --no-access-log --no-server-header"]
