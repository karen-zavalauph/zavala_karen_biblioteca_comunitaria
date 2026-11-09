const token = sessionStorage.getItem("access_token");
const tablaAutores = document.getElementById("tabla-autores");
const mensaje = document.getElementById("mensaje");




//referencias a libros
const tablaLibros = document.getElementById("tabla-libros");
const mensajeLibros = document.getElementById("mensaje-libros");
const selectorAutorLibro = document.getElementById("libro-autor");
let librosCargados = [];
let libroEditandoId = null;


//referencias a ejemplares
const tablaEjemplares = document.getElementById("tabla-ejemplares");
const mensajeEjemplares = document.getElementById("mensaje-ejemplares");
const selectorLibroEjemplar = document.getElementById("ejemplar-libro");
let ejemplaresCargados = [];
let ejemplarEditandoId = null;



if (!token) {
    window.location.href = "/frontend/login.html";
} else {
    cargarAutores();
    cargarIndicadores();
    cargarLibros();
    cargarAutoresEnSelector();
    cargarEjemplares();
    cargarLibrosEnSelector();
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





//cargar tarjetas de indicadores
async function cargarIndicadores() {
    try {
        const opciones = {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        };

        const rutas = [
            "/libros/",
            "/ejemplares/",
            "/lectores/",
            "/prestamos/"
        ];

        const respuestas = await Promise.all(
            rutas.map((ruta) => fetch(ruta, opciones))
        );

        if (respuestas.some((respuesta) => respuesta.status === 401)) {
            sessionStorage.removeItem("access_token");
            window.location.href = "/frontend/login.html";
            return;
        }

        const indiceError = respuestas.findIndex(
            (respuesta) => !respuesta.ok
        );

        if (indiceError !== -1) {
            throw new Error(
                `GET ${rutas[indiceError]} respondió HTTP ` +
                `${respuestas[indiceError].status}.`
            );
        }

        const [libros, ejemplares, lectores, prestamos] = await Promise.all(
            respuestas.map((respuesta) => respuesta.json())
        );

        document.getElementById("kpi-libros").textContent = libros.length;

        document.getElementById("kpi-ejemplares-disponibles").textContent =
            ejemplares.filter(
                (ejemplar) => ejemplar.estado === "disponible"
            ).length;

        document.getElementById("kpi-lectores").textContent = lectores.length;

        document.getElementById("kpi-prestamos-activos").textContent =
            prestamos.filter(
                (prestamo) => prestamo.fecha_devolucion === null
            ).length;
    } catch (error) {
        mensaje.textContent = error.message;
    }
}



//funciones de  cargar libros
async function cargarLibros() {
    mensajeLibros.textContent = "Cargando libros...";

    try {
        const respuesta = await fetch("/libros/", {
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
            throw new Error(`No se pudieron cargar los libros (HTTP ${respuesta.status}).`);
        }

        librosCargados = await respuesta.json();
        mostrarLibros(librosCargados);

        mensajeLibros.textContent = librosCargados.length
            ? ""
            : "Todavía no hay libros registrados.";
    } catch (error) {
        mensajeLibros.textContent = error.message;
    }
}

function mostrarLibros(libros) {
    tablaLibros.replaceChildren();

    libros.forEach((libro) => {
        const fila = document.createElement("tr");

        [
            libro.id,
            libro.titulo,
            libro.isbn,
            libro.autor_id,
            libro.categoria,
            libro.anio,
            libro.editorial
        ].forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaAcciones = document.createElement("td");

const botonEditar = document.createElement("button");
botonEditar.type = "button";
botonEditar.textContent = "Editar";
botonEditar.dataset.id = libro.id;
botonEditar.classList.add("editar-libro");

const botonEliminar = document.createElement("button");
botonEliminar.type = "button";
botonEliminar.textContent = "Eliminar";
botonEliminar.dataset.id = libro.id;
botonEliminar.classList.add("eliminar-libro");

celdaAcciones.append(botonEditar, botonEliminar);
fila.appendChild(celdaAcciones);
        tablaLibros.appendChild(fila);
    });
}

async function cargarAutoresEnSelector() {
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
            throw new Error("No se pudieron cargar los autores para el selector.");
        }

        const autores = await respuesta.json();
        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Selecciona un autor";

        selectorAutorLibro.replaceChildren(opcionInicial);

        autores.forEach((autor) => {
            const opcion = document.createElement("option");
            opcion.value = autor.id;
            opcion.textContent = autor.nombre_autor;
            selectorAutorLibro.appendChild(opcion);
        });
    } catch (error) {
        mensajeLibros.textContent = error.message;
    }
}

