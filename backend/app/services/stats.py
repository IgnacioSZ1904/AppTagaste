import csv
import io
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import UnprocessableError
from app.models.attendance import Attendance
from app.models.event import Event
from app.models.group import Group
from app.services.events import in_group


class InvalidPeriodError(UnprocessableError):
    detail = "La fecha de inicio no puede ser posterior a la de fin"


@dataclass
class Period:
    start: date
    end: date


@dataclass
class EventRow:
    event: Event
    # child_id → asistió; sin clave = sin pasar lista
    marks: dict[int, bool]


def _zone() -> ZoneInfo:
    return ZoneInfo(get_settings().timezone)


def resolve_period(start: date | None, end: date | None) -> Period:
    """Por defecto, el curso actual: del 1 de septiembre a hoy (hora de España)."""
    today = datetime.now(_zone()).date()
    end = end or today
    if start is None:
        year = end.year if end.month >= 9 else end.year - 1
        start = date(year, 9, 1)
    if start > end:
        raise InvalidPeriodError()
    return Period(start, end)


def rate(present: int, absent: int) -> int | None:
    total = present + absent
    return round(100 * present / total) if total else None


def group_rows(db: Session, group: Group, period: Period) -> list[EventRow]:
    """Eventos del grupo y generales que empiezan en el periodo, con las marcas de sus niños."""
    zone = _zone()
    events = list(
        db.scalars(
            select(Event)
            .where(
                in_group(group.id),
                Event.starts_at >= datetime.combine(period.start, time(), zone),
                Event.starts_at < datetime.combine(period.end + timedelta(days=1), time(), zone),
            )
            .order_by(Event.starts_at)
        )
    )
    rows = [EventRow(event, {}) for event in events]
    child_ids = [c.id for c in group.children]
    if events and child_ids:
        by_event = {row.event.id: row for row in rows}
        marks = db.execute(
            select(Attendance.event_id, Attendance.child_id, Attendance.present).where(
                Attendance.event_id.in_(by_event), Attendance.child_id.in_(child_ids)
            )
        )
        for event_id, child_id, present in marks:
            by_event[event_id].marks[child_id] = present
    return rows


def group_stats(db: Session, group: Group, period: Period) -> dict:
    rows = group_rows(db, group, period)
    events = [
        {
            "event_id": row.event.id,
            "title": row.event.title,
            "starts_at": row.event.starts_at,
            "present": sum(row.marks.values()),
            "absent": len(row.marks) - sum(row.marks.values()),
            "taken": bool(row.marks),
        }
        for row in rows
    ]
    children = []
    for child in group.children:
        marks = [row.marks[child.id] for row in rows if child.id in row.marks]
        present = sum(marks)
        children.append(
            {
                "child_id": child.id,
                "full_name": child.full_name,
                "present": present,
                "absent": len(marks) - present,
                "rate": rate(present, len(marks) - present),
            }
        )
    return {
        "group_id": group.id,
        "from_": period.start,
        "to": period.end,
        "events": events,
        "children": children,
    }


def groups_summary(db: Session, period: Period) -> list[dict]:
    summary = []
    for group in db.scalars(select(Group).order_by(Group.name)):
        rows = group_rows(db, group, period)
        present = sum(sum(row.marks.values()) for row in rows)
        total = sum(len(row.marks) for row in rows)
        summary.append(
            {
                "group_id": group.id,
                "name": group.name,
                "children_count": group.children_count,
                "events_taken": sum(1 for row in rows if row.marks),
                "rate": rate(present, total - present),
            }
        )
    return summary


def group_csv(db: Session, group: Group, period: Period) -> str:
    """Una fila por niño y una columna por evento (Sí / No / vacío), para Excel en español."""
    rows = group_rows(db, group, period)
    zone = _zone()
    out = io.StringIO()
    writer = csv.writer(out, delimiter=";", lineterminator="\r\n")
    writer.writerow(
        [
            "Niño",
            *(f"{r.event.starts_at.astimezone(zone):%d/%m/%Y} {r.event.title}" for r in rows),
            "Asistencias",
            "Faltas",
            "%",
        ]
    )
    for child in group.children:
        cells = []
        present = absent = 0
        for row in rows:
            mark = row.marks.get(child.id)
            cells.append("" if mark is None else "Sí" if mark else "No")
            present += mark is True
            absent += mark is False
        percent = rate(present, absent)
        writer.writerow(
            [child.full_name, *cells, present, absent, "" if percent is None else percent]
        )
    # BOM: sin él Excel no reconoce las tildes
    return "﻿" + out.getvalue()
