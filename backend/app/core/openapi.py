"""Textos de la documentación OpenAPI (/docs)."""

from typing import Any

from app.schemas.errors import ErrorRead

DESCRIPTION = """
API de **AppTagaste**: organización de la catequesis de un colegio.

- **Autenticación:** `POST /auth/google` con el ID token de Google devuelve un JWT propio;
  el resto de rutas lo piden como `Authorization: Bearer <token>`.
- **Roles:** admin, coordinador, monitor y usuario. Cada ruta indica quién puede usarla.
- **Fechas:** hora de España en formato `AAAA-MM-DD HH:MM`.
- **Errores:** siempre `{"detail": "mensaje"}` en español; los 500 añaden `request_id`, que
  también va en la cabecera `X-Request-ID` de todas las respuestas.
"""

TAGS = [
    {"name": "health", "description": "Estado de la API y de la base de datos."},
    {"name": "auth", "description": "Inicio de sesión con Google y usuario actual."},
    {"name": "users", "description": "Gestión de usuarios y roles (solo admin)."},
    {"name": "events", "description": "Eventos del calendario. Editan admin y coordinadores."},
    {"name": "calendar", "description": "Feed iCal público para suscribirse al calendario."},
    {
        "name": "groups",
        "description": "Grupos, sus responsables y sus niños (los niños, solo admin y "
        "responsables del grupo).",
    },
    {"name": "attendance", "description": "Pase de lista de un evento de un grupo."},
    {"name": "stats", "description": "Estadísticas de asistencia (admin y coordinadores)."},
    {
        "name": "documents",
        "description": "Biblioteca de recursos: subir, buscar, abrir, editar y eliminar "
        "documentos (admin, coordinadores y monitores).",
    },
]

ERROR_DESCRIPTIONS = {
    400: "Petición no válida",
    401: "No autenticado o token no válido",
    403: "Sin permiso",
    404: "No encontrado",
    409: "Conflicto con lo que ya existe",
    413: "Fichero demasiado grande",
    422: "Datos no válidos",
    503: "Servicio no disponible",
}


def errors(*codes: int) -> dict[int | str, dict[str, Any]]:
    """Respuestas de error para `responses=` de una ruta o un router."""
    return {code: {"model": ErrorRead, "description": ERROR_DESCRIPTIONS[code]} for code in codes}
