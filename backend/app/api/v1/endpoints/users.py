from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import DbSession, require_role
from app.models.user import Role, User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import users as users_service

router = APIRouter(prefix="/users", tags=["users"])

Coordinator = Annotated[User, Depends(require_role(Role.COORDINADOR))]


@router.get("", response_model=list[UserRead])
def list_users(db: DbSession, _: Coordinator) -> list[User]:
    return users_service.list_users(db)


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(body: UserCreate, db: DbSession, _: Coordinator) -> User:
    try:
        return users_service.create_user(db, body)
    except users_service.EmailAlreadyExistsError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Ya existe un usuario con ese email"
        ) from None


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, body: UserUpdate, db: DbSession, current: Coordinator) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    if user.id == current.id and (body.role is not None or body.is_active is not None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes cambiar tu propio rol ni desactivarte",
        )
    return users_service.update_user(db, user, body)
