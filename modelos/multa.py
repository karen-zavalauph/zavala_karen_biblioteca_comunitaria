from dataclasses import dataclass


@dataclass
class Multa:
    prestamo_id: int
    monto: float
    pagada: str
    id: int | None = None