from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Table, func, select
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from app.db.base import Base
from app.models.user import Role, User

# Roles que pueden ser responsables de un grupo (ver y gestionar sus niños)
GROUP_MEMBER_ROLES = {Role.MONITOR, Role.COORDINADOR}

group_members = Table(
    "group_members",
    Base.metadata,
    Column("group_id", ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)


class Group(Base):
    __tablename__ = "groups"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    members: Mapped[list[User]] = relationship(
        secondary=group_members, order_by=User.full_name, lazy="selectin"
    )
    # passive_deletes: la BD borra los niños en cascada (ON DELETE CASCADE)
    children: Mapped[list["Child"]] = relationship(
        back_populates="group",
        order_by="Child.full_name",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def is_managed_by(self, user: User) -> bool:
        """Admin, o responsable del grupo con un rol que lo permite."""
        if user.role == Role.ADMIN:
            return True
        return user.role in GROUP_MEMBER_ROLES and any(m.id == user.id for m in self.members)


class Child(Base):
    __tablename__ = "children"

    id: Mapped[int] = mapped_column(primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("groups.id", ondelete="CASCADE"), index=True)
    full_name: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    group: Mapped[Group] = relationship(back_populates="children")


# Número de niños sin cargarlos (la lista de grupos la ve cualquiera)
Group.children_count = column_property(
    select(func.count(Child.id)).where(Child.group_id == Group.id).scalar_subquery()
)
