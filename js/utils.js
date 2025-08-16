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
