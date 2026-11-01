import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from database import get_db
from modelos.ejemplar import Ejemplar
from repositorios.ejemplar_repositorio import EjemplarRepositorio
from esquemas import EjemplarEntrada, EjemplarRespuesta


router = APIRouter(prefix="/ejemplares", tags=["Ejemplares"])


@router.get("/", response_model=list[EjemplarRespuesta])
def listar_ejemplares(conexion: sqlite3.Connection = Depends(get_db)):
    return EjemplarRepositorio(conexion).listar()


@router.get("/{ejemplar_id}", response_model=EjemplarRespuesta)
def obtener_ejemplar(
    ejemplar_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    ejemplar = EjemplarRepositorio(conexion).obtener(ejemplar_id)
    if ejemplar is None:
        raise HTTPException(status_code=404, detail="Ejemplar no encontrado")
    return ejemplar


@router.post(
    "/",
    response_model=EjemplarRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear_ejemplar(
    datos: EjemplarEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    ejemplar = Ejemplar(**datos.model_dump(mode="json"))
    try:
        return EjemplarRepositorio(conexion).crear(ejemplar)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="El libro no existe o el código del ejemplar ya está registrado",
        )


@router.put("/{ejemplar_id}", response_model=EjemplarRespuesta)
def actualizar_ejemplar(
    ejemplar_id: int,
    datos: EjemplarEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    ejemplar = Ejemplar(**datos.model_dump(mode="json"))
    try:
        actualizado = EjemplarRepositorio(conexion).actualizar(
            ejemplar_id, ejemplar
        )
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="El libro no existe o el código del ejemplar ya está registrado",
        )

    if actualizado is None:
        raise HTTPException(status_code=404, detail="Ejemplar no encontrado")
    return actualizado


@router.delete(
    "/{ejemplar_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_ejemplar(
    ejemplar_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    try:
        eliminado = EjemplarRepositorio(conexion).eliminar(ejemplar_id)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el ejemplar porque tiene préstamos asociados",
        )

    if not eliminado:
        raise HTTPException(status_code=404, detail="Ejemplar no encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)