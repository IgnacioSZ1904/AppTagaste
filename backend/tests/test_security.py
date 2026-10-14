from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.core import google
from app.core.config import get_settings
from app.core.google import InvalidGoogleTokenError, verify_google_token
from app.core.security import ALGORITHM, create_access_token, decode_access_token


def test_access_token_roundtrip() -> None:
    assert decode_access_token(create_access_token(42)) == 42


def test_expired_token_is_rejected() -> None:
    expired = {"sub": "42", "exp": datetime.now(UTC) - timedelta(minutes=1)}
    token = jwt.encode(expired, get_settings().secret_key, algorithm=ALGORITHM)
    assert decode_access_token(token) is None


def test_token_signed_with_other_key_is_rejected() -> None:
    token = jwt.encode({"sub": "42"}, "otra-clave-que-no-es-la-nuestra-000000", algorithm=ALGORITHM)
    assert decode_access_token(token) is None


def test_garbage_token_is_rejected() -> None:
    assert decode_access_token("no-es-un-token") is None


@pytest.fixture
def google_client_id(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(get_settings(), "google_client_id", "test-client-id")


def _fake_claims(monkeypatch: pytest.MonkeyPatch, **claims: object) -> None:
    monkeypatch.setattr(google.id_token, "verify_oauth2_token", lambda *args: claims)


def test_google_token_with_verified_email(
    google_client_id: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    _fake_claims(monkeypatch, sub="123", email="Ana@Ejemplo.com", email_verified=True, name="Ana")
    identity = verify_google_token("token")
    assert (identity.sub, identity.email, identity.name) == ("123", "ana@ejemplo.com", "Ana")


def test_google_token_with_unverified_email(
    google_client_id: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    _fake_claims(monkeypatch, sub="123", email="ana@ejemplo.com", email_verified=False)
    with pytest.raises(InvalidGoogleTokenError):
        verify_google_token("token")


def test_google_token_rejected_by_google(
    google_client_id: None, monkeypatch: pytest.MonkeyPatch
) -> None:
    def invalid(*args: object) -> None:
        raise ValueError("Wrong audience")

    monkeypatch.setattr(google.id_token, "verify_oauth2_token", invalid)
    with pytest.raises(InvalidGoogleTokenError):
        verify_google_token("token")


def test_google_login_disabled_without_client_id(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(get_settings(), "google_client_id", "")
    with pytest.raises(InvalidGoogleTokenError):
        verify_google_token("token")
