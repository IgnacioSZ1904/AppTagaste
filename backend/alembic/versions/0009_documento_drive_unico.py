"""documento de Drive único

Revision ID: 0009
Revises: 0008
Create Date: 2026-10-20 10:57:26.785558

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0009'
down_revision: str | None = '0008'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_unique_constraint(op.f('uq_documents_drive_file_id'), 'documents', ['drive_file_id'])


def downgrade() -> None:
    op.drop_constraint(op.f('uq_documents_drive_file_id'), 'documents', type_='unique')
