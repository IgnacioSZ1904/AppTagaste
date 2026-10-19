from pydantic import BaseModel

from app.schemas.types import LocalDateTime


class AttendanceChild(BaseModel):
    child_id: int
    full_name: str
    # None = aún no se ha pasado lista a este niño
    present: bool | None


class AttendanceRead(BaseModel):
    event_id: int
    group_id: int
    children: list[AttendanceChild]
    marked_by: str | None
    marked_at: LocalDateTime | None


class AttendanceWrite(BaseModel):
    present_child_ids: list[int]
