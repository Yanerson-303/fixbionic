const formAcc = document.getElementById('form-accesorios');
const tablaAcc = document.getElementById('tabla-accesorios');
let filaSeleccionadaAcc = null;
const passwordEliminar = 'error'; // Puedes cambiar esta contraseña si deseas

let grafico = null; // Controla la instancia del gráfico

// Cargar accesorios al iniciar
window.onload = function () {
  const datosAccesorios = JSON.parse(localStorage.getItem('accesorios')) || [];
  datosAccesorios.forEach(dato => agregarFilaAccesorios(dato, false));
  actualizarMetricas();
};

// Guardar accesorio nuevo
formAcc.addEventListener('submit', function (e) {
  e.preventDefault();

  const nuevoAccesorio = {
    fecha: document.getElementById('fechaAcc').value,
    nombre: document.getElementById('nombreAcc').value,
    categoria: document.getElementById('categoriaAcc').value,
    precio: document.getElementById('precioAcc').value,
    cantidad: document.getElementById('cantidadAcc').value,
    observaciones: document.getElementById('observacionesAcc').value
  };

  agregarFilaAccesorios(nuevoAccesorio, true);
  formAcc.reset();
  actualizarMetricas();
});

// Agregar fila a la tabla
function agregarFilaAccesorios(data, guardar) {
  const fila = document.createElement('tr');

  fila.innerHTML = `
    <td>${data.fecha}</td>
    <td>${data.nombre}</td>
    <td>${data.categoria}</td>
    <td>${data.precio}</td>
    <td>${data.cantidad}</td>
    <td>${data.observaciones}</td>
  `;

  // Selección de fila
  fila.addEventListener('click', function () {
    if (filaSeleccionadaAcc) filaSeleccionadaAcc.classList.remove('seleccionada');
    filaSeleccionadaAcc = fila;
    filaSeleccionadaAcc.classList.add('seleccionada');
  });

  tablaAcc.appendChild(fila);

  if (guardar) {
    const datosGuardados = JSON.parse(localStorage.getItem('accesorios')) || [];
    datosGuardados.push(data);
    localStorage.setItem('accesorios', JSON.stringify(datosGuardados));
  }
}

// Eliminar accesorio seleccionado
function eliminarAccesorioSeleccionado() {
  if (!filaSeleccionadaAcc) {
    alert('Selecciona un accesorio para eliminar.');
    return;
  }

  const confirmPass = prompt('Ingresa la contraseña para eliminar:');
  if (confirmPass !== passwordEliminar) {
    alert('Contraseña incorrecta.');
    return;
  }

  const nombre = filaSeleccionadaAcc.children[1].textContent;
  const fecha = filaSeleccionadaAcc.children[0].textContent;

  filaSeleccionadaAcc.remove();
  filaSeleccionadaAcc = null;

  let datosGuardados = JSON.parse(localStorage.getItem('accesorios')) || [];
  datosGuardados = datosGuardados.filter(d => !(d.nombre === nombre && d.fecha === fecha));
  localStorage.setItem('accesorios', JSON.stringify(datosGuardados));

  alert('Accesorio eliminado con éxito.');
  actualizarMetricas();
}

// Gráfico y métricas
function actualizarMetricas() {
  const datos = JSON.parse(localStorage.getItem('accesorios')) || [];

  // --- Resumen por categoría ---
  const resumen = {};
  datos.forEach(acc => {
    const cat = acc.categoria;
    const cantidad = parseInt(acc.cantidad);
    resumen[cat] = (resumen[cat] || 0) + cantidad;
  });

  const categorias = Object.keys(resumen);
  const cantidades = Object.values(resumen);

  const ctx = document.getElementById('graficoAccesorios').getContext('2d');

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categorias,
      datasets: [{
        label: 'Cantidad por Categoría',
        data: cantidades,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return ` ${context.parsed.y} unidades`;
            }
          }
        }
      },
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