document.getElementById("buscar-libro").addEventListener("input", (evento) => {
    const busqueda = evento.target.value.trim().toLocaleLowerCase();

    const librosFiltrados = librosCargados.filter((libro) =>
        libro.titulo.toLocaleLowerCase().includes(busqueda) ||
        libro.isbn.toLocaleLowerCase().includes(busqueda)
    );

    mostrarLibros(librosFiltrados);

    mensajeLibros.textContent = librosFiltrados.length
        ? ""
        : "No se encontraron libros que coincidan con la búsqueda.";
});


//función para agregar libros
document
    .getElementById("formulario-libro")
    .addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const datosLibro = {
            titulo: document.getElementById("libro-titulo").value.trim(),
            isbn: document.getElementById("libro-isbn").value.trim(),
            autor_id: Number(selectorAutorLibro.value),
            categoria: document.getElementById("libro-categoria").value.trim(),
            anio: Number(document.getElementById("libro-anio").value),
            editorial: document.getElementById("libro-editorial").value.trim()
        };

        const esEdicion = libroEditandoId !== null;
        const url = esEdicion
            ? `/libros/${libroEditandoId}`
            : "/libros/";

        mensajeLibros.textContent = esEdicion
            ? "Actualizando libro..."
            : "Guardando libro...";

        try {
            const respuesta = await fetch(url, {
                method: esEdicion ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datosLibro)
            });

            const resultado = await respuesta.json().catch(() => ({}));

            if (respuesta.status === 401) {
                sessionStorage.removeItem("access_token");
                window.location.href = "/frontend/login.html";
                return;
            }

            if (!respuesta.ok) {
                throw new Error(
                    typeof resultado.detail === "string"
                        ? resultado.detail
                        : "No se pudo guardar el libro."
                );
            }

            evento.target.reset();
            libroEditandoId = null;
            document.querySelector(
                "#formulario-libro button[type='submit']"
            ).textContent = "Agregar libro";

            document.getElementById("buscar-libro").value = "";
            await cargarLibros();
            await cargarIndicadores();

            mensajeLibros.textContent = esEdicion
                ? "Libro actualizado correctamente."
                : `Libro "${resultado.titulo}" agregado correctamente.`;
        } catch (error) {
            mensajeLibros.textContent = error.message;
        }
    });


