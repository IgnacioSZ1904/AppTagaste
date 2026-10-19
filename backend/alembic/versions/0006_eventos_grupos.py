"""eventos por grupo: relación N:M entre eventos y grupos

Revision ID: 0006
Revises: 0005
Create Date: 2026-10-19 17:01:48.700273

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0006'
down_revision: str | None = '0005'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('event_groups',
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('group_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_event_groups_event_id_events'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], name=op.f('fk_event_groups_group_id_groups'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('event_id', 'group_id', name=op.f('pk_event_groups'))
    )
    op.create_index(op.f('ix_event_groups_group_id'), 'event_groups', ['group_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_event_groups_group_id'), table_name='event_groups')
    op.drop_table('event_groups')
