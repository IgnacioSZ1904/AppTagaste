"""Matriz de permisos de los cuatro roles."""

from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

from app.models.event import Event
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
