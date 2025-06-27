// estado.js
export const state = {
  datos: [],
  filaSeleccionada: null,
  patronActual: [],
  set(key, value) {
    this[key] = value;
    if (this._listeners[key]) {
      this._listeners[key].forEach(fn => fn(value));
    }
  },
  subscribe(key, callback) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(callback);
  },
  _listeners: {}
};
