# Importa aquí cada modelo nuevo para que Alembic lo detecte con --autogenerate
from app.db.base import Base
from app.models.event import Event, EventType, event_groups
from app.models.group import Child, Group, group_members
from app.models.user import Role, User

__all__ = [
    "Base",
    "Child",
    "Event",
    "EventType",
    "Group",
    "Role",
    "User",
    "event_groups",
    "group_members",
]
