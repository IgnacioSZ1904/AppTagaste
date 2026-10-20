import logging
from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models.user import Role, User
from app.services import groups as groups_service
from tests.conftest import auth_headers

URL = "/api/v1/groups"


@pytest.fixture
def admin(make_user: Callable[..., User]) -> User:
    return make_user(role=Role.ADMIN)


def test_error_de_servicio_da_su_estado_y_mensaje(
    client: TestClient, admin: User, make_group: Callable
) -> None:
    make_group(name="Juniors")

    response = client.post(URL, json={"name": "Juniors"}, headers=auth_headers(admin))

    assert response.status_code == 409
    assert response.json() == {"detail": "Ya existe un grupo con ese nombre"}


@pytest.mark.parametrize(
    ("body", "detail"),
    [
        ({}, "name: es obligatorio"),
        ({"name": ""}, "name: debe tener al menos 1 carácter(es)"),
        ({"name": 3}, "name: debe ser texto"),
    ],
)
def test_validacion_en_espanol(client: TestClient, admin: User, body: dict, detail: str) -> None:
    response = client.post(URL, json=body, headers=auth_headers(admin))

    assert response.status_code == 422
    assert response.json() == {"detail": detail}


def test_validadores_propios_sin_prefijo_de_pydantic(client: TestClient, admin: User) -> None:
    response = client.post(
        "/api/v1/events",
        json={
            "title": "Reunión",
            "type": "reunion",
            "starts_at": "2026-10-20 18:00",
            "ends_at": "2026-10-20 17:00",
        },
        headers=auth_headers(admin),
    )

    assert response.json() == {"detail": "La fecha de fin debe ser posterior a la de inicio"}


def test_error_inesperado_da_500_con_referencia_y_traza_en_el_log(
    client: TestClient,
    admin: User,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    def boom(_: object) -> None:
        raise RuntimeError("fallo de prueba")

    monkeypatch.setattr(groups_service, "list_groups", boom)

    with caplog.at_level(logging.INFO):
        response = client.get(URL, headers=auth_headers(admin))

    request_id = response.headers["X-Request-ID"]
    assert response.status_code == 500
    assert response.json() == {"detail": "Error interno del servidor", "request_id": request_id}
    error = next(r for r in caplog.records if r.levelno == logging.ERROR)
    assert "GET /api/v1/groups" in error.getMessage()
    assert error.exc_info is not None and "fallo de prueba" in str(error.exc_info[1])
    assert error.request_id == request_id  # type: ignore[attr-defined]


def test_cada_peticion_lleva_su_id_y_deja_una_linea_de_log(
    client: TestClient, admin: User, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.INFO, logger="app.requests"):
        generated = client.get(URL, headers=auth_headers(admin))
        given = client.get(URL, headers={**auth_headers(admin), "X-Request-ID": "abc123"})

    assert len(generated.headers["X-Request-ID"]) == 12
    assert given.headers["X-Request-ID"] == "abc123"
    lines = [r.getMessage() for r in caplog.records if r.name == "app.requests"]
    assert lines[0].startswith("GET /api/v1/groups 200 ")
    assert lines[0].endswith(f"usuario={admin.id}")
    assert caplog.records[-1].request_id == "abc123"  # type: ignore[attr-defined]


def test_sin_sesion_el_log_no_tiene_usuario(
    client: TestClient, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.INFO, logger="app.requests"):
        client.get(URL)

    assert caplog.records[-1].getMessage().startswith("GET /api/v1/groups 401 ")
    assert caplog.records[-1].getMessage().endswith("usuario=-")


def test_health_solo_en_debug(client: TestClient, caplog: pytest.LogCaptureFixture) -> None:
    with caplog.at_level(logging.INFO, logger="app.requests"):
        client.get("/api/v1/health")

    assert [r for r in caplog.records if r.name == "app.requests"] == []


def test_openapi_documentado(client: TestClient) -> None:
    schema = client.get("/openapi.json").json()

    assert schema["info"]["version"] == "1.0.0"
    assert "AppTagaste" in schema["info"]["description"]
    assert all(tag.get("description") for tag in schema["tags"])
    operations = [op for path in schema["paths"].values() for op in path.values()]
    assert len(operations) >= 36
    assert all(op.get("summary") for op in operations)
    # Los errores usan el esquema propio, también los 422
    groups_post = schema["paths"]["/api/v1/groups"]["post"]["responses"]
    assert groups_post["422"]["content"]["application/json"]["schema"]["$ref"].endswith(
        "/ErrorRead"
    )
    assert "HTTPValidationError" not in schema["components"]["schemas"]


def test_la_app_registra_los_manejadores() -> None:
    from app.core.errors import AppError

    assert AppError in app.exception_handlers
