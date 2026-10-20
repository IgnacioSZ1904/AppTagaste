from functools import lru_cache

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_SECRET_KEY = "dev-insecure-secret-key-change-me-0000000000"


class Settings(BaseSettings):
    """Configuración de la app, leída de variables de entorno (.env)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AppTagaste"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str
    # Zona horaria de los eventos: las fechas sin zona se interpretan en ella
    timezone: str = "Europe/Madrid"
    # DEBUG, INFO, WARNING… (DEBUG también registra las peticiones a /health)
    log_level: str = "INFO"

    # Autenticación
    secret_key: str = DEV_SECRET_KEY
    access_token_expire_minutes: int = 480
    google_client_id: str = ""

    @field_validator("database_url")
    @classmethod
    def _use_psycopg_driver(cls, url: str) -> str:
        """Acepta la URL tal cual la dan Neon o Render (postgres:// o postgresql://)."""
        for prefix in ("postgres://", "postgresql://"):
            if url.startswith(prefix):
                return "postgresql+psycopg://" + url.removeprefix(prefix)
        return url

    @model_validator(mode="after")
    def _check_production_secrets(self) -> "Settings":
        if self.environment == "production" and self.secret_key in ("", DEV_SECRET_KEY):
            raise ValueError("SECRET_KEY debe definirse en producción")
        if not self.secret_key:
            # SECRET_KEY= vacía en el .env de desarrollo: se usa la clave de desarrollo
            self.secret_key = DEV_SECRET_KEY
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
