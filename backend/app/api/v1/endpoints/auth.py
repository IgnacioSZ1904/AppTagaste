from fastapi import APIRouter

from app.api.deps import CurrentUser, DbSession
from app.core.google import verify_google_token
from app.core.openapi import errors
from app.core.security import create_access_token
from app.schemas.auth import GoogleLogin, Token
from app.schemas.user import UserRead
from app.services import users as users_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/google",
    response_model=Token,
    summary="Entrar con Google",
    responses=errors(401, 403, 422),
)
def login_google(body: GoogleLogin, db: DbSession) -> Token:
    """Recibe el ID token de Google y devuelve el JWT de la app (alta automática como usuario)."""
    identity = verify_google_token(body.credential)
    user = users_service.login_with_google(db, identity)
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead, summary="Usuario actual", responses=errors(401))
def me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)
