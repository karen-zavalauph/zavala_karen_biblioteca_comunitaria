from modelos.usuario import Usuario
from repositorios.base import RepositorioBase


class UsuarioRepositorio(RepositorioBase):
    tabla= "Usuario"
    modelo = Usuario
    columnas = {
        "nombre_usuario": "nombre_usuario",
        "password_hash": "password_hash",
    }