import io
import zipfile
from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import update
from sqlalchemy.orm import Session

from app import cli
from app.models.document import Document
from app.models.group import Group
from app.models.user import Role, User
from app.services import documents as documents_service
from tests.conftest import auth_headers
from tests.files import docx_with_text, pdf_with_text

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
        "has_text": False,
        "snippet": None,
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


def test_fichero_de_drive_repetido_da_409(upload: Callable[..., dict]) -> None:
    first = upload(drive_file_id="abc123", title="Reunión del perdón")

    response = upload(drive_file_id="abc123", status=409)

    assert first["id"]
    assert response["detail"] == "Ya está en la biblioteca: «Reunión del perdón»"


def test_desde_el_ordenador_se_puede_repetir(upload: Callable[..., dict]) -> None:
    first = upload(drive_file_id="")
    second = upload()

    assert first["id"] != second["id"]


@pytest.fixture
def search(client: TestClient, monitor: User) -> Callable[..., list[dict]]:
    def _search(q: str, **params: str) -> list[dict]:
        response = client.get(URL, params={"q": q, **params}, headers=auth_headers(monitor))
        assert response.status_code == 200, response.text
        return response.json()

    return _search


def ids_of(documents: list[dict]) -> list[int]:
    return [d["id"] for d in documents]


def test_busca_en_el_texto_sin_tildes_y_con_variantes(
    upload: Callable[..., dict], search: Callable[..., list[dict]]
) -> None:
    perdon = upload(
        content=pdf_with_text("Dinámica: pedimos perdón por lo que hicimos mal."),
        filename="sesion1.pdf",
    )
    upload(content=docx_with_text("Juegos para la convivencia"), filename="juegos.docx")

    assert perdon["has_text"]
    assert ids_of(search("perdon")) == [perdon["id"]]
    assert ids_of(search("perdonar")) == [perdon["id"]]
    assert ids_of(search("DINAMICAS")) == [perdon["id"]]
    assert search("perdón")[0]["snippet"] == (
        "Dinámica: pedimos <mark>perdón</mark> por lo que hicimos mal."
    )


def test_busca_en_tablas_de_word(
    upload: Callable[..., dict], search: Callable[..., list[dict]]
) -> None:
    document = upload(
        content=docx_with_text("Material", table=[["Gymkana", "Pañuelos"]]), filename="g.docx"
    )

    assert ids_of(search("panuelo")) == [document["id"]]


def test_varias_palabras_frase_y_prefijo(
    upload: Callable[..., dict], search: Callable[..., list[dict]]
) -> None:
    a = upload(content=pdf_with_text("La oración de la mañana en grupo"), filename="a.pdf")
    b = upload(content=pdf_with_text("Grupo de oración y mañana de juegos"), filename="b.pdf")

    assert set(ids_of(search("oración mañana"))) == {a["id"], b["id"]}
    assert ids_of(search("oración juegos")) == [b["id"]]
    assert ids_of(search('"oración de la mañana"')) == [a["id"]]
    assert set(ids_of(search("orac"))) == {a["id"], b["id"]}
    assert ids_of(search("oración jue")) == [b["id"]]
    assert search("nada que ver") == []


def test_titulo_y_etiquetas_pesan_mas_que_el_texto(
    upload: Callable[..., dict], search: Callable[..., list[dict]]
) -> None:
    in_text = upload(content=pdf_with_text("Hablamos de la amistad"), filename="texto.pdf")
    in_tag = upload(tags="Amistad", filename="otra.pdf")
    in_title = upload(title="Dinámica de la amistad", filename="titulo.pdf")

    found = search("amistad")

    assert ids_of(found)[2] == in_text["id"]
    assert set(ids_of(found)[:2]) == {in_tag["id"], in_title["id"]}
    # Sin texto (PDF escaneado) se encuentra por título y etiquetas, sin fragmento
    assert found[0]["has_text"] is False
    assert found[0]["snippet"] is None


def test_busqueda_con_filtros(
    upload: Callable[..., dict], search: Callable[..., list[dict]]
) -> None:
    content = pdf_with_text("Eucaristía de inicio de curso")
    old = upload(content=content, filename="a.pdf", school_year="2024-2025", tags="misa")
    new = upload(content=content, filename="b.pdf")

    assert set(ids_of(search("eucaristia"))) == {old["id"], new["id"]}
    assert ids_of(search("eucaristia", school_year="2024-2025")) == [old["id"]]
    assert ids_of(search("eucaristia", tag="misa")) == [old["id"]]
    assert ids_of(search("eucaristia", group="Otro grupo")) == []


def test_busqueda_vacia_o_rara_no_falla(
    upload: Callable[..., dict], search: Callable[..., list[dict]]
) -> None:
    document = upload()

    assert ids_of(search("  ")) == [document["id"]]
    for q in ["de", "-", '"', "a OR", "perdón -", "(x) & y:* | !z"]:
        search(q)


def test_reindex_documents(
    db: Session,
    upload: Callable[..., dict],
    search: Callable[..., list[dict]],
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    document = upload(content=pdf_with_text("Reunión de padres"), filename="r.pdf")
    upload()
    db.execute(update(Document).values(content_text=None, search_vector=None))
    assert search("padres") == []
    monkeypatch.setattr(cli, "SessionLocal", lambda: db)

    assert cli.main(["reindex-documents"]) == 0

    assert capsys.readouterr().out == "Documentos indexados: 2 (1 sin texto)\n"
    # El comando cierra su sesión: se busca directamente en el servicio
    found = documents_service.list_documents(db, q="padres")
    assert [d.id for d, _, _ in found] == [document["id"]]
