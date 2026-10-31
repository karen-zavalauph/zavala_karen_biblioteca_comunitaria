class RepositorioBase:
    tabla = ""
    modelo = None
    columnas = {}

    def __init__(self, conexion):
        self.conexion = conexion

    def _convertir(self, fila):
        if fila is None:
            return None

        datos = {"id": fila["id"]}
        for columna, atributo in self.columnas.items():
            datos[atributo] = fila[columna]

        return self.modelo(**datos)

    def listar(self):
        columnas_sql = ", ".join(["id", *self.columnas.keys()])
        filas = self.conexion.execute(
            f"SELECT {columnas_sql} FROM {self.tabla}"
        ).fetchall()
        return [self._convertir(fila) for fila in filas]

    def obtener(self, registro_id):
        columnas_sql = ", ".join(["id", *self.columnas.keys()])
        fila = self.conexion.execute(
            f"SELECT {columnas_sql} FROM {self.tabla} WHERE id = ?",
            (registro_id,),
        ).fetchone()
        return self._convertir(fila)

    def crear(self, objeto):
        nombres_columnas = list(self.columnas.keys())
        nombres_atributos = list(self.columnas.values())
        columnas_sql = ", ".join(nombres_columnas)
        marcadores = ", ".join("?" for _ in nombres_columnas)
        valores = [
            getattr(objeto, nombre)
            for nombre in nombres_atributos
        ]

        cursor = self.conexion.execute(
            f"INSERT INTO {self.tabla} ({columnas_sql}) VALUES ({marcadores})",
            valores,
        )
        self.conexion.commit()
        return self.obtener(cursor.lastrowid)

    def actualizar(self, registro_id, objeto):
        asignaciones = ", ".join(
            f"{columna} = ?" for columna in self.columnas
        )
        valores = [
            getattr(objeto, atributo)
            for atributo in self.columnas.values()
        ]
        valores.append(registro_id)

        cursor = self.conexion.execute(
            f"UPDATE {self.tabla} SET {asignaciones} WHERE id = ?",
            valores,
        )
        self.conexion.commit()

        if cursor.rowcount == 0:
            return None
        return self.obtener(registro_id)

    def eliminar(self, registro_id):
        cursor = self.conexion.execute(
            f"DELETE FROM {self.tabla} WHERE id = ?",
            (registro_id,),
        )
        self.conexion.commit()
        return cursor.rowcount > 0