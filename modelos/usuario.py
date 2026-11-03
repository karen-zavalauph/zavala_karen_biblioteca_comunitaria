from dataclasses import dataclass

@dataclass
class Usuario:
    nombre_usuario: str
    password_hash: str
    id: int | None = None