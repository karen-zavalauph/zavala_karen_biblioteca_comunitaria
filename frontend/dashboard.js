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

//referencias a lectores
const tablaLectores = document.getElementById("tabla-lectores");
const mensajeLectores = document.getElementById("mensaje-lectores");
let lectoresCargados = [];
let lectorEditandoId = null;

//referencias a préstamos
const tablaPrestamos = document.getElementById("tabla-prestamos");
const mensajePrestamos = document.getElementById("mensaje-prestamos");
const selectorEjemplarPrestamo = document.getElementById("prestamo-ejemplar");
const selectorLectorPrestamo = document.getElementById("prestamo-lector");
let prestamosCargados = [];


//referencias a multas
const tablaMultas = document.getElementById("tabla-multas");
const mensajeMultas = document.getElementById("mensaje-multas");
let multasCargadas = [];


if (!token) {
    window.location.href = "/frontend/login.html";
} else {
    cargarAutores();
    cargarIndicadores();
    cargarAutoresEnSelector();
    cargarLibros()
    cargarLibros()
    .then(() => cargarEjemplares())
    .then(() => cargarLectores())
    .then(() => cargarPrestamos());
    cargarSelectoresPrestamo();
    cargarMultas();
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
        const libro = librosCargados.find(
    (elemento) => elemento.id === ejemplar.libro_id
);
        const fila = document.createElement("tr");

        [
            ejemplar.id,
           libro ? libro.titulo : `Libro ID ${ejemplar.libro_id}`,
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


//función de lectores
async function cargarLectores() {
    mensajeLectores.textContent = "Cargando lectores...";

    try {
        const respuesta = await fetch("/lectores/", {
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
                `No se pudieron cargar los lectores (HTTP ${respuesta.status}).`
            );
        }

        lectoresCargados = await respuesta.json();
        mostrarLectores(lectoresCargados);

        mensajeLectores.textContent = lectoresCargados.length
            ? ""
            : "Todavía no hay lectores registrados.";
    } catch (error) {
        mensajeLectores.textContent = error.message;
    }
}

function mostrarLectores(lectores) {
    tablaLectores.replaceChildren();

    lectores.forEach((lector) => {
        const fila = document.createElement("tr");

        [
            lector.id,
            lector.nombre,
            lector.identificacion,
            lector.telefono
        ].forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaAcciones = document.createElement("td");


const botonEditar = document.createElement("button");
botonEditar.type = "button";
botonEditar.textContent = "Editar";
botonEditar.dataset.id = lector.id;
botonEditar.classList.add("editar-lector");

const botonEliminar = document.createElement("button");
botonEliminar.type = "button";
botonEliminar.textContent = "Eliminar";
botonEliminar.dataset.id = lector.id;
botonEliminar.classList.add("eliminar-lector");

celdaAcciones.append(botonEditar, botonEliminar);
fila.appendChild(celdaAcciones);
        tablaLectores.appendChild(fila);
    });
}

document.getElementById("buscar-lector").addEventListener("input", (evento) => {
    const busqueda = evento.target.value.trim().toLocaleLowerCase();

    const filtrados = lectoresCargados.filter((lector) =>
        lector.nombre.toLocaleLowerCase().includes(busqueda) ||
        lector.identificacion.toLocaleLowerCase().includes(busqueda)
    );

    mostrarLectores(filtrados);

    mensajeLectores.textContent = filtrados.length
        ? ""
        : "No se encontraron lectores que coincidan con la búsqueda.";
});


document
    .getElementById("formulario-lector")
    .addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const datosLector = {
            nombre: document.getElementById("lector-nombre").value.trim(),
            identificacion: document
                .getElementById("lector-identificacion")
                .value.trim(),
            telefono: document.getElementById("lector-telefono").value.trim()
        };

        const esEdicion = lectorEditandoId !== null;
        const url = esEdicion
            ? `/lectores/${lectorEditandoId}`
            : "/lectores/";

        mensajeLectores.textContent = esEdicion
            ? "Actualizando lector..."
            : "Guardando lector...";

        try {
            const respuesta = await fetch(url, {
                method: esEdicion ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(datosLector)
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
                        : "No se pudo guardar el lector."
                );
            }

            evento.target.reset();
            lectorEditandoId = null;
            document.querySelector(
                "#formulario-lector button[type='submit']"
            ).textContent = "Agregar lector";

            document.getElementById("buscar-lector").value = "";
            await cargarLectores();

            mensajeLectores.textContent = esEdicion
                ? "Lector actualizado correctamente."
                : `Lector "${resultado.nombre}" agregado correctamente.`;
        } catch (error) {
            mensajeLectores.textContent = error.message;
        }
    });

