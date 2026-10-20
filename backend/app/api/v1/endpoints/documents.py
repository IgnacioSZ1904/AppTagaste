from typing import Annotated
from urllib.parse import quote

from fastapi import APIRouter, File, Form, Query, Response, UploadFile, status

from app.api.deps import DbSession, Librarian
from app.core.errors import ForbiddenError, NotFoundError
from app.core.openapi import errors
from app.models.document import Document
from app.models.user import User
from app.schemas.document import DocumentRead, DocumentUpdate, LibraryFilters, TagRead
from app.services import documents as documents_service

router = APIRouter(tags=["documents"], responses=errors(401, 403, 422))


@router.post(
    "/documents",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Añadir un documento",
    responses=errors(409, 413),
)
def create_document(
    db: DbSession,
    user: Librarian,
    file: Annotated[UploadFile, File(description="PDF o Word (.docx), máx. 10 MB")],
    school_year: Annotated[str, Form(description="Curso escolar, p. ej. 2025-2026")],
    group_id: Annotated[int, Form()],
    title: Annotated[str | None, Form(description="Por defecto, el nombre del fichero")] = None,
    tags: Annotated[str, Form(description="Etiquetas separadas por comas")] = "",
    drive_file_id: Annotated[
        str | None, Form(description="Id del fichero en Drive, si viene de allí")
    ] = None,
) -> dict:
    # Se lee un byte de más para saber si pasa del límite sin cargar ficheros enormes
    content = file.file.read(documents_service.MAX_SIZE + 1)
    document = documents_service.create_document(
        db,
        user,
        content=content,
        filename=file.filename or "documento",
        title=title,
        school_year=school_year,
        group_id=group_id,
        tag_names=tags.split(","),
        drive_file_id=drive_file_id,
    )
    return documents_service.to_read(document, user, bool(document.content_text))


@router.get("/documents", response_model=list[DocumentRead], summary="Listar y buscar documentos")
def list_documents(
    db: DbSession,
    user: Librarian,
    school_year: str | None = None,
    group: Annotated[str | None, Query(description="Nombre del grupo")] = None,
    tag: Annotated[list[str] | None, Query(description="Varias = los que tienen todas")] = None,
    q: Annotated[
        str | None,
        Query(
            max_length=200,
            description='Buscador: palabras (todas), "frase exacta"; ordena por relevancia',
        ),
    ] = None,
) -> list[dict]:
    rows = documents_service.list_documents(db, school_year, group, tag, q)
    return [
        documents_service.to_read(document, user, found, snippet)
        for document, found, snippet in rows
    ]


# Antes de /documents/{document_id} para que "filters" no se tome como id
@router.get(
    "/documents/filters", response_model=LibraryFilters, summary="Cursos, grupos y etiquetas usados"
)
def library_filters(db: DbSession, _: Librarian) -> dict:
    return documents_service.library_filters(db)


def get_document_or_404(document_id: int, db: DbSession) -> Document:
    document = db.get(Document, document_id)
    if document is None:
        raise NotFoundError("Documento no encontrado")
    return document


@router.get(
    "/documents/{document_id}",
    response_model=DocumentRead,
    summary="Ver un documento",
    responses=errors(404),
)
def get_document(document_id: int, db: DbSession, user: Librarian) -> dict:
    document = get_document_or_404(document_id, db)
    return documents_service.to_read(document, user, bool(document.content_text))


def editable_document_or_403(document_id: int, db: DbSession, user: User) -> Document:
    document = get_document_or_404(document_id, db)
    if not documents_service.can_edit(user, document):
        raise ForbiddenError("Solo quien lo subió, los coordinadores y el admin pueden cambiarlo")
    return document


@router.patch(
    "/documents/{document_id}",
    response_model=DocumentRead,
    summary="Editar título, curso, grupo o etiquetas",
    responses=errors(404),
)
def update_document(
    document_id: int, payload: DocumentUpdate, db: DbSession, user: Librarian
) -> dict:
    document = editable_document_or_403(document_id, db, user)
    documents_service.update_document(
        db,
        document,
        title=payload.title,
        school_year=payload.school_year,
        group_id=payload.group_id,
        tag_names=payload.tags,
    )
    return documents_service.to_read(document, user, bool(document.content_text))


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un documento",
    responses=errors(404),
)
def delete_document(document_id: int, db: DbSession, user: Librarian) -> None:
    documents_service.delete_document(db, editable_document_or_403(document_id, db, user))


@router.get(
    "/documents/{document_id}/file",
    response_class=Response,
    summary="Abrir la copia del fichero",
    responses={
        200: {"content": {"application/pdf": {}}, "description": "Copia del fichero"},
        **errors(404),
    },
)
def document_file(document_id: int, db: DbSession, _: Librarian) -> Response:
    document = get_document_or_404(document_id, db)
    return Response(
        content=document.file.content,
        media_type=document.mime_type,
        # inline: el navegador abre los PDF en vez de descargarlos
        headers={"Content-Disposition": f"inline; filename*=UTF-8''{quote(document.filename)}"},
    )


@router.get("/tags", response_model=list[TagRead], summary="Listar todas las etiquetas")
def list_tags(db: DbSession, _: Librarian) -> list:
    return documents_service.list_tags(db)
