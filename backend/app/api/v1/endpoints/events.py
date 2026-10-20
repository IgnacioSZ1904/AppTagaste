from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession, EventEditor
from app.core.errors import NotFoundError
from app.core.openapi import errors
from app.models.event import Event, EventType
from app.models.group import Group
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.schemas.types import LocalDateTime
from app.services import events as events_service

router = APIRouter(prefix="/events", tags=["events"], responses=errors(401, 422))


def get_event_or_404(event_id: int, db: DbSession) -> Event:
    event = db.get(Event, event_id)
    if event is None:
        raise NotFoundError("Evento no encontrado")
    return event


EventById = Annotated[Event, Depends(get_event_or_404)]


@router.get("", response_model=list[EventRead], summary="Listar eventos", responses=errors(404))
def list_events(
    db: DbSession,
    _: CurrentUser,
    from_: Annotated[LocalDateTime | None, Query(alias="from")] = None,
    to: LocalDateTime | None = None,
    type_: Annotated[EventType | None, Query(alias="type")] = None,
    group_id: int | None = None,
) -> list[Event]:
    """Eventos que se solapan con el rango. Con `group_id`, los de ese grupo más los generales."""
    if group_id is not None and db.get(Group, group_id) is None:
        raise NotFoundError("Grupo no encontrado")
    return events_service.list_events(db, from_, to, type_, group_id)


@router.get("/{event_id}", response_model=EventRead, summary="Ver un evento", responses=errors(404))
def get_event(event: EventById, _: CurrentUser) -> Event:
    return event


@router.post(
    "",
    response_model=EventRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un evento",
    responses=errors(403),
)
def create_event(body: EventCreate, db: DbSession, current: EventEditor) -> Event:
    return events_service.create_event(db, body, current)


@router.patch(
    "/{event_id}", response_model=EventRead, summary="Editar un evento", responses=errors(403, 404)
)
def update_event(event: EventById, body: EventUpdate, db: DbSession, _: EventEditor) -> Event:
    return events_service.update_event(db, event, body)


@router.delete(
    "/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Borrar un evento",
    responses=errors(403, 404),
)
def delete_event(event: EventById, db: DbSession, _: EventEditor) -> None:
    events_service.delete_event(db, event)
