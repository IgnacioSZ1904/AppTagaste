"""Errores de la API: los servicios lanzan AppError y un único manejador los convierte en JSON."""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Error esperado de la app: estado HTTP y mensaje para el usuario."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    detail: str = "Error interno del servidor"

    def __init__(self, detail: str | None = None) -> None:
        if detail is not None:
            self.detail = detail
        super().__init__(self.detail)


class BadRequestError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "No autenticado"


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    detail = "Permiso denegado"


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "No encontrado"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT


class ContentTooLargeError(AppError):
    status_code = status.HTTP_413_CONTENT_TOO_LARGE


class UnprocessableError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT


class ServiceUnavailableError(AppError):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE


# Mensajes de Pydantic más comunes, en español ({…} se rellena con el contexto del error)
VALIDATION_MESSAGES = {
    "missing": "es obligatorio",
    "string_type": "debe ser texto",
    "string_too_short": "debe tener al menos {min_length} carácter(es)",
    "string_too_long": "no puede tener más de {max_length} caracteres",
    "string_pattern_mismatch": "no tiene un formato válido",
    "int_type": "debe ser un número entero",
    "int_parsing": "debe ser un número entero",
    "bool_parsing": "debe ser verdadero o falso",
    "list_type": "debe ser una lista",
    "enum": "debe ser uno de: {expected}",
    "literal_error": "debe ser uno de: {expected}",
    "date_parsing": "fecha no válida (AAAA-MM-DD)",
    "date_from_datetime_parsing": "fecha no válida (AAAA-MM-DD)",
    "datetime_parsing": "fecha y hora no válidas (AAAA-MM-DD HH:MM)",
    "datetime_from_date_parsing": "fecha y hora no válidas (AAAA-MM-DD HH:MM)",
    "greater_than_equal": "debe ser mayor o igual que {ge}",
    "less_than_equal": "debe ser menor o igual que {le}",
    "json_invalid": "JSON no válido",
}
LOCATIONS = {"body", "query", "path", "header", "cookie"}


def validation_message(error: dict) -> str:
    template = VALIDATION_MESSAGES.get(error["type"])
    if template is None:
        # Validadores propios: el mensaje ya está en español
        message = str(error["msg"]).removeprefix("Value error, ")
    else:
        message = template.format(**error.get("ctx", {}))
    field = ".".join(str(part) for part in error["loc"] if part not in LOCATIONS)
    return f"{field}: {message}" if field else message


async def app_error_handler(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, AppError)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


async def validation_error_handler(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    detail = "; ".join(validation_message(error) for error in exc.errors())
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, content={"detail": detail}
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
