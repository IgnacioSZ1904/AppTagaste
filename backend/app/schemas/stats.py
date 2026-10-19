from datetime import date

from pydantic import BaseModel, Field

from app.schemas.types import LocalDateTime


class EventStats(BaseModel):
    event_id: int
    title: str
    starts_at: LocalDateTime
    present: int
    absent: int
    # False = aún no se ha pasado lista en este evento
    taken: bool


class ChildStats(BaseModel):
    child_id: int
    full_name: str
    present: int
    absent: int
    # % de asistencia; None si no hay ninguna lista pasada
    rate: int | None


class GroupStats(BaseModel):
    group_id: int
    from_: date = Field(serialization_alias="from")
    to: date
    events: list[EventStats]
    children: list[ChildStats]


class GroupSummary(BaseModel):
    group_id: int
    name: str
    children_count: int
    events_taken: int
    rate: int | None
