from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.google import GoogleIdentity
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class EmailAlreadyExistsError(Exception):
    pass


class UserNotAllowedError(Exception):
    """El email no está dado de alta o el usuario está desactivado."""


class GoogleAccountMismatchError(Exception):
    """El email ya está vinculado a otra cuenta de Google."""


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def list_users(db: Session) -> list[User]:
    return list(db.scalars(select(User).order_by(User.full_name)))


def create_user(db: Session, data: UserCreate) -> User:
    if get_by_email(db, data.email):
        raise EmailAlreadyExistsError(data.email)
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
    if user is None or not user.is_active:
        raise UserNotAllowedError(identity.email)
    if user.google_sub is None:
        # Primer login: vinculamos la cuenta de Google al usuario
        user.google_sub = identity.sub
        db.commit()
    elif user.google_sub != identity.sub:
        raise GoogleAccountMismatchError(identity.email)
    return user
