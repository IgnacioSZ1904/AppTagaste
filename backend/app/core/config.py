from functools import lru_cache

from pydantic import model_validator
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

    # Autenticación
    secret_key: str = DEV_SECRET_KEY
    access_token_expire_minutes: int = 480
    google_client_id: str = ""

    @model_validator(mode="after")
    def _check_production_secrets(self) -> "Settings":
        if self.environment == "production" and self.secret_key == DEV_SECRET_KEY:
            raise ValueError("SECRET_KEY debe definirse en producción")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
