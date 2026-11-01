from fastapi import FastAPI

from routers.autores import router as router_autores
from routers.libros import router as router_libros
from routers.lectores import router as router_lectores
from routers.ejemplares import router as router_ejemplares




app=FastAPI(
    title="API de Biblioteca Comunitaria",
    description="Gestión de autores y libros de la biblioteca",
    version="1.0.0",
)

app.include_router(router_autores)
app.include_router(router_libros)
app.include_router(router_lectores)
app.include_router(router_ejemplares)

@app.get("/")
def inicio():
    return {"mensaje": "API de Biblioteca Comunitaria"}