tablaLectores.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".eliminar-lector");

    if (!boton) {
        return;
    }

    if (!window.confirm(`¿Eliminar al lector con ID ${boton.dataset.id}?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`/lectores/${boton.dataset.id}`, {
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
                    : "No se pudo eliminar el lector."
            );
        }

        await cargarLectores();
        await cargarIndicadores();
        mensajeLectores.textContent = "Lector eliminado correctamente.";
    } catch (error) {
        mensajeLectores.textContent = error.message;
    }
});

tablaLectores.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".editar-lector");

    if (!boton) {
        return;
    }

    const lector = lectoresCargados.find(
        (elemento) => elemento.id === Number(boton.dataset.id)
    );

    if (!lector) {
        mensajeLectores.textContent = "No se encontró ese lector.";
        return;
    }

    lectorEditandoId = lector.id;
    document.getElementById("lector-nombre").value = lector.nombre;
    document.getElementById("lector-identificacion").value =
        lector.identificacion;
    document.getElementById("lector-telefono").value = lector.telefono;

    document.querySelector(
        "#formulario-lector button[type='submit']"
    ).textContent = "Actualizar lector";

    document.getElementById("formulario-lector").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});


//funciones de préstamos
async function cargarPrestamos() {
    mensajePrestamos.textContent = "Cargando préstamos...";

    try {
        const respuesta = await fetch("/prestamos/", {
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
                `No se pudieron cargar los préstamos (HTTP ${respuesta.status}).`
            );
        }

        prestamosCargados = await respuesta.json();
        mostrarPrestamos(prestamosCargados);

        mensajePrestamos.textContent = prestamosCargados.length
            ? ""
            : "Todavía no hay préstamos registrados.";
    } catch (error) {
        mensajePrestamos.textContent = error.message;
    }
}





function mostrarPrestamos(prestamos) {
    tablaPrestamos.replaceChildren();

    prestamos.forEach((prestamo) => {
        const ejemplar = ejemplaresCargados.find(
            (elemento) => elemento.id === prestamo.ejemplar_id
        );

        const libro = ejemplar
            ? librosCargados.find(
                (elemento) => elemento.id === ejemplar.libro_id
            )
            : null;

        const lector = lectoresCargados.find(
            (elemento) => elemento.id === prestamo.lector_id
        );

        const nombreLibro = libro
            ? `${libro.titulo} (${ejemplar.codigo})`
            : `Ejemplar ID ${prestamo.ejemplar_id}`;

        const nombreLector = lector
            ? `${lector.nombre} (${lector.identificacion})`
            : `Lector ID ${prestamo.lector_id}`;

        const fila = document.createElement("tr");

        [
            prestamo.id,
            nombreLibro,
            nombreLector,
            prestamo.fecha_prestamo,
            prestamo.fecha_limite,
            prestamo.fecha_devolucion || "Pendiente"
        ].forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaAcciones = document.createElement("td");

if (prestamo.fecha_devolucion === null) {
    const botonDevolver = document.createElement("button");
    botonDevolver.type = "button";
    botonDevolver.textContent = "Registrar devolución";
    botonDevolver.dataset.id = prestamo.id;
    botonDevolver.classList.add("devolver-prestamo");
    celdaAcciones.appendChild(botonDevolver);
} else {
    celdaAcciones.textContent = "Devuelto";
}

fila.appendChild(celdaAcciones);
        tablaPrestamos.appendChild(fila);
    });
}

async function cargarSelectoresPrestamo() {
    try {
        const opciones = {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        };

        const [respuestaEjemplares, respuestaLectores] = await Promise.all([
            fetch("/ejemplares/", opciones),
            fetch("/lectores/", opciones)
        ]);

        if (
            respuestaEjemplares.status === 401 ||
            respuestaLectores.status === 401
        ) {
            sessionStorage.removeItem("access_token");
            window.location.href = "/frontend/login.html";
            return;
        }

        if (!respuestaEjemplares.ok || !respuestaLectores.ok) {
            throw new Error("No se pudieron cargar los datos de los selectores.");
        }

        const [ejemplares, lectores] = await Promise.all([
            respuestaEjemplares.json(),
            respuestaLectores.json()
        ]);

        selectorEjemplarPrestamo.replaceChildren(
            new Option("Selecciona un ejemplar", "")
        );

        ejemplares
            .filter((ejemplar) => ejemplar.estado === "disponible")
            .forEach((ejemplar) => {
                selectorEjemplarPrestamo.appendChild(
                    new Option(
                        `${ejemplar.codigo} (Libro ${ejemplar.libro_id})`,
                        ejemplar.id
                    )
                );
            });

        selectorLectorPrestamo.replaceChildren(
            new Option("Selecciona un lector", "")
        );

        lectores.forEach((lector) => {
            selectorLectorPrestamo.appendChild(
                new Option(
                    `${lector.nombre} — ${lector.identificacion}`,
                    lector.id
                )
            );
        });
    } catch (error) {
        mensajePrestamos.textContent = error.message;
    }
}

document.getElementById("buscar-prestamo").addEventListener("input", (evento) => {
    const busqueda = evento.target.value.trim().toLocaleLowerCase();

    const filtrados = prestamosCargados.filter((prestamo) =>
        String(prestamo.lector_id).includes(busqueda) ||
        String(prestamo.ejemplar_id).includes(busqueda)
    );

    mostrarPrestamos(filtrados);

    mensajePrestamos.textContent = filtrados.length
        ? ""
        : "No se encontraron préstamos que coincidan con la búsqueda.";
});


document
    .getElementById("formulario-prestamo")
    .addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const nuevoPrestamo = {
            ejemplar_id: Number(selectorEjemplarPrestamo.value),
            lector_id: Number(selectorLectorPrestamo.value),
            fecha_prestamo: document.getElementById("prestamo-fecha").value,
            fecha_limite: document.getElementById("prestamo-limite").value
        };

        mensajePrestamos.textContent = "Registrando préstamo...";

        try {
            const respuesta = await fetch("/prestamos/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(nuevoPrestamo)
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
                        : "No se pudo registrar el préstamo."
                );
            }

            evento.target.reset();
            await cargarPrestamos();
            await cargarSelectoresPrestamo();
            await cargarIndicadores();

            mensajePrestamos.textContent =
                `Préstamo ${resultado.id} registrado correctamente.`;
        } catch (error) {
            mensajePrestamos.textContent = error.message;
        }
    });


    tablaPrestamos.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".devolver-prestamo");

    if (!boton) {
        return;
    }

    const prestamo = prestamosCargados.find(
        (elemento) => elemento.id === Number(boton.dataset.id)
    );

    if (!prestamo) {
        mensajePrestamos.textContent = "No se encontró ese préstamo.";
        return;
    }

    const ahora = new Date();
    const hoy = [
        ahora.getFullYear(),
        String(ahora.getMonth() + 1).padStart(2, "0"),
        String(ahora.getDate()).padStart(2, "0")
    ].join("-");

    const fechaDevolucion = window.prompt(
        "Fecha de devolución (AAAA-MM-DD):",
        hoy
    );

    if (fechaDevolucion === null) {
        return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaDevolucion)) {
        mensajePrestamos.textContent = "Escribe la fecha como AAAA-MM-DD.";
        return;
    }

    try {
        const respuesta = await fetch(`/prestamos/${prestamo.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ejemplar_id: prestamo.ejemplar_id,
                lector_id: prestamo.lector_id,
                fecha_prestamo: prestamo.fecha_prestamo,
                fecha_limite: prestamo.fecha_limite,
                fecha_devolucion: fechaDevolucion
            })
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
                    : "No se pudo registrar la devolución."
            );
        }

        await cargarEjemplares();
        await cargarPrestamos();
        await cargarSelectoresPrestamo();
        await cargarIndicadores();

        mensajePrestamos.textContent =
            "Devolución registrada. Si se entregó tarde, la API generará la multa.";
    } catch (error) {
        mensajePrestamos.textContent = error.message;
    }
});


