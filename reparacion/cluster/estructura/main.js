// main.js
import { state } from './estado.js';
import { agregarFila, seleccionarFila } from './tabla.js';
import { actualizarMetricas } from './metricas.js';
import { mostrarCampoContrasena, manejarPatron } from './patron.js';

window.onload = function () {
  const datosGuardados = JSON.parse(localStorage.getItem('reparaciones')) || [];
  datosGuardados.forEach(dato => agregarFila(dato, false));
  actualizarMetricas();
};

document.getElementById('formulario').addEventListener('submit', function (e) {
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
  document.getElementById('formulario').reset();
  mostrarCampoContrasena();
  actualizarMetricas();
});

document.querySelectorAll('.patron-btn').forEach(manejarPatron);
