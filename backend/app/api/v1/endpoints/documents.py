from typing import Annotated
from urllib.parse import quote

from fastapi import APIRouter, File, Form, HTTPException, Query, Response, UploadFile, status

from app.api.deps import DbSession, Librarian
from app.models.document import Document
from app.schemas.document import DocumentRead, LibraryFilters, TagRead
from app.services import documents as documents_service

router = APIRouter(tags=["documents"])


@router.post("/documents", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
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
    try:
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
    except documents_service.DuplicateDriveFileError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya está en la biblioteca: «{error.existing.title}»",
        ) from None
    except documents_service.FileTooLargeError:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="El fichero no puede pasar de 10 MB",
        ) from None
    except documents_service.UnsupportedFileError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Solo se admiten PDF y Word (.docx)",
        ) from None
    except documents_service.InvalidSchoolYearError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Curso escolar no válido (formato 2025-2026, no posterior al actual)",
        ) from None
    except documents_service.UnknownGroupError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Grupo no encontrado"
        ) from None
    return documents_service.to_read(document)


@router.get("/documents", response_model=list[DocumentRead])
def list_documents(
    db: DbSession,
    _: Librarian,
    school_year: str | None = None,
    group: Annotated[str | None, Query(description="Nombre del grupo")] = None,
    tag: Annotated[list[str] | None, Query(description="Varias = los que tienen todas")] = None,
) -> list[dict]:
    documents = documents_service.list_documents(db, school_year, group, tag)
    return [documents_service.to_read(d) for d in documents]


# Antes de /documents/{document_id} para que "filters" no se tome como id
@router.get("/documents/filters", response_model=LibraryFilters)
def library_filters(db: DbSession, _: Librarian) -> dict:
    return documents_service.library_filters(db)


def get_document_or_404(document_id: int, db: DbSession) -> Document:
    document = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Documento no encontrado")
    return document


@router.get("/documents/{document_id}", response_model=DocumentRead)
def get_document(document_id: int, db: DbSession, _: Librarian) -> dict:
    return documents_service.to_read(get_document_or_404(document_id, db))


@router.get(
    "/documents/{document_id}/file",
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}, "description": "Copia del fichero"}},
)
def document_file(document_id: int, db: DbSession, _: Librarian) -> Response:
    document = get_document_or_404(document_id, db)
    return Response(
        content=document.file.content,
        media_type=document.mime_type,
        # inline: el navegador abre los PDF en vez de descargarlos
        headers={"Content-Disposition": f"inline; filename*=UTF-8''{quote(document.filename)}"},
    )


@router.get("/tags", response_model=list[TagRead])
def list_tags(db: DbSession, _: Librarian) -> list:
    return documents_service.list_tags(db)
