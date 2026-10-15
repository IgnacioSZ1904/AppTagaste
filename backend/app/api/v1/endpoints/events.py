from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import CurrentUser, DbSession, EventEditor
from app.models.event import Event, EventType
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.schemas.types import LocalDateTime
from app.services import events as events_service

router = APIRouter(prefix="/events", tags=["events"])


def get_event_or_404(event_id: int, db: DbSession) -> Event:
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")
    return event


EventById = Annotated[Event, Depends(get_event_or_404)]


@router.get("", response_model=list[EventRead])
def list_events(
    db: DbSession,
    _: CurrentUser,
    from_: Annotated[LocalDateTime | None, Query(alias="from")] = None,
    to: LocalDateTime | None = None,
    type_: Annotated[EventType | None, Query(alias="type")] = None,
) -> list[Event]:
    return events_service.list_events(db, from_, to, type_)


@router.get("/{event_id}", response_model=EventRead)
def get_event(event: EventById, _: CurrentUser) -> Event:
    return event


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(body: EventCreate, db: DbSession, current: EventEditor) -> Event:
    return events_service.create_event(db, body, current)


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event: EventById, body: EventUpdate, db: DbSession, _: EventEditor) -> Event:
    try:
        return events_service.update_event(db, event, body)
    except events_service.InvalidEventRangeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La fecha de fin debe ser posterior a la de inicio",
        ) from None


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event: EventById, db: DbSession, _: EventEditor) -> None:
    events_service.delete_event(db, event)
