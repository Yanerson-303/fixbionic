const formulario = document.getElementById('formulario');
const tabla = document.getElementById('tabla-reparaciones');
let filaSeleccionada = null;
const passwordEliminar = 'error';
let grafico = null;

window.onload = function () {
  const datosGuardados = JSON.parse(localStorage.getItem('reparaciones')) || [];
  datosGuardados.forEach(dato => agregarFila(dato, false));
  actualizarMetricas();
};

formulario.addEventListener('submit', function (e) {
  e.preventDefault();

  const nuevaReparacion = {
    fecha: document.getElementById('fecha').value,
    cliente: document.getElementById('cliente').value,
    modelo: document.getElementById('modelo').value,
    reparacion: document.getElementById('reparacion').value,
    tecnico: document.getElementById('tecnico').value,
    notas: document.getElementById('notas').value,
    controlID: document.getElementById('controlID').value,
    estado: document.getElementById('estado').value
  };

  agregarFila(nuevaReparacion, true);
  formulario.reset();
  actualizarMetricas();
});

function agregarFila(data, guardar) {
  const fila = document.createElement('tr');

  let claseEstado = '';
  if (data.estado === 'entregado') claseEstado = 'estado-entregado';
  else if (data.estado === 'pendiente') claseEstado = 'estado-pendiente';
  else claseEstado = 'estado-nulo';

  fila.innerHTML = `
    <td>${data.fecha}</td>
    <td>${data.cliente}</td>
    <td>${data.modelo}</td>
    <td>${data.reparacion}</td>
    <td>${data.tecnico}</td>
    <td>${data.notas}</td>
    <td>${data.controlID}</td>
    <td class="${claseEstado}">${data.estado.charAt(0).toUpperCase() + data.estado.slice(1)}</td>
  `;

  fila.addEventListener('click', function () {
    if (filaSeleccionada) filaSeleccionada.classList.remove('seleccionada');
    filaSeleccionada = fila;
    filaSeleccionada.classList.add('seleccionada');
  });

  tabla.appendChild(fila);

  if (guardar) {
    const datosGuardados = JSON.parse(localStorage.getItem('reparaciones')) || [];
    datosGuardados.push(data);
    localStorage.setItem('reparaciones', JSON.stringify(datosGuardados));
  }
}

function eliminarSeleccionada() {
  if (!filaSeleccionada) {
    alert('Selecciona una fila para eliminar.');
    return;
  }

  const confirmPass = prompt('Ingresa la contraseña para eliminar:');
  if (confirmPass !== passwordEliminar) {
    alert('Contraseña incorrecta.');
    return;
  }

  const controlID = filaSeleccionada.children[6].textContent;
  filaSeleccionada.remove();
  filaSeleccionada = null;

  let datosGuardados = JSON.parse(localStorage.getItem('reparaciones')) || [];
  datosGuardados = datosGuardados.filter(d => d.controlID !== controlID);
  localStorage.setItem('reparaciones', JSON.stringify(datosGuardados));

  alert('Reparación eliminada con éxito.');
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
      labels: ['Pendientes', 'Entregadas', 'No se ha hecho nada'],
      datasets: [{
        label: 'Reparaciones',
        data: [
          pendientes,
          entregadas,
          total - pendientes - entregadas
        ],
        backgroundColor: ['#ffc107', '#28a745', '#6c757d'],
        borderColor: ['#fff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
