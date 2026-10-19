from collections.abc import Callable, Iterator
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token
from app.db.session import get_db
from app.main import app
from app.models.event import Event, EventType
from app.models.group import Child, Group
from app.models.user import Role, User

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _test_database_url() -> str:
    """URL de la BD de test: la de .env con el sufijo _test en el nombre."""
    url = make_url(get_settings().database_url)
    return url.set(database=f"{url.database}_test").render_as_string(hide_password=False)


def _create_database_if_missing(url: str) -> None:
    target = make_url(url)
    admin = create_engine(target.set(database="postgres"), isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        exists = conn.scalar(
            text("SELECT 1 FROM pg_database WHERE datname = :name"), {"name": target.database}
        )
        if not exists:
            conn.execute(text(f'CREATE DATABASE "{target.database}"'))
    admin.dispose()


@pytest.fixture(scope="session")
def engine() -> Iterator[Engine]:
    url = _test_database_url()
    # Salvaguarda: nunca correr los tests contra la BD de desarrollo
    assert make_url(url).database.endswith("_test")
    _create_database_if_missing(url)

    alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    alembic_cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(alembic_cfg, "head")

    engine = create_engine(url)
    yield engine
    engine.dispose()


@pytest.fixture
def db(engine: Engine) -> Iterator[Session]:
    """Sesión dentro de una transacción que se deshace al acabar cada test."""
    with engine.connect() as connection:
        transaction = connection.begin()
        session = Session(bind=connection, join_transaction_mode="create_savepoint")
        try:
            yield session
        finally:
            session.close()
            transaction.rollback()


@pytest.fixture
def client(db: Session) -> Iterator[TestClient]:
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def make_user(db: Session) -> Callable[..., User]:
    """Crea usuarios de prueba (admin por defecto): make_user(role=Role.MONITOR, email=...)."""
    counter = iter(range(1, 10_000))

    def _make_user(
        role: Role = Role.ADMIN, email: str | None = None, is_active: bool = True
    ) -> User:
        n = next(counter)
        user = User(
            email=email or f"user{n}@ejemplo.com",
            full_name=f"Usuario {n}",
            role=role,
            is_active=is_active,
        )
        db.add(user)
        db.commit()
        return user

    return _make_user


@pytest.fixture
def make_event(db: Session) -> Callable[..., Event]:
    """Crea eventos de prueba: make_event(starts_at=..., hours=2, type=EventType.REUNION)."""

    def _make_event(
        starts_at: datetime | None = None,
        hours: int = 2,
        type: EventType = EventType.REUNION,
        title: str = "Reunión de prueba",
    ) -> Event:
        start = starts_at or datetime(2026, 11, 7, 17, 0, tzinfo=UTC)
        event = Event(
            title=title, type=type, starts_at=start, ends_at=start + timedelta(hours=hours)
        )
        db.add(event)
        db.commit()
        return event

    return _make_event


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


def auth_headers(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}
