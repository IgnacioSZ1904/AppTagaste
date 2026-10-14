"""events: tabla de eventos y reuniones

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-14 10:26:03.562952

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0003'
down_revision: str | None = '0002'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('type', sa.Enum('reunion', 'convivencia', 'eucaristia', 'otro', name='event_type', native_enum=False, create_constraint=True, length=20), nullable=False),
    sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('ends_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('location', sa.String(length=150), nullable=True),
    sa.Column('created_by_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.CheckConstraint('ends_at > starts_at', name=op.f('ck_events_ends_after_start')),
    sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], name=op.f('fk_events_created_by_id_users'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_events'))
    )
    op.create_index(op.f('ix_events_starts_at'), 'events', ['starts_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_events_starts_at'), table_name='events')
    op.drop_table('events')
