import sqlite3

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from database import get_db
from modelos.prestamo import Prestamo
from repositorios.prestamo_repositorio import PrestamoRepositorio
from esquemas import PrestamoEntrada, PrestamoRespuesta


router = APIRouter(prefix="/prestamos", tags=["Préstamos"])


@router.get("/", response_model=list[PrestamoRespuesta])
def listar_prestamos(conexion: sqlite3.Connection = Depends(get_db)):
    return PrestamoRepositorio(conexion).listar()


@router.get("/{prestamo_id}", response_model=PrestamoRespuesta)
def obtener_prestamo(
    prestamo_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    prestamo = PrestamoRepositorio(conexion).obtener(prestamo_id)
    if prestamo is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    return prestamo


@router.post(
    "/",
    response_model=PrestamoRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear_prestamo(
    datos: PrestamoEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    if datos.fecha_devolucion is not None:
        raise HTTPException(
            status_code=400,
            detail="Un préstamo nuevo no puede tener fecha de devolución",
        )

    lector = conexion.execute(
        "SELECT id FROM Lector WHERE id = ?",
        (datos.lector_id,),
    ).fetchone()
    if lector is None:
        raise HTTPException(status_code=404, detail="Lector no encontrado")

    ejemplar = conexion.execute(
        "SELECT estado FROM Ejemplar WHERE id = ?",
        (datos.ejemplar_id,),
    ).fetchone()
    if ejemplar is None:
        raise HTTPException(status_code=404, detail="Ejemplar no encontrado")
    if ejemplar["estado"] != "disponible":
        raise HTTPException(
            status_code=409,
            detail="El ejemplar no está disponible para préstamo",
        )

    prestamo_activo = conexion.execute(
        """
        SELECT id
        FROM Prestamo
        WHERE ejemplar_id = ? AND fecha_devolucion IS NULL
        """,
        (datos.ejemplar_id,),
    ).fetchone()

    if prestamo_activo is not None:
        raise HTTPException(
            status_code=409,
            detail="El ejemplar ya tiene un préstamo activo",
        )

    


    prestamos_activos = conexion.execute(
        """
        SELECT COUNT(*) AS total
        FROM Prestamo
        WHERE lector_id = ? AND fecha_devolucion IS NULL
        """,
        (datos.lector_id,),
    ).fetchone()["total"]

    if prestamos_activos >= 3:
        raise HTTPException(
            status_code=409,
            detail="El lector ya tiene el máximo de 3 préstamos activos",
        )

    multas_pendientes = conexion.execute(
        """
        SELECT COUNT(*) AS total
        FROM Multa m
        JOIN Prestamo p ON p.id = m.prestamo_id
        WHERE p.lector_id = ? AND m.pagada = 'no'
        """,
        (datos.lector_id,),
    ).fetchone()["total"]

    if multas_pendientes > 0:
        raise HTTPException(
            status_code=409,
            detail="El lector tiene multas pendientes de pago",
        )

    prestamo = Prestamo(**datos.model_dump(mode="json"))

    try:
        creado = PrestamoRepositorio(conexion).crear(prestamo)
        conexion.execute(
            "UPDATE Ejemplar SET estado = 'prestado' WHERE id = ?",
            (datos.ejemplar_id,),
        )
        conexion.commit()
        return creado
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="No se pudo registrar el préstamo por una restricción de datos",
        )


@router.put("/{prestamo_id}", response_model=PrestamoRespuesta)
def actualizar_prestamo(
    prestamo_id: int,
    datos: PrestamoEntrada,
    conexion: sqlite3.Connection = Depends(get_db),
):
    repositorio = PrestamoRepositorio(conexion)
    actual = repositorio.obtener(prestamo_id)

    if actual is None:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")

    if actual.fecha_devolucion is not None:
        raise HTTPException(
            status_code=409,
            detail="El préstamo ya fue devuelto",
        )

    if (
        datos.ejemplar_id != actual.ejemplar_id
        or datos.lector_id != actual.lector_id
    ):
        raise HTTPException(
            status_code=400,
            detail="No se puede cambiar el lector ni el ejemplar del préstamo",
        )

    fecha_devolucion = (
        datos.fecha_devolucion.isoformat()
        if datos.fecha_devolucion is not None
        else None
    )

    try:
        conexion.execute(
            """
            UPDATE Prestamo
            SET fecha_prestamo = ?, fecha_limite = ?, fecha_devolucion = ?
            WHERE id = ?
            """,
            (
                datos.fecha_prestamo.isoformat(),
                datos.fecha_limite.isoformat(),
                fecha_devolucion,
                prestamo_id,
            ),
        )

        if datos.fecha_devolucion is not None:
            conexion.execute(
                "UPDATE Ejemplar SET estado = 'disponible' WHERE id = ?",
                (datos.ejemplar_id,),
            )

            dias_tarde = (
                datos.fecha_devolucion - datos.fecha_limite
            ).days

            if dias_tarde > 0:
                monto = dias_tarde * 5.00    #se calcula la multa de 5.00 por día de atraso
                multa = conexion.execute(
                    "SELECT id, pagada FROM Multa WHERE prestamo_id = ?",
                    (prestamo_id,),
                ).fetchone()

                if multa is None:
                    conexion.execute(
                        """
                        INSERT INTO Multa (prestamo_id, monto, pagada)
                        VALUES (?, ?, 'no')
                        """,
                        (prestamo_id, monto),
                    )
                elif multa["pagada"] == "no":
                    conexion.execute(
                        "UPDATE Multa SET monto = ? WHERE id = ?",
                        (monto, multa["id"]),
                    )

        conexion.commit()
    except sqlite3.IntegrityError:
        conexion.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo actualizar el préstamo por una restricción de datos",
        )

    return repositorio.obtener(prestamo_id)


@router.delete(
    "/{prestamo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_prestamo(
    prestamo_id: int,
    conexion: sqlite3.Connection = Depends(get_db),
):
    try:
        eliminado = PrestamoRepositorio(conexion).eliminar(prestamo_id)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar el préstamo porque tiene una multa asociada",
        )

    if not eliminado:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)





