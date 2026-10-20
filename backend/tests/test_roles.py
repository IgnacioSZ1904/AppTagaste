"""Matriz de permisos de los cuatro roles."""

from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.group import Group
from app.models.user import Role, User
from tests.conftest import auth_headers

NEW_EVENT = {
    "title": "Reunión",
    "type": "reunion",
    "starts_at": "2026-11-13 17:00",
    "ends_at": "2026-11-13 19:00",
}

CAN_EDIT_EVENTS = {Role.ADMIN, Role.COORDINADOR}


@pytest.mark.parametrize("role", list(Role))
def test_everyone_can_read_events(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event], role: Role
) -> None:
    make_event()
    response = client.get("/api/v1/events", headers=auth_headers(make_user(role=role)))
    assert response.status_code == 200


@pytest.mark.parametrize("role", list(Role))
def test_only_admin_and_coordinator_write_events(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event], role: Role
) -> None:
    headers = auth_headers(make_user(role=role))
    event = make_event()
    allowed = role in CAN_EDIT_EVENTS

    create = client.post("/api/v1/events", json=NEW_EVENT, headers=headers)
    update = client.patch(f"/api/v1/events/{event.id}", json={"title": "Otra"}, headers=headers)
    delete = client.delete(f"/api/v1/events/{event.id}", headers=headers)

    assert create.status_code == (201 if allowed else 403)
    assert update.status_code == (200 if allowed else 403)
    assert delete.status_code == (204 if allowed else 403)


@pytest.mark.parametrize("role", list(Role))
def test_only_admin_manages_users(
    client: TestClient, make_user: Callable[..., User], role: Role
) -> None:
    response = client.get("/api/v1/users", headers=auth_headers(make_user(role=role)))
    assert response.status_code == (200 if role == Role.ADMIN else 403)


def test_admin_can_appoint_another_admin(
    client: TestClient, make_user: Callable[..., User]
) -> None:
    admin = make_user()
    other = make_user(role=Role.USUARIO)

    response = client.patch(
        f"/api/v1/users/{other.id}", json={"role": "admin"}, headers=auth_headers(admin)
    )

    assert response.status_code == 200
    assert response.json()["role"] == "admin"


@pytest.mark.parametrize("role", list(Role))
def test_everyone_can_read_groups(
    client: TestClient, make_user: Callable[..., User], role: Role
) -> None:
    response = client.get("/api/v1/groups", headers=auth_headers(make_user(role=role)))
    assert response.status_code == 200


@pytest.mark.parametrize("role", list(Role))
def test_only_admin_manages_groups(
    client: TestClient, db: Session, make_user: Callable[..., User], role: Role
) -> None:
    headers = auth_headers(make_user(role=role))
    group = Group(name="Grupo")
    db.add(group)
    db.commit()
    monitor = make_user(role=Role.MONITOR)
    allowed = role == Role.ADMIN

    create = client.post("/api/v1/groups", json={"name": "Nuevo"}, headers=headers)
    rename = client.patch(f"/api/v1/groups/{group.id}", json={"name": "Otro"}, headers=headers)
    add = client.post(
        f"/api/v1/groups/{group.id}/members", json={"user_id": monitor.id}, headers=headers
    )
    delete = client.delete(f"/api/v1/groups/{group.id}", headers=headers)

    assert create.status_code == (201 if allowed else 403)
    assert rename.status_code == (200 if allowed else 403)
    assert add.status_code == (201 if allowed else 403)
    assert delete.status_code == (204 if allowed else 403)


@pytest.mark.parametrize("role", list(Role))
@pytest.mark.parametrize("is_member", [True, False])
def test_children_only_for_admin_and_group_members(
    client: TestClient, db: Session, make_user: Callable[..., User], role: Role, is_member: bool
) -> None:
    user = make_user(role=role)
    group = Group(name="Grupo", members=[user] if is_member else [])
    db.add(group)
    db.commit()
    allowed = role == Role.ADMIN or (is_member and role in {Role.MONITOR, Role.COORDINADOR})

    response = client.get(f"/api/v1/groups/{group.id}/children", headers=auth_headers(user))

    assert response.status_code == (200 if allowed else 403)


@pytest.mark.parametrize("role", list(Role))
@pytest.mark.parametrize("is_member", [True, False])
def test_attendance_read_by_responsables_saved_only_by_monitors(
    client: TestClient,
    db: Session,
    make_user: Callable[..., User],
    make_event: Callable[..., Event],
    role: Role,
    is_member: bool,
) -> None:
    user = make_user(role=role)
    group = Group(name="Grupo", members=[user] if is_member else [])
    db.add(group)
    db.commit()
    url = f"/api/v1/groups/{group.id}/events/{make_event().id}/attendance"
    can_read = role == Role.ADMIN or (is_member and role in {Role.MONITOR, Role.COORDINADOR})
    can_save = is_member and role == Role.MONITOR

    read = client.get(url, headers=auth_headers(user))
    save = client.put(url, json={"present_child_ids": []}, headers=auth_headers(user))

    assert read.status_code == (200 if can_read else 403)
    assert save.status_code == (200 if can_save else 403)


@pytest.mark.parametrize("role", list(Role))
def test_stats_only_for_admin_and_coordinators(
    client: TestClient, db: Session, make_user: Callable[..., User], role: Role
) -> None:
    user = make_user(role=role)
    # Aunque sea responsable del grupo, un monitor no ve las estadísticas
    group = Group(name="Grupo", members=[user] if role != Role.USUARIO else [])
    db.add(group)
    db.commit()
    headers = auth_headers(user)
    allowed = role in {Role.ADMIN, Role.COORDINADOR}

    summary = client.get("/api/v1/stats/groups", headers=headers)
    detail = client.get(f"/api/v1/groups/{group.id}/stats", headers=headers)
    export = client.get(f"/api/v1/groups/{group.id}/stats.csv", headers=headers)

    for response in (summary, detail, export):
        assert response.status_code == (200 if allowed else 403)


@pytest.mark.parametrize("role", list(Role))
def test_library_for_admin_coordinators_and_monitors(
    client: TestClient, db: Session, make_user: Callable[..., User], role: Role
) -> None:
    group = Group(name="Grupo")
    db.add(group)
    db.commit()
    headers = auth_headers(make_user(role=role))
    allowed = role != Role.USUARIO

    upload = client.post(
        "/api/v1/documents",
        data={"school_year": "2025-2026", "group_id": group.id},
        files={"file": ("a.pdf", b"%PDF-1.4\n", "application/pdf")},
        headers=headers,
    )
    listing = client.get("/api/v1/documents", headers=headers)
    filters = client.get("/api/v1/documents/filters", headers=headers)
    tags = client.get("/api/v1/tags", headers=headers)

    assert upload.status_code == (201 if allowed else 403)
    for response in (listing, filters, tags):
        assert response.status_code == (200 if allowed else 403)
