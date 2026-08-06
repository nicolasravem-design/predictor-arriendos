/* ============================================================
   PREDICTOR DE ARRIENDOS — VALLE DE ABURRÁ
   Modelo de estimación basado en datos de referencia del mercado
   inmobiliario del Área Metropolitana del Valle de Aburrá.
   ============================================================ */

// ===== PRECIO BASE POR M² SEGÚN ZONA (COP/mes) =====
// Datos de referencia del mercado de arriendos 2024-2025
const PRECIO_M2_ZONA = {
  // Zona Sur
  "sabaneta":        { base: 32000, nombre: "Sabaneta", zona: "Sur" },
  "envigado":       { base: 30000, nombre: "Envigado", zona: "Sur" },
  "itagui":         { base: 24000, nombre: "Itagüí", zona: "Sur" },
  "la-estrella":    { base: 22000, nombre: "La Estrella", zona: "Sur" },
  "caldas":         { base: 18000, nombre: "Caldas", zona: "Sur" },
  // Medellín
  "el-poblado":     { base: 42000, nombre: "El Poblado", zona: "Medellín" },
  "laureles":       { base: 33000, nombre: "Laureles", zona: "Medellín" },
  "belen":          { base: 26000, nombre: "Belén", zona: "Medellín" },
  "robledo":        { base: 20000, nombre: "Robledo", zona: "Medellín" },
  "manila":         { base: 30000, nombre: "Manila", zona: "Medellín" },
  "boston":         { base: 28000, nombre: "Boston", zona: "Medellín" },
  "castropol":      { base: 35000, nombre: "Castropol", zona: "Medellín" },
  "los-balsos":     { base: 32000, nombre: "Los Balsos", zona: "Medellín" },
  "el-tesoro":      { base: 38000, nombre: "El Tesoro", zona: "Medellín" },
  "la-florida":     { base: 34000, nombre: "La Florida", zona: "Medellín" },
  "conquistadores": { base: 30000, nombre: "Conquistadores", zona: "Medellín" },
  "centro-medellin": { base: 18000, nombre: "Centro", zona: "Medellín" },
  "aranjuez":       { base: 19000, nombre: "Aranjuez", zona: "Medellín" },
  "villa-hermosa":  { base: 17000, nombre: "Villa Hermosa", zona: "Medellín" },
  "buenos-aires":   { base: 21000, nombre: "Buenos Aires", zona: "Medellín" },
  "guayabal":       { base: 22000, nombre: "Guayabal", zona: "Medellín" },
  // Zona Norte
  "bello":          { base: 19000, nombre: "Bello", zona: "Norte" },
  "copacabana":     { base: 21000, nombre: "Copacabana", zona: "Norte" },
  "girardota":      { base: 18000, nombre: "Girardota", zona: "Norte" },
  "barbosa":        { base: 16000, nombre: "Barbosa", zona: "Norte" },
};

// ===== MULTIPLICADOR POR ESTRATO =====
const MULT_ESTRATO = {
  "1": 0.50,
  "2": 0.62,
  "3": 0.80,
  "4": 0.95,
  "5": 1.12,
  "6": 1.30,
};

// ===== MULTIPLICADOR POR TIPO DE INMUEBLE =====
const MULT_TIPO = {
  "apartamento": 1.00,
  "casa":        1.15,  // Las casas suelen arrendarse más caro por m²
  "estudio":     0.85,  // Los estudios son más económicos
};

// ===== FACTOR DE ANTIGÜEDAD =====
const FACTOR_ANTIGUEDAD = {
  "nueva":       1.08,  // Plus por construcción reciente
  "reciente":    1.00,
  "intermedia":  0.92,
  "antigua":     0.82,  // Descuento por antigüedad
};

// ===== VALORES ADICIONALES POR CARACTERÍSTICA (COP/mes) =====
const VALOR_HABITACION = 90000;
const VALOR_BANO = 70000;
const VALOR_PARQUEADERO = 130000;

// ===== VALORES POR AMENIDAD (incremento porcentual) =====
const INCREMENTO_AMENIDAD = {
  "ascensor":         0.03,
  "balcon":           0.04,
  "terraza":          0.05,
  "porteria":         0.05,
  "gimnasio":         0.06,
  "piscina":          0.08,
  "conjunto-cerrado": 0.04,
  "zonas-sociales":   0.03,
};

// ===== LABELS PARA EL DESGLOSE =====
const LABELS = {
  area: "Área base (m² × precio/zona)",
  estrato: "Ajuste por estrato",
  tipo: "Ajuste por tipo de inmueble",
  antiguedad: "Ajuste por antigüedad",
  habitaciones: "Habitaciones adicionales",
  banos: "Baños adicionales",
  parqueaderos: "Parqueaderos adicionales",
  amenidades: "Amenidades y servicios",
};

const LABELS_ANTIGUEDAD = {
  "nueva": "Recién construida",
  "reciente": "Reciente",
  "intermedia": "Intermedia",
  "antigua": "Antigua",
};

// ===== FUNCIÓN PRINCIPAL DE PREDICCIÓN =====
function predecirArriendo(datos) {
  const zonaData = PRECIO_M2_ZONA[datos.municipio] || PRECIO_M2_ZONA["el-poblado"];
  const precioM2Base = zonaData.base;
  const multEstrato = MULT_ESTRATO[datos.estrato] ?? 0.80;
  const multTipo = MULT_TIPO[datos.tipo] ?? 1.00;
  const factorAntiguedad = FACTOR_ANTIGUEDAD[datos.antiguedad] ?? 1.00;

  // Precio base: área × precio/m² × estrato × tipo × antigüedad
  const precioBase = datos.area * precioM2Base * multEstrato * multTipo * factorAntiguedad;

  // Sumas adicionales por habitaciones, baños, parqueaderos
  const valorHabitaciones = datos.habitaciones * VALOR_HABITACION;
  const valorBanos = datos.banos * VALOR_BANO;
  const valorParqueaderos = datos.parqueaderos * VALOR_PARQUEADERO;

  // Subtotal antes de amenidades
  const subtotal = precioBase + valorHabitaciones + valorBanos + valorParqueaderos;

  // Incremento por amenidades (porcentaje sobre subtotal)
  let incrementoAmenidades = 0;
  let amenidadesActivas = [];
  datos.amenidades.forEach(amenidad => {
    if (INCREMENTO_AMENIDAD[amenidad]) {
      incrementoAmenidades += INCREMENTO_AMENIDAD[amenidad];
      amenidadesActivas.push(amenidad);
    }
  });

  const valorAmenidades = subtotal * incrementoAmenidades;

  // Precio final estimado
  const precioEstimado = subtotal + valorAmenidades;

  // Rango de variación (±8%)
  const variacion = 0.08;
  const precioMin = precioEstimado * (1 - variacion);
  const precioMax = precioEstimado * (1 + variacion);

  // Precio por m² efectivo
  const precioM2Efectivo = datos.area > 0 ? precioEstimado / datos.area : 0;

  // Desglose
  const desglose = [
    {
      label: `${LABELS.area}`,
      value: formatearCOP(precioBase),
      detalle: `${datos.area} m² × ${formatearCOP(precioM2Base)}/m²`
    },
    {
      label: LABELS.estrato,
      value: `×${multEstrato.toFixed(2)}`,
      detalle: `Estrato ${datos.estrato}`,
      tipo: multEstrato > 1 ? "positive" : multEstrato < 1 ? "negative" : null
    },
    {
      label: LABELS.tipo,
      value: `×${multTipo.toFixed(2)}`,
      detalle: datos.tipo.charAt(0).toUpperCase() + datos.tipo.slice(1),
    },
    {
      label: LABELS.antiguedad,
      value: `×${factorAntiguedad.toFixed(2)}`,
      detalle: LABELS_ANTIGUEDAD[datos.antiguedad] || "",
      tipo: factorAntiguedad > 1 ? "positive" : factorAntiguedad < 1 ? "negative" : null
    },
    {
      label: LABELS.habitaciones,
      value: `+${formatearCOP(valorHabitaciones)}`,
      detalle: `${datos.habitaciones} × ${formatearCOP(VALOR_HABITACION)}`
    },
    {
      label: LABELS.banos,
      value: `+${formatearCOP(valorBanos)}`,
      detalle: `${datos.banos} × ${formatearCOP(VALOR_BANO)}`
    },
    {
      label: LABELS.parqueaderos,
      value: `+${formatearCOP(valorParqueaderos)}`,
      detalle: `${datos.parqueaderos} × ${formatearCOP(VALOR_PARQUEADERO)}`
    },
  ];

  if (amenidadesActivas.length > 0) {
    desglose.push({
      label: LABELS.amenidades,
      value: `+${formatearCOP(valorAmenidades)}`,
      detalle: `${amenidadesActivas.length} amenidad(es) (+${(incrementoAmenidades * 100).toFixed(0)}%)`,
      tipo: "positive"
    });
  }

  return {
    precioEstimado: Math.round(precioEstimado / 1000) * 1000,
    precioMin: Math.round(precioMin / 1000) * 1000,
    precioMax: Math.round(precioMax / 1000) * 1000,
    precioM2Efectivo: Math.round(precioM2Efectivo),
    zonaNombre: zonaData.nombre,
    zona: zonaData.zona,
    tipoInmueble: datos.tipo,
    desglose: desglose,
  };
}

