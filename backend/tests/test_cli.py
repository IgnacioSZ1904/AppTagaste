from collections.abc import Callable

import pytest
from sqlalchemy.orm import Session

from app import cli
from app.models.user import Role, User
from app.services import users as users_service


@pytest.fixture(autouse=True)
def _cli_uses_test_db(db: Session, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cli, "SessionLocal", lambda: db)


def test_create_admin_creates_new_user(db: Session) -> None:
    assert cli.main(["create-admin", "--email", "Ana@Ejemplo.com", "--name", "Ana"]) == 0
    user = users_service.get_by_email(db, "ana@ejemplo.com")
    assert user is not None
    assert user.role == Role.ADMIN


def test_create_admin_promotes_existing_user(db: Session, make_user: Callable[..., User]) -> None:
    make_user(role=Role.USUARIO, email="ana@ejemplo.com", is_active=False)

    assert cli.main(["create-admin", "--email", "ana@ejemplo.com", "--name", "Ana"]) == 0

    # El comando cierra su sesión: se vuelve a leer el usuario de la BD
    user = users_service.get_by_email(db, "ana@ejemplo.com")
    assert user is not None
    assert user.role == Role.ADMIN
    assert user.is_active
