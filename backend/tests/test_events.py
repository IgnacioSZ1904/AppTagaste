from collections.abc import Callable
from datetime import UTC, datetime

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.event import Event, EventType
from app.models.group import Group
from app.models.user import Role, User
from tests.conftest import auth_headers

EVENTS_URL = "/api/v1/events"

NEW_EVENT = {
    "title": "Convivencia de otoño",
    "description": "Fin de semana en la sierra",
    "type": "convivencia",
    "starts_at": "2026-11-13 17:00",
    "ends_at": "2026-11-15 14:00",
    "location": "Albergue",
}


def test_coordinator_creates_event(client: TestClient, make_user: Callable[..., User]) -> None:
    coordinator = make_user(role=Role.COORDINADOR)

    response = client.post(EVENTS_URL, json=NEW_EVENT, headers=auth_headers(coordinator))

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Convivencia de otoño"
    assert body["created_by_id"] == coordinator.id
    assert body["starts_at"] == "2026-11-13 17:00"
    assert body["ends_at"] == "2026-11-15 14:00"


def test_dates_are_spanish_local_time(
    client: TestClient, db: Session, make_user: Callable[..., User]
) -> None:
    response = client.post(EVENTS_URL, json=NEW_EVENT, headers=auth_headers(make_user()))

    # 17:00 en España en noviembre (UTC+1) se guarda como las 16:00 UTC
    event = db.get(Event, response.json()["id"])
    assert event.starts_at == datetime(2026, 11, 13, 16, 0, tzinfo=UTC)


def test_datetime_with_zone_is_converted_to_spanish_time(
    client: TestClient, make_user: Callable[..., User]
) -> None:
    payload = {**NEW_EVENT, "starts_at": "2026-11-13T16:00:00Z"}
    response = client.post(EVENTS_URL, json=payload, headers=auth_headers(make_user()))
    assert response.json()["starts_at"] == "2026-11-13 17:00"


def test_monitor_can_read_but_not_write(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event]
) -> None:
    headers = auth_headers(make_user(role=Role.MONITOR))
    event = make_event()

    assert client.get(EVENTS_URL, headers=headers).status_code == 200
    assert client.get(f"{EVENTS_URL}/{event.id}", headers=headers).status_code == 200
    assert client.post(EVENTS_URL, json=NEW_EVENT, headers=headers).status_code == 403
    assert client.patch(f"{EVENTS_URL}/{event.id}", json={}, headers=headers).status_code == 403
    assert client.delete(f"{EVENTS_URL}/{event.id}", headers=headers).status_code == 403


def test_anonymous_cannot_read_events(client: TestClient) -> None:
    assert client.get(EVENTS_URL).status_code == 401


def test_end_before_start_is_rejected(client: TestClient, make_user: Callable[..., User]) -> None:
    payload = {**NEW_EVENT, "ends_at": NEW_EVENT["starts_at"]}
    response = client.post(EVENTS_URL, json=payload, headers=auth_headers(make_user()))
    assert response.status_code == 422


def test_invalid_datetime_is_rejected(client: TestClient, make_user: Callable[..., User]) -> None:
    payload = {**NEW_EVENT, "starts_at": "13/11/2026 17:00"}
    response = client.post(EVENTS_URL, json=payload, headers=auth_headers(make_user()))
    assert response.status_code == 422


def test_invalid_type_is_rejected(client: TestClient, make_user: Callable[..., User]) -> None:
    payload = {**NEW_EVENT, "type": "excursion"}
    response = client.post(EVENTS_URL, json=payload, headers=auth_headers(make_user()))
    assert response.status_code == 422


def test_coordinator_updates_only_sent_fields(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event]
) -> None:
    event = make_event(title="Antes")

    response = client.patch(
        f"{EVENTS_URL}/{event.id}", json={"title": "Después"}, headers=auth_headers(make_user())
    )

    assert response.status_code == 200
    assert response.json()["title"] == "Después"
    assert response.json()["type"] == "reunion"


def test_update_with_end_before_start_is_rejected(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event]
) -> None:
    event = make_event(starts_at=datetime(2026, 11, 7, 17, 0, tzinfo=UTC))

    response = client.patch(
        f"{EVENTS_URL}/{event.id}",
        json={"ends_at": "2026-11-07 10:00"},
        headers=auth_headers(make_user()),
    )

    assert response.status_code == 422


def test_update_required_field_to_null_is_rejected(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event]
) -> None:
    event = make_event()
    response = client.patch(
        f"{EVENTS_URL}/{event.id}", json={"title": None}, headers=auth_headers(make_user())
    )
    assert response.status_code == 422


def test_coordinator_deletes_event(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event]
) -> None:
    headers = auth_headers(make_user())
    event = make_event()

    assert client.delete(f"{EVENTS_URL}/{event.id}", headers=headers).status_code == 204
    assert client.get(f"{EVENTS_URL}/{event.id}", headers=headers).status_code == 404


def test_missing_event_returns_404(client: TestClient, make_user: Callable[..., User]) -> None:
    headers = auth_headers(make_user())
    assert client.get(f"{EVENTS_URL}/999999", headers=headers).status_code == 404
    assert client.patch(f"{EVENTS_URL}/999999", json={}, headers=headers).status_code == 404
    assert client.delete(f"{EVENTS_URL}/999999", headers=headers).status_code == 404


def test_list_filters_by_overlapping_range_and_type(
    client: TestClient, make_user: Callable[..., User], make_event: Callable[..., Event]
) -> None:
    headers = auth_headers(make_user())
    # Convivencia que empieza en octubre y acaba en noviembre: debe salir en noviembre
    make_event(
        title="Puente",
        starts_at=datetime(2026, 10, 30, 17, 0, tzinfo=UTC),
        hours=48,
        type=EventType.CONVIVENCIA,
    )
    make_event(title="Reunión noviembre", starts_at=datetime(2026, 11, 7, 17, 0, tzinfo=UTC))
    make_event(
        title="Eucaristía noviembre",
        starts_at=datetime(2026, 11, 1, 11, 0, tzinfo=UTC),
        type=EventType.EUCARISTIA,
    )
    make_event(title="Reunión diciembre", starts_at=datetime(2026, 12, 1, 17, 0, tzinfo=UTC))

    november = {"from": "2026-11-01 00:00", "to": "2026-12-01 00:00"}
    titles = [e["title"] for e in client.get(EVENTS_URL, params=november, headers=headers).json()]
    assert titles == ["Puente", "Eucaristía noviembre", "Reunión noviembre"]

    only_meetings = {**november, "type": "reunion"}
    titles = [
        e["title"] for e in client.get(EVENTS_URL, params=only_meetings, headers=headers).json()
    ]
    assert titles == ["Reunión noviembre"]


# Grupos


def test_evento_con_grupos(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    b, a = make_group(name="B"), make_group(name="A")

    response = client.post(
        EVENTS_URL,
        json={**NEW_EVENT, "group_ids": [b.id, a.id]},
        headers=auth_headers(make_user(role=Role.COORDINADOR)),
    )

    assert response.status_code == 201
    assert response.json()["groups"] == [{"id": a.id, "name": "A"}, {"id": b.id, "name": "B"}]


def test_evento_sin_grupos_es_general(client: TestClient, make_user: Callable[..., User]) -> None:
    response = client.post(EVENTS_URL, json=NEW_EVENT, headers=auth_headers(make_user()))

    assert response.status_code == 201
    assert response.json()["groups"] == []


def test_grupo_inexistente_al_crear_da_422(
    client: TestClient, make_user: Callable[..., User]
) -> None:
    response = client.post(
        EVENTS_URL, json={**NEW_EVENT, "group_ids": [999]}, headers=auth_headers(make_user())
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "No existe el grupo: 999"


def test_editar_grupos_del_evento(
    client: TestClient,
    make_user: Callable[..., User],
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
) -> None:
    event, group = make_event(), make_group()
    url = f"{EVENTS_URL}/{event.id}"
    headers = auth_headers(make_user())

    assert client.patch(url, json={"group_ids": [group.id]}, headers=headers).json()["groups"] == [
        {"id": group.id, "name": group.name}
    ]
    # Sin group_ids no se tocan los grupos
    assert len(client.patch(url, json={"title": "Otro"}, headers=headers).json()["groups"]) == 1
    assert client.patch(url, json={"group_ids": []}, headers=headers).json()["groups"] == []
    assert client.patch(url, json={"group_ids": None}, headers=headers).status_code == 422
    assert client.patch(url, json={"group_ids": [999]}, headers=headers).status_code == 422


def test_filtra_por_grupo_con_los_generales(
    client: TestClient,
    db: Session,
    make_user: Callable[..., User],
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
) -> None:
    a, b = make_group(), make_group()
    make_event(title="General")
    make_event(title="De A").groups = [a]
    make_event(title="De B").groups = [b]
    make_event(title="De A y B").groups = [a, b]
    db.commit()
    headers = auth_headers(make_user(role=Role.USUARIO))

    titles = {
        e["title"]
        for e in client.get(EVENTS_URL, params={"group_id": a.id}, headers=headers).json()
    }

    assert titles == {"General", "De A", "De A y B"}
    assert len(client.get(EVENTS_URL, headers=headers).json()) == 4
    assert client.get(EVENTS_URL, params={"group_id": 999}, headers=headers).status_code == 404


def test_borrar_grupo_conserva_sus_eventos(
    client: TestClient,
    db: Session,
    make_user: Callable[..., User],
    make_event: Callable[..., Event],
    make_group: Callable[..., Group],
) -> None:
    group = make_group()
    event = make_event()
    event.groups = [group]
    db.commit()
    headers = auth_headers(make_user())

    assert client.delete(f"/api/v1/groups/{group.id}", headers=headers).status_code == 204

    response = client.get(f"{EVENTS_URL}/{event.id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["groups"] == []
