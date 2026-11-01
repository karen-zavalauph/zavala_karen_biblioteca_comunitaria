from dataclasses import dataclass


@dataclass
class Lector:
    nombre: str
    identificacion: str
    telefono: str
    id: int | None = None