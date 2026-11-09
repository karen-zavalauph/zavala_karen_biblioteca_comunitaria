const token = sessionStorage.getItem("access_token");
const tablaAutores = document.getElementById("tabla-autores");
const mensaje = document.getElementById("mensaje");

if (!token) {
    window.location.href = "/frontend/login.html";
} else {
    cargarAutores();
}

async function cargarAutores() {
    mensaje.textContent = "Cargando autores...";

    try {
        const respuesta = await fetch("/autores/", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (respuesta.status === 401) {
            sessionStorage.removeItem("access_token");
            window.location.href = "/frontend/login.html";
            return;
        }

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar la lista de autores");
        }

        const autores = await respuesta.json();
        tablaAutores.replaceChildren();

        autores.forEach((autor) => {
    const fila = document.createElement("tr");

    const celdaId = document.createElement("td");
    celdaId.textContent = autor.id;

    const celdaNombre = document.createElement("td");
    celdaNombre.textContent = autor.nombre_autor;

    const celdaAcciones = document.createElement("td");
    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.dataset.id = autor.id;
    botonEliminar.classList.add("eliminar-autor");

    const botonEditar = document.createElement("button");
botonEditar.type = "button";
botonEditar.textContent = "Editar";
botonEditar.dataset.id = autor.id;
botonEditar.dataset.nombre = autor.nombre_autor;
botonEditar.classList.add("editar-autor");

celdaAcciones.append(botonEditar, botonEliminar);
    fila.append(celdaId, celdaNombre, celdaAcciones);
    tablaAutores.appendChild(fila);
});


        mensaje.textContent = autores.length
            ? ""
            : "Todavía no hay autores registrados.";
    } catch (error) {
        mensaje.textContent = error.message;
    }
}

document.getElementById("cerrar-sesion").addEventListener("click", () => {
    sessionStorage.removeItem("access_token");
    window.location.href = "/frontend/login.html";
});




//formulario para crear autores
document
    .getElementById("formulario-autor")
    .addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nombreAutor = document
            .getElementById("nombre-autor")
            .value
            .trim();

        mensaje.textContent = "Guardando autor...";

        try {
            const respuesta = await fetch("/autores/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre_autor: nombreAutor
                })
            });

            const resultado = await respuesta.json();

            if (respuesta.status === 401) {
                sessionStorage.removeItem("access_token");
                window.location.href = "/frontend/login.html";
                return;
            }

            if (!respuesta.ok) {
                throw new Error(resultado.detail || "No se pudo crear el autor");
            }

            evento.target.reset();
            await cargarAutores();
            mensaje.textContent = `Autor "${resultado.nombre_autor}" creado correctamente.`;
        } catch (error) {
            mensaje.textContent = error.message;
        }
    });



//eliminar autores
tablaAutores.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".eliminar-autor");

    if (!boton) {
        return;
    }

    const confirmado = window.confirm(
        `¿Eliminar el autor con ID ${boton.dataset.id}?`
    );

    if (!confirmado) {
        return;
    }

    try {
        const respuesta = await fetch(`/autores/${boton.dataset.id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (respuesta.status === 401) {
            sessionStorage.removeItem("access_token");
            window.location.href = "/frontend/login.html";
            return;
        }

        if (!respuesta.ok) {
            const error = await respuesta.json().catch(() => ({}));
            throw new Error(error.detail || "No se pudo eliminar el autor");
        }

        await cargarAutores();
        mensaje.textContent = "Autor eliminado correctamente.";
    } catch (error) {
        mensaje.textContent = error.message;
    }
});




//editar autores
tablaAutores.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".editar-autor");

    if (!boton) {
        return;
    }

    const nuevoNombre = window.prompt(
        "Escribe el nuevo nombre del autor:",
        boton.dataset.nombre
    );

    if (nuevoNombre === null) {
        return;
    }

    if (!nuevoNombre.trim()) {
        mensaje.textContent = "El nombre no puede quedar vacío.";
        return;
    }

    try {
        const respuesta = await fetch(`/autores/${boton.dataset.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre_autor: nuevoNombre.trim()
            })
        });

        if (respuesta.status === 401) {
            sessionStorage.removeItem("access_token");
            window.location.href = "/frontend/login.html";
            return;
        }

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                typeof resultado.detail === "string"
                    ? resultado.detail
                    : "No se pudo actualizar el autor"
            );
        }

        await cargarAutores();
        mensaje.textContent = "Autor actualizado correctamente.";
    } catch (error) {
        mensaje.textContent = error.message;
    }
});