import re
import unicodedata
from datetime import date
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Response, status

from app.api.deps import DbSession, EventEditor, GroupById
from app.schemas.stats import GroupStats, GroupSummary
from app.services import stats as stats_service

# Estadísticas de asistencia: solo admin y coordinadores (de todos los grupos)
router = APIRouter(tags=["stats"])

From = Annotated[date | None, Query(alias="from", description="AAAA-MM-DD (incluido)")]
To = Annotated[date | None, Query(description="AAAA-MM-DD (incluido)")]


def period(start: date | None, end: date | None) -> stats_service.Period:
    try:
        return stats_service.resolve_period(start, end)
    except stats_service.InvalidPeriodError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La fecha de inicio no puede ser posterior a la de fin",
        ) from None


def slug(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-") or "grupo"


@router.get("/stats/groups", response_model=list[GroupSummary])
def groups_summary(db: DbSession, _: EventEditor, from_: From = None, to: To = None) -> list[dict]:
    return stats_service.groups_summary(db, period(from_, to))


@router.get("/groups/{group_id}/stats", response_model=GroupStats)
def group_stats(
    group: GroupById, db: DbSession, _: EventEditor, from_: From = None, to: To = None
) -> dict:
    return stats_service.group_stats(db, group, period(from_, to))


@router.get(
    "/groups/{group_id}/stats.csv",
    response_class=Response,
    responses={200: {"content": {"text/csv": {}}, "description": "Asistencia en CSV"}},
)
def group_stats_csv(
    group: GroupById, db: DbSession, _: EventEditor, from_: From = None, to: To = None
) -> Response:
    p = period(from_, to)
    filename = f"asistencia-{slug(group.name)}-{p.start}-{p.end}.csv"
    return Response(
        content=stats_service.group_csv(db, group, p),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
