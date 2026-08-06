/* ============================================================
   PREDICTOR DE ARRIENDOS — VALLE DE ABURRÁ
   Modelo de estimación basado en datos de referencia del mercado
   inmobiliario del Área Metropolitana del Valle de Aburrá.
   ============================================================ */

// ===== PRECIO BASE POR M² SEGÚN ZONA (COP/mes) =====
const PRECIO_M2_ZONA = {
  "sabaneta":        { base: 32000, nombre: "Sabaneta", zona: "Sur" },
  "envigado":       { base: 30000, nombre: "Envigado", zona: "Sur" },
  "itagui":         { base: 24000, nombre: "Itagüí", zona: "Sur" },
  "la-estrella":    { base: 22000, nombre: "La Estrella", zona: "Sur" },
  "caldas":         { base: 18000, nombre: "Caldas", zona: "Sur" },
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
  "bello":          { base: 19000, nombre: "Bello", zona: "Norte" },
  "copacabana":     { base: 21000, nombre: "Copacabana", zona: "Norte" },
  "girardota":      { base: 18000, nombre: "Girardota", zona: "Norte" },
  "barbosa":        { base: 16000, nombre: "Barbosa", zona: "Norte" },
};

const MULT_ESTRATO = {
  "1": 0.50, "2": 0.62, "3": 0.80,
  "4": 0.95, "5": 1.12, "6": 1.30,
};

const MULT_TIPO = {
  "apartamento": 1.00,
  "casa":        1.15,
  "estudio":     0.85,
};

const FACTOR_ANTIGUEDAD = {
  "nueva": 1.08,
  "reciente": 1.00,
  "intermedia": 0.92,
  "antigua": 0.82,
};

const VALOR_HAB = 90000;
const VALOR_BANO = 70000;
const VALOR_PARQ = 130000;

const INCREMENTO_AMENIDAD = {
  "ascensor": 0.03,
  "balcon": 0.04,
  "terraza": 0.05,
  "porteria": 0.05,
  "gimnasio": 0.06,
  "piscina": 0.08,
  "conjunto-cerrado": 0.04,
  "zonas-sociales": 0.03,
};

const LABELS = {
  area: "Base (m² × precio/zona)",
  estrato: "Ajuste por estrato",
  tipo: "Ajuste por tipo",
  antiguedad: "Ajuste por antigüedad",
  habitaciones: "Habitaciones",
  banos: "Baños",
  parqueaderos: "Parqueaderos",
  amenidades: "Amenidades",
};

const LABELS_ANT = {
  "nueva": "Recién construida",
  "reciente": "Reciente",
  "intermedia": "Intermedia",
  "antigua": "Antigua",
};

// ===== PREDICCIÓN =====
function predecirArriendo(datos) {
  const zonaData = PRECIO_M2_ZONA[datos.municipio] || PRECIO_M2_ZONA["el-poblado"];
  const precioM2Base = zonaData.base;
  const multEstrato = MULT_ESTRATO[datos.estrato] ?? 0.80;
  const multTipo = MULT_TIPO[datos.tipo] ?? 1.00;
  const factorAnt = FACTOR_ANTIGUEDAD[datos.antiguedad] ?? 1.00;

  const precioBase = datos.area * precioM2Base * multEstrato * multTipo * factorAnt;
  const vHab = datos.habitaciones * VALOR_HAB;
  const vBanos = datos.banos * VALOR_BANO;
  const vParq = datos.parqueaderos * VALOR_PARQ;
  const subtotal = precioBase + vHab + vBanos + vParq;

  let incAmen = 0;
  let amenActivas = [];
  datos.amenidades.forEach(a => {
    if (INCREMENTO_AMENIDAD[a]) {
      incAmen += INCREMENTO_AMENIDAD[a];
      amenActivas.push(a);
    }
  });

  const vAmen = subtotal * incAmen;
  const precioFinal = subtotal + vAmen;
  const variacion = 0.08;
  const precioMin = precioFinal * (1 - variacion);
  const precioMax = precioFinal * (1 + variacion);
  const precioM2Ef = datos.area > 0 ? precioFinal / datos.area : 0;

  // Confianza basada en cuántos datos tenemos
  let datosCompletos = 4; // area, tipo, municipio, estrato
  if (datos.habitaciones > 0) datosCompletos++;
  if (datos.banos > 0) datosCompletos++;
  if (datos.parqueaderos > 0) datosCompletos++;
  if (amenActivas.length > 0) datosCompletos++;
  let nivelConfianza = "media";
  let claseConfianza = "";
  if (datosCompletos >= 7) { nivelConfianza = "Alta"; claseConfianza = "confidence-high"; }
  else if (datosCompletos <= 4) { nivelConfianza = "Básica"; claseConfianza = "confidence-low"; }

  const desglose = [
    { label: LABELS.area, value: fmtCOP(precioBase), detalle: `${datos.area} m² × ${fmtCOP(precioM2Base)}/m²` },
    { label: LABELS.estrato, value: `×${multEstrato.toFixed(2)}`, detalle: `Estrato ${datos.estrato}`, tipo: multEstrato > 1 ? "pos" : multEstrato < 1 ? "neg" : null },
    { label: LABELS.tipo, value: `×${multTipo.toFixed(2)}`, detalle: datos.tipo.charAt(0).toUpperCase() + datos.tipo.slice(1) },
    { label: LABELS.antiguedad, value: `×${factorAnt.toFixed(2)}`, detalle: LABELS_ANT[datos.antiguedad] || "", tipo: factorAnt > 1 ? "pos" : factorAnt < 1 ? "neg" : null },
    { label: LABELS.habitaciones, value: `+${fmtCOP(vHab)}`, detalle: `${datos.habitaciones} × ${fmtCOP(VALOR_HAB)}` },
    { label: LABELS.banos, value: `+${fmtCOP(vBanos)}`, detalle: `${datos.banos} × ${fmtCOP(VALOR_BANO)}` },
    { label: LABELS.parqueaderos, value: `+${fmtCOP(vParq)}`, detalle: `${datos.parqueaderos} × ${fmtCOP(VALOR_PARQ)}` },
  ];

  if (amenActivas.length > 0) {
    desglose.push({
      label: LABELS.amenidades,
      value: `+${fmtCOP(vAmen)}`,
      detalle: `${amenActivas.length} amenidad(es) · +${(incAmen * 100).toFixed(0)}%`,
      tipo: "pos"
    });
  }

  return {
    precioEstimado: Math.round(precioFinal / 1000) * 1000,
    precioMin: Math.round(precioMin / 1000) * 1000,
    precioMax: Math.round(precioMax / 1000) * 1000,
    precioM2Efectivo: Math.round(precioM2Ef),
    zonaNombre: zonaData.nombre,
    zona: zonaData.zona,
    tipoInmueble: datos.tipo,
    desglose,
    nivelConfianza,
    claseConfianza,
  };
}

function fmtCOP(v) {
  return "$" + Math.round(v).toLocaleString("es-CO");
}

// ===== LEER FORMULARIO =====
function leerFormulario() {
  const tipoActivo = document.querySelector(".seg__btn.active");
  const amenidades = [];
  document.querySelectorAll(".chip input:checked").forEach(cb => amenidades.push(cb.value));

  return {
    tipo: tipoActivo ? tipoActivo.dataset.value : "apartamento",
    municipio: document.getElementById("municipio").value,
    area: Math.max(1, Number(document.getElementById("area").value) || 0),
    habitaciones: Math.max(0, Number(document.getElementById("habitaciones").value) || 0),
    banos: Math.max(0, Number(document.getElementById("banos").value) || 0),
    parqueaderos: Math.max(0, Number(document.getElementById("parqueaderos").value) || 0),
    estrato: document.getElementById("estrato").value,
    antiguedad: document.getElementById("antiguedad").value,
    amenidades,
  };
}

// ===== MOSTRAR RESULTADO =====
function mostrarResultado(r) {
  document.getElementById("result-placeholder").classList.add("hidden");
  const content = document.getElementById("result-content");
  content.classList.remove("hidden");

  // Re-trigger animation
  content.style.animation = "none";
  void content.offsetHeight;
  content.style.animation = "";

  // Price
  document.getElementById("price-main").textContent = fmtCOP(r.precioEstimado);
  document.getElementById("price-min").textContent = fmtCOP(r.precioMin);
  document.getElementById("price-max").textContent = fmtCOP(r.precioMax);

  // Confidence badge
  const badge = document.getElementById("confidence-badge");
  badge.textContent = `Confianza ${r.nivelConfianza}`;
  badge.className = `price-card__badge ${r.claseConfianza}`;

  // Stats
  document.getElementById("stat-precio-m2").textContent = fmtCOP(r.precioM2Efectivo);
  document.getElementById("stat-tipo").textContent = r.tipoInmueble.charAt(0).toUpperCase() + r.tipoInmueble.slice(1);
  document.getElementById("stat-zona").textContent = r.zonaNombre;

  // Breakdown
  const list = document.getElementById("breakdown-list");
  list.innerHTML = "";

  r.desglose.forEach(item => {
    const div = document.createElement("div");
    div.className = "bd-item";

    const label = document.createElement("span");
    label.className = "bd-item__label";
    label.textContent = item.label;

    const right = document.createElement("div");
    right.className = "bd-item__right";

    const val = document.createElement("span");
    val.className = "bd-item__val";
    if (item.tipo === "pos") val.classList.add("pos");
    if (item.tipo === "neg") val.classList.add("neg");
    val.textContent = item.value;
    right.appendChild(val);

    if (item.detalle) {
      const det = document.createElement("div");
      det.className = "bd-item__detail";
      det.textContent = item.detalle;
      right.appendChild(det);
    }

    div.appendChild(label);
    div.appendChild(right);
    list.appendChild(div);
  });

  // Store for copy
  window._ultimoResultado = r;
}

// ===== VALIDACIÓN =====
function validar(d) {
  if (d.area < 1 || d.area > 1000) return false;
  if (d.habitaciones < 0 || d.habitaciones > 20) return false;
  if (d.banos < 0 || d.banos > 10) return false;
  if (d.parqueaderos < 0 || d.parqueaderos > 5) return false;
  return true;
}

// ===== CALCULAR =====
function calcular() {
  const datos = leerFormulario();
  if (!validar(datos)) {
    document.getElementById("price-main").textContent = "Datos inválidos";
    return;
  }
  mostrarResultado(predecirArriendo(datos));

  // Scroll on mobile
  if (window.innerWidth < 820) {
    setTimeout(() => {
      document.getElementById("result-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
}

// ===== COPIAR RESULTADO =====
function copiarResultado() {
  const r = window._ultimoResultado;
  if (!r) return;

  const texto =
    `PREDICTOR DE ARRIENDOS — VALLE DE ABURRÁ\n` +
    `========================================\n` +
    `Arriendo estimado: ${fmtCOP(r.precioEstimado)} COP/mes\n` +
    `Rango: ${fmtCOP(r.precioMin)} – ${fmtCOP(r.precioMax)} COP/mes\n` +
    `Precio/m²: ${fmtCOP(r.precioM2Efectivo)}\n` +
    `Zona: ${r.zonaNombre} (${r.zona})\n` +
    `Tipo: ${r.tipoInmueble}\n` +
    `Confianza: ${r.nivelConfianza}\n` +
    `\nEstimación de referencia — el precio real puede variar.`;

  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.getElementById("btn-copy");
    btn.classList.add("copied");
    btn.querySelector("span").textContent = "¡Copiado!";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.querySelector("span").textContent = "Copiar resultado";
    }, 2000);
  }).catch(() => {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = texto;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    const btn = document.getElementById("btn-copy");
    btn.classList.add("copied");
    btn.querySelector("span").textContent = "¡Copiado!";
    setTimeout(() => {
      btn.classList.remove("copied");
      btn.querySelector("span").textContent = "Copiar resultado";
    }, 2000);
  });
}

// ===== SEGMENTED CONTROL =====
function initSeg() {
  document.querySelectorAll(".seg__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".seg__btn").forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");
    });
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initSeg();
  document.getElementById("btn-predict").addEventListener("click", calcular);
  document.getElementById("btn-copy").addEventListener("click", copiarResultado);
  calcular();
});
