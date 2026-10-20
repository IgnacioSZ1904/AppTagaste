from datetime import datetime

from sqlalchemy import ColumnElement, or_, select
from sqlalchemy.orm import Session

from app.core.errors import UnprocessableError
from app.models.event import Event, EventType
from app.models.group import Group
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate


class InvalidEventRangeError(UnprocessableError):
    detail = "La fecha de fin debe ser posterior a la de inicio"


class UnknownGroupError(UnprocessableError):
    """Alguno de los grupos indicados no existe."""

    def __init__(self, group_ids: list[int]) -> None:
        self.group_ids = group_ids
        super().__init__("No existe el grupo: " + ", ".join(str(i) for i in group_ids))


def in_group(group_id: int) -> ColumnElement[bool]:
    """Eventos del grupo más los generales (sin grupos)."""
    return or_(~Event.groups.any(), Event.groups.any(Group.id == group_id))


def resolve_groups(db: Session, group_ids: list[int]) -> list[Group]:
    ids = set(group_ids)
    groups = list(db.scalars(select(Group).where(Group.id.in_(ids)))) if ids else []
    missing = ids - {g.id for g in groups}
    if missing:
        raise UnknownGroupError(sorted(missing))
    return groups


def list_events(
    db: Session,
    from_: datetime | None = None,
    to: datetime | None = None,
    type_: EventType | None = None,
    group_id: int | None = None,
) -> list[Event]:
    query = select(Event).order_by(Event.starts_at, Event.id)
    # Rango [from_, to): incluye los eventos que se solapan con él, no solo los que empiezan dentro
    if from_ is not None:
        query = query.where(Event.ends_at > from_)
    if to is not None:
        query = query.where(Event.starts_at < to)
    if type_ is not None:
        query = query.where(Event.type == type_)
    if group_id is not None:
        query = query.where(in_group(group_id))
    return list(db.scalars(query))


def create_event(db: Session, data: EventCreate, author: User) -> Event:
    groups = resolve_groups(db, data.group_ids)
    event = Event(**data.model_dump(exclude={"group_ids"}), groups=groups, created_by_id=author.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event: Event, data: EventUpdate) -> Event:
    changes = data.model_dump(exclude_unset=True, exclude={"group_ids"})
    starts_at = changes.get("starts_at", event.starts_at)
    ends_at = changes.get("ends_at", event.ends_at)
    if ends_at <= starts_at:
        raise InvalidEventRangeError
    if data.group_ids is not None:
        event.groups = resolve_groups(db, data.group_ids)
    for field, value in changes.items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event: Event) -> None:
    db.delete(event)
    db.commit()
