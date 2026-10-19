from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.attendance import Attendance
from app.models.event import Event
from app.models.group import Group
from app.models.user import Role, User
from tests.conftest import auth_headers


def url(group: Group, event: Event) -> str:
    return f"/api/v1/groups/{group.id}/events/{event.id}/attendance"


@pytest.fixture
def monitor(make_user: Callable[..., User]) -> User:
    return make_user(role=Role.MONITOR)


@pytest.fixture
def group(make_group: Callable[..., Group], monitor: User) -> Group:
    return make_group(members=[monitor], children=("Luis", "Ana", "Carla"))


def ids(group: Group) -> dict[str, int]:
    return {c.full_name: c.id for c in group.children}


def test_sin_pasar_lista_todos_pendientes(
    client: TestClient, make_event: Callable[..., Event], group: Group, monitor: User
) -> None:
    event = make_event()

    response = client.get(url(group, event), headers=auth_headers(monitor))

    assert response.status_code == 200
    assert response.json() == {
        "event_id": event.id,
        "group_id": group.id,
        "children": [
            {"child_id": ids(group)[n], "full_name": n, "present": None}
            for n in ("Ana", "Carla", "Luis")
        ],
        "marked_by": None,
        "marked_at": None,
    }


def test_guardar_lista_marca_presentes_y_ausentes(
    client: TestClient, make_event: Callable[..., Event], group: Group, monitor: User
) -> None:
    event = make_event()
    body = {"present_child_ids": [ids(group)["Ana"], ids(group)["Luis"]]}

    saved = client.put(url(group, event), json=body, headers=auth_headers(monitor))
    read = client.get(url(group, event), headers=auth_headers(monitor))

    assert saved.status_code == 200
    assert saved.json() == read.json()
    data = read.json()
    assert {c["full_name"]: c["present"] for c in data["children"]} == {
        "Ana": True,
        "Carla": False,
        "Luis": True,
    }
    assert data["marked_by"] == monitor.full_name
    assert len(data["marked_at"]) == len("2026-11-07 17:00")


def test_volver_a_guardar_sustituye_la_lista(
    client: TestClient, make_event: Callable[..., Event], group: Group, monitor: User
) -> None:
    event = make_event()
    headers = auth_headers(monitor)
    client.put(url(group, event), json={"present_child_ids": [ids(group)["Ana"]]}, headers=headers)

    response = client.put(
        url(group, event), json={"present_child_ids": [ids(group)["Carla"]]}, headers=headers
    )

    assert {c["full_name"]: c["present"] for c in response.json()["children"]} == {
        "Ana": False,
        "Carla": True,
        "Luis": False,
    }


def test_nino_nuevo_tras_pasar_lista_sale_pendiente(
    client: TestClient,
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
    monitor: User,
) -> None:
    group = make_group(members=[monitor], children=("Ana",))
    event = make_event()
    client.put(url(group, event), json={"present_child_ids": []}, headers=auth_headers(monitor))
    client.post(
        f"/api/v1/groups/{group.id}/children",
        json={"full_name": "Bea"},
        headers=auth_headers(monitor),
    )

    response = client.get(url(group, event), headers=auth_headers(monitor))

    assert [(c["full_name"], c["present"]) for c in response.json()["children"]] == [
        ("Ana", False),
        ("Bea", None),
    ]


def test_nino_de_otro_grupo_da_422(
    client: TestClient,
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
    group: Group,
    monitor: User,
) -> None:
    other = make_group(children=("Pablo",))
    body = {"present_child_ids": [other.children[0].id]}

    response = client.put(url(group, make_event()), json=body, headers=auth_headers(monitor))

    assert response.status_code == 422


def test_evento_de_otro_grupo_da_404_y_el_propio_vale(
    client: TestClient,
    db: Session,
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
    group: Group,
    monitor: User,
) -> None:
    other_event = make_event()
    other_event.groups = [make_group()]
    own_event = make_event()
    own_event.groups = [group]
    db.commit()
    headers = auth_headers(monitor)

    assert client.get(url(group, other_event), headers=headers).status_code == 404
    assert client.get(url(group, own_event), headers=headers).status_code == 200
    missing = f"/api/v1/groups/{group.id}/events/999999/attendance"
    assert client.get(missing, headers=headers).status_code == 404


def test_borrar_evento_borra_su_asistencia(
    client: TestClient,
    db: Session,
    make_event: Callable[..., Event],
    make_user: Callable[..., User],
    group: Group,
    monitor: User,
) -> None:
    event = make_event()
    client.put(url(group, event), json={"present_child_ids": []}, headers=auth_headers(monitor))

    response = client.delete(f"/api/v1/events/{event.id}", headers=auth_headers(make_user()))

    assert response.status_code == 204
    assert db.scalar(select(func.count()).select_from(Attendance)) == 0
