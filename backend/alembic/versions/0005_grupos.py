"""grupos: grupos, responsables y niños

Revision ID: 0005
Revises: 0004
Create Date: 2026-10-19 16:38:14.899073

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '0005'
down_revision: str | None = '0004'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('groups',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=80), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_groups')),
    sa.UniqueConstraint('name', name=op.f('uq_groups_name'))
    )
    op.create_table('children',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('group_id', sa.Integer(), nullable=False),
    sa.Column('full_name', sa.String(length=120), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], name=op.f('fk_children_group_id_groups'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_children'))
    )
    op.create_index(op.f('ix_children_group_id'), 'children', ['group_id'], unique=False)
    op.create_table('group_members',
    sa.Column('group_id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['group_id'], ['groups.id'], name=op.f('fk_group_members_group_id_groups'), ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_group_members_user_id_users'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('group_id', 'user_id', name=op.f('pk_group_members'))
    )


def downgrade() -> None:
    op.drop_table('group_members')
    op.drop_index(op.f('ix_children_group_id'), table_name='children')
    op.drop_table('children')
    op.drop_table('groups')
