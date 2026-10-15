# Importa aquí cada modelo nuevo para que Alembic lo detecte con --autogenerate
from app.db.base import Base
from app.models.event import Event, EventType
from app.models.user import Role, User

__all__ = ["Base", "Event", "EventType", "Role", "User"]
