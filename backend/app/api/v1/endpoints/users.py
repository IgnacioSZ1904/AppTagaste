from fastapi import APIRouter, status

from app.api.deps import Admin, DbSession
from app.core.errors import BadRequestError, NotFoundError
from app.core.openapi import errors
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import users as users_service

router = APIRouter(prefix="/users", tags=["users"], responses=errors(401, 403, 422))


@router.get("", response_model=list[UserRead], summary="Listar usuarios")
def list_users(db: DbSession, _: Admin) -> list[User]:
    return users_service.list_users(db)


@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Dar de alta un usuario por email",
    responses=errors(409),
)
def create_user(body: UserCreate, db: DbSession, _: Admin) -> User:
    return users_service.create_user(db, body)


@router.patch(
    "/{user_id}",
    response_model=UserRead,
    summary="Cambiar rol, nombre o activar/desactivar",
    responses=errors(400, 404),
)
def update_user(user_id: int, body: UserUpdate, db: DbSession, current: Admin) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("Usuario no encontrado")
    if user.id == current.id and (body.role is not None or body.is_active is not None):
        raise BadRequestError("No puedes cambiar tu propio rol ni desactivarte")
    return users_service.update_user(db, user, body)
