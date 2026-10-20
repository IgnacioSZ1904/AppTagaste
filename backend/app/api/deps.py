from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.group import Group
from app.models.user import Role, User

DbSession = Annotated[Session, Depends(get_db)]

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized
    user_id = decode_access_token(credentials.credentials)
    user = db.get(User, user_id) if user_id is not None else None
    if user is None or not user.is_active:
        raise unauthorized
    # Para la línea de log de la petición (middleware)
    request.state.user_id = user.id
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: Role) -> Callable[[User], User]:
    """Dependencia que deja pasar solo a usuarios con alguno de los roles indicados."""

    def checker(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso denegado")
        return user

    return checker


Admin = Annotated[User, Depends(require_role(Role.ADMIN))]
EventEditor = Annotated[User, Depends(require_role(Role.ADMIN, Role.COORDINADOR))]


def get_group_or_404(group_id: int, db: DbSession) -> Group:
    group = db.get(Group, group_id)
    if group is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grupo no encontrado")
    return group


GroupById = Annotated[Group, Depends(get_group_or_404)]


def get_managed_group(group: GroupById, user: CurrentUser) -> Group:
    """El grupo, si el usuario es admin o responsable de él (sus niños son datos de menores)."""
    if not group.is_managed_by(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso denegado")
    return group


ManagedGroup = Annotated[Group, Depends(get_managed_group)]


def get_monitored_group(group: GroupById, user: CurrentUser) -> Group:
    """El grupo, si el usuario es monitor responsable de él (el único que pasa lista)."""
    if not group.is_monitored_by(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permiso denegado")
    return group


MonitoredGroup = Annotated[Group, Depends(get_monitored_group)]

# Biblioteca de recursos: ver, abrir y añadir documentos
Librarian = Annotated[User, Depends(require_role(Role.ADMIN, Role.COORDINADOR, Role.MONITOR))]
