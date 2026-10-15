from collections.abc import Callable

from fastapi.testclient import TestClient

from app.models.user import Role, User
from tests.conftest import auth_headers

USERS_URL = "/api/v1/users"


def test_monitor_cannot_manage_users(client: TestClient, make_user: Callable[..., User]) -> None:
    monitor = make_user(role=Role.MONITOR)
    assert client.get(USERS_URL, headers=auth_headers(monitor)).status_code == 403


def test_anonymous_cannot_manage_users(client: TestClient) -> None:
    assert client.get(USERS_URL).status_code == 401


def test_admin_creates_and_lists_users(client: TestClient, make_user: Callable[..., User]) -> None:
    admin = make_user()
    headers = auth_headers(admin)

    response = client.post(
        USERS_URL,
        json={"email": "Luis@Ejemplo.com", "full_name": "Luis", "role": "monitor"},
        headers=headers,
    )

    assert response.status_code == 201
    assert response.json()["email"] == "luis@ejemplo.com"
    emails = [u["email"] for u in client.get(USERS_URL, headers=headers).json()]
    assert "luis@ejemplo.com" in emails


def test_duplicate_email_is_rejected(client: TestClient, make_user: Callable[..., User]) -> None:
    admin = make_user()
    make_user(email="luis@ejemplo.com")
    response = client.post(
        USERS_URL,
        json={"email": "LUIS@ejemplo.com", "full_name": "Luis", "role": "monitor"},
        headers=auth_headers(admin),
    )
    assert response.status_code == 409


def test_invalid_role_is_rejected(client: TestClient, make_user: Callable[..., User]) -> None:
    response = client.post(
        USERS_URL,
        json={"email": "x@ejemplo.com", "full_name": "X", "role": "superadmin"},
        headers=auth_headers(make_user()),
    )
    assert response.status_code == 422


def test_admin_updates_user(client: TestClient, make_user: Callable[..., User]) -> None:
    admin = make_user()
    monitor = make_user(role=Role.MONITOR)
    response = client.patch(
        f"{USERS_URL}/{monitor.id}",
        json={"role": "coordinador", "is_active": False},
        headers=auth_headers(admin),
    )
    assert response.status_code == 200
    assert response.json()["role"] == "coordinador"
    assert response.json()["is_active"] is False


def test_cannot_change_own_role_or_deactivate(
    client: TestClient, make_user: Callable[..., User]
) -> None:
    admin = make_user()
    response = client.patch(
        f"{USERS_URL}/{admin.id}",
        json={"is_active": False},
        headers=auth_headers(admin),
    )
    assert response.status_code == 400


def test_update_missing_user(client: TestClient, make_user: Callable[..., User]) -> None:
    response = client.patch(
        f"{USERS_URL}/999999", json={"full_name": "X"}, headers=auth_headers(make_user())
    )
    assert response.status_code == 404
