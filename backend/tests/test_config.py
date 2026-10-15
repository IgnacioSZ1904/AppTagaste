import pytest
from pydantic import ValidationError

from app.core.config import DEV_SECRET_KEY, Settings

NEON_URL = "postgresql://user:pw@ep-x.eu-central-1.aws.neon.tech/apptagaste?sslmode=require"


@pytest.mark.parametrize(
    ("url", "expected"),
    [
        (NEON_URL, "postgresql+psycopg://" + NEON_URL.removeprefix("postgresql://")),
        ("postgres://user:pw@host/db", "postgresql+psycopg://user:pw@host/db"),
        ("postgresql+psycopg://user:pw@db:5432/db", "postgresql+psycopg://user:pw@db:5432/db"),
    ],
)
def test_database_url_uses_psycopg_driver(url: str, expected: str) -> None:
    assert Settings(database_url=url).database_url == expected


@pytest.mark.parametrize("secret_key", [DEV_SECRET_KEY, ""])
def test_production_requires_secret_key(secret_key: str) -> None:
    with pytest.raises(ValidationError, match="SECRET_KEY"):
        Settings(database_url=NEON_URL, environment="production", secret_key=secret_key)


def test_empty_secret_key_in_development_uses_dev_key() -> None:
    settings = Settings(database_url=NEON_URL, environment="development", secret_key="")
    assert settings.secret_key == DEV_SECRET_KEY


def test_production_with_secret_key_is_valid() -> None:
    settings = Settings(database_url=NEON_URL, environment="production", secret_key="x" * 48)
    assert settings.environment == "production"