@router.get("/atrasados", tags=["Reportes"])
def listar_prestamos_atrasados(
    conexion: sqlite3.Connection = Depends(get_db),
):
    filas = conexion.execute(
        """
        SELECT
            p.id AS prestamo_id,
            l.nombre AS lector,
            li.titulo AS libro,
            e.codigo AS codigo_ejemplar,
            p.fecha_limite,
            CAST(
                julianday(date('now')) - julianday(p.fecha_limite)
                AS INTEGER
            ) AS dias_atraso
        FROM Prestamo p
        JOIN Lector l ON l.id = p.lector_id
        JOIN Ejemplar e ON e.id = p.ejemplar_id
        JOIN Libro li ON li.id = e.libro_id
        WHERE p.fecha_devolucion IS NULL
          AND date(p.fecha_limite) < date('now')
        ORDER BY p.fecha_limite
        """
    ).fetchall()

    return [dict(fila) for fila in filas]


@router.get("/mas-prestados", tags=["Reportes"])
def listar_libros_mas_prestados(
    conexion: sqlite3.Connection = Depends(get_db),
):
    filas = conexion.execute(
        """
        SELECT
            li.id AS libro_id,
            li.titulo,
            li.ISBN AS isbn,
            a.nombre_autor,
            COUNT(p.id) AS total_prestamos
        FROM Libro li
        JOIN Autor a ON a.id = li.autor_id
        JOIN Ejemplar e ON e.libro_id = li.id
        JOIN Prestamo p ON p.ejemplar_id = e.id
        GROUP BY li.id, li.titulo, li.ISBN, a.nombre_autor
        ORDER BY total_prestamos DESC, li.titulo
        LIMIT 10
        """
    ).fetchall()

    return [dict(fila) for fila in filas]