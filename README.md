# Presupuesto · Vanilla (Modular)

Estructura limpia y modular en ES Modules:

```
presupuesto-modular-vanilla/
├─ index.html
├─ assets/
│  └─ style.css
└─ js/
   ├─ utils.js      (helpers: $, $$, toNumber, fmtVE, dateHuman)
   ├─ state.js      (estado central)
   ├─ dom.js        (caché de elementos del DOM)
   ├─ render.js     (pintar ítems y totales)
   ├─ events.js     (listeners / acciones)
   ├─ pdf.js        (exportar a PDF)
   └─ main.js       (bootstrap)
```

## Uso
1. Abre `index.html` en un navegador moderno.
2. Completa cliente, dirección, fecha y agrega ítems (cantidad, descripción, precio).
3. “Descargar PDF” exporta el área blanca (A4).

> No requiere Node ni bundlers. Usa `html2pdf.js` desde CDN.
