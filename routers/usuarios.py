import sqlite3
import jwt


from fastapi import APIRouter, Depends, HTTPException, status
from pwdlib import PasswordHash

from database import get_db
from modelos.usuario import Usuario
from repositorios.usuario_repositorio import UsuarioRepositorio
from esquemas import UsuarioEntrada, UsuarioRespuesta, LoginEntrada
from datetime import datetime, timedelta, timezone
from seguridad import CLAVE_SECRETA, ALGORITMO

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])
password_hash=PasswordHash.recommended()



DURACION_TOKEN_MINUTOS = 30



@router.post("/", response_model=UsuarioRespuesta, status_code=status.HTTP_201_CREATED)
def crear_usuario(
    datos: UsuarioEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    hash_guardado=password_hash.hash(datos.contrasena)
    usuario=Usuario(
        nombre_usuario=datos.nombre_usuario,
        password_hash=hash_guardado,
    )

    try:
        return UsuarioRepositorio(conexion).crear(usuario)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario ya está registrado",
        )


@router.post("/login")
def iniciar_sesion(
    datos: LoginEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    fila = conexion.execute(
        """
        SELECT id, nombre_usuario, password_hash
        FROM Usuario
        WHERE nombre_usuario = ?
        """,
        (datos.nombre_usuario,),
    ).fetchone()

    if fila is None or not password_hash.verify(
        datos.contrasena,
        fila["password_hash"],
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
        )

    ahora = datetime.now(timezone.utc)
    expira = ahora + timedelta(minutes=DURACION_TOKEN_MINUTOS)

    token = jwt.encode(
        {
            "sub": str(fila["id"]),
            "nombre_usuario": fila["nombre_usuario"],
            "exp": expira,
        },
        CLAVE_SECRETA,
        algorithm=ALGORITMO,
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }

