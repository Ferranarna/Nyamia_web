# Nyamia website API (`apps/api`)

Small FastAPI service whose only v1 job is to receive **demo requests** from
nyamia.com safely (spec: `.claude/spec/features/001-landing-and-demo-request/spec.md`,
"Demo-request contract" — frozen).

## Layout (hexagonal + CQRS-lite)

```
src/
  main.py                         create_app() factory; `main:app` built lazily
  domain/                         no FastAPI / SQLAlchemy imports
    models/demo_request.py        DemoRequest entity + invariants, Role/ClientVolume/Locale
    models/rate_limit_policy.py   5 / h per IP hash, 3 / 24 h per email, 24 h duplicate window
    ports/                        DemoRequestRepositoryPort, LeadNotifierPort, ClockPort
    exceptions.py                 InvalidDemoRequest(fields), RateLimited(retry_after, scope)
  application/commands/submit_demo_request.py   command + handler → SubmitOutcome
  infrastructure/
    api/        schemas (extra="forbid"), routers, middleware (request id, security
                headers, 8 KB body guard, generic 500), exception handlers, DI
    persistence/ async engine + request-scoped session, ORM model, Postgres repository
    security/client_ip.py         X-Forwarded-For with TRUSTED_PROXY_HOP_COUNT + HMAC-SHA256
    notification/noop_notifier.py v1 no-op (real email = roadmap 004)
    config/settings.py, logging/config.py, clock/
alembic/                          async env; schema only via migrations
tests/                            domain · application (fakes) · infrastructure/api · persistence (real PG)
```

## Endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/demo-requests` | 202 `{"status":"received"}` · 422 `{"detail":"invalid_request","fields":[…]}` · 413 · 429 + `Retry-After` · 500 `{"detail":"internal_error"}` |
| GET | `/api/v1/health` | 200 `{"status":"ok"}`; 503 `{"status":"unavailable"}` if the DB is unreachable |

`/docs` and `/openapi.json` exist only when `ENVIRONMENT` ≠ `production`.

Handler order: honeypot (`website` non-blank → 202, nothing stored) → domain
invariants (consent, `privacy_version` must equal `PRIVACY_VERSION`) → per-IP
limit → per-email limit → duplicate email within 24 h (202, not stored) →
persist + notify.

## Local development

From the repo root:

```bash
make api-env         # copies .env.example → apps/api/.env (never overwrites)
make api-db-up       # postgres:17-alpine on 127.0.0.1:5433 (product DB stays on 5432)
make api-db-migrate  # alembic upgrade head
make api-dev         # http://localhost:8020
make api-test        # uv run pytest (repository tests skip if PG is unreachable)
make api-lint        # uv run ruff check src tests
```

First time: `cd apps/api && uv sync --extra dev`.

New migration: `cd apps/api && uv run alembic revision --autogenerate -m "…"`,
then review the generated file by hand.

## Configuration (names only — values in `.env` / Railway variables)

| Variable | Purpose |
|----------|---------|
| `ENVIRONMENT` | `development` \| `test` \| `production` (production: docs off, strong `IP_HASH_SECRET` enforced) |
| `DATABASE_URL` | Postgres URL; `postgres://`/`postgresql://` are rewritten to `postgresql+asyncpg://` |
| `IP_HASH_SECRET` | HMAC key for client-IP hashing; ≥ 32 random chars in production |
| `TRUSTED_PROXY_HOP_COUNT` | Proxies that append to `X-Forwarded-For` (default 0 = header ignored) |
| `PRIVACY_VERSION` | Current privacy-notice version the form must send (default `2026-10-30`) |
| `LOG_LEVEL` | default `INFO` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | local docker compose only |

## Deploy (Railway)

- Service root `apps/api`, builder Dockerfile (`railway.json`).
- **Pre-deploy command: `alembic upgrade head`** (set in `railway.json`).
- Health check: `/api/v1/health`.
- Runs as non-root (uid 10001; code and venv root-owned, read-only for it) with
  `--no-proxy-headers --no-access-log --no-server-header`:
  the app parses `X-Forwarded-For` itself (uvicorn with `--forwarded-allow-ips='*'`
  would trust the leftmost, forgeable entry) and uvicorn access lines would log
  client IPs.
- **`TRUSTED_PROXY_HOP_COUNT` must be measured on the real Vercel → Railway
  chain (feature 003)** before go-live: with N, the client IP is the N-th
  `X-Forwarded-For` entry from the right. Too low → every lead shares the
  proxy's IP (global rate limit); too high → callers can forge their IP.

## Privacy

- Stored per lead: contract fields (minus honeypot), `consent_at`, `privacy_version`,
  `ip_hash` (HMAC of the IP — of its /64 for IPv6 — never the raw IP), `user_agent`
  (control characters stripped, ≤ 200 chars), `created_at`.
- Retention: 12 months, then deleted (deletion job in backlog).
- Logs carry request id, outcome, server-generated lead id and invalid field
  *names* only — never name, email, message, IP or user agent. Unhandled errors
  log the exception class only (driver messages can quote row values).
- No endpoint reads leads back; the founder uses the DB console until 004.
