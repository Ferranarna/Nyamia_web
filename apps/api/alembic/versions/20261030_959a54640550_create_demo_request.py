"""create demo_request

Revision ID: 959a54640550
Revises:
Create Date: 2026-10-30

Leads from the website demo form (spec 001). Indexes back the rate-limit and
duplicate lookups (count by ip_hash / email within a time window).
Retention: 12 months (deletion job in backlog).
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "959a54640550"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "demo_request",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("practice_name", sa.String(length=120), nullable=True),
        sa.Column("client_volume", sa.String(length=8), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("locale", sa.String(length=2), nullable=False),
        sa.Column("consent", sa.Boolean(), nullable=False),
        sa.Column("consent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("privacy_version", sa.String(length=32), nullable=False),
        sa.Column("ip_hash", sa.String(length=64), nullable=False),
        sa.Column("user_agent", sa.String(length=200), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint("consent", name=op.f("ck_demo_request_consent_true")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_demo_request")),
    )
    op.create_index("ix_demo_request_email_created_at", "demo_request", ["email", "created_at"])
    op.create_index("ix_demo_request_ip_hash_created_at", "demo_request", ["ip_hash", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_demo_request_ip_hash_created_at", table_name="demo_request")
    op.drop_index("ix_demo_request_email_created_at", table_name="demo_request")
    op.drop_table("demo_request")
