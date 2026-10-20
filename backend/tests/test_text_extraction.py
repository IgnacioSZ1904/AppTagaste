from app.services.text_extraction import DOCX, PDF, extract_text
from tests.files import docx_with_text, pdf_with_text


def test_texto_de_un_pdf() -> None:
    content = pdf_with_text("Dinámica del perdón", "Reflexión en grupo")

    assert extract_text(content, PDF) == "Dinámica del perdón\nReflexión en grupo"


def test_texto_de_un_docx_con_tabla() -> None:
    content = docx_with_text(
        "Convivencia de otoño", "", table=[["Juego", "Material"], ["Gymkana", "Pañuelos"]]
    )

    assert extract_text(content, DOCX) == (
        "Convivencia de otoño\nJuego\nMaterial\nGymkana\nPañuelos"
    )


def test_pdf_sin_texto_queda_vacio() -> None:
    assert extract_text(pdf_with_text(), PDF) == ""


def test_fichero_danado_queda_vacio() -> None:
    assert extract_text(b"%PDF-1.4\nroto", PDF) == ""
    assert extract_text(b"PK\x03\x04roto", DOCX) == ""
