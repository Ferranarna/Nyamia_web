"""Runtime configuration (environment variables; local dev reads `.env`).

Variable names are documented in `.env.example`; values never appear in code,
logs or docs.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_MIN_PRODUCTION_SECRET_LENGTH = 32


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        # .env also carries POSTGRES_* for docker compose; ignore them here.
        extra="ignore",
        case_sensitive=True,
    )

    ENVIRONMENT: Literal["development", "test", "production"] = "development"
    DATABASE_URL: SecretStr
    IP_HASH_SECRET: SecretStr
    TRUSTED_PROXY_HOP_COUNT: int = Field(default=0, ge=0, le=10)
    PRIVACY_VERSION: str = Field(default="2026-10-30", min_length=1, max_length=32)
    LOG_LEVEL: str = "INFO"

    @field_validator("DATABASE_URL")
    @classmethod
    def _use_asyncpg_driver(cls, value: SecretStr) -> SecretStr:
        # Railway/Heroku style URLs are `postgres://` or `postgresql://`;
        # the app always talks to Postgres through asyncpg.
        url = value.get_secret_value()
        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                url = "postgresql+asyncpg://" + url[len(prefix) :]
                break
        return SecretStr(url)

    @model_validator(mode="after")
    def _production_guards(self) -> Settings:
        secret = self.IP_HASH_SECRET.get_secret_value()
        if not secret:
            raise ValueError("IP_HASH_SECRET must not be empty")
        if self.is_production and (
            len(secret) < _MIN_PRODUCTION_SECRET_LENGTH or "change-me" in secret
        ):
            raise ValueError(
                "IP_HASH_SECRET must be a random value of at least "
                f"{_MIN_PRODUCTION_SECRET_LENGTH} characters in production"
            )
        return self

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def docs_enabled(self) -> bool:
        return not self.is_production


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from the environment
