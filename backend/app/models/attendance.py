from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import User


class Attendance(Base):
    """Asistencia de un niño a un evento. Sin fila = aún no se ha pasado lista."""

    __tablename__ = "attendance"

    event_id: Mapped[int] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), primary_key=True
    )
    child_id: Mapped[int] = mapped_column(
        ForeignKey("children.id", ondelete="CASCADE"), primary_key=True, index=True
    )
    present: Mapped[bool]
    marked_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    marked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    marked_by: Mapped[User | None] = relationship()
