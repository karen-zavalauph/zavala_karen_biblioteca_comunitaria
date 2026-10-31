from dataclasses import dataclass

@dataclass
class Autor:
    nombre_autor: str
    id:int | None = None