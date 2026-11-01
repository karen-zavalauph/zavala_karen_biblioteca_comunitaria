from pydantic import BaseModel, ConfigDict, Field
from modelos.ejemplar import EstadoEjemplar

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