// ===== FORMATEAR MONEDA COP =====
function formatearCOP(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function formatearCOPCompleto(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO") + " COP";
}

// ===== LEER FORMULARIO =====
function leerFormulario() {
  const tipoActivo = document.querySelector(".seg-btn.active");
  const amenidades = [];
  document.querySelectorAll(".chip-check input:checked").forEach(cb => {
    amenidades.push(cb.value);
  });

  return {
    tipo: tipoActivo ? tipoActivo.dataset.value : "apartamento",
    municipio: document.getElementById("municipio").value,
    area: Math.max(1, Number(document.getElementById("area").value) || 0),
    habitaciones: Math.max(0, Number(document.getElementById("habitaciones").value) || 0),
    banos: Math.max(0, Number(document.getElementById("banos").value) || 0),
    parqueaderos: Math.max(0, Number(document.getElementById("parqueaderos").value) || 0),
    estrato: document.getElementById("estrato").value,
    antiguedad: document.getElementById("antiguedad").value,
    amenidades: amenidades,
  };
}

// ===== MOSTRAR RESULTADO =====
function mostrarResultado(resultado) {
  // Ocultar placeholder, mostrar resultado
  document.getElementById("result-placeholder").classList.add("hidden");
  const content = document.getElementById("result-content");
  content.classList.remove("hidden");

  // Forzar re-animación
  content.style.animation = "none";
  content.offsetHeight; // reflow
  content.style.animation = "";

  // Precio principal
  document.getElementById("price-main").textContent = formatearCOPCompleto(resultado.precioEstimado);
  document.getElementById("price-min").textContent = formatearCOP(resultado.precioMin);
  document.getElementById("price-max").textContent = formatearCOP(resultado.precioMax);

  // Stats
  document.getElementById("stat-precio-m2").textContent = formatearCOP(resultado.precioM2Efectivo);
  const tipoLabel = resultado.tipoInmueble.charAt(0).toUpperCase() + resultado.tipoInmueble.slice(1);
  document.getElementById("stat-tipo").textContent = tipoLabel;
  document.getElementById("stat-zona").textContent = resultado.zonaNombre;

  // Breakdown
  const breakdownList = document.getElementById("breakdown-list");
  breakdownList.innerHTML = "";

  resultado.desglose.forEach(item => {
    const div = document.createElement("div");
    div.className = "breakdown-item";

    const labelSpan = document.createElement("span");
    labelSpan.className = "bd-label";
    labelSpan.textContent = item.label;

    const valueContainer = document.createElement("div");
    valueContainer.style.textAlign = "right";

    const valueSpan = document.createElement("span");
    valueSpan.className = "bd-value";
    if (item.tipo === "positive") valueSpan.classList.add("positive");
    if (item.tipo === "negative") valueSpan.classList.add("negative");
    valueSpan.textContent = item.value;

    valueContainer.appendChild(valueSpan);

    if (item.detalle) {
      const detalle = document.createElement("div");
      detalle.style.fontSize = "0.6875rem";
      detalle.style.color = "var(--text-muted)";
      detalle.style.marginTop = "2px";
      detalle.textContent = item.detalle;
      valueContainer.appendChild(detalle);
    }

    div.appendChild(labelSpan);
    div.appendChild(valueContainer);
    breakdownList.appendChild(div);
  });
}

// ===== VALIDACIÓN BÁSICA =====
function validarDatos(datos) {
  if (datos.area < 1 || datos.area > 1000) return false;
  if (datos.habitaciones < 0 || datos.habitaciones > 20) return false;
  if (datos.banos < 0 || datos.banos > 10) return false;
  if (datos.parqueaderos < 0 || datos.parqueaderos > 5) return false;
  return true;
}

// ===== EVENTO PRINCIPAL =====
function calcularEstimacion() {
  const datos = leerFormulario();

  if (!validarDatos(datos)) {
    document.getElementById("price-main").textContent = "Datos inválidos";
    return;
  }

  const resultado = predecirArriendo(datos);
  mostrarResultado(resultado);

  // Scroll suave al resultado en móvil
  if (window.innerWidth < 860) {
    document.getElementById("result-panel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

// ===== SEGMENTED CONTROL =====
function initSegmentedControl() {
  const buttons = document.querySelectorAll(".seg-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");
    });
  });
}

// ===== INICIALIZACIÓN =====
document.addEventListener("DOMContentLoaded", () => {
  initSegmentedControl();
  document.getElementById("btn-predict").addEventListener("click", calcularEstimacion);

  // Calcular estimación inicial
  calcularEstimacion();
});
