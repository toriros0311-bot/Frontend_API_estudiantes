/* 
  Nombre: Toribio Rosendi
  Curso: 7°3
*/
const API_URL = "https://backend-api-estudiantes-7tqs.onrender.com/api/students";

const form = document.getElementById("student-form");
const studentIdInput = document.getElementById("student-id");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const tbody = document.getElementById("students-tbody");
const btnGuardar = document.getElementById("btn-guardar");
const btnCancelar = document.getElementById("btn-cancelar");
const divMensaje = document.getElementById("mensaje");
const inputBuscar = document.getElementById("input-buscar");

let listaEstudiantesGlobal = [];

// Mostrar avisos en pantalla sin usar alert
function mostrarMensaje(texto, tipo) {
    divMensaje.textContent = texto;
    divMensaje.className = `mensaje ${tipo}`;
    setTimeout(() => {
        divMensaje.className = "mensaje oculto";
    }, 4000);
}

// Cargar estudiantes (GET)
async function cargarEstudiantes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Error " + response.status);
        
        listaEstudiantesGlobal = await response.json();
        renderizarTabla(listaEstudiantesGlobal);
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el servidor", "error");
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Error de conexión con la API</td></tr>`;
    }
}

// Dibujar la tabla en el DOM
function renderizarTabla(estudiantes) {
    tbody.innerHTML = "";

    if (estudiantes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No hay estudiantes registrados</td></tr>`;
        return;
    }

    estudiantes.forEach(est => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${est.id}</td>
            <td>${est.firstName}</td>
            <td>${est.lastName}</td>
            <td>${est.email}</td>
            <td>${est.age}</td>
            <td>
                <button class="btn-editar" onclick="prepararEdicion(${est.id})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarEstudiante(${est.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Manejar el envío del formulario (POST o PUT)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = studentIdInput.value;
    const estudianteData = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        age: parseInt(ageInput.value)
    };

    if (id) {
        await actualizarEstudiante(id, estudianteData);
    } else {
        await crearEstudiante(estudianteData);
    }
});

// Crear un estudiante (POST)
async function crearEstudiante(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status === 201) {
            form.reset();
            mostrarMensaje("Estudiante creado con éxito", "exito");
            cargarEstudiantes();
        } else if (response.status === 400) {
            const errorRes = await response.json();
            manejarErroresValidacion(errorRes);
        } else {
            throw new Error("Error inesperado en el servidor");
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el servidor", "error");
    }
}

// Preparar formulario para Editar (GET por ID)
async function prepararEdicion(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (response.status === 404) {
            mostrarMensaje("El estudiante ya no existe", "error");
            cargarEstudiantes();
            return;
        }
        if (!response.ok) throw new Error("Error " + response.status);

        const est = await response.json();

        studentIdInput.value = est.id;
        firstNameInput.value = est.firstName;
        lastNameInput.value = est.lastName;
        emailInput.value = est.email;
        ageInput.value = est.age;

        document.getElementById("form-titulo").textContent = "Editar Estudiante";
        btnGuardar.textContent = "Actualizar";
        btnCancelar.classList.remove("oculto");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el servidor", "error");
    }
}

// Actualizar estudiante (PUT)
async function actualizarEstudiante(id, data) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status === 200) {
            limpiarFormularioModoCrear();
            mostrarMensaje("Estudiante actualizado con éxito", "exito");
            cargarEstudiantes();
        } else if (response.status === 400) {
            const errorRes = await response.json();
            manejarErroresValidacion(errorRes);
        } else if (response.status === 404) {
            mostrarMensaje("El estudiante a actualizar ya no existe", "error");
            cargarEstudiantes();
        } else {
            throw new Error("Error inesperado");
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el servidor", "error");
    }
}

// Eliminar un estudiante (DELETE)
async function eliminarEstudiante(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este estudiante?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (response.status === 204) {
            mostrarMensaje("Estudiante eliminado correctamente", "exito");
            cargarEstudiantes();
        } else if (response.status === 404) {
            mostrarMensaje("El estudiante ya no existe en el servidor", "error");
            cargarEstudiantes();
        } else {
            throw new Error("Error al eliminar");
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje("No se pudo conectar con el servidor", "error");
    }
}

// Manejar errores de validación (400)
function manejarErroresValidacion(errorRes) {
    if (errorRes.errors) {
        const mensajes = Object.values(errorRes.errors).join(", ");
        mostrarMensaje(`Errores de validación: ${mensajes}`, "error");
    } else if (errorRes.message) {
        mostrarMensaje(errorRes.message, "error");
    } else {
        mostrarMensaje("Datos inválidos", "error");
    }
}

// Botón Cancelar
btnCancelar.addEventListener("click", () => {
    limpiarFormularioModoCrear();
});

function limpiarFormularioModoCrear() {
    form.reset();
    studentIdInput.value = "";
    document.getElementById("form-titulo").textContent = "Registrar Nuevo Estudiante";
    btnGuardar.textContent = "Guardar";
    btnCancelar.classList.add("oculto");
}

// Desafío Opcional 1: Filtrar la tabla por apellido en tiempo real
inputBuscar.addEventListener("input", (e) => {
    const textoFiltro = e.target.value.toLowerCase();
    const filtrados = listaEstudiantesGlobal.filter(est => 
        est.lastName.toLowerCase().includes(textoFiltro)
    );
    renderizarTabla(filtrados);
});

// Desafío Opcional 2: Ordenar la tabla al hacer clic en los encabezados
let ordenAscendente = true;
function ordenarTabla(columnaIndex) {
    const propiedades = ['id', 'firstName', 'lastName', null, 'age'];
    const prop = propiedades[columnaIndex];
    if (!prop) return;

    listaEstudiantesGlobal.sort((a, b) => {
        let valA = a[prop];
        let valB = b[prop];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });

    ordenAscendente = !ordenAscendente;
    renderizarTabla(listaEstudiantesGlobal);
}

// Inicializar cargando los estudiantes al abrir la página
cargarEstudiantes();
