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
    telefono: document.getElementById('telefono').value,
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
    <td>${data.telefono}</td>
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

    // Llenar el formulario con los datos de la fila
    document.getElementById('fecha').value = data.fecha;
    document.getElementById('cliente').value = data.cliente;
    document.getElementById('telefono').value = data.telefono;
    document.getElementById('modelo').value = data.modelo;
    document.getElementById('reparacion').value = data.reparacion;
    document.getElementById('tecnico').value = data.tecnico;
    document.getElementById('notas').value = data.notas;
    document.getElementById('controlID').value = data.controlID;
    document.getElementById('estado').value = data.estado;
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

  const controlID = filaSeleccionada.children[7].textContent;
  filaSeleccionada.remove();
  filaSeleccionada = null;

  let datosGuardados = JSON.parse(localStorage.getItem('reparaciones')) || [];
  datosGuardados = datosGuardados.filter(d => d.controlID !== controlID);
  localStorage.setItem('reparaciones', JSON.stringify(datosGuardados));

  alert('Reparación eliminada con éxito.');
  actualizarMetricas();
}

function editarSeleccionada() {
  if (!filaSeleccionada) {
    alert('Selecciona una fila para editar.');
    return;
  }

  const confirmPass = prompt('Ingresa la contraseña para editar:');
  if (confirmPass !== passwordEliminar) {
    alert('Contraseña incorrecta.');
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
    estado: document.getElementById('estado').value
  };

  let datosGuardados = JSON.parse(localStorage.getItem('reparaciones')) || [];
  const index = datosGuardados.findIndex(d => d.controlID === filaSeleccionada.children[7].textContent);
  if (index !== -1) {
    datosGuardados[index] = nuevaReparacion;
    localStorage.setItem('reparaciones', JSON.stringify(datosGuardados));
  }

  filaSeleccionada.innerHTML = `
    <td>${nuevaReparacion.fecha}</td>
    <td>${nuevaReparacion.cliente}</td>
    <td>${nuevaReparacion.telefono}</td>
    <td>${nuevaReparacion.modelo}</td>
    <td>${nuevaReparacion.reparacion}</td>
    <td>${nuevaReparacion.tecnico}</td>
    <td>${nuevaReparacion.notas}</td>
    <td>${nuevaReparacion.controlID}</td>
    <td class="${nuevaReparacion.estado === 'entregado' ? 'estado-entregado' : nuevaReparacion.estado === 'pendiente' ? 'estado-pendiente' : 'estado-nulo'}">
      ${nuevaReparacion.estado.charAt(0).toUpperCase() + nuevaReparacion.estado.slice(1)}
    </td>
  `;

  alert('Reparación editada con éxito.');
  formulario.reset();
  filaSeleccionada.classList.remove('seleccionada');
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
