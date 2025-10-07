// Espera a que todo el contenido del DOM se haya cargado
document.addEventListener("DOMContentLoaded", () => {
  // Obtener la ruta actual del navegador para identificar la vista
  const path = window.location.pathname;

  // Cargar los servicios (desde localStorage o JSON)
  cargarServicios().then((servicios) => {
    // Mostrar los servicios según la vista
    if (path.includes("servicios.html")) mostrarServicios(servicios); // Vista de lista de servicios
    if (path.includes("crudadmin.html")) iniciarCrud(servicios);      // Vista de CRUD administrativo
    if (path.includes("detalleserv.html")) mostrarDetalle(servicios); // Vista de detalle de servicio
  })
  .catch((err) => console.error("Error al cargar los datos:", err)); // Captura errores al cargar datos
});

// -----------------------------
// Función para mostrar los servicios en la vista servicios.html
// -----------------------------
function mostrarServicios(servicios) {
  // Selecciona el contenedor de la cuadrícula de servicios
  const grid = document.querySelector(".services-grid");

  // Genera el HTML de cada servicio y lo inserta en el contenedor
  grid.innerHTML = servicios
    .map(
      (s) => `
      <a href="detalleserv.html?id=${s.id}">
        <div class="service-card">
          <div class="service-image">
            <span class="price">$${s.precio}</span>
          </div>
          <p class="service-name">${s.nombre}</p>
        </div>
      </a>
    `
    )
    .join(""); // Une todos los elementos en un solo string
}

// -----------------------------
// Función para manejar el CRUD en crudadmin.html
// -----------------------------
function iniciarCrud(servicios) {
  // Intentar cargar los servicios desde localStorage si existen
  const stored = JSON.parse(localStorage.getItem("servicios"));
  if (stored) servicios = stored;

  // Selecciona el cuerpo de la tabla
  const tbody = document.querySelector("tbody");

  // Función que dibuja la tabla con los servicios actuales
  function renderTabla() {
    tbody.innerHTML = servicios
      .map(
        (s) => `
            <tr data-id="${s.id}">
              <td>${s.id}</td>
              <td>${s.nombre}</td>
              <td>$${s.precio}</td>
              <td>
                <button class="btn btn-edit">Editar</button>
                <button class="btn btn-delete">Eliminar</button>
              </td>
            </tr>
        `
      )
      .join(""); // Une todos los elementos
  }

  renderTabla(); // Dibujar tabla inicialmente

  // -----------------------------
  // Crear nuevo servicio
  // -----------------------------
  document.getElementById("btn-nuevo")?.addEventListener("click", () => {
    // Pedir los datos al usuario
    const nombre = prompt("Nombre del servicio:");
    const precio = parseFloat(prompt("Precio:"));
    const descripcion = prompt("Descripción:");
    const cantidad = parseInt(prompt("Cantidad:"));

    // Validación básica
    if (!nombre || isNaN(precio) || !descripcion || isNaN(cantidad)) {
      return alert("Datos inválidos");
    }

    // Crear un objeto de servicio con ID único
    const nuevoServicio = {
      id: servicios.length ? servicios[servicios.length - 1].id + 1 : 1,
      nombre,
      precio,
      descripcion,
      cantidad,
    };

    // Agregar el servicio al array
    servicios.push(nuevoServicio);

    // Guardar en localStorage
    localStorage.setItem("servicios", JSON.stringify(servicios));

    // Actualizar la tabla
    renderTabla();
  });

  // -----------------------------
  // Editar y eliminar servicios
  // -----------------------------
  tbody.addEventListener("click", (e) => {
    // Obtener la fila correspondiente
    const fila = e.target.closest("tr");
    if (!fila) return;

    // Obtener el ID del servicio
    const id = parseInt(fila.dataset.id);
    const servicio = servicios.find((s) => s.id === id);

    // Editar servicio
    if (e.target.classList.contains("btn-edit")) {
      servicio.nombre = prompt("Editar nombre:", servicio.nombre) || servicio.nombre;
      servicio.precio = parseFloat(prompt("Editar precio:", servicio.precio)) || servicio.precio;
      servicio.descripcion = prompt("Editar descripción:", servicio.descripcion) || servicio.descripcion;
      servicio.cantidad = parseInt(prompt("Editar cantidad:", servicio.cantidad)) || servicio.cantidad;

      // Guardar cambios en localStorage
      localStorage.setItem("servicios", JSON.stringify(servicios));
      renderTabla();
    }

    // Eliminar servicio
    if (e.target.classList.contains("btn-delete")) {
      if (confirm("¿Eliminar este servicio?")) {
        // Filtrar el servicio eliminado
        servicios = servicios.filter((s) => s.id !== id);

        // Guardar cambios en localStorage
        localStorage.setItem("servicios", JSON.stringify(servicios));
        renderTabla();
      }
    }
  });
}

// -----------------------------
// Función para mostrar detalle del servicio en detalleserv.html
// -----------------------------
function mostrarDetalle(servicios) {
  // Obtener parámetros de la URL (ej: ?id=2)
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"));

  // Buscar el servicio correspondiente
  const servicio = servicios.find((s) => s.id === id);
  if (!servicio) return; // Si no existe, salir

  // Mostrar los datos en la página
  document.querySelector(".nombre").textContent = servicio.nombre;
  document.querySelector(".tarjeta-grande .precio").textContent = "$" + servicio.precio;
  document.querySelector(".info-extra .descripcion").textContent = servicio.descripcion || "Sin descripción";
  document.querySelector(".info-extra .cantidad").textContent = "Cantidad: " + servicio.cantidad;
}

// -----------------------------
// Función para cargar servicios desde localStorage o JSON
// -----------------------------
function cargarServicios() {
  // Intentar obtener servicios de localStorage
  let servicios = JSON.parse(localStorage.getItem("servicios"));

  if (!servicios) {
    // Si no existen en localStorage, cargar desde archivo JSON
    return fetch("../data/services.json")
      .then((res) => res.json())
      .then((data) => {
        // Guardar en localStorage para futuras sesiones
        localStorage.setItem("servicios", JSON.stringify(data));
        return data;
      });
  }

  // Si ya existen en localStorage, devolverlos como Promise
  return Promise.resolve(servicios);
}
