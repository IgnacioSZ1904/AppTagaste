from fastapi import APIRouter, Response

from app.api.deps import DbSession
from app.core.errors import NotFoundError
from app.core.openapi import errors
from app.models.group import Group
from app.services import calendar as calendar_service

router = APIRouter(tags=["calendar"])


@router.get(
    "/calendar.ics",
    response_class=Response,
    summary="Calendario iCal (público)",
    responses={
        200: {"content": {"text/calendar": {}}, "description": "Calendario iCalendar"},
        **errors(404, 422),
    },
)
def calendar_feed(db: DbSession, group_id: int | None = None) -> Response:
    """Calendario público para suscribirse desde Google Calendar o el iPhone (sin login).

    Con `group_id`, solo los eventos de ese grupo más los generales.
    """
    name = "AppTagaste"
    if group_id is not None:
        group = db.get(Group, group_id)
        if group is None:
            raise NotFoundError("Grupo no encontrado")
        name = f"AppTagaste · {group.name}"
    events = calendar_service.feed_events(db, group_id=group_id)
    ics = calendar_service.build_calendar(events, name)
    return Response(
        content=ics,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": 'inline; filename="apptagaste.ics"'},
    )
