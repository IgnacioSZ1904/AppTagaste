import re
import unicodedata
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Query, Response

from app.api.deps import DbSession, EventEditor, GroupById
from app.core.openapi import errors
from app.schemas.stats import GroupStats, GroupSummary
from app.services import stats as stats_service

# Estadísticas de asistencia: solo admin y coordinadores (de todos los grupos)
router = APIRouter(tags=["stats"], responses=errors(401, 403, 422))

From = Annotated[date | None, Query(alias="from", description="AAAA-MM-DD (incluido)")]
To = Annotated[date | None, Query(description="AAAA-MM-DD (incluido)")]


def slug(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-") or "grupo"


@router.get(
    "/stats/groups", response_model=list[GroupSummary], summary="Resumen de asistencia por grupo"
)
def groups_summary(db: DbSession, _: EventEditor, from_: From = None, to: To = None) -> list[dict]:
    return stats_service.groups_summary(db, stats_service.resolve_period(from_, to))


@router.get(
    "/groups/{group_id}/stats",
    response_model=GroupStats,
    summary="Asistencia de un grupo por evento y por niño",
    responses=errors(404),
)
def group_stats(
    group: GroupById, db: DbSession, _: EventEditor, from_: From = None, to: To = None
) -> dict:
    return stats_service.group_stats(db, group, stats_service.resolve_period(from_, to))


@router.get(
    "/groups/{group_id}/stats.csv",
    response_class=Response,
    summary="Asistencia de un grupo en CSV",
    responses={
        200: {"content": {"text/csv": {}}, "description": "Asistencia en CSV"},
        **errors(404),
    },
)
def group_stats_csv(
    group: GroupById, db: DbSession, _: EventEditor, from_: From = None, to: To = None
) -> Response:
    p = stats_service.resolve_period(from_, to)
    filename = f"asistencia-{slug(group.name)}-{p.start}-{p.end}.csv"
    return Response(
        content=stats_service.group_csv(db, group, p),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
