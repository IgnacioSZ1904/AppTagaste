"""asistencia: pase de lista por evento

Revision ID: 0007
Revises: 0006
Create Date: 2026-10-19 17:30:24.031106

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0007'
down_revision: str | None = '0006'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('attendance',
    sa.Column('event_id', sa.Integer(), nullable=False),
    sa.Column('child_id', sa.Integer(), nullable=False),
    sa.Column('present', sa.Boolean(), nullable=False),
    sa.Column('marked_by_id', sa.Integer(), nullable=True),
    sa.Column('marked_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['child_id'], ['children.id'], name=op.f('fk_attendance_child_id_children'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['event_id'], ['events.id'], name=op.f('fk_attendance_event_id_events'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['marked_by_id'], ['users.id'], name=op.f('fk_attendance_marked_by_id_users'), ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('event_id', 'child_id', name=op.f('pk_attendance'))
    )
    op.create_index(op.f('ix_attendance_child_id'), 'attendance', ['child_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_attendance_child_id'), table_name='attendance')
    op.drop_table('attendance')
