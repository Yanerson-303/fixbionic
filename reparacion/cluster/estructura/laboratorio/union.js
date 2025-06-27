// === MÓDULO ESTADO ===
const state = {
  patronActual: [],
  set(prop, val) {
    this[prop] = val;
  }
};

// === MÓDULO PATRÓN ===
function mostrarCampoContrasena() {
  const tipo = document.getElementById('tipo-contrasena').value;
  const pin = document.getElementById('contrasena');
  const patron = document.getElementById('patron-container');
  const error = document.getElementById('errorPatron');

  pin.style.display = tipo === 'pin' ? 'block' : 'none';
  patron.style.display = tipo === 'patron' ? 'block' : 'none';
  error.style.display = 'none';

  state.set('patronActual', []);
  document.querySelectorAll('.patron-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('patron-input').value = '';
}

function manejarPatron() {
  document.querySelectorAll('.patron-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const valor = btn.dataset.num;
      if (!state.patronActual.includes(valor)) {
        state.patronActual.push(valor);
        btn.classList.add('active');
        document.getElementById('patron-input').value = state.patronActual.join('-');
      }
    });
  });
}

// === FUNCIONES Y VARIABLES GLOBALES ===
const formulario = document.getElementById('formulario');
const tabla = document.getElementById('tabla-reparaciones');
let filaSeleccionada = null;
const passwordEliminar = 'error';
let grafico = null;

// === EVENTOS Y CARGA INICIAL ===
window.onload = () => {
  cargarDesdeLocalStorage();
  actualizarMetricas();
  manejarPatron();
  mostrarCampoContrasena();
};

document.getElementById('tipo-contrasena').addEventListener('change', mostrarCampoContrasena);
document.getElementById('btn-eliminar').addEventListener('click', eliminarSeleccionada);
document.getElementById('btn-editar').addEventListener('click', editarSeleccionada);
document.getElementById('buscarInput').addEventListener('input', e => buscarReparacion(e.target.value));
document.getElementById('btn-descargar-imagen').addEventListener('click', exportarSeleccionadaComoImagen);

formulario.addEventListener('submit', e => {
  e.preventDefault();

  const tipo = document.getElementById('tipo-contrasena').value;
  const patronInput = document.getElementById('patron-input').value;
  const error = document.getElementById('errorPatron');

  if (tipo === 'patron' && patronInput.trim() === '') {
    error.style.display = 'block';
    return;
  }

  const nuevaReparacion = {
    fecha: document.getElementById('fecha').value,
    cliente: document.getElementById('cliente').value,
    telefono: document.getElementById('telefono').value,
    modelo: document.getElementById('modelo').value,
    reparacion: document.getElementById('reparacion').value,
    tecnico: document.getElementById('tecnico').value,
    notas: document.getElementById('notas').value,
    controlID: document.getElementById('controlID').value,
    estado: document.getElementById('estado').value,
    contrasena: tipo === 'pin' ? document.getElementById('contrasena').value : patronInput
  };

  agregarFila(nuevaReparacion, true);
  formulario.reset();
  mostrarCampoContrasena();
  actualizarMetricas();
});

// === CRUD Y FUNCIONES DE NEGOCIO ===
function cargarDesdeLocalStorage() {
  const datos = JSON.parse(localStorage.getItem('reparaciones')) || [];
  datos.forEach(dato => agregarFila(dato, false));
}

function agregarFila(data, guardar = true) {
  const fila = document.createElement('tr');
  const claseEstado = data.estado === 'entregado' ? 'estado-entregado' :
                      data.estado === 'pendiente' ? 'estado-pendiente' : 'estado-nulo';

  fila.innerHTML = `
    <td>${data.fecha}</td>
    <td>${data.cliente}</td>
    <td>${data.telefono}</td>
    <td>${data.modelo}</td>
    <td>${data.reparacion}</td>
    <td>${data.tecnico}</td>
    <td>${data.notas}</td>
    <td>${data.controlID}</td>
    <td class="${claseEstado}">${capitalize(data.estado)}</td>
    <td>${data.contrasena || ''}</td>
  `;

  fila.addEventListener('click', () => seleccionarFila(fila, data));
  tabla.appendChild(fila);

  if (guardar) {
    const datosGuardados = JSON.parse(localStorage.getItem('reparaciones')) || [];
    datosGuardados.push(data);
    localStorage.setItem('reparaciones', JSON.stringify(datosGuardados));
  }
}

