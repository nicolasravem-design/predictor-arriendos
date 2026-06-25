// ===== Datos base de ejemplo (ajusta esto a tu modelo real) =====
// Precio aproximado por m² según barrio (COP)
const PRECIO_M2_BARRIO = {
  "Laureles": 28000,
  "El Poblado": 38000,
  "Belén": 22000,
  "Envigado": 25000
};

// Multiplicador según estrato
const MULTIPLICADOR_ESTRATO = {
  "1": 0.55,
  "2": 0.65,
  "3": 0.80,
  "4": 0.95,
  "5": 1.10,
  "6": 1.25
};

// ===== Función de predicción (reemplaza esto por tu modelo/API real) =====
function predecirPrecio({ area, habitaciones, banos, parqueaderos, estrato, barrio }) {
  const precioM2 = PRECIO_M2_BARRIO[barrio] ?? 25000;
  const multiplicador = MULTIPLICADOR_ESTRATO[estrato] ?? 1;

  let precio = area * precioM2 * multiplicador;

  precio += habitaciones * 120000;
  precio += banos * 90000;
  precio += parqueaderos * 150000;

  // Redondear a miles para que se vea limpio
  precio = Math.round(precio / 1000) * 1000;

  return precio;
}

function formatearCOP(valor) {
  return "$" + valor.toLocaleString("es-CO") + " COP";
}

function leerFormulario() {
  return {
    area: Number(document.getElementById("area").value) || 0,
    habitaciones: Number(document.getElementById("habitaciones").value) || 0,
    banos: Number(document.getElementById("banos").value) || 0,
    parqueaderos: Number(document.getElementById("parqueaderos").value) || 0,
    estrato: document.getElementById("estrato").value,
    barrio: document.getElementById("barrio").value
  };
}

function actualizarResultado() {
  const datos = leerFormulario();
  const precio = predecirPrecio(datos);

  document.querySelector(".result-price").textContent = formatearCOP(precio);
}

// Conecta el botón "Predecir precio"
document.querySelector(".btn-predict").addEventListener("click", actualizarResultado);

// Calcula un valor inicial al cargar la página
document.addEventListener("DOMContentLoaded", actualizarResultado);
