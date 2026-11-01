from modelos.multa import Multa
from repositorios.base import RepositorioBase


class MultaRepositorio(RepositorioBase):
    tabla = "Multa"
    modelo = Multa
    columnas = {
        "prestamo_id": "prestamo_id",
        "monto": "monto",
        "pagada": "pagada",
    }