function seleccionarFila(fila, data) {
  if (filaSeleccionada) filaSeleccionada.classList.remove('seleccionada');
  filaSeleccionada = fila;
  filaSeleccionada.classList.add('seleccionada');

  document.getElementById('fecha').value = data.fecha;
  document.getElementById('cliente').value = data.cliente;
  document.getElementById('telefono').value = data.telefono;
  document.getElementById('modelo').value = data.modelo;
  document.getElementById('reparacion').value = data.reparacion;
  document.getElementById('tecnico').value = data.tecnico;
  document.getElementById('notas').value = data.notas;
  document.getElementById('controlID').value = data.controlID;
  document.getElementById('estado').value = data.estado;
  document.getElementById('tipo-contrasena').value = data.contrasena?.includes('-') ? 'patron' : 'pin';

  mostrarCampoContrasena();

  if (data.contrasena?.includes('-')) {
    state.set('patronActual', data.contrasena.split('-'));
    document.getElementById('patron-input').value = data.contrasena;
    document.querySelectorAll('.patron-btn').forEach(btn => {
      btn.classList.toggle('active', state.patronActual.includes(btn.dataset.num));
    });
  } else {
    document.getElementById('contrasena').value = data.contrasena;
  }
}

function eliminarSeleccionada() {
  if (!filaSeleccionada) return alert('Selecciona una fila.');
  const confirmPass = prompt('Contraseña para eliminar:');
  if (confirmPass !== passwordEliminar) return alert('Contraseña incorrecta.');

  const controlID = filaSeleccionada.children[7].textContent;
  filaSeleccionada.remove();
  filaSeleccionada = null;

  let datos = JSON.parse(localStorage.getItem('reparaciones')) || [];
  datos = datos.filter(d => d.controlID !== controlID);
  localStorage.setItem('reparaciones', JSON.stringify(datos));

  alert('Reparación eliminada.');
  actualizarMetricas();
}

function editarSeleccionada() {
  if (!filaSeleccionada) return alert('Selecciona una fila.');
  const confirmPass = prompt('Contraseña para editar:');
  if (confirmPass !== passwordEliminar) return alert('Contraseña incorrecta.');

  const tipo = document.getElementById('tipo-contrasena').value;
  const reparacionEditada = {
    fecha: document.getElementById('fecha').value,
    cliente: document.getElementById('cliente').value,
    telefono: document.getElementById('telefono').value,
    modelo: document.getElementById('modelo').value,
    reparacion: document.getElementById('reparacion').value,
    tecnico: document.getElementById('tecnico').value,
    notas: document.getElementById('notas').value,
    controlID: document.getElementById('controlID').value,
    estado: document.getElementById('estado').value,
    contrasena: tipo === 'pin' ? document.getElementById('contrasena').value : document.getElementById('patron-input').value
  };

  let datos = JSON.parse(localStorage.getItem('reparaciones')) || [];
  const idx = datos.findIndex(d => d.controlID === filaSeleccionada.children[7].textContent);
  if (idx !== -1) datos[idx] = reparacionEditada;
  localStorage.setItem('reparaciones', JSON.stringify(datos));

  agregarFila(reparacionEditada, false);
  filaSeleccionada.remove();
  alert('Reparación actualizada.');
  formulario.reset();
  mostrarCampoContrasena();
  filaSeleccionada = null;
  actualizarMetricas();
}

