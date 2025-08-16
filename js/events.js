// events.js
import { dateHuman, fmtVE, toNumber } from './utils.js';
import { renderItems } from './render.js';

let wired = false; // 👈 evita registrar listeners 2 veces

export function bindEvents(state, els) {
  if (wired) return;   // 👈 ya está enlazado
  wired = true;

  // ------- Handlers nombrados (para depurar/remover si hiciera falta) -------
  const onCustomer = (e) => {
    state.customer = e.target.value;
    els.pvCustomer.textContent = state.customer || '—';
  };

  const onAddress = (e) => {
    state.address = e.target.value;
    els.pvAddress.textContent = state.address || '—';
  };

  const onCurrency = (e) => {
    state.currency = e.target.value || ' $';
    // Re-formatear sin re-render global
    [...els.pvBody.rows].forEach((row, idx) => {
      const it = state.items[idx];
      if (!it) return;
      row.cells[2].textContent = fmtVE(it.price, state.currency);
      row.cells[3].textContent = fmtVE(it.qty * it.price, state.currency);
    });
    const total = state.items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);
    els.totalBadge.textContent = `Total: ${fmtVE(total, state.currency)}`;
    els.pvGrand.textContent = fmtVE(total, state.currency);
  };

  const onDate = (e) => {
    state.date = new Date(e.target.value);
    els.pvDate.textContent = dateHuman(state.date);
  };

  // Edición de inputs dentro de la lista (sin re-render global)
  const onItemsInput = (e) => {
    const input = e.target;
    if (!input.matches('input[data-i][data-k]')) return;

    const i = Number(input.getAttribute('data-i'));
    const k = input.getAttribute('data-k');
    if (!Number.isInteger(i) || i < 0 || i >= state.items.length) return;

    if (state.items[i].confirmed) return; // no editar si está confirmado

    if (k === 'desc') {
      state.items[i].desc = input.value;
      const row = els.pvBody.rows[i];
      if (row) row.cells[1].textContent = input.value;
    } else {
      const val = toNumber(input.value);
      state.items[i][k] = val;
      const row = els.pvBody.rows[i];
      if (row) {
        row.cells[0].textContent = state.items[i].qty;
        row.cells[2].textContent = fmtVE(state.items[i].price, state.currency);
        row.cells[3].textContent = fmtVE(state.items[i].qty * state.items[i].price, state.currency);
      }
      const total = state.items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);
      els.totalBadge.textContent = `Total: ${fmtVE(total, state.currency)}`;
      els.pvGrand.textContent = fmtVE(total, state.currency);
    }
  };

  // Clicks dentro de la lista: Confirmar / Eliminar
  const onItemsClick = (e) => {
    const btnConfirm = e.target.closest('button[data-confirm]');
    if (btnConfirm) {
      const i = Number(btnConfirm.getAttribute('data-confirm'));
      if (!Number.isInteger(i) || i < 0 || i >= state.items.length) return;
      state.items[i].confirmed = true;
      renderItems(state, els); // cambia estructura
      return;
    }

    const btnRemove = e.target.closest('button[data-remove]');
    if (btnRemove) {
      const i = Number(btnRemove.getAttribute('data-remove'));
      if (!Number.isInteger(i) || i < 0 || i >= state.items.length) return;

      state.items.splice(i, 1);

      // Si no queda ninguno, dejar la lista vacía (o un item inicial editable si preferís)
      // Opción A: vacía
      // if (!state.items.length) { /* nada */ }

      // Opción B: dejar 1 ítem editable (como antes)
      if (!state.items.length) state.items = [{ qty: 1, desc: '', price: 0, confirmed: false }];

      renderItems(state, els);
    }
  };

  const onAddItem = () => {
    state.items.push({ qty: 1, desc: '', price: 0, confirmed: false });
    renderItems(state, els);
  };

  const onSeed = () => {
    state.customer = 'Atención Angela Janji';
    state.address = 'Prados del este';
    state.items = [
      { qty: 2,  desc: 'Ucaros',           price: 80, confirmed: false },
      { qty: 10, desc: 'Pileas',           price: 6,  confirmed: false },
      { qty: 3,  desc: 'Sacos de tierra',  price: 6,  confirmed: false },
      { qty: 1,  desc: 'Transporte',       price: 20, confirmed: false },
    ];
    document.getElementById('customer').value = state.customer;
    document.getElementById('address').value  = state.address;
    els.pvCustomer.textContent = state.customer;
    els.pvAddress.textContent  = state.address;
    renderItems(state, els);
  };

  // ------- Registro único de listeners -------
  els.customer.addEventListener('input', onCustomer);
  els.address.addEventListener('input',  onAddress);
  els.currency.addEventListener('input', onCurrency);
  els.date.addEventListener('input',     onDate);

  els.items.addEventListener('input', onItemsInput);
  els.items.addEventListener('click', onItemsClick);

  els.addItem.addEventListener('click', onAddItem);
  els.seed.addEventListener('click',    onSeed);
}
