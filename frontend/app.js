const formulario = document.getElementById("formulario-login");
const mensaje = document.getElementById("mensaje");

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombreUsuario = document
        .getElementById("nombre_usuario")
        .value
        .trim();

    const contrasena = document.getElementById("contrasena").value;

    mensaje.textContent = "Iniciando sesión...";

    try {
        const respuesta = await fetch("/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nombre_usuario: nombreUsuario,
                contrasena: contrasena
            })
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.detail || "No se pudo iniciar sesión");
        }

        sessionStorage.setItem("access_token", resultado.access_token);
        mensaje.textContent = "Inicio de sesión correcto.";
        window.location.href = "/frontend/dashboard.html";
    } catch (error) {
        mensaje.textContent = error.message;
    }
});