async function cargarMultas() {
    mensajeMultas.textContent = "Cargando multas...";

    try {
        const respuesta = await fetch("/multas/", {
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
                `No se pudieron cargar las multas (HTTP ${respuesta.status}).`
            );
        }

        multasCargadas = await respuesta.json();
        mostrarMultas(multasCargadas);

        mensajeMultas.textContent = multasCargadas.length
            ? ""
            : "Todavía no hay multas registradas.";
    } catch (error) {
        mensajeMultas.textContent = error.message;
    }
}

function mostrarMultas(multas) {
    tablaMultas.replaceChildren();

    multas.forEach((multa) => {
        const fila = document.createElement("tr");
        const estadoPago = multa.pagada === "si" ? "Sí" : "No";

        [
            multa.id,
            multa.prestamo_id,
            `L ${Number(multa.monto).toFixed(2)}`,
            estadoPago
        ].forEach((valor) => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaAcciones = document.createElement("td");

if (multa.pagada === "no") {
    const botonPagar = document.createElement("button");
    botonPagar.type = "button";
    botonPagar.textContent = "Marcar pagada";
    botonPagar.dataset.id = multa.id;
    botonPagar.classList.add("pagar-multa");
    celdaAcciones.appendChild(botonPagar);
} else {
    celdaAcciones.textContent = "Pagada";
}

fila.appendChild(celdaAcciones);
        tablaMultas.appendChild(fila);
    });
}

document.getElementById("buscar-multa").addEventListener("input", (evento) => {
    const busqueda = evento.target.value.trim().toLocaleLowerCase();

    const filtradas = multasCargadas.filter((multa) => {
        const estado = multa.pagada === "si" ? "pagada" : "pendiente";

        return String(multa.prestamo_id).includes(busqueda) ||
            estado.includes(busqueda) ||
            multa.pagada.includes(busqueda);
    });

    mostrarMultas(filtradas);

    mensajeMultas.textContent = filtradas.length
        ? ""
        : "No se encontraron multas que coincidan con la búsqueda.";
});



tablaMultas.addEventListener("click", async (evento) => {
    const boton = evento.target.closest(".pagar-multa");

    if (!boton) {
        return;
    }

    const multa = multasCargadas.find(
        (elemento) => elemento.id === Number(boton.dataset.id)
    );

    if (!multa) {
        mensajeMultas.textContent = "No se encontró esa multa.";
        return;
    }

    try {
        const respuesta = await fetch(`/multas/${multa.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                prestamo_id: multa.prestamo_id,
                monto: multa.monto,
                pagada: "si"
            })
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
                    : "No se pudo actualizar la multa."
            );
        }

        await cargarMultas();
        mensajeMultas.textContent = "Multa marcada como pagada.";
    } catch (error) {
        mensajeMultas.textContent = error.message;
    }
});