from modelos.prestamo import Prestamo
from repositorios.base import RepositorioBase


class PrestamoRepositorio(RepositorioBase):
    tabla = "Prestamo"
    modelo = Prestamo
    columnas = {
        "ejemplar_id": "ejemplar_id",
        "lector_id": "lector_id",
        "fecha_prestamo": "fecha_prestamo",
        "fecha_limite": "fecha_limite",
        "fecha_devolucion": "fecha_devolucion",
    }