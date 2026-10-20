from fastapi import FastAPI

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.core.logging import setup_logging
from app.core.middleware import RequestLogMiddleware
from app.core.openapi import DESCRIPTION, TAGS

settings = get_settings()
setup_logging(settings.log_level)

app = FastAPI(
    title=settings.app_name,
    description=DESCRIPTION,
    version="1.0.0",
    contact={"name": "Ignacio Segovia Zurita", "email": "segovia.ignacio1904@gmail.com"},
    openapi_tags=TAGS,
)
app.add_middleware(RequestLogMiddleware)
register_error_handlers(app)
app.include_router(api_router, prefix=settings.api_v1_prefix)
