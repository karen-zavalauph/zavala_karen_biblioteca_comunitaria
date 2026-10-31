from modelos.libro import Libro
from repositorios.base import RepositorioBase

class LibroRepositorio(RepositorioBase):
    tabla= "Libro"
    modelo=Libro
    columnas= {
        "titulo":"titulo",
        "ISBN": "isbn",
        "autor_id": "autor_id",
        "categoria": "categoria",
        "anio": "anio",
        "editorial": "editorial",
    }