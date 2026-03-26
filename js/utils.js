// utils.js — funciones auxiliares
export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => Array.from(document.querySelectorAll(sel));

export const toNumber = (v) => {
  if (typeof v === 'number' && !isNaN(v)) return v;
  const n = parseFloat(String(v).replace(/,/g, '.'));
  return isNaN(n) ? 0 : n;
};

export const fmtVE = (n, sym = ' $') =>
  toNumber(n).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + sym;

export const dateHuman = (d) => {
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dia}-${mes}-${yy}`;
};

/**
 * Convierte texto libre en array de ítems.
 *
 * Formatos soportados por línea (espacios o comas como separador):
 *   cantidad descripción precio   →  1 ficus 150
 *   descripción precio            →  ficus 150       (qty = 1)
 *   cantidad descripción          →  1 ficus          (price = 0)
 *   descripción sola              →  ficus            (qty = 1, price = 0)
 *   con comas                     →  1, ficus, 150
 *
 * Reglas de detección:
 *   - Si el primer token es número  → es la cantidad
 *   - Si el último token es número  → es el precio
 *   - Lo que queda en el medio      → es la descripción
 */
export function parseItemsText(raw) {
  const lines = raw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return lines.map(line => {
    // Normalizar comas como separador extra y colapsar espacios
    const normalized = line.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const tokens = normalized.split(' ');

    let qty = 1;
    let price = 0;
    let descTokens = [...tokens];

    // ¿El primer token es número?
    const firstNum = toNumber(tokens[0]);
    if (!isNaN(firstNum) && tokens[0] !== '' && /^\d/.test(tokens[0])) {
      qty = firstNum;
      descTokens = descTokens.slice(1);
    }

    // ¿El último token (restante) es número?
    if (descTokens.length > 1) {
      const last = descTokens[descTokens.length - 1];
      const lastNum = toNumber(last);
      if (!isNaN(lastNum) && /^\d/.test(last)) {
        price = lastNum;
        descTokens = descTokens.slice(0, -1);
      }
    }

    const desc = descTokens.join(' ');

    return { qty, desc, price, confirmed: false };
  }).filter(it => it.desc); // descartar líneas sin descripción
}
