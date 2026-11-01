from modelos.ejemplar import Ejemplar
from repositorios.base import RepositorioBase


class EjemplarRepositorio(RepositorioBase):
    tabla = "Ejemplar"
    modelo = Ejemplar
    columnas = {
        "libro_id": "libro_id",
        "codigo": "codigo",
        "estado": "estado",
    }