from dataclasses import dataclass
from enum import Enum


class EstadoEjemplar(str, Enum):
    DISPONIBLE = "disponible"
    PRESTADO = "prestado"
    DANADO = "dañado"


@dataclass
class Ejemplar:
    libro_id: int
    codigo: str
    estado: EstadoEjemplar
    id: int | None = None