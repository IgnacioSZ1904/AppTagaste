from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser, DbSession
from app.core.google import InvalidGoogleTokenError, verify_google_token
from app.core.security import create_access_token
from app.schemas.auth import GoogleLogin, Token
from app.schemas.user import UserRead
from app.services import users as users_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=Token)
def login_google(body: GoogleLogin, db: DbSession) -> Token:
    try:
        identity = verify_google_token(body.credential)
        user = users_service.login_with_google(db, identity)
    except (InvalidGoogleTokenError, users_service.GoogleAccountMismatchError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token de Google no válido"
        ) from None
    except users_service.UserNotAllowedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta no está dada de alta. Pide acceso a un coordinador.",
        ) from None
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)
