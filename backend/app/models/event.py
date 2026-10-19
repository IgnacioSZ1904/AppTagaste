from datetime import datetime
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Table,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.group import Group


class EventType(StrEnum):
    REUNION = "reunion"
    CONVIVENCIA = "convivencia"
    EUCARISTIA = "eucaristia"
    OTRO = "otro"


# Grupos de cada evento; un evento sin grupos es general (sale en el calendario de todos)
event_groups = Table(
    "event_groups",
    Base.metadata,
    Column("event_id", ForeignKey("events.id", ondelete="CASCADE"), primary_key=True),
    Column("group_id", ForeignKey("groups.id", ondelete="CASCADE"), primary_key=True, index=True),
)


class Event(Base):
    __tablename__ = "events"
    __table_args__ = (CheckConstraint("ends_at > starts_at", name="ends_after_start"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150))
    description: Mapped[str | None] = mapped_column(Text)
    type: Mapped[EventType] = mapped_column(
        Enum(
            EventType,
            name="event_type",
            native_enum=False,
            create_constraint=True,
            length=20,
            values_callable=lambda types: [t.value for t in types],
        )
    )
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    location: Mapped[str | None] = mapped_column(String(150))
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    groups: Mapped[list[Group]] = relationship(
        secondary=event_groups, order_by=Group.name, lazy="selectin"
    )
