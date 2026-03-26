// state.js — estado central de la app
export const INFO_DEFAULT = `El siguiente presupuesto no incluye IVA.
Al momento de aprobar el presupuesto debe cancelar el 80% del monto total y el 20% restante al momento de culminar el trabajo.
Métodos de pago: aceptamos efectivo en divisa, transferencias nacionales como Banesco, Provincial, Mercantil, Venezolano de Crédito y Banco de Venezuela.`;

export const state = {
  customer: '',
  address: '',
  rif: '',
  currency: ' $',
  date: new Date(),
  info: INFO_DEFAULT,
  items: [{ qty: 1, desc: '', price: 0, confirmed: false }]
};
