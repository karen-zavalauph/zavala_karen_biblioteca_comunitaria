from modelos.autor import Autor
from repositorios.base import RepositorioBase


class AutorRepositorio(RepositorioBase):
    tabla = "Autor"
    modelo = Autor
    columnas = {
        "nombre_autor": "nombre_autor",
    }