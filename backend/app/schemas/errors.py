from pydantic import BaseModel


class ErrorRead(BaseModel):
    """Respuesta de error de la API."""

    detail: str
    # Solo en los 500: referencia para buscar el error en el log
    request_id: str | None = None
