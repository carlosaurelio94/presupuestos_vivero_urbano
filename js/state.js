// state.js — estado central de la app
export const state = {
  customer: '',
  address: '',
  rif: '',
  currency: ' $', // símbolo al final, estilo 80,00$
  date: new Date(),
  items: [{ qty: 1, desc: '', price: 0, confirmed: false }]
}

