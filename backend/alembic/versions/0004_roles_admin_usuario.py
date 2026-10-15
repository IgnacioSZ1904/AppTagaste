"""roles: admin y usuario; los coordinadores actuales pasan a admin

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-15 17:00:00.000000

"""
from collections.abc import Sequence

from alembic import op


revision: str = '0004'
down_revision: str | None = '0003'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.drop_constraint(op.f('ck_users_role'), 'users', type_='check')
    op.create_check_constraint(
        op.f('ck_users_role'), 'users', "role IN ('admin', 'coordinador', 'monitor', 'usuario')"
    )
    op.execute("UPDATE users SET role = 'admin' WHERE role = 'coordinador'")


def downgrade() -> None:
    # Sin borrar datos: admin vuelve a coordinador y usuario pasa a monitor
    op.execute("UPDATE users SET role = 'coordinador' WHERE role = 'admin'")
    op.execute("UPDATE users SET role = 'monitor' WHERE role = 'usuario'")
    op.drop_constraint(op.f('ck_users_role'), 'users', type_='check')
    op.create_check_constraint(op.f('ck_users_role'), 'users', "role IN ('coordinador', 'monitor')")
