import io
import re
import unicodedata
import zipfile
from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.document import Document, DocumentFile, Tag, document_tags
from app.models.group import Group
from app.models.user import User

MAX_SIZE = 10 * 1024 * 1024
PDF = "application/pdf"
DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


class FileTooLargeError(Exception):
    pass


class UnsupportedFileError(Exception):
    """Solo PDF y Word (.docx)."""


class InvalidSchoolYearError(Exception):
    pass


class UnknownGroupError(Exception):
    pass


def slugify(text: str) -> str:
    """ "  Perdón " → "perdon": sin tildes, en minúsculas y con espacios simples."""
    plain = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", plain).strip().lower()


def current_school_year() -> str:
    today = datetime.now(ZoneInfo(get_settings().timezone)).date()
    start = today.year if today.month >= 9 else today.year - 1
    return f"{start}-{start + 1}"


def check_school_year(value: str) -> str:
    """ "2025-2026": años seguidos y no posterior al curso actual."""
    match = re.fullmatch(r"(\d{4})-(\d{4})", value.strip())
    if not match or int(match[2]) != int(match[1]) + 1 or value.strip() > current_school_year():
        raise InvalidSchoolYearError(value)
    return value.strip()


def detect_mime(content: bytes) -> str:
    """Tipo según los primeros bytes, no según el nombre que manda el navegador."""
    if content.startswith(b"%PDF-"):
        return PDF
    if content.startswith(b"PK\x03\x04"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as archive:
                if "word/document.xml" in archive.namelist():
                    return DOCX
        except zipfile.BadZipFile:
            pass
    raise UnsupportedFileError()


def resolve_tags(db: Session, names: list[str]) -> list[Tag]:
    """Etiquetas por nombre; las nuevas se crean ("Perdón" y "perdon" son la misma)."""
    tags: dict[str, Tag] = {}
    for name in names:
        slug = slugify(name)[:50]
        if not slug or slug in tags:
            continue
        tag = db.scalar(select(Tag).where(Tag.slug == slug))
        if tag is None:
            tag = Tag(name=re.sub(r"\s+", " ", name).strip()[:50], slug=slug)
            db.add(tag)
        tags[slug] = tag
    return list(tags.values())


def create_document(
    db: Session,
    user: User,
    *,
    content: bytes,
    filename: str,
    title: str | None,
    school_year: str,
    group_id: int,
    tag_names: list[str],
    drive_file_id: str | None = None,
) -> Document:
    if len(content) > MAX_SIZE:
        raise FileTooLargeError()
    mime_type = detect_mime(content)
    year = check_school_year(school_year)
    group = db.get(Group, group_id)
    if group is None:
        raise UnknownGroupError(group_id)
    document = Document(
        title=(title or "").strip() or filename.rsplit(".", 1)[0],
        school_year=year,
        group_id=group.id,
        group_name=group.name,
        filename=filename,
        mime_type=mime_type,
        size=len(content),
        drive_file_id=drive_file_id,
        created_by_id=user.id,
        tags=resolve_tags(db, tag_names),
        file=DocumentFile(content=content),
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def list_documents(
    db: Session,
    school_year: str | None = None,
    group_name: str | None = None,
    tag_names: list[str] | None = None,
) -> list[Document]:
    query: Select[tuple[Document]] = select(Document)
    if school_year:
        query = query.where(Document.school_year == school_year)
    if group_name:
        query = query.where(Document.group_name == group_name)
    # Varias etiquetas: los documentos que tienen todas
    for slug in {slugify(t) for t in tag_names or [] if slugify(t)}:
        query = query.where(Document.tags.any(Tag.slug == slug))
    return list(db.scalars(query.order_by(Document.created_at.desc(), Document.id.desc())))


def library_filters(db: Session) -> dict:
    used_tags = select(document_tags.c.tag_id)
    return {
        "school_years": list(
            db.scalars(
                select(Document.school_year).distinct().order_by(Document.school_year.desc())
            )
        ),
        "groups": list(
            db.scalars(select(Document.group_name).distinct().order_by(Document.group_name))
        ),
        "tags": list(db.scalars(select(Tag).where(Tag.id.in_(used_tags)).order_by(Tag.slug))),
    }


def list_tags(db: Session) -> list[Tag]:
    return list(db.scalars(select(Tag).order_by(Tag.slug)))


def to_read(document: Document) -> dict:
    return {
        "id": document.id,
        "title": document.title,
        "school_year": document.school_year,
        "group_id": document.group_id,
        "group_name": document.group_name,
        "filename": document.filename,
        "mime_type": document.mime_type,
        "size": document.size,
        "tags": document.tags,
        "created_by": document.created_by.full_name if document.created_by else None,
        "created_at": document.created_at,
    }
