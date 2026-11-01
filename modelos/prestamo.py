from dataclasses import dataclass


@dataclass
class Prestamo:
    ejemplar_id: int
    lector_id: int
    fecha_prestamo: str
    fecha_limite: str
    fecha_devolucion: str | None = None
    id: int | None = None