from datetime import datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EventType(StrEnum):
    REUNION = "reunion"
    CONVIVENCIA = "convivencia"
    EUCARISTIA = "eucaristia"
    OTRO = "otro"


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
