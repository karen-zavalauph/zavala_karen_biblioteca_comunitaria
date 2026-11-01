import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from database import get_db
from modelos.multa import Multa
from repositorios.multa_repositorio import MultaRepositorio
from esquemas import MultaEntrada, MultaRespuesta


router = APIRouter(prefix="/multas", tags=["Multas"])


@router.get("/", response_model=list[MultaRespuesta])
def listar_multas(conexion: sqlite3.Connection = Depends(get_db)):
    return MultaRepositorio(conexion).listar()


@router.get("/{multa_id}", response_model=MultaRespuesta)
def obtener_multa(
    multa_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    multa = MultaRepositorio(conexion).obtener(multa_id)
    if multa is None:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    return multa


@router.post(
    "/",
    response_model=MultaRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear_multa(
    datos: MultaEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    multa = Multa(**datos.model_dump())
    try:
        return MultaRepositorio(conexion).crear(multa)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="El préstamo no existe o ya tiene una multa",
        )


@router.put("/{multa_id}", response_model=MultaRespuesta)
def actualizar_multa(
    multa_id: int,
    datos: MultaEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    multa = Multa(**datos.model_dump())
    try:
        actualizada = MultaRepositorio(conexion).actualizar(multa_id, multa)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="El préstamo no existe o ya tiene una multa",
        )

    if actualizada is None:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    return actualizada


@router.delete("/{multa_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_multa(
    multa_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    eliminada = MultaRepositorio(conexion).eliminar(multa_id)
    if not eliminada:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    return Response(status_code=status.HTTP_204_NO_CONTENT)