from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.group import Child, Group
from app.models.user import Role, User
from tests.conftest import auth_headers

URL = "/api/v1/groups"


@pytest.fixture
def make_group(db: Session) -> Callable[..., Group]:
    """Crea un grupo con responsables y niños: make_group(members=[u], children=["Ana"])."""
    counter = iter(range(1, 10_000))

    def _make_group(
        name: str | None = None, members: list[User] | None = None, children: tuple[str, ...] = ()
    ) -> Group:
        group = Group(name=name or f"Grupo {next(counter)}", members=members or [])
        group.children = [Child(full_name=c) for c in children]
        db.add(group)
        db.commit()
        return group

    return _make_group


# Grupos


def test_admin_crea_grupo(client: TestClient, make_user: Callable[..., User]) -> None:
    response = client.post(
        URL, json={"name": "  1º Confirmación A "}, headers=auth_headers(make_user())
    )

    assert response.status_code == 201
    assert response.json() == {
        "id": response.json()["id"],
        "name": "1º Confirmación A",
        "members": [],
        "children_count": 0,
    }


def test_nombre_repetido_da_409(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    headers = auth_headers(make_user())
    make_group(name="Grupo A")
    other = make_group(name="Grupo B")

    create = client.post(URL, json={"name": "Grupo A"}, headers=headers)
    rename = client.patch(f"{URL}/{other.id}", json={"name": "Grupo A"}, headers=headers)
    same = client.patch(f"{URL}/{other.id}", json={"name": "Grupo B"}, headers=headers)

    assert create.status_code == 409
    assert rename.status_code == 409
    assert same.status_code == 200


def test_lista_grupos_con_responsables_y_numero_de_ninos(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    monitor = make_user(role=Role.MONITOR)
    make_group(name="B", members=[monitor], children=["Ana", "Luis"])
    make_group(name="A")

    response = client.get(URL, headers=auth_headers(make_user(role=Role.USUARIO)))

    assert response.status_code == 200
    groups = response.json()
    assert [g["name"] for g in groups] == ["A", "B"]
    assert groups[1]["children_count"] == 2
    assert groups[1]["members"] == [
        {"id": monitor.id, "full_name": monitor.full_name, "role": "monitor"}
    ]
    assert "children" not in groups[1]


def test_grupo_inexistente_da_404(client: TestClient, make_user: Callable[..., User]) -> None:
    assert client.get(f"{URL}/999999", headers=auth_headers(make_user())).status_code == 404


def test_borrar_grupo_borra_sus_ninos(
    client: TestClient,
    db: Session,
    make_user: Callable[..., User],
    make_group: Callable[..., Group],
) -> None:
    group = make_group(members=[make_user(role=Role.MONITOR)], children=["Ana"])
    child_id = group.children[0].id

    response = client.delete(f"{URL}/{group.id}", headers=auth_headers(make_user()))

    assert response.status_code == 204
    db.expire_all()
    assert db.get(Child, child_id) is None


# Responsables


@pytest.mark.parametrize("role", [Role.MONITOR, Role.COORDINADOR])
def test_asignar_responsable(
    client: TestClient,
    make_user: Callable[..., User],
    make_group: Callable[..., Group],
    role: Role,
) -> None:
    group = make_group()
    member = make_user(role=role)

    response = client.post(
        f"{URL}/{group.id}/members", json={"user_id": member.id}, headers=auth_headers(make_user())
    )

    assert response.status_code == 201
    assert [m["id"] for m in response.json()["members"]] == [member.id]


@pytest.mark.parametrize("role", [Role.ADMIN, Role.USUARIO])
def test_solo_monitores_y_coordinadores_son_responsables(
    client: TestClient,
    make_user: Callable[..., User],
    make_group: Callable[..., Group],
    role: Role,
) -> None:
    group = make_group()
    response = client.post(
        f"{URL}/{group.id}/members",
        json={"user_id": make_user(role=role).id},
        headers=auth_headers(make_user()),
    )
    assert response.status_code == 422


def test_asignar_dos_veces_o_usuario_inexistente(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    headers = auth_headers(make_user())
    monitor = make_user(role=Role.MONITOR)
    group = make_group(members=[monitor])

    again = client.post(f"{URL}/{group.id}/members", json={"user_id": monitor.id}, headers=headers)
    missing = client.post(f"{URL}/{group.id}/members", json={"user_id": 999999}, headers=headers)

    assert again.status_code == 409
    assert missing.status_code == 404


def test_quitar_responsable(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    headers = auth_headers(make_user())
    monitor = make_user(role=Role.MONITOR)
    group = make_group(members=[monitor])

    first = client.delete(f"{URL}/{group.id}/members/{monitor.id}", headers=headers)
    second = client.delete(f"{URL}/{group.id}/members/{monitor.id}", headers=headers)

    assert first.status_code == 204
    assert second.status_code == 404
    assert client.get(f"{URL}/{group.id}", headers=headers).json()["members"] == []


# Niños


def test_responsable_gestiona_ninos_de_su_grupo(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    monitor = make_user(role=Role.MONITOR)
    group = make_group(members=[monitor], children=["Zoe Ruiz"])
    headers = auth_headers(monitor)
    children_url = f"{URL}/{group.id}/children"

    created = client.post(children_url, json={"full_name": " Ana García "}, headers=headers)
    child_id = created.json()["id"]
    renamed = client.patch(
        f"{children_url}/{child_id}", json={"full_name": "Ana García López"}, headers=headers
    )
    listed = client.get(children_url, headers=headers)
    deleted = client.delete(f"{children_url}/{child_id}", headers=headers)

    assert created.status_code == 201
    assert created.json()["full_name"] == "Ana García"
    assert renamed.json()["full_name"] == "Ana García López"
    assert [c["full_name"] for c in listed.json()] == ["Ana García López", "Zoe Ruiz"]
    assert deleted.status_code == 204


def test_nino_de_otro_grupo_da_404(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    monitor = make_user(role=Role.MONITOR)
    mine = make_group(members=[monitor])
    other = make_group(children=["Ana"])

    response = client.delete(
        f"{URL}/{mine.id}/children/{other.children[0].id}", headers=auth_headers(monitor)
    )

    assert response.status_code == 404


def test_responsable_que_pierde_el_rol_pierde_el_acceso(
    client: TestClient,
    db: Session,
    make_user: Callable[..., User],
    make_group: Callable[..., Group],
) -> None:
    monitor = make_user(role=Role.MONITOR)
    group = make_group(members=[monitor])
    monitor.role = Role.USUARIO
    db.commit()

    response = client.get(f"{URL}/{group.id}/children", headers=auth_headers(monitor))

    assert response.status_code == 403


# Mis grupos


def test_mis_grupos(
    client: TestClient, make_user: Callable[..., User], make_group: Callable[..., Group]
) -> None:
    coordinator = make_user(role=Role.COORDINADOR)
    make_group(name="B", members=[coordinator])
    make_group(name="A", members=[coordinator])
    make_group(name="C")

    response = client.get("/api/v1/me/groups", headers=auth_headers(coordinator))

    assert response.status_code == 200
    assert [g["name"] for g in response.json()] == ["A", "B"]
