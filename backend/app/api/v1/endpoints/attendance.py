from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession, ManagedGroup, MonitoredGroup
from app.models.event import Event
from app.models.group import Group
from app.schemas.attendance import AttendanceRead, AttendanceWrite
from app.services import attendance as attendance_service

router = APIRouter(prefix="/groups", tags=["attendance"])

PATH = "/{group_id}/events/{event_id}/attendance"


def group_event(db: DbSession, group: Group, event_id: int) -> Event:
    try:
        return attendance_service.get_group_event(db, group, event_id)
    except attendance_service.EventNotInGroupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado en este grupo"
        ) from None


# Ver la lista: admin y responsables del grupo
@router.get(PATH, response_model=AttendanceRead)
def get_attendance(group: ManagedGroup, event_id: int, db: DbSession) -> AttendanceRead:
    return attendance_service.get_attendance(db, group, group_event(db, group, event_id))


# Pasar lista: solo los monitores responsables del grupo
@router.put(PATH, response_model=AttendanceRead)
def save_attendance(
    group: MonitoredGroup, event_id: int, body: AttendanceWrite, db: DbSession, user: CurrentUser
) -> AttendanceRead:
    event = group_event(db, group, event_id)
    try:
        return attendance_service.save_attendance(db, group, event, body.present_child_ids, user)
    except attendance_service.UnknownChildError as error:
        ids = ", ".join(str(i) for i in error.child_ids)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"No son niños de este grupo: {ids}",
        ) from None
