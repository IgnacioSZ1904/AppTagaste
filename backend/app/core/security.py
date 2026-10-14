from datetime import UTC, datetime, timedelta

import jwt

from app.core.config import get_settings

ALGORITHM = "HS256"


def create_access_token(user_id: int) -> str:
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int | None:
    """Devuelve el id del usuario o None si el token no es válido o ha caducado."""
    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (jwt.InvalidTokenError, KeyError, ValueError):
        return None
