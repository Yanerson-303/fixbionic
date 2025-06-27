const formAcc = document.getElementById('form-accesorios');
const tablaAcc = document.getElementById('tabla-accesorios');
let filaSeleccionadaAcc = null;
const passwordEliminar = 'error';
let grafico = null;

// === EVENTOS ===
window.onload = () => {
  cargarDesdeLocalStorage();
  actualizarMetricas();
};

formAcc?.addEventListener('submit', guardarNuevoAccesorio);
document.getElementById('exportarImagenBtn')?.addEventListener('click', exportarSeleccionadaComoImagen);
document.getElementById('exportarExcelBtn')?.addEventListener('click', exportarTablaAExcel);
document.getElementById('exportarJsonBtn')?.addEventListener('click', exportarBaseDeDatos);
document.getElementById('importarBD')?.addEventListener('change', importarBaseDeDatos);
document.getElementById('btnEliminar')?.addEventListener('click', eliminarAccesorioSeleccionado);
document.getElementById('btnEditar')?.addEventListener('click', editarAccesorioSeleccionado);

// === FUNCIONES PRINCIPALES ===
function guardarNuevoAccesorio(e) {
  e.preventDefault();
  const nuevo = capturarDatosFormulario();
  agregarFilaAccesorios(nuevo, true);
  formAcc.reset();
  actualizarMetricas();
}

function capturarDatosFormulario() {
  const get = id => document.getElementById(id)?.value || '';
  return {
    fecha: get('fechaAcc'),
    nombre: get('nombreAcc'),
    categoria: get('categoriaAcc'),
    precio: get('precioAcc'),
    cantidad: get('cantidadAcc'),
    observaciones: get('observacionesAcc'),
    cliente: get('clienteAcc'),
    contacto: get('contactoAcc')
  };
}

function agregarFilaAccesorios(data, guardar) {
  const fila = document.createElement('tr');
  fila.innerHTML = `
    <td>${data.fecha}</td>
    <td>${data.nombre}</td>
    <td>${data.categoria}</td>
    <td>${data.precio}</td>
    <td>${data.cantidad}</td>
    <td>${data.observaciones}</td>
    <td>${data.cliente}</td>
    <td>${data.contacto}</td>
  `;
  fila.addEventListener('click', () => seleccionarFila(fila, data));
  tablaAcc.appendChild(fila);

  if (guardar) {
    const accesorios = obtenerDesdeLocalStorage();
    accesorios.push(data);
    localStorage.setItem('accesorios', JSON.stringify(accesorios));
  }
}

function seleccionarFila(fila, data) {
  if (filaSeleccionadaAcc) filaSeleccionadaAcc.classList.remove('seleccionada');
  filaSeleccionadaAcc = fila;
  filaSeleccionadaAcc.classList.add('seleccionada');

  Object.entries(data).forEach(([key, value]) => {
    const campo = document.getElementById(key + 'Acc');
    if (campo) campo.value = value;
  });
}

function eliminarAccesorioSeleccionado() {
  if (!filaSeleccionadaAcc) return alert('Selecciona un accesorio.');
  if (prompt('Contraseña para eliminar:') !== passwordEliminar) return alert('Contraseña incorrecta.');

  const nombre = filaSeleccionadaAcc.children[1].textContent;
  const fecha = filaSeleccionadaAcc.children[0].textContent;

  filaSeleccionadaAcc.remove();
  filaSeleccionadaAcc = null;

  const datos = obtenerDesdeLocalStorage().filter(d => !(d.nombre === nombre && d.fecha === fecha));
  localStorage.setItem('accesorios', JSON.stringify(datos));
  actualizarMetricas();
  alert('Accesorio eliminado correctamente.');
}

function editarAccesorioSeleccionado() {
  if (!filaSeleccionadaAcc) return alert('Selecciona un accesorio.');
  if (prompt('Contraseña para editar:') !== passwordEliminar) return alert('Contraseña incorrecta.');

  const nuevo = capturarDatosFormulario();
  const nombre = filaSeleccionadaAcc.children[1].textContent;
  const fecha = filaSeleccionadaAcc.children[0].textContent;

  let datos = obtenerDesdeLocalStorage();
  const index = datos.findIndex(d => d.nombre === nombre && d.fecha === fecha);
  if (index !== -1) datos[index] = nuevo;
  localStorage.setItem('accesorios', JSON.stringify(datos));

  filaSeleccionadaAcc.innerHTML = `
    <td>${nuevo.fecha}</td>
    <td>${nuevo.nombre}</td>
    <td>${nuevo.categoria}</td>
    <td>${nuevo.precio}</td>
    <td>${nuevo.cantidad}</td>
    <td>${nuevo.observaciones}</td>
    <td>${nuevo.cliente}</td>
    <td>${nuevo.contacto}</td>
  `;
  actualizarMetricas();
  alert('Accesorio editado correctamente.');
  formAcc.reset();
  filaSeleccionadaAcc.classList.remove('seleccionada');
  filaSeleccionadaAcc = null;
}

