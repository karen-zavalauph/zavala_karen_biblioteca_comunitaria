import sqlite3

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import get_db

CLAVE_SECRETA = "cambia-esto-por-una-clave-larga-y-aleatoria"
ALGORITMO = "HS256"

esquema_bearer = HTTPBearer(auto_error=False)


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(esquema_bearer),
    conexion: sqlite3.Connection = Depends(get_db),
):
    error_autenticacion = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o faltante",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credenciales is None:
        raise error_autenticacion

    try:
        contenido = jwt.decode(
            credenciales.credentials,
            CLAVE_SECRETA,
            algorithms=[ALGORITMO],
        )
        usuario_id = int(contenido["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise error_autenticacion

    usuario = conexion.execute(
        "SELECT id, nombre_usuario FROM Usuario WHERE id = ?",
        (usuario_id,),
    ).fetchone()

    if usuario is None:
        raise error_autenticacion

    return usuario
