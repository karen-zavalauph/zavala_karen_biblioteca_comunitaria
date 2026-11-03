
from modelos.ejemplar import EstadoEjemplar
from datetime import date
from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Literal





class AutorEntrada(BaseModel):
    nombre_autor: str= Field(min_length=1, max_length=150)



class AutorRespuesta(AutorEntrada):
    id: int
    model_config= ConfigDict(from_attributes=True)


class LibroEntrada(BaseModel):
    titulo: str=Field(min_length=1, max_length=200)
    isbn: str= Field(min_length=1, max_length=30)
    autor_id: int= Field(gt=0)
    categoria: str=Field(min_length=1, max_length=100)
    anio: int= Field(gt=0)
    editorial:str=Field(min_length=1, max_length=150)


class LibroRespuesta(LibroEntrada):
    id:int
    model_config=ConfigDict(from_attributes=True)







class LectorEntrada(BaseModel):
    nombre: str = Field(min_length=1, max_length=150)
    identificacion: str = Field(min_length=1, max_length=30)
    telefono: str = Field(min_length=1, max_length=30)


class LectorRespuesta(LectorEntrada):
    id: int
    model_config = ConfigDict(from_attributes=True)




class EjemplarEntrada(BaseModel):
    libro_id: int = Field(gt=0)
    codigo: str = Field(min_length=1, max_length=50)
    estado: EstadoEjemplar


class EjemplarRespuesta(EjemplarEntrada):
    id: int
    model_config = ConfigDict(from_attributes=True)



class PrestamoEntrada(BaseModel):
    ejemplar_id: int = Field(gt=0)
    lector_id: int = Field(gt=0)
    fecha_prestamo: date
    fecha_limite: date
    fecha_devolucion: date | None = None

    @model_validator(mode="after")
    def validar_fechas(self):
        if self.fecha_limite < self.fecha_prestamo:
            raise ValueError(
                "La fecha límite no puede ser anterior a la fecha del préstamo"
            )

        if (
            self.fecha_devolucion is not None
            and self.fecha_devolucion < self.fecha_prestamo
        ):
            raise ValueError(
                "La fecha de devolución no puede ser anterior al préstamo"
            )

        return self


class PrestamoRespuesta(PrestamoEntrada):
    id: int
    model_config = ConfigDict(from_attributes=True)




class MultaEntrada(BaseModel):
    prestamo_id: int = Field(gt=0)
    monto: float = Field(gt=0)
    pagada: Literal["si", "no"] = "no"


class MultaRespuesta(MultaEntrada):
    id: int
    model_config = ConfigDict(from_attributes=True)


class UsuarioEntrada(BaseModel):
    nombre_usuario: str = Field(min_length=1, max_length=150)
    contrasena: str = Field(min_length=1, max_length=150)

class UsuarioRespuesta(BaseModel):
    nombre_usuario: str
    id: int
    model_config = ConfigDict(from_attributes=True)