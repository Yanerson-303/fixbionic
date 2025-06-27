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
