from pydantic import BaseModel, ConfigDict, Field

from app.schemas.types import LocalDateTime


class TagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class DocumentRead(BaseModel):
    id: int
    title: str
    school_year: str
    group_id: int | None
    group_name: str
    filename: str
    mime_type: str
    size: int
    tags: list[TagRead]
    created_by: str | None
    created_at: LocalDateTime
    # False: no se pudo sacar texto (p. ej. PDF escaneado) y solo se busca por título y etiquetas
    has_text: bool
    # Solo al buscar: trozo del texto con lo encontrado entre <mark> y </mark>
    snippet: str | None = None
    # Quien lo subió, los coordinadores y el admin pueden editarlo y eliminarlo
    can_edit: bool


class DocumentUpdate(BaseModel):
    """Solo se cambia lo que se envía. El fichero no se puede cambiar."""

    title: str | None = Field(default=None, min_length=1, max_length=200, pattern=r"\S")
    school_year: str | None = None
    group_id: int | None = None
    tags: list[str] | None = None


class LibraryFilters(BaseModel):
    """Valores usados en la biblioteca, para los filtros de la pantalla."""

    school_years: list[str]
    groups: list[str]
    tags: list[TagRead]
