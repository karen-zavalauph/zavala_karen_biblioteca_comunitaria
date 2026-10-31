import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from database import get_db
from repositorios.autor_repositorio import AutorRepositorio
from esquemas import AutorEntrada, AutorRespuesta

router = APIRouter(prefix="/autores", tags=["Autores"])


@router.get("/", response_model=list[AutorRespuesta])
def listar_autor(conexion: sqlite3.Connection= Depends(get_db)):
    return AutorRepositorio(conexion).listar()



@router.get("/{autor_id}", response_model=AutorRespuesta)
def obtener_autor(
    autor_id:int,
    conexion: sqlite3.Connection= Depends(get_db),
):
    autor= AutorRepositorio(conexion).obtener(autor_id)
    if autor is None:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return autor




@router.post(
    "/",
    response_model=AutorRespuesta,
    status_code=status.HTTP_201_CREATED,
)

def crear_autor(
    datos:AutorEntrada,
    conexion: sqlite3.Connection=Depends(get_db),
):
    autor=AutorEntrada(**datos.model_dump())
    return AutorRepositorio(conexion).crear(autor)



@router.put("/{autor_id}", response_model=AutorRespuesta)
def actualizar_autor(
    autor_id: int,
    datos: AutorEntrada,
    conexion: sqlite3.Connection=Depends(get_db),
):
    autor= AutorEntrada(**datos.model_dump())
    actualizado= AutorRepositorio(conexion).actualizar(autor_id, autor)
    if actualizado is None:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return actualizado


@router.delete("/{autor_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_autor(
    autor_id: int,
    conexion:sqlite3.Connection=Depends(get_db),
):
    try:
        eliminado= AutorRepositorio(conexion).eliminar(autor_id)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el autor porque tiene libros asociados",
        )
    if not eliminado:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)