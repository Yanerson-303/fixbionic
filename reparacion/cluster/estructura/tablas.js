// tabla.js
import { state } from './estado.js';
import { mostrarCampoContrasena } from './patron.js';

export function agregarFila(data, guardar) {
  const tabla = document.getElementById('tabla-reparaciones');
  const fila = document.createElement('tr');
  const claseEstado = data.estado === 'entregado' ? 'estado-entregado' : data.estado === 'pendiente' ? 'estado-pendiente' : 'estado-nulo';

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

export function seleccionarFila(fila, data) {
  if (state.filaSeleccionada) state.filaSeleccionada.classList.remove('seleccionada');
  state.set('filaSeleccionada', fila);
  fila.classList.add('seleccionada');

  document.getElementById('fecha').value = data.fecha;
  document.getElementById('cliente').value = data.cliente;
  document.getElementById('telefono').value = data.telefono;
  document.getElementById('modelo').value = data.modelo;
  document.getElementById('reparacion').value = data.reparacion;
  document.getElementById('tecnico').value = data.tecnico;
  document.getElementById('notas').value = data.notas;
  document.getElementById('controlID').value = data.controlID;
  document.getElementById('estado').value = data.estado;
  document.getElementById('tipo-contrasena').value = data.contrasena && data.contrasena.includes('-') ? 'patron' : 'pin';
  mostrarCampoContrasena();

  if (data.contrasena) {
    if (data.contrasena.includes('-')) {
      state.set('patronActual', data.contrasena.split('-'));
      document.getElementById('patron-input').value = data.contrasena;
      document.querySelectorAll('.patron-btn').forEach(btn => {
        if (state.patronActual.includes(btn.dataset.num)) {
          btn.classList.add('active');
        }
      });
    } else {
      document.getElementById('contrasena').value = data.contrasena;
    }
  }
}


// patron.js
import { state } from './estado.js';

export function mostrarCampoContrasena() {
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

export function manejarPatron(btn) {
  btn.addEventListener('click', () => {
    const valor = btn.dataset.num;
    if (!state.patronActual.includes(valor)) {
      state.patronActual.push(valor);
      btn.classList.add('active');
      document.getElementById('patron-input').value = state.patronActual.join('-');
    }
  });
}
