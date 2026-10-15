from dataclasses import dataclass

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core.config import get_settings


class InvalidGoogleTokenError(Exception):
    """El token de Google no es válido, ha caducado o no es para esta app."""


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
