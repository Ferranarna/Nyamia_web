.PHONY: api-env api-db-up api-db-down api-db-migrate api-dev api-test api-lint

# Bootstrap apps/api/.env from the template (never overwrites an existing one).
api-env:
	test -f apps/api/.env || cp apps/api/.env.example apps/api/.env

# Local Postgres for the website API only (port 5433, never the product's dev DB).
api-db-up:
	docker compose -f apps/api/docker-compose.yml --env-file apps/api/.env up -d --wait

api-db-down:
	docker compose -f apps/api/docker-compose.yml --env-file apps/api/.env down

api-db-migrate:
	cd apps/api && uv run alembic upgrade head

api-dev:
	cd apps/api && uv run uvicorn main:app --app-dir src --reload --port 8020

api-test:
	cd apps/api && uv run pytest

api-lint:
	cd apps/api && uv run ruff check src tests
