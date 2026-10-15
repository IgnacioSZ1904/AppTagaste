from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event, EventType
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate


class InvalidEventRangeError(Exception):
    """La fecha de fin no es posterior a la de inicio."""


def list_events(
    db: Session,
    from_: datetime | None = None,
    to: datetime | None = None,
    type_: EventType | None = None,
) -> list[Event]:
    query = select(Event).order_by(Event.starts_at, Event.id)
    # Rango [from_, to): incluye los eventos que se solapan con él, no solo los que empiezan dentro
    if from_ is not None:
        query = query.where(Event.ends_at > from_)
    if to is not None:
        query = query.where(Event.starts_at < to)
    if type_ is not None:
        query = query.where(Event.type == type_)
    return list(db.scalars(query))


def create_event(db: Session, data: EventCreate, author: User) -> Event:
    event = Event(**data.model_dump(), created_by_id=author.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def update_event(db: Session, event: Event, data: EventUpdate) -> Event:
    changes = data.model_dump(exclude_unset=True)
    starts_at = changes.get("starts_at", event.starts_at)
    ends_at = changes.get("ends_at", event.ends_at)
    if ends_at <= starts_at:
        raise InvalidEventRangeError
    for field, value in changes.items():
        setattr(event, field, value)
    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, event: Event) -> None:
    db.delete(event)
    db.commit()
