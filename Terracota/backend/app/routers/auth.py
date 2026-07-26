from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from psycopg import Connection

from ..config import Settings, get_settings
from ..database import get_connection
from ..schemas import TokenResponse, UserIdentity
from ..security import create_access_token


router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/token", response_model=TokenResponse)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    connection: Connection = Depends(get_connection),
    settings: Settings = Depends(get_settings),
) -> TokenResponse:
    record = connection.execute(
        "SELECT * FROM terracota.autenticar_usuario(%s, %s)",
        (form.username, form.password),
    ).fetchone()
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    identity = UserIdentity(
        id=record["usuario_id"],
        nombre=record["nombre"],
        usuario=record["usuario"],
        roles=record["roles"],
    )
    token = create_access_token(
        user_id=identity.id,
        username=identity.usuario,
        roles=identity.roles,
        settings=settings,
    )
    return TokenResponse(access_token=token, usuario=identity)
