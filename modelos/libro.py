from dataclasses import dataclass

@dataclass
class Libro:
    titulo: str
    isbn: str
    autor_id: int
    categoria: str
    anio:int
    editorial: str
    id: int | None = None
    