import io
import zipfile
from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.group import Group
from app.models.user import Role, User
from app.services import documents as documents_service
from tests.conftest import auth_headers

URL = "/api/v1/documents"
PDF = b"%PDF-1.4\n% prueba\n"


def docx() -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("word/document.xml", "<w:document/>")
    return buffer.getvalue()


@pytest.fixture
def monitor(make_user: Callable[..., User]) -> User:
    return make_user(role=Role.MONITOR)


@pytest.fixture
def group(make_group: Callable[..., Group]) -> Group:
    return make_group(name="1º Confirmación")


@pytest.fixture
def upload(client: TestClient, monitor: User, group: Group) -> Callable[..., dict]:
    def _upload(
        content: bytes = PDF,
        filename: str = "Dinámica del perdón.pdf",
        status: int = 201,
        **form: str | int,
    ) -> dict:
        data = {"school_year": "2025-2026", "group_id": group.id, **form}
        response = client.post(
            URL,
            data=data,
            files={"file": (filename, content, "application/octet-stream")},
            headers=auth_headers(monitor),
        )
        assert response.status_code == status, response.text
        return response.json()

    return _upload


def test_monitor_anade_un_pdf(upload: Callable[..., dict], monitor: User, group: Group) -> None:
    document = upload(tags="Perdón, amistad")

    assert document == {
        "id": document["id"],
        "title": "Dinámica del perdón",
        "school_year": "2025-2026",
        "group_id": group.id,
        "group_name": "1º Confirmación",
        "filename": "Dinámica del perdón.pdf",
        "mime_type": "application/pdf",
        "size": len(PDF),
        "tags": [
            {"id": document["tags"][0]["id"], "name": "amistad"},
            {"id": document["tags"][1]["id"], "name": "Perdón"},
        ],
        "created_by": monitor.full_name,
        "created_at": document["created_at"],
    }


def test_anade_un_docx_con_titulo(upload: Callable[..., dict]) -> None:
    document = upload(content=docx(), filename="reunion.docx", title=" Reunión 1 ")

    assert document["title"] == "Reunión 1"
    assert document["mime_type"] == documents_service.DOCX


def test_etiquetas_con_y_sin_tilde_son_la_misma(
    client: TestClient, upload: Callable[..., dict], monitor: User
) -> None:
    first = upload(tags="Perdón")
    second = upload(tags="perdon,  PERDÓN , ")

    assert second["tags"] == first["tags"]
    tags = client.get("/api/v1/tags", headers=auth_headers(monitor)).json()
    assert [t["name"] for t in tags] == ["Perdón"]


def test_filtros(
    client: TestClient,
    upload: Callable[..., dict],
    make_group: Callable[..., Group],
    monitor: User,
) -> None:
    other = make_group(name="2º Confirmación")
    a = upload(tags="perdón,amistad")
    b = upload(tags="perdón", school_year="2024-2025")
    c = upload(tags="amistad", group_id=other.id)
    headers = auth_headers(monitor)

    def ids(**params: str | list[str]) -> list[int]:
        return [d["id"] for d in client.get(URL, params=params, headers=headers).json()]

    assert ids() == [c["id"], b["id"], a["id"]]
    assert ids(school_year="2024-2025") == [b["id"]]
    assert ids(group="2º Confirmación") == [c["id"]]
    assert ids(tag="Perdon") == [b["id"], a["id"]]
    assert ids(tag=["perdón", "amistad"]) == [a["id"]]

    filters = client.get(f"{URL}/filters", headers=headers).json()
    assert filters["school_years"] == ["2025-2026", "2024-2025"]
    assert filters["groups"] == ["1º Confirmación", "2º Confirmación"]
    assert [t["name"] for t in filters["tags"]] == ["amistad", "perdón"]


def test_abrir_la_copia_del_fichero(
    client: TestClient, upload: Callable[..., dict], monitor: User
) -> None:
    document = upload()

    response = client.get(f"{URL}/{document['id']}/file", headers=auth_headers(monitor))

    assert response.status_code == 200
    assert response.content == PDF
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["content-disposition"] == (
        "inline; filename*=UTF-8''Din%C3%A1mica%20del%20perd%C3%B3n.pdf"
    )


def test_documento_inexistente_da_404(client: TestClient, monitor: User) -> None:
    headers = auth_headers(monitor)
    assert client.get(f"{URL}/999999", headers=headers).status_code == 404
    assert client.get(f"{URL}/999999/file", headers=headers).status_code == 404


@pytest.mark.parametrize(
    "content",
    [b"hola, soy un txt", b"PK\x03\x04no es un zip", b"\x89PNG\r\n\x1a\n"],
)
def test_tipo_no_admitido_da_422(upload: Callable[..., dict], content: bytes) -> None:
    upload(content=content, filename="falso.pdf", status=422)


def test_fichero_de_mas_de_10_mb_da_413(
    upload: Callable[..., dict], monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(documents_service, "MAX_SIZE", len(PDF) - 1)
    upload(status=413)


@pytest.mark.parametrize("year", ["2025", "2025-2027", "25-26", "2099-2100"])
def test_curso_no_valido_da_422(upload: Callable[..., dict], year: str) -> None:
    upload(school_year=year, status=422)


def test_grupo_inexistente_da_422(upload: Callable[..., dict]) -> None:
    upload(group_id=999999, status=422)


def test_borrar_el_grupo_conserva_su_nombre(
    client: TestClient, db: Session, upload: Callable[..., dict], group: Group, monitor: User
) -> None:
    document = upload()
    db.delete(group)
    db.commit()
    db.expire_all()

    response = client.get(f"{URL}/{document['id']}", headers=auth_headers(monitor))

    assert response.json()["group_id"] is None
    assert response.json()["group_name"] == "1º Confirmación"
    assert db.get(Document, document["id"]) is not None
