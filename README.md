
# Generador de Presupuestos (PDF)

Incluye **dos opciones**, ambas cumplen con "solo HTML, CSS y JS":

1) **single-file-vanilla/** — Implementación sin framework, puro HTML/CSS/JS.
2) **angular-standalone-esm/** — Implementación con **Angular 18** usando módulos ESM vía CDN (sin build).

> La salida PDF replica el formato básico del ejemplo (cliente, fecha, dirección, tabla de ítems y notas con condiciones). Ajusta estilos y textos según tu PDF.

## Requisitos
- Un navegador moderno (Chrome/Edge/Firefox). **Se requiere Internet** para la versión Angular al cargar ESM desde CDN.
- No necesitas Node ni CLI.

## Uso
### Opción 1 — Vanilla
1. Abre `single-file-vanilla/index.html` en el navegador.
2. Completa cliente, dirección, fecha y agrega ítems (cantidad, descripción, precio).
3. Haz clic en **Descargar PDF**.

### Opción 2 — Angular 18 (Standalone + ESM)
1. Abre `angular-standalone-esm/index.html` en el navegador.
2. Rellena los campos y usa **Descargar PDF**.
3. Botón **Cargar ejemplo** precarga ítems similares al PDF de referencia.

## Notas sobre el PDF
- Formato A4, una página (auto-ajustable si hay muchos ítems).
- Números con formato hispano (dos decimales). El símbolo de moneda va al final (ej: `80,00$`) para asemejar el archivo de muestra.
- Se incluye una sección de **Información** con condiciones comunes (no incluye IVA, anticipo 80%, métodos de pago). Modifícalas si lo deseas desde el HTML.

## Créditos
- Conversión a PDF con [html2pdf.js] (html2canvas + jsPDF).
