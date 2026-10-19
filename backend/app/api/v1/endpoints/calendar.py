from fastapi import APIRouter, Response

from app.api.deps import DbSession
from app.services import calendar as calendar_service

router = APIRouter(tags=["calendar"])


@router.get(
    "/calendar.ics",
    response_class=Response,
    responses={200: {"content": {"text/calendar": {}}, "description": "Calendario iCalendar"}},
)
def calendar_feed(db: DbSession) -> Response:
    """Calendario público para suscribirse desde Google Calendar o el iPhone (sin login)."""
    ics = calendar_service.build_calendar(calendar_service.feed_events(db))
    return Response(
        content=ics,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": 'inline; filename="apptagaste.ics"'},
    )
