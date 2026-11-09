from fastapi import FastAPI, Depends 

from fastapi.staticfiles import StaticFiles

from routers.autores import router as router_autores
from routers.libros import router as router_libros
from routers.lectores import router as router_lectores
from routers.ejemplares import router as router_ejemplares
from routers.prestamos import router as router_prestamos
from routers.multas import router as router_multas
from routers.usuarios import router as router_usuarios
from seguridad import obtener_usuario_actual

from fastapi.responses import RedirectResponse


app=FastAPI(
    title="API de Biblioteca Comunitaria",
    description="Gestión de autores y libros de la biblioteca",
    version="1.0.0",

    
)


app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")


app.include_router(
    router_autores,
    dependencies=[Depends(obtener_usuario_actual)],
)
app.include_router(
    router_libros,
    dependencies=[Depends(obtener_usuario_actual)],
)
app.include_router(
    router_lectores,
    dependencies=[Depends(obtener_usuario_actual)],
)
app.include_router(
    router_ejemplares,
    dependencies=[Depends(obtener_usuario_actual)],
)
app.include_router(
    router_prestamos,
    dependencies=[Depends(obtener_usuario_actual)],
)
app.include_router(
    router_multas,
    dependencies=[Depends(obtener_usuario_actual)],
)

app.include_router(router_usuarios)

@app.get("/", include_in_schema=False)
def inicio():
    return RedirectResponse(url="/frontend/login.html")