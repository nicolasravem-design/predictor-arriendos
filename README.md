# 🏠 Predictor de Arriendos — Valle de Aburrá

Herramienta web para estimar el valor de arriendo mensual de inmuebles en el Valle de Aburrá (Área Metropolitana de Medellín), basada en datos de referencia del mercado inmobiliario.

## 🎯 Características

- **Cobertura completa del Valle de Aburrá**: 25+ zonas entre Medellín, zona sur (Sabaneta, Envigado, Itagüí, La Estrella, Caldas) y zona norte (Bello, Copacabana, Girardota, Barbosa)
- **Modelo de estimación multivariable** que considera:
  - Área del inmueble (m²)
  - Ubicación / zona
  - Estrato socioeconómico (1-6)
  - Tipo de inmueble (apartamento, casa, estudio)
  - Antigüedad de la edificación
  - Número de habitaciones, baños y parqueaderos
  - Amenidades (ascensor, balcón, terraza, portería 24h, gimnasio, piscina, conjunto cerrado, zonas sociales)
- **Rango de precio** (mínimo, estimado, máximo) con ±8% de variación
- **Desglose detallado** del cálculo para transparencia
- **Precio por m²** efectivo
- **UI profesional** con diseño dark mode, responsive y accesible

## 🚀 Cómo usar

1. Abre `index.html` en cualquier navegador moderno
2. Selecciona el tipo de inmueble y la zona
3. Ingresa las características de la propiedad
4. Marca las amenidades que incluye
5. Presiona **Calcular estimación**

No requiere instalación, servidor ni dependencias externas. Solo un navegador.

## 📊 Modelo de estimación

El cálculo se basa en el siguiente modelo:

```
Precio base = Área(m²) × Precio/m²(zona) × Multiplicador(estrato) × Multiplicador(tipo) × Factor(antigüedad)
Subtotal = Precio base + (Habitaciones × $90,000) + (Baños × $70,000) + (Parqueaderos × $130,000)
Precio final = Subtotal + (Subtotal × Σ Incrementos por amenidad)
```

### Precios base por zona (COP/m²)

| Zona | Precio/m² |
|------|-----------|
| El Poblado | $42,000 |
| El Tesoro | $38,000 |
| Castropol | $35,000 |
| La Florida | $34,000 |
| Laureles | $33,000 |
| Los Balsos | $32,000 |
| Sabaneta | $32,000 |
| Envigado | $30,000 |
| Manila | $30,000 |
| Conquistadores | $30,000 |
| Boston | $28,000 |
| Belén | $26,000 |
| Itagüí | $24,000 |
| Guayabal | $22,000 |
| La Estrella | $22,000 |
| Buenos Aires | $21,000 |
| Copacabana | $21,000 |
| Robledo | $20,000 |
| Bello | $19,000 |
| Aranjuez | $19,000 |
| Centro Medellín | $18,000 |
| Caldas | $18,000 |
| Girardota | $18,000 |
| Villa Hermosa | $17,000 |
| Barbosa | $16,000 |

> Los precios de referencia están basados en datos del mercado inmobiliario del Valle de Aburrá 2024-2025 y pueden ajustarse en `script.js`.

## 🛠️ Personalización

Edita `script.js` para:
- Ajustar los precios base por zona (`PRECIO_M2_ZONA`)
- Modificar multiplicadores de estrato (`MULT_ESTRATO`)
- Cambiar valores por habitación/baño/parqueadero
- Agregar o quitar amenidades

## 📁 Estructura

```
predictor-arriendos/
├── index.html      # Estructura HTML
├── styles.css      # Estilos (dark mode, responsive)
├── script.js       # Lógica del modelo de predicción
└── README.md       # Documentación
```

## ⚠️ Aviso

Esta herramienta proporciona estimaciones de referencia basadas en datos de mercado. El precio real de arriendo puede variar según el estado del inmueble, la negociación, condiciones del mercado y otros factores no contemplados en el modelo.

## 📄 Licencia

Uso libre para fines educativos y comerciales.