// === FUNCIONES DE EXPORTACIÓN / IMPORTACIÓN ===
function exportarSeleccionadaComoImagen() {
  if (!filaSeleccionadaAcc) return alert('Selecciona una fila.');
  const celdas = filaSeleccionadaAcc.children;
  const contenedor = document.getElementById('contenedor-exportacion');
  const facturaID = 'FBX-' + Date.now().toString().slice(-6);
  const total = parseInt(celdas[3].textContent) * parseInt(celdas[4].textContent);
  const fechaActual = new Date().toLocaleDateString('es-CO');

  contenedor.innerHTML = `
    <div id="factura-fixbionix" style="width: 300px; padding: 18px; font-family: 'Courier New'; font-size: 13px; background: #fff; color: #000; border: 1px solid #000;">
      <div style="text-align: center;">
        <h2 style="margin: 0; font-size: 18px; font-weight: bold;">FIX BIONIX</h2>
        <p>Accesorios & Servicio Técnico</p>
        <p>Itagüí, CC Arquicentro</p>
        <p>NIT: 901361537-1</p>
        <hr>
        <p><strong>FACTURA No. ${facturaID}</strong></p>
      </div>
      <table style="width: 100%; margin: 8px 0;">
        <tr><td>Fecha:</td><td style="text-align:right;">${celdas[0].textContent}</td></tr>
        <tr><td>Producto:</td><td style="text-align:right;">${celdas[1].textContent}</td></tr>
        <tr><td>Precio:</td><td style="text-align:right;">$${parseInt(celdas[3].textContent).toLocaleString()}</td></tr>
        <tr><td>Cantidad:</td><td style="text-align:right;">${celdas[4].textContent}</td></tr>
        <tr><td>Total:</td><td style="text-align:right;"><strong>$${total.toLocaleString()}</strong></td></tr>
        <tr><td>Cliente:</td><td style="text-align:right;">${celdas[6].textContent}</td></tr>
        <tr><td>Contacto:</td><td style="text-align:right;">${celdas[7].textContent}</td></tr>
      </table>
      <div style="text-align: center; font-size: 11px;">
        <p>www.fixbionix.com</p>
        <p>Generado el ${fechaActual}</p>
      </div>
    </div>
  `;
  contenedor.style.display = 'block';

  html2canvas(document.getElementById('factura-fixbionix'), {
    scale: 6,
    useCORS: true,
    backgroundColor: "#fff"
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Factura_${facturaID}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    contenedor.style.display = 'none';
  });
}

function exportarTablaAExcel() {
  const datos = obtenerDesdeLocalStorage();
  if (!datos.length) return alert('No hay datos para exportar.');
  const hoja = XLSX.utils.json_to_sheet(datos);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, "Accesorios");
  XLSX.writeFile(libro, "accesorios.xlsx");
}

function exportarBaseDeDatos() {
  const datos = obtenerDesdeLocalStorage();
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'base_accesorios.json';
  link.click();
}

function importarBaseDeDatos(e) {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = function (e) {
    try {
      const datos = JSON.parse(e.target.result);
      if (!Array.isArray(datos)) throw new Error();
      localStorage.setItem('accesorios', JSON.stringify(datos));
      tablaAcc.innerHTML = '';
      datos.forEach(d => agregarFilaAccesorios(d, false));
      actualizarMetricas();
    } catch {
      alert('Error al importar la base de datos.');
    }
  };
  lector.readAsText(archivo);
}

// === FUNCIONES AUXILIARES ===
function obtenerDesdeLocalStorage() {
  return JSON.parse(localStorage.getItem('accesorios')) || [];
}

function cargarDesdeLocalStorage() {
  obtenerDesdeLocalStorage().forEach(dato => agregarFilaAccesorios(dato, false));
}

function actualizarMetricas() {
  const datos = obtenerDesdeLocalStorage();
  let totalUnidades = 0;
  let valorTotal = 0;
  const resumen = {};

  datos.forEach(acc => {
    const cat = acc.categoria;
    const cantidad = parseInt(acc.cantidad);
    const precio = parseInt(acc.precio);
    resumen[cat] = (resumen[cat] || 0) + cantidad;
    totalUnidades += cantidad;
    valorTotal += cantidad * precio;
  });

  document.getElementById('total-registros').textContent = datos.length;
  document.getElementById('total-unidades').textContent = totalUnidades;
  document.getElementById('valor-total').textContent = valorTotal.toLocaleString();

  const ctx = document.getElementById('graficoAccesorios').getContext('2d');
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(resumen),
      datasets: [{
        label: 'Cantidad por Categoría',
        data: Object.values(resumen),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Cantidad' }
        },
        x: {
          title: { display: true, text: 'Categoría' }
        }
      }
    }
  });
}
