from collections.abc import Callable
from datetime import UTC, date, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.event import Event
from app.models.group import Group
from app.models.user import Role, User
from app.services.stats import InvalidPeriodError, resolve_period
from tests.conftest import auth_headers

PERIOD = {"from": "2026-11-01", "to": "2026-11-30"}


@pytest.fixture
def headers(make_user: Callable[..., User]) -> dict[str, str]:
    return auth_headers(make_user(role=Role.COORDINADOR))


@pytest.fixture
def group(make_group: Callable[..., Group]) -> Group:
    return make_group(name="Confirmación A", children=("Ana", "Luis"))


def mark(db: Session, event: Event, group: Group, **present: bool) -> None:
    ids = {c.full_name: c.id for c in group.children}
    for name, value in present.items():
        db.add(Attendance(event_id=event.id, child_id=ids[name], present=value))
    db.commit()


def at(day: int) -> datetime:
    return datetime(2026, 11, day, 17, 0, tzinfo=UTC)


def test_estadisticas_por_evento_y_por_nino(
    client: TestClient,
    db: Session,
    make_event: Callable[..., Event],
    group: Group,
    headers: dict[str, str],
) -> None:
    first = make_event(starts_at=at(7), title="Reunión 1")
    second = make_event(starts_at=at(14), title="Reunión 2")
    pending = make_event(starts_at=at(21), title="Reunión 3")
    mark(db, first, group, Ana=True, Luis=False)
    mark(db, second, group, Ana=True, Luis=True)

    response = client.get(f"/api/v1/groups/{group.id}/stats", params=PERIOD, headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["from"] == "2026-11-01"
    assert data["to"] == "2026-11-30"
    assert [(e["event_id"], e["present"], e["absent"], e["taken"]) for e in data["events"]] == [
        (first.id, 1, 1, True),
        (second.id, 2, 0, True),
        (pending.id, 0, 0, False),
    ]
    assert data["events"][0]["starts_at"] == "2026-11-07 18:00"
    assert [(c["full_name"], c["present"], c["absent"], c["rate"]) for c in data["children"]] == [
        ("Ana", 2, 0, 100),
        ("Luis", 1, 1, 50),
    ]


def test_solo_eventos_del_grupo_o_generales_dentro_del_periodo(
    client: TestClient,
    db: Session,
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
    group: Group,
    headers: dict[str, str],
) -> None:
    general = make_event(starts_at=at(7))
    own = make_event(starts_at=at(8))
    own.groups = [group]
    other = make_event(starts_at=at(9))
    other.groups = [make_group()]
    db.commit()
    make_event(starts_at=datetime(2026, 12, 1, 17, 0, tzinfo=UTC))

    response = client.get(f"/api/v1/groups/{group.id}/stats", params=PERIOD, headers=headers)

    assert [e["event_id"] for e in response.json()["events"]] == [general.id, own.id]


def test_nino_sin_listas_tiene_rate_null(
    client: TestClient, group: Group, headers: dict[str, str]
) -> None:
    response = client.get(f"/api/v1/groups/{group.id}/stats", params=PERIOD, headers=headers)

    assert [c["rate"] for c in response.json()["children"]] == [None, None]


def test_resumen_de_todos_los_grupos(
    client: TestClient,
    db: Session,
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
    group: Group,
    headers: dict[str, str],
) -> None:
    empty = make_group(name="B vacío")
    event = make_event(starts_at=at(7))
    make_event(starts_at=at(14))
    mark(db, event, group, Ana=True, Luis=False)

    response = client.get("/api/v1/stats/groups", params=PERIOD, headers=headers)

    assert response.status_code == 200
    assert response.json() == [
        {
            "group_id": empty.id,
            "name": "B vacío",
            "children_count": 0,
            "events_taken": 0,
            "rate": None,
        },
        {
            "group_id": group.id,
            "name": "Confirmación A",
            "children_count": 2,
            "events_taken": 1,
            "rate": 50,
        },
    ]


def test_csv_para_excel(
    client: TestClient,
    db: Session,
    make_event: Callable[..., Event],
    group: Group,
    headers: dict[str, str],
) -> None:
    event = make_event(starts_at=at(7), title="Reunión")
    make_event(starts_at=at(14), title="Convivencia")
    mark(db, event, group, Ana=True, Luis=False)

    response = client.get(f"/api/v1/groups/{group.id}/stats.csv", params=PERIOD, headers=headers)

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert response.headers["content-disposition"] == (
        'attachment; filename="asistencia-confirmacion-a-2026-11-01-2026-11-30.csv"'
    )
    assert response.content.startswith("﻿".encode())
    assert response.text.lstrip("﻿").split("\r\n") == [
        "Niño;07/11/2026 Reunión;14/11/2026 Convivencia;Asistencias;Faltas;%",
        "Ana;Sí;;1;0;100",
        "Luis;No;;0;1;0",
        "",
    ]


def test_periodo_al_reves_da_422(client: TestClient, group: Group, headers: dict[str, str]) -> None:
    params = {"from": "2026-11-30", "to": "2026-11-01"}

    response = client.get(f"/api/v1/groups/{group.id}/stats", params=params, headers=headers)

    assert response.status_code == 422


@pytest.mark.parametrize(
    ("end", "start"),
    [(date(2026, 10, 19), date(2026, 9, 1)), (date(2027, 3, 5), date(2026, 9, 1))],
)
def test_periodo_por_defecto_es_el_curso(end: date, start: date) -> None:
    assert resolve_period(None, end).start == start


def test_periodo_invalido() -> None:
    with pytest.raises(InvalidPeriodError):
        resolve_period(date(2026, 11, 2), date(2026, 11, 1))


def test_grupo_inexistente_da_404(client: TestClient, headers: dict[str, str]) -> None:
    assert client.get("/api/v1/groups/999999/stats", headers=headers).status_code == 404
