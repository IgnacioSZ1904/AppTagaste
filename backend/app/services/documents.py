import io
import re
import unicodedata
import zipfile
from datetime import datetime
from zoneinfo import ZoneInfo

from sqlalchemy import ColumnElement, Select, func, literal, select, text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.document import Document, DocumentFile, Tag, document_tags
from app.models.group import Group
from app.models.user import Role, User
from app.services.text_extraction import DOCX, PDF, extract_text

MAX_SIZE = 10 * 1024 * 1024
# Español sin tildes (migración 0010): "perdon" encuentra "perdón" y "perdonar"
SEARCH_CONFIG = "es_unaccent"
SNIPPET_OPTIONS = "StartSel=<mark>, StopSel=</mark>, MinWords=10, MaxWords=30"
# Título y etiquetas (A) pesan más que el texto (C)
UPDATE_SEARCH_VECTOR = text(
    """
    UPDATE documents AS d SET search_vector =
        setweight(to_tsvector('es_unaccent', d.title), 'A')
        || setweight(to_tsvector('es_unaccent', coalesce((
            SELECT string_agg(t.name, ' ') FROM tags AS t
            JOIN document_tags AS dt ON dt.tag_id = t.id
            WHERE dt.document_id = d.id), '')), 'A')
        || setweight(to_tsvector('es_unaccent', coalesce(d.content_text, '')), 'C')
    WHERE d.id = :id
    """
)


class FileTooLargeError(Exception):
    pass


class UnsupportedFileError(Exception):
    """Solo PDF y Word (.docx)."""


class InvalidSchoolYearError(Exception):
    pass


class UnknownGroupError(Exception):
    pass


class DuplicateDriveFileError(Exception):
    """El fichero de Drive ya está en la biblioteca."""

    def __init__(self, existing: Document) -> None:
        super().__init__(existing.id)
        self.existing = existing


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
    if drive_file_id:
        existing = db.scalar(select(Document).where(Document.drive_file_id == drive_file_id))
        if existing is not None:
            raise DuplicateDriveFileError(existing)
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
        drive_file_id=drive_file_id or None,
        created_by_id=user.id,
        tags=resolve_tags(db, tag_names),
        file=DocumentFile(content=content),
    )
    db.add(document)
    index_document(db, document, content)
    db.commit()
    db.refresh(document)
    return document


def can_edit(user: User, document: Document) -> bool:
    """Quien lo subió, los coordinadores y el admin."""
    return user.role in (Role.ADMIN, Role.COORDINADOR) or document.created_by_id == user.id


def update_document(
    db: Session,
    document: Document,
    *,
    title: str | None = None,
    school_year: str | None = None,
    group_id: int | None = None,
    tag_names: list[str] | None = None,
) -> Document:
    """Cambia los datos del documento (no el fichero). None = no se toca."""
    if title is not None:
        document.title = title.strip()
    if school_year is not None:
        document.school_year = check_school_year(school_year)
    if group_id is not None and group_id != document.group_id:
        group = db.get(Group, group_id)
        if group is None:
            raise UnknownGroupError(group_id)
        document.group_id = group.id
        document.group_name = group.name
    if tag_names is not None:
        document.tags = resolve_tags(db, tag_names)
    db.flush()
    # Título y etiquetas cuentan en el buscador
    db.execute(UPDATE_SEARCH_VECTOR, {"id": document.id})
    db.commit()
    db.refresh(document)
    return document


def delete_document(db: Session, document: Document) -> None:
    """Borra el documento con su fichero; un fichero de Drive se podrá volver a añadir."""
    db.delete(document)
    db.commit()


def index_document(db: Session, document: Document, content: bytes) -> None:
    """Extrae el texto del fichero y actualiza el índice del buscador."""
    document.content_text = extract_text(content, document.mime_type)
    db.flush()
    db.execute(UPDATE_SEARCH_VECTOR, {"id": document.id})


def reindex_all(db: Session) -> tuple[int, int]:
    """Vuelve a indexar todos los documentos. Devuelve (total, sin texto)."""
    total = without_text = 0
    for document in db.scalars(select(Document).order_by(Document.id)):
        index_document(db, document, document.file.content)
        db.commit()
        total += 1
        without_text += not document.content_text
    return total, without_text


def search_query(q: str) -> ColumnElement:
    """Palabras sin tildes y con variantes, "frase exacta" y la última palabra empezada."""
    q = q.strip()
    last = re.search(r"(?<![-\w])[^\W_]+$", q)
    if q.endswith('"') or last is None or last[0].lower() == "or":
        return func.websearch_to_tsquery(SEARCH_CONFIG, q)
    return func.websearch_to_tsquery(SEARCH_CONFIG, q[: last.start()]).op("&&")(
        func.to_tsquery(SEARCH_CONFIG, literal(last[0] + ":*"))
    )


def list_documents(
    db: Session,
    school_year: str | None = None,
    group_name: str | None = None,
    tag_names: list[str] | None = None,
    q: str | None = None,
) -> list[tuple[Document, bool, str | None]]:
    """(documento, tiene texto, fragmento). Con `q`, ordenados por relevancia."""
    text_found = func.coalesce(Document.content_text, "") != ""
    if q and q.strip():
        tsquery = search_query(q)
        snippet = func.ts_headline(
            SEARCH_CONFIG, func.coalesce(Document.content_text, ""), tsquery, SNIPPET_OPTIONS
        )
        query: Select = (
            select(Document, text_found, snippet)
            .where(Document.search_vector.op("@@")(tsquery))
            .order_by(func.ts_rank(Document.search_vector, tsquery).desc())
        )
    else:
        query = select(Document, text_found, literal(None))
    if school_year:
        query = query.where(Document.school_year == school_year)
    if group_name:
        query = query.where(Document.group_name == group_name)
    # Varias etiquetas: los documentos que tienen todas
    for slug in {slugify(t) for t in tag_names or [] if slugify(t)}:
        query = query.where(Document.tags.any(Tag.slug == slug))
    rows = db.execute(query.order_by(Document.created_at.desc(), Document.id.desc()))
    return [(document, found, snippet or None) for document, found, snippet in rows]


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


def to_read(document: Document, user: User, text_found: bool, snippet: str | None = None) -> dict:
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
        "has_text": text_found,
        "snippet": snippet,
        "can_edit": can_edit(user, document),
    }
