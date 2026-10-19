from collections.abc import Callable
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi.testclient import TestClient
from icalendar import Calendar
from sqlalchemy.orm import Session

from app.models.event import Event, EventType
from app.services.calendar import build_calendar

URL = "/api/v1/calendar.ics"
MADRID = ZoneInfo("Europe/Madrid")


def _events(response_body: bytes) -> dict[str, dict]:
    cal = Calendar.from_ical(response_body)
    return {str(e["summary"]): e for e in cal.walk("VEVENT")}


def test_calendario_publico_sin_login(client: TestClient) -> None:
    response = client.get(URL)
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/calendar")
    cal = Calendar.from_ical(response.content)
    assert str(cal["x-wr-calname"]) == "AppTagaste"


def test_incluye_ultimos_tres_meses_y_futuros(
    client: TestClient, make_event: Callable[..., Event]
) -> None:
    now = datetime.now(UTC)
    make_event(starts_at=now + timedelta(days=10), title="Futuro")
    make_event(starts_at=now - timedelta(days=30), title="Reciente")
    make_event(starts_at=now - timedelta(days=120), title="Antiguo")

    events = _events(client.get(URL).content)

    assert "Futuro" in events
    assert "Reciente" in events
    assert "Antiguo" not in events


def test_campos_del_evento(
    client: TestClient, make_event: Callable[..., Event], db: Session
) -> None:
    event = make_event(
        # iCalendar no guarda microsegundos
        starts_at=datetime.now(UTC).replace(second=0, microsecond=0) + timedelta(days=5),
        type=EventType.CONVIVENCIA,
        title="Convivencia de otoño",
    )
    event.location = "Casa de espiritualidad"
    event.description = "Traed saco de dormir"
    db.commit()

    item = _events(client.get(URL).content)["Convivencia de otoño"]

    assert str(item["uid"]) == f"evento-{event.id}@apptagaste"
    assert str(item["location"]) == "Casa de espiritualidad"
    assert str(item["description"]) == "Tipo: Convivencia\n\nTraed saco de dormir"
    assert item["categories"].cats == ["Convivencia"]
    assert item.decoded("dtstart") == event.starts_at.astimezone(UTC)


def test_horas_en_utc() -> None:
    # 18:00 en España en octubre (UTC+2) son las 16:00 UTC
    start = datetime(2026, 10, 24, 18, 0, tzinfo=MADRID)
    event = Event(
        id=1,
        title="Reunión",
        type=EventType.REUNION,
        starts_at=start,
        ends_at=start + timedelta(hours=2),
        updated_at=start,
    )
    ics = build_calendar([event]).decode()
    assert "DTSTART:20261024T160000Z" in ics
    assert "DTEND:20261024T180000Z" in ics
