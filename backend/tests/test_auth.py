from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

from app.api.v1.endpoints import auth
from app.core.google import GoogleIdentity, InvalidGoogleTokenError
from app.models.user import Role, User
from tests.conftest import auth_headers

LOGIN_URL = "/api/v1/auth/google"


def _google_returns(monkeypatch: pytest.MonkeyPatch, email: str, sub: str = "google-1") -> None:
    identity = GoogleIdentity(sub=sub, email=email, name="Nombre")
    monkeypatch.setattr(auth, "verify_google_token", lambda token: identity)


def test_login_ok_links_google_account(
    client: TestClient, make_user: Callable[..., User], monkeypatch: pytest.MonkeyPatch
) -> None:
    user = make_user(email="ana@ejemplo.com")
    _google_returns(monkeypatch, "ana@ejemplo.com")

    response = client.post(LOGIN_URL, json={"credential": "x"})

    assert response.status_code == 200
    token = response.json()["access_token"]
    me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.json()["email"] == "ana@ejemplo.com"
    assert user.google_sub == "google-1"


def test_login_invalid_google_token(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    def invalid(token: str) -> GoogleIdentity:
        raise InvalidGoogleTokenError("mal")

    monkeypatch.setattr(auth, "verify_google_token", invalid)
    assert client.post(LOGIN_URL, json={"credential": "x"}).status_code == 401


def test_login_email_not_registered(client: TestClient, monkeypatch: pytest.MonkeyPatch) -> None:
    _google_returns(monkeypatch, "desconocido@ejemplo.com")
    assert client.post(LOGIN_URL, json={"credential": "x"}).status_code == 403


def test_login_inactive_user(
    client: TestClient, make_user: Callable[..., User], monkeypatch: pytest.MonkeyPatch
) -> None:
    make_user(email="ana@ejemplo.com", is_active=False)
    _google_returns(monkeypatch, "ana@ejemplo.com")
    assert client.post(LOGIN_URL, json={"credential": "x"}).status_code == 403


def test_login_other_google_account_same_email(
    client: TestClient, make_user: Callable[..., User], monkeypatch: pytest.MonkeyPatch
) -> None:
    user = make_user(email="ana@ejemplo.com")
    user.google_sub = "google-original"
    _google_returns(monkeypatch, "ana@ejemplo.com", sub="google-otra")
    assert client.post(LOGIN_URL, json={"credential": "x"}).status_code == 401


def test_me_without_token(client: TestClient) -> None:
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_with_token(client: TestClient, make_user: Callable[..., User]) -> None:
    user = make_user(role=Role.MONITOR)
    response = client.get("/api/v1/auth/me", headers=auth_headers(user))
    assert response.status_code == 200
    assert response.json()["role"] == "monitor"


def test_me_inactive_user_is_rejected(client: TestClient, make_user: Callable[..., User]) -> None:
    user = make_user(is_active=False)
    assert client.get("/api/v1/auth/me", headers=auth_headers(user)).status_code == 401
