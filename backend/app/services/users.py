from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, ForbiddenError, UnauthorizedError
from app.core.google import GoogleIdentity
from app.models.user import Role, User
from app.schemas.user import UserCreate, UserUpdate


class EmailAlreadyExistsError(ConflictError):
    detail = "Ya existe un usuario con ese email"


class UserInactiveError(ForbiddenError):
    detail = "Tu cuenta está desactivada. Pide acceso a un administrador."


class GoogleAccountMismatchError(UnauthorizedError):
    """El email ya está vinculado a otra cuenta de Google: se responde como a un token malo."""

    detail = "Token de Google no válido"


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.full_name)))


def create_user(db: Session, data: UserCreate) -> User:
    if get_by_email(db, data.email):
        raise EmailAlreadyExistsError()
    user = User(email=data.email.lower(), full_name=data.full_name, role=data.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, data: UserUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def login_with_google(db: Session, identity: GoogleIdentity) -> User:
    user = get_by_email(db, identity.email)
    if user is None:
        # Alta automática: cualquier cuenta de Google puede ver el calendario
        name = (identity.name or identity.email.split("@")[0])[:120]
        user = User(
            email=identity.email, full_name=name, role=Role.USUARIO, google_sub=identity.sub
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    if not user.is_active:
        raise UserInactiveError()
    if user.google_sub is None:
        # Primer login: vinculamos la cuenta de Google al usuario
        user.google_sub = identity.sub
        db.commit()
    elif user.google_sub != identity.sub:
        raise GoogleAccountMismatchError()
    return user
