


Autor-Libros-Ejemplar-Lector-Prestamos-Multas
<img width="920" height="582" alt="diagrama ER Biblioteca Comunitaria drawio" src="https://github.com/user-attachments/assets/ee555c47-afb1-4a14-9f90-fbd66794b9f8" />





<img width="922" height="572" alt="diagrama UML biblioteca comunitaria drawio" src="https://github.com/user-attachments/assets/d0a00e69-9f0e-48a4-a329-1e2da44cc20c" />

# API de Biblioteca Comunitaria

## Descripción
API y dashboard para gestionar autores, libros, ejemplares, lectores,
préstamos y multas de una biblioteca comunitaria.

## Funcionalidades
- Login con token.
- Consulta y administración de autores, libros, ejemplares y lectores.
- Registro de préstamos y devoluciones.
- Consulta y búsqueda de multas; marcar multas como pagadas.
- Dashboard con indicadores y búsqueda de registros.

## Reglas de negocio
- Cada lector puede tener hasta 3 préstamos activos.
- Solo se prestan ejemplares disponibles.
- Un lector con multas pendientes no puede solicitar préstamos.
- Una devolución tardía genera una multa de L 5.00 por día.

## Tecnologías
- Python: [agrega la versión usada]
- FastAPI
- SQLite
- HTML, CSS y JavaScript
- Dependencias: `requirements.txt`

## Instalación y ejecución
```powershell/cmd
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload














Enlaces de API Biblioteca Comunitaria

API: http://127.0.0.1:8000 
Login: http://127.0.0.1:8000/frontend/login.html 
Dashboard:http://127.0.0.1:8000/frontend/dashboard.html 
