from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import CurrentUser, DbSession, EventEditor
from app.models.event import Event, EventType
from app.models.group import Group
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

GROUP_NOT_FOUND = HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grupo no encontrado")


def unknown_groups(error: events_service.UnknownGroupError) -> HTTPException:
    ids = ", ".join(str(i) for i in error.group_ids)
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=f"No existe el grupo: {ids}"
    )


@router.get("", response_model=list[EventRead])
def list_events(
    db: DbSession,
    _: CurrentUser,
    from_: Annotated[LocalDateTime | None, Query(alias="from")] = None,
    to: LocalDateTime | None = None,
    type_: Annotated[EventType | None, Query(alias="type")] = None,
    group_id: int | None = None,
) -> list[Event]:
    """Con `group_id`, los eventos de ese grupo más los generales."""
    if group_id is not None and db.get(Group, group_id) is None:
        raise GROUP_NOT_FOUND
    return events_service.list_events(db, from_, to, type_, group_id)


@router.get("/{event_id}", response_model=EventRead)
def get_event(event: EventById, _: CurrentUser) -> Event:
    return event


@router.post("", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(body: EventCreate, db: DbSession, current: EventEditor) -> Event:
    try:
        return events_service.create_event(db, body, current)
    except events_service.UnknownGroupError as e:
        raise unknown_groups(e) from None


@router.patch("/{event_id}", response_model=EventRead)
def update_event(event: EventById, body: EventUpdate, db: DbSession, _: EventEditor) -> Event:
    try:
        return events_service.update_event(db, event, body)
    except events_service.InvalidEventRangeError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La fecha de fin debe ser posterior a la de inicio",
        ) from None
    except events_service.UnknownGroupError as e:
        raise unknown_groups(e) from None


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event: EventById, db: DbSession, _: EventEditor) -> None:
    events_service.delete_event(db, event)
