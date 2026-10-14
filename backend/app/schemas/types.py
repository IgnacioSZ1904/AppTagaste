from datetime import datetime
from typing import Annotated
from zoneinfo import ZoneInfo

from pydantic import AfterValidator, PlainSerializer, WithJsonSchema

from app.core.config import get_settings

LOCAL_FORMAT = "%Y-%m-%d %H:%M"


def _local_zone() -> ZoneInfo:
    return ZoneInfo(get_settings().timezone)


def _to_local(value: datetime) -> datetime:
    """Sin zona → hora local (España). Con zona → se convierte a hora local."""
    zone = _local_zone()
    if value.tzinfo is None:
        return value.replace(tzinfo=zone)
    return value.astimezone(zone)


def _format_local(value: datetime) -> str:
    return value.astimezone(_local_zone()).strftime(LOCAL_FORMAT)


# Fecha y hora en formato simple de 24 h y hora de España: "2026-11-13 17:00"
LocalDateTime = Annotated[
    datetime,
    AfterValidator(_to_local),
    PlainSerializer(_format_local, return_type=str, when_used="json"),
    WithJsonSchema({"type": "string", "example": "2026-11-13 17:00"}),
]
