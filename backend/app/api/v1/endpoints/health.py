from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.errors import ServiceUnavailableError
from app.core.openapi import errors
from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health", summary="Estado de la API y la base de datos", responses=errors(503))
def health(db: Annotated[Session, Depends(get_db)]) -> dict[str, str]:
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError:
        raise ServiceUnavailableError("Base de datos no disponible") from None
    return {"status": "ok", "db": "ok"}
