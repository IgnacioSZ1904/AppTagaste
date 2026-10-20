from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.errors import NotFoundError, UnprocessableError
from app.models.attendance import Attendance
from app.models.event import Event
from app.models.group import Group
from app.models.user import User
from app.schemas.attendance import AttendanceChild, AttendanceRead
from app.services.events import in_group


class EventNotInGroupError(NotFoundError):
    """El evento no existe o no es del grupo ni general."""

    detail = "Evento no encontrado en este grupo"


class UnknownChildError(UnprocessableError):
    def __init__(self, child_ids: list[int]) -> None:
        self.child_ids = child_ids
        super().__init__("No son niños de este grupo: " + ", ".join(str(i) for i in child_ids))


def get_group_event(db: Session, group: Group, event_id: int) -> Event:
    event = db.scalar(select(Event).where(Event.id == event_id, in_group(group.id)))
    if event is None:
        raise EventNotInGroupError()
    return event


def get_attendance(db: Session, group: Group, event: Event) -> AttendanceRead:
    child_ids = [c.id for c in group.children]
    rows = (
        list(
            db.scalars(
                select(Attendance).where(
                    Attendance.event_id == event.id, Attendance.child_id.in_(child_ids)
                )
            )
        )
        if child_ids
        else []
    )
    by_child = {r.child_id: r for r in rows}
    last = max(rows, key=lambda r: r.marked_at, default=None)
    return AttendanceRead(
        event_id=event.id,
        group_id=group.id,
        children=[
            AttendanceChild(
                child_id=c.id,
                full_name=c.full_name,
                present=by_child[c.id].present if c.id in by_child else None,
            )
            for c in group.children
        ],
        marked_by=last.marked_by.full_name if last and last.marked_by else None,
        marked_at=last.marked_at if last else None,
    )


def save_attendance(
    db: Session, group: Group, event: Event, present_ids: list[int], user: User
) -> AttendanceRead:
    """Guarda la lista entera: los niños del grupo no marcados quedan ausentes."""
    child_ids = {c.id for c in group.children}
    unknown = set(present_ids) - child_ids
    if unknown:
        raise UnknownChildError(sorted(unknown))
    if child_ids:
        present = set(present_ids)
        stmt = insert(Attendance).values(
            [
                {
                    "event_id": event.id,
                    "child_id": cid,
                    "present": cid in present,
                    "marked_by_id": user.id,
                }
                for cid in child_ids
            ]
        )
        db.execute(
            stmt.on_conflict_do_update(
                index_elements=[Attendance.event_id, Attendance.child_id],
                set_={
                    "present": stmt.excluded.present,
                    "marked_by_id": stmt.excluded.marked_by_id,
                    "marked_at": func.now(),
                },
            )
        )
        db.commit()
        db.expire_all()
    return get_attendance(db, group, event)
