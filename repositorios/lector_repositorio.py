from modelos.lector import Lector
from repositorios.base import RepositorioBase


class LectorRepositorio(RepositorioBase):
    tabla = "Lector"
    modelo = Lector
    columnas = {
        "nombre": "nombre",
        "identificacion": "identificacion",
        "telefono": "telefono",
    }