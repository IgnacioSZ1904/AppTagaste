from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession, ManagedGroup, MonitoredGroup
from app.core.openapi import errors
from app.schemas.attendance import AttendanceRead, AttendanceWrite
from app.services import attendance as attendance_service

router = APIRouter(prefix="/groups", tags=["attendance"], responses=errors(401, 403, 404, 422))

PATH = "/{group_id}/events/{event_id}/attendance"


@router.get(PATH, response_model=AttendanceRead, summary="Ver la lista de un evento")
def get_attendance(group: ManagedGroup, event_id: int, db: DbSession) -> AttendanceRead:
    """Admin y responsables del grupo."""
    event = attendance_service.get_group_event(db, group, event_id)
    return attendance_service.get_attendance(db, group, event)


@router.put(PATH, response_model=AttendanceRead, summary="Pasar lista")
def save_attendance(
    group: MonitoredGroup, event_id: int, body: AttendanceWrite, db: DbSession, user: CurrentUser
) -> AttendanceRead:
    """Solo los monitores responsables del grupo. Se guarda la lista entera."""
    event = attendance_service.get_group_event(db, group, event_id)
    return attendance_service.save_attendance(db, group, event, body.present_child_ids, user)