function actualizarMetricas() {
  const datos = JSON.parse(localStorage.getItem('reparaciones')) || [];
  const total = datos.length;
  const pendientes = datos.filter(d => d.estado === 'pendiente').length;
  const entregadas = datos.filter(d => d.estado === 'entregado').length;

  document.getElementById('total-reparaciones').textContent = total;
  document.getElementById('total-pendientes').textContent = pendientes;
  document.getElementById('total-entregadas').textContent = entregadas;

  const ctx = document.getElementById('graficoReparaciones')?.getContext('2d');
  if (!ctx) return;
  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pendientes', 'Entregadas', 'No hecho'],
      datasets: [{
        label: 'Reparaciones',
        data: [pendientes, entregadas, total - pendientes - entregadas],
        backgroundColor: ['#ffc107', '#28a745', '#6c757d'],
        borderColor: ['#fff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function buscarReparacion(valor) {
  const datos = JSON.parse(localStorage.getItem('reparaciones')) || [];
  tabla.innerHTML = '';
  datos.forEach(dato => {
    if (
      dato.cliente.toLowerCase().includes(valor.toLowerCase()) ||
      dato.modelo.toLowerCase().includes(valor.toLowerCase()) ||
      dato.controlID.includes(valor)
    ) {
      agregarFila(dato, false);
    }
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function exportarSeleccionadaComoImagen() {
  if (!filaSeleccionada) return alert('Selecciona una fila.');

  const celdas = filaSeleccionada.children;
  const contenedor = document.getElementById('contenedor-exportacion');
  if (!contenedor) return alert('No se encontró el contenedor para exportar la imagen.');

  const fechaHoy = new Date().toLocaleDateString('es-CO');
  const facturaID = 'FBX-' + Date.now().toString().slice(-6);

  contenedor.innerHTML = `
    <div id="factura-fixbionic" style="width: 350px; padding: 20px; font-family: 'Courier New'; font-size: 14px; font-weight: bold; background: #fff; color: #000; border: 2px solid #000; box-shadow: 2px 2px 10px rgba(0,0,0,0.1);">
      <div style="text-align: center;">
        <h2 style="margin: 0; font-size: 20px;">FIX BIONIC</h2>
        <p style="margin: 2px 0;">Centro de Servicio Técnico</p>
        <p style="margin: 2px 0;">NIT: 1022421675-9</p>
        <p style="margin: 2px 0;">CC Arquicentro, Itagüí - Local 102</p>
        <p style="margin: 2px 0;">www.fixbionic.com</p>
        <hr style="border-top: 2px dashed #000; margin: 10px 0;" />
        <p style="margin: 2px 0;"><strong>FACTURA No: ${facturaID}</strong></p>
      </div>
      <table style="width: 100%; margin-top: 10px; font-size: 13px;">
        <tr><td>Fecha:</td><td style="text-align:right;">${celdas[0].textContent}</td></tr>
        <tr><td>Cliente:</td><td style="text-align:right;">${celdas[1].textContent}</td></tr>
        <tr><td>Teléfono:</td><td style="text-align:right;">${celdas[2].textContent}</td></tr>
        <tr><td>Modelo:</td><td style="text-align:right;">${celdas[3].textContent}</td></tr>
        <tr><td>Reparación:</td><td style="text-align:right;">${celdas[4].textContent}</td></tr>
        <tr><td>Técnico:</td><td style="text-align:right;">${celdas[5].textContent}</td></tr>
        <tr><td>Notas:</td><td style="text-align:right;">${celdas[6].textContent}</td></tr>
        <tr><td>Control ID:</td><td style="text-align:right;">${celdas[7].textContent}</td></tr>
        <tr><td>Estado:</td><td style="text-align:right;">${celdas[8].textContent}</td></tr>
        <tr><td>Contraseña:</td><td style="text-align:right;">${celdas[9].textContent}</td></tr>
      </table>
      <hr style="border-top: 1px dashed #000; margin: 10px 0;" />
      <div style="text-align: center; font-size: 11px;">
        <p>Gracias por confiar en nosotros.</p>
        <p>Generado el ${fechaHoy}</p>
      </div>
    </div>
  `;

  contenedor.style.display = 'block';

  html2canvas(document.getElementById('factura-fixbionic'), {
    scale: 6,
    useCORS: true,
    backgroundColor: "#fff"
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Factura_${facturaID}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    contenedor.style.display = 'none';
  }).catch(err => {
    alert('Error al generar la imagen: ' + err);
  });
}