from pydantic import BaseModel


class GoogleLogin(BaseModel):
    credential: str  # ID token que devuelve Google Identity Services en el frontend


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
