from collections.abc import Iterable
from datetime import UTC, datetime, timedelta

from icalendar import Calendar
from icalendar import Event as ICalEvent
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.event import Event, EventType
from app.services.events import in_group

# El feed incluye los eventos de los últimos 3 meses y todos los futuros
PAST_DAYS = 90

TYPE_LABELS = {
    EventType.REUNION: "Reunión",
    EventType.CONVIVENCIA: "Convivencia",
    EventType.EUCARISTIA: "Eucaristía",
    EventType.OTRO: "Otro",
}


def feed_events(
    db: Session, now: datetime | None = None, group_id: int | None = None
) -> list[Event]:
    cutoff = (now or datetime.now(UTC)) - timedelta(days=PAST_DAYS)
    query = select(Event).where(Event.ends_at > cutoff).order_by(Event.starts_at, Event.id)
    if group_id is not None:
        query = query.where(in_group(group_id))
    return list(db.scalars(query))


def build_calendar(events: Iterable[Event], name: str = "AppTagaste") -> bytes:
    cal = Calendar()
    cal.add("prodid", "-//AppTagaste//ES")
    cal.add("version", "2.0")
    cal.add("calscale", "GREGORIAN")
    cal.add("x-wr-calname", name)
    cal.add("x-wr-timezone", "Europe/Madrid")
    # Sugerencia de refresco (el iPhone la respeta; Google refresca cuando quiere)
    cal.add("refresh-interval", timedelta(hours=1), parameters={"VALUE": "DURATION"})
    cal.add("x-published-ttl", "PT1H")

    for event in events:
        label = TYPE_LABELS[event.type]
        item = ICalEvent()
        # UID estable: si el evento cambia, el calendario lo actualiza en vez de duplicarlo
        item.add("uid", f"evento-{event.id}@apptagaste")
        item.add("summary", event.title)
        # En UTC: cada móvil lo muestra en su hora local sin definir la zona horaria
        item.add("dtstart", event.starts_at.astimezone(UTC))
        item.add("dtend", event.ends_at.astimezone(UTC))
        item.add("dtstamp", event.updated_at.astimezone(UTC))
        item.add("last-modified", event.updated_at.astimezone(UTC))
        item.add("categories", [label])
        description = f"Tipo: {label}"
        if event.description:
            description += f"\n\n{event.description}"
        item.add("description", description)
        if event.location:
            item.add("location", event.location)
        cal.add_component(item)

    return cal.to_ical()
