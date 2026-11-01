import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from database import get_db
from modelos.lector import Lector
from repositorios.lector_repositorio import LectorRepositorio
from esquemas import LectorEntrada, LectorRespuesta


router = APIRouter(prefix="/lectores", tags=["Lectores"])


@router.get("/", response_model=list[LectorRespuesta])
def listar_lectores(conexion: sqlite3.Connection = Depends(get_db)):
    return LectorRepositorio(conexion).listar()


@router.get("/{lector_id}", response_model=LectorRespuesta)
def obtener_lector(
    lector_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    lector = LectorRepositorio(conexion).obtener(lector_id)
    if lector is None:
        raise HTTPException(status_code=404, detail="Lector no encontrado")
    return lector


@router.post(
    "/",
    response_model=LectorRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear_lector(
    datos: LectorEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    lector = Lector(**datos.model_dump())
    try:
        return LectorRepositorio(conexion).crear(lector)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un lector con esa identificación",
        )


@router.put("/{lector_id}", response_model=LectorRespuesta)
def actualizar_lector(
    lector_id: int,
    datos: LectorEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    lector = Lector(**datos.model_dump())
    try:
        actualizado = LectorRepositorio(conexion).actualizar(lector_id, lector)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un lector con esa identificación",
        )

    if actualizado is None:
        raise HTTPException(status_code=404, detail="Lector no encontrado")
    return actualizado


@router.delete("/{lector_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_lector(
    lector_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    try:
        eliminado = LectorRepositorio(conexion).eliminar(lector_id)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el lector porque tiene préstamos asociados",
        )

    if not eliminado:
        raise HTTPException(status_code=404, detail="Lector no encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)