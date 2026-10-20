import logging
from dataclasses import dataclass

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core.config import get_settings
from app.core.errors import UnauthorizedError

logger = logging.getLogger(__name__)


class InvalidGoogleTokenError(UnauthorizedError):
    """El token de Google no es válido, ha caducado o no es para esta app."""

    def __init__(self, reason: str) -> None:
        # El motivo va al log; al usuario, un mensaje genérico
        self.reason = reason
        logger.warning("Token de Google rechazado: %s", reason)
        super().__init__("Token de Google no válido")


@dataclass(frozen=True)
class GoogleIdentity:
    sub: str
    email: str
    name: str


def verify_google_token(token: str) -> GoogleIdentity:
    """Verifica el ID token de Google (firma, audiencia, emisor y caducidad)."""
    client_id = get_settings().google_client_id
    if not client_id:
        raise InvalidGoogleTokenError("GOOGLE_CLIENT_ID no está configurado")
    try:
        claims = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
    except ValueError as exc:
        raise InvalidGoogleTokenError(str(exc)) from exc
    if not claims.get("email_verified"):
        raise InvalidGoogleTokenError("El email de Google no está verificado")
    return GoogleIdentity(
        sub=claims["sub"], email=claims["email"].lower(), name=claims.get("name", "")
    )
