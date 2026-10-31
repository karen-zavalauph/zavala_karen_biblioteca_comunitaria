import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from database import get_db
from modelos.libro import Libro
from repositorios.libro_repositorio import LibroRepositorio
from esquemas import LibroEntrada, LibroRespuesta

router= APIRouter(prefix="/libros", tags=["Libros"])

@router.get("/", response_model=list[LibroRespuesta])
def listar_libros(conexion: sqlite3.Connection= Depends(get_db)):
    return LibroRepositorio(conexion).listar()


@router.get ("/{libro_id}", response_model=LibroRespuesta)
def obtener_libro(
    libro_id:int,
    conexion:sqlite3.Connection=Depends(get_db),
):
    libro=LibroRepositorio(conexion).obtener(libro_id)
    if libro is None:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro


@router.post(
    "/",
    response_model=LibroRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear_libro(
    datos:LibroEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    libro= Libro(**datos.model_dump())
    try:
        return LibroRepositorio(conexion).crear(libro)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="El ISBN ya existe o el autor indicado no existe",
        )



@router.put("/{libro_id}", response_model=LibroRespuesta)
def actualizar_libro(
    libro_id:int,
    datos:LibroEntrada,
    conexion:sqlite3.Connection=Depends(get_db),
):
    libro= Libro(**datos.model_dump())
    try:
        actualizado=LibroRepositorio(conexion).actualizar(libro_id, libro)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="El ISBN ya existe o el autor indicado no existe",

        )

    if actualizado is None:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return actualizado


@router.delete("/{libro_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_libro(
    libro_id:int,
    conexion: sqlite3.Connection=Depends(get_db),

):
    try:
        eliminado=LibroRepositorio(conexion).eliminar(libro_id)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliinar el libro porque tiene ejemplares asociados",

        )
    if not eliminado:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)