//eliminar libros
tablaLibros.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".eliminar-libro");

    if (!boton) {
        return;
    }

    if (!window.confirm(`¿Eliminar el libro con ID ${boton.dataset.id}?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`/libros/${boton.dataset.id}`, {
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

        const resultado = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                typeof resultado.detail === "string"
                    ? resultado.detail
                    : "No se pudo eliminar el libro."
            );
        }

        await cargarLibros();
        await cargarIndicadores();
        mensajeLibros.textContent = "Libro eliminado correctamente.";
    } catch (error) {
        mensajeLibros.textContent = error.message;
    }
});

//editar libros
tablaLibros.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".editar-libro");

    if (!boton) {
        return;
    }

    const libro = librosCargados.find(
        (elemento) => elemento.id === Number(boton.dataset.id)
    );

    if (!libro) {
        mensajeLibros.textContent = "No se encontró ese libro.";
        return;
    }

    libroEditandoId = libro.id;
    document.getElementById("libro-titulo").value = libro.titulo;
    document.getElementById("libro-isbn").value = libro.isbn;
    selectorAutorLibro.value = String(libro.autor_id);
    document.getElementById("libro-categoria").value = libro.categoria;
    document.getElementById("libro-anio").value = libro.anio;
    document.getElementById("libro-editorial").value = libro.editorial;

    document.querySelector(
        "#formulario-libro button[type='submit']"
    ).textContent = "Actualizar libro";

    document.getElementById("formulario-libro").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});



//cargar ejemplares
async function cargarEjemplares() {
    mensajeEjemplares.textContent = "Cargando ejemplares...";

    try {
        const respuesta = await fetch("/ejemplares/", {
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
            throw new Error(
                `No se pudieron cargar los ejemplares (HTTP ${respuesta.status}).`
            );
        }

        ejemplaresCargados = await respuesta.json();
        mostrarEjemplares(ejemplaresCargados);

        mensajeEjemplares.textContent = ejemplaresCargados.length
            ? ""
            : "Todavía no hay ejemplares registrados.";
    } catch (error) {
        mensajeEjemplares.textContent = error.message;
    }
}

function mostrarEjemplares(ejemplares) {
    tablaEjemplares.replaceChildren();

    ejemplares.forEach((ejemplar) => {
        const fila = document.createElement("tr");

        [
            ejemplar.id,
            ejemplar.libro_id,
            ejemplar.codigo,
            ejemplar.estado
        ].forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

       const celdaAcciones = document.createElement("td");

const botonEditar = document.createElement("button");
botonEditar.type = "button";
botonEditar.textContent = "Editar";
botonEditar.dataset.id = ejemplar.id;
botonEditar.classList.add("editar-ejemplar");

const botonEliminar = document.createElement("button");
botonEliminar.type = "button";
botonEliminar.textContent = "Eliminar";
botonEliminar.dataset.id = ejemplar.id;
botonEliminar.classList.add("eliminar-ejemplar");

celdaAcciones.append(botonEditar, botonEliminar);
fila.appendChild(celdaAcciones);
        tablaEjemplares.appendChild(fila);
    });
}

async function cargarLibrosEnSelector() {
    try {
        const respuesta = await fetch("/libros/", {
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
            throw new Error("No se pudieron cargar los libros para el selector.");
        }

        const libros = await respuesta.json();
        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Selecciona un libro";

        selectorLibroEjemplar.replaceChildren(opcionInicial);

        libros.forEach((libro) => {
            const opcion = document.createElement("option");
            opcion.value = libro.id;
            opcion.textContent = `${libro.titulo} — ${libro.isbn}`;
            selectorLibroEjemplar.appendChild(opcion);
        });
    } catch (error) {
        mensajeEjemplares.textContent = error.message;
    }
}

document.getElementById("buscar-ejemplar").addEventListener("input", (evento) => {
    const busqueda = evento.target.value.trim().toLocaleLowerCase();

    const filtrados = ejemplaresCargados.filter((ejemplar) =>
        ejemplar.codigo.toLocaleLowerCase().includes(busqueda)
    );

    mostrarEjemplares(filtrados);

    mensajeEjemplares.textContent = filtrados.length
        ? ""
        : "No se encontraron ejemplares con ese código.";
});




// formulario ejemplares
document
    .getElementById("formulario-ejemplar")
    .addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const datosEjemplar = {
            libro_id: Number(selectorLibroEjemplar.value),
            codigo: document.getElementById("ejemplar-codigo").value.trim(),
            estado: document.getElementById("ejemplar-estado").value
        };

        const esEdicion = ejemplarEditandoId !== null;
        const url = esEdicion
            ? `/ejemplares/${ejemplarEditandoId}`
            : "/ejemplares/";

        mensajeEjemplares.textContent = esEdicion
            ? "Actualizando ejemplar..."
            : "Guardando ejemplar...";

        try {
            const respuesta = await fetch(url, {
                method: esEdicion ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datosEjemplar)
            });

            const resultado = await respuesta.json().catch(() => ({}));

            if (respuesta.status === 401) {
                sessionStorage.removeItem("access_token");
                window.location.href = "/frontend/login.html";
                return;
            }

            if (!respuesta.ok) {
                throw new Error(
                    typeof resultado.detail === "string"
                        ? resultado.detail
                        : "No se pudo guardar el ejemplar."
                );
            }

            evento.target.reset();
            ejemplarEditandoId = null;
            document.querySelector(
                "#formulario-ejemplar button[type='submit']"
            ).textContent = "Agregar ejemplar";

            document.getElementById("buscar-ejemplar").value = "";
            await cargarEjemplares();
            await cargarIndicadores();

            mensajeEjemplares.textContent = esEdicion
                ? "Ejemplar actualizado correctamente."
                : `Ejemplar "${resultado.codigo}" agregado correctamente.`;
        } catch (error) {
            mensajeEjemplares.textContent = error.message;
        }
    });



tablaEjemplares.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".eliminar-ejemplar");

    if (!boton) {
        return;
    }

    if (!window.confirm(`¿Eliminar el ejemplar con ID ${boton.dataset.id}?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`/ejemplares/${boton.dataset.id}`, {
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

        const resultado = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok) {
            throw new Error(
                typeof resultado.detail === "string"
                    ? resultado.detail
                    : "No se pudo eliminar el ejemplar."
            );
        }

        await cargarEjemplares();
        await cargarIndicadores();
        mensajeEjemplares.textContent = "Ejemplar eliminado correctamente.";
    } catch (error) {
        mensajeEjemplares.textContent = error.message;
    }
});


//editar ejemplares
tablaEjemplares.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".editar-ejemplar");

    if (!boton) {
        return;
    }

    const ejemplar = ejemplaresCargados.find(
        (elemento) => elemento.id === Number(boton.dataset.id)
    );

    if (!ejemplar) {
        mensajeEjemplares.textContent = "No se encontró ese ejemplar.";
        return;
    }

    if (ejemplar.estado === "prestado") {
        mensajeEjemplares.textContent =
            "No se edita un ejemplar prestado desde este módulo.";
        return;
    }

    ejemplarEditandoId = ejemplar.id;
    selectorLibroEjemplar.value = String(ejemplar.libro_id);
    document.getElementById("ejemplar-codigo").value = ejemplar.codigo;
    document.getElementById("ejemplar-estado").value = ejemplar.estado;

    document.querySelector(
        "#formulario-ejemplar button[type='submit']"
    ).textContent = "Actualizar ejemplar";

    document.getElementById("formulario-ejemplar").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});