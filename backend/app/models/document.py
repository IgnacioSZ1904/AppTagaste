from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Table,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import User

document_tags = Table(
    "document_tags",
    Base.metadata,
    Column("document_id", ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True, index=True),
)


class Tag(Base):
    """Temática de la biblioteca. `slug` sin tildes ni mayúsculas: "Perdón" = "perdon"."""

    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    slug: Mapped[str] = mapped_column(String(50), unique=True)


class Document(Base):
    """Recurso de la biblioteca, de solo lectura: se edita en Drive y se sube terminado."""

    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    school_year: Mapped[str] = mapped_column(String(9), index=True)
    # El nombre del grupo se copia para que el documento siga clasificado si se borra el grupo
    group_id: Mapped[int | None] = mapped_column(ForeignKey("groups.id", ondelete="SET NULL"))
    group_name: Mapped[str] = mapped_column(String(80), index=True)
    filename: Mapped[str] = mapped_column(String(255))
    mime_type: Mapped[str] = mapped_column(String(100))
    size: Mapped[int] = mapped_column(Integer)
    drive_file_id: Mapped[str | None] = mapped_column(String(100))
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    created_by: Mapped[User | None] = relationship(lazy="selectin")
    tags: Mapped[list[Tag]] = relationship(
        secondary=document_tags, order_by=Tag.slug, lazy="selectin"
    )
    file: Mapped["DocumentFile"] = relationship(cascade="all, delete-orphan", passive_deletes=True)


class DocumentFile(Base):
    """Copia del fichero, en tabla aparte para que los listados no la carguen."""

    __tablename__ = "document_files"

    document_id: Mapped[int] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True
    )
    content: Mapped[bytes] = mapped_column(LargeBinary)
