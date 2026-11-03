import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from pwdlib import PasswordHash

from database import get_db
from modelos.usuario import Usuario
from repositorios.usuario_repositorio import UsuarioRepositorio
from esquemas import UsuarioEntrada, UsuarioRespuesta

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])
password_hash=PasswordHash.recommended()



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