from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Role(StrEnum):
    ADMIN = "admin"  # todo + gestión de usuarios
    COORDINADOR = "coordinador"  # CRUD de eventos
    MONITOR = "monitor"
    USUARIO = "usuario"  # solo ver el calendario; alta automática con Google


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    full_name: Mapped[str] = mapped_column(String(120))
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True)
    role: Mapped[Role] = mapped_column(
        # VARCHAR + CHECK (no enum nativo): añadir roles será una migración sencilla
        Enum(
            Role,
            name="role",
            native_enum=False,
            create_constraint=True,
            length=20,
            values_callable=lambda roles: [r.value for r in roles],
        )
    )
    is_active: Mapped[bool] = mapped_column(default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
