// events.js
import { dateHuman, fmtVE, toNumber, parseItemsText } from './utils.js';
import { renderItems } from './render.js';
import { INFO_DEFAULT, INFO_ALT } from './state.js';

let wired = false;

export function bindEvents(state, els) {
  if (wired) return;
  wired = true;

  const onCustomer = (e) => {
    state.customer = e.target.value;
    els.pvCustomer.textContent = state.customer || '—';
  };

  const onAddress = (e) => {
    state.address = e.target.value.trim();
    if (state.address) {
      els.pvAddress.textContent = state.address;
      els.pvAddress.parentElement.style.display = 'flex';
    } else {
      els.pvAddress.textContent = '';
      els.pvAddress.parentElement.style.display = 'none';
    }
    // sin renderItems — no destruye el DOM del formulario
  };

  const onCurrency = (e) => {
    state.currency = e.target.value || ' $';
    // actualizar solo las celdas de precio en la preview, sin re-render
    document.querySelectorAll('#previewPagesContainer tr[data-i]').forEach(row => {
      const idx = Number(row.dataset.i);
      const it  = state.items[idx];
      if (!it) return;
      row.cells[2].textContent = fmtVE(it.price, state.currency);
      row.cells[3].textContent = fmtVE(it.qty * it.price, state.currency);
    });
    const total = state.items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);
    els.totalBadge.textContent = `Total: ${fmtVE(total, state.currency)}`;
    els.pvGrand.textContent = fmtVE(total, state.currency);
  };

  const onRif = (e) => {
    state.rif = e.target.value.trim();
    if (state.rif) {
      els.pvRif.textContent = state.rif;
      els.pvRif.parentElement.style.display = 'flex';
    } else {
      els.pvRif.textContent = '';
      els.pvRif.parentElement.style.display = 'none';
    }
  };

  const onDate = (e) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    state.date = new Date(year, month - 1, day);
    els.pvDate.textContent = dateHuman(state.date);
    // actualizar fecha en la preview sin re-render
    document.querySelectorAll('#previewPagesContainer .field.fecha [data-pvdate]').forEach(el => {
      el.textContent = dateHuman(state.date);
    });
  };

  // Textarea "Información" — debounce para no re-renderizar en cada tecla
  let infoTimer = null;
  const onInfo = (e) => {
    state.info = e.target.value;
    clearTimeout(infoTimer);
    infoTimer = setTimeout(() => renderItems(state, els), 800);
  };

  const onItemsInput = (e) => {
    const input = e.target;
    if (!input.matches('input[data-i][data-k]')) return;
    const i = Number(input.getAttribute('data-i'));
    const k = input.getAttribute('data-k');
    if (!Number.isInteger(i) || i < 0 || i >= state.items.length) return;
    if (state.items[i].confirmed) return;

    if (k === 'desc') {
      state.items[i].desc = input.value;
      // actualizar celda de descripción en la preview directamente
      const previewRow = document.querySelector(`#previewPagesContainer tr[data-i="${i}"]`);
      if (previewRow) previewRow.cells[1].textContent = input.value;
    } else {
      const val = toNumber(input.value);
      state.items[i][k] = val;
      const previewRow = document.querySelector(`#previewPagesContainer tr[data-i="${i}"]`);
      if (previewRow) {
        previewRow.cells[0].textContent = state.items[i].qty;
        previewRow.cells[2].textContent = fmtVE(state.items[i].price, state.currency);
        previewRow.cells[3].textContent = fmtVE(state.items[i].qty * state.items[i].price, state.currency);
      }
      const total = state.items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);
      els.totalBadge.textContent = `Total: ${fmtVE(total, state.currency)}`;
      els.pvGrand.textContent    = fmtVE(total, state.currency);
      // actualizar total en la preview
      const pvTotal = document.querySelector('#previewPagesContainer .totales:last-child');
      if (pvTotal) pvTotal.textContent = fmtVE(total, state.currency);
    }
    // SIN renderItems — el input mantiene el foco
  };

  const onItemsClick = (e) => {
    const btnConfirm = e.target.closest('button[data-confirm]');
    if (btnConfirm) {
      const i = Number(btnConfirm.getAttribute('data-confirm'));
      if (!Number.isInteger(i) || i < 0 || i >= state.items.length) return;
      state.items[i].confirmed = true;
      renderItems(state, els);
      return;
    }
    const btnUnconfirm = e.target.closest('button[data-unconfirm]');
    if (btnUnconfirm) {
      const i = Number(btnUnconfirm.getAttribute('data-unconfirm'));
      if (!Number.isInteger(i) || i < 0 || i >= state.items.length) return;
      state.items[i].confirmed = false;
      renderItems(state, els);
      return;
    }
    const btnRemove = e.target.closest('button[data-remove]');
    if (btnRemove) {
      const i = Number(btnRemove.getAttribute('data-remove'));
      if (!Number.isInteger(i) || i < 0 || i >= state.items.length) return;
      state.items.splice(i, 1);
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
    state.address  = 'Prados del este';
    state.rif      = 'J-219494191-1';
    state.items = [
      { qty: 2,  desc: 'Ucaros',          price: 80, confirmed: false },
      { qty: 10, desc: 'Pileas',           price: 6,  confirmed: false },
      { qty: 3,  desc: 'Sacos de tierra',  price: 6,  confirmed: false },
      { qty: 1,  desc: 'Transporte',       price: 20, confirmed: false },
    ];
    document.getElementById('customer').value = state.customer;
    document.getElementById('address').value  = state.address;
    document.getElementById('rif').value      = state.rif;
    els.pvCustomer.textContent = state.customer;
    els.pvAddress.textContent  = state.address;
    els.pvRif.textContent      = state.rif;
    renderItems(state, els);
  };

  // ------- Modal Importar texto -------
  const openImportModal = () => {
    let modal = document.getElementById('importModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'importModal';
      modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-box">
          <h3>Importar ítems desde texto</h3>
          <p class="modal-hint">
            Una línea por ítem. Formatos aceptados:<br>
            <code>cantidad descripción precio</code> → <code>1 ficus 150</code><br>
            <code>descripción precio</code> → <code>ficus 150</code> (qty = 1)<br>
            <code>cantidad descripción</code> → <code>3 orquídea</code> (precio = 0)<br>
            También podés usar comas: <code>1, ficus, 150</code>
          </p>
          <textarea
            id="importTextarea"
            class="import-textarea"
            placeholder="1 ficus 150&#10;2 orquídea 20&#10;transporte 50"
            rows="8"
          ></textarea>
          <p id="importPreview" class="import-preview"></p>
          <div class="modal-actions">
            <button class="btn" id="importCancel" type="button">Cancelar</button>
            <button class="btn primary" id="importConfirm" type="button">Agregar ítems</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('importTextarea').addEventListener('input', (e) => {
        const parsed = parseItemsText(e.target.value);
        const prev = document.getElementById('importPreview');
        if (!parsed.length) { prev.textContent = ''; return; }
        prev.textContent = `${parsed.length} ítem(s) detectado(s): ` +
          parsed.map(it => `${it.qty}× ${it.desc || '?'} = ${it.price}`).join(' | ');
      });

      document.getElementById('importCancel').addEventListener('click', closeImportModal);
      document.getElementById('importConfirm').addEventListener('click', confirmImport);
      modal.querySelector('.modal-backdrop').addEventListener('click', closeImportModal);
    }

    document.getElementById('importTextarea').value = '';
    document.getElementById('importPreview').textContent = '';
    modal.style.display = 'flex';
  };

  const closeImportModal = () => {
    const modal = document.getElementById('importModal');
    if (modal) modal.style.display = 'none';
  };

  const confirmImport = () => {
    const raw = document.getElementById('importTextarea').value;
    const newItems = parseItemsText(raw);
    if (!newItems.length) return;
    const hasOnlyBlank = state.items.length === 1 && !state.items[0].desc && state.items[0].price === 0;
    if (hasOnlyBlank) {
      state.items = newItems;
    } else {
      state.items.push(...newItems);
    }
    renderItems(state, els);
    closeImportModal();
  };

  // ------- Registro de listeners -------
  els.customer.addEventListener('input', onCustomer);
  els.address.addEventListener('input',  onAddress);
  els.currency.addEventListener('input', onCurrency);
  els.date.addEventListener('input',     onDate);
  els.rif.addEventListener('input',      onRif);

  // Textarea info
  const infoTextEl = document.getElementById('infoText');
  if (infoTextEl) infoTextEl.addEventListener('input', onInfo);

  els.items.addEventListener('input', onItemsInput);
  els.items.addEventListener('click', onItemsClick);

  els.addItem.addEventListener('click', onAddItem);
  els.seed.addEventListener('click',    onSeed);

  const onClear = () => {
    if (!confirm('¿Limpiar todo el formulario?')) return;
    state.customer = '';
    state.address  = '';
    state.rif      = '';
    state.currency = ' $';
    state.info     = INFO_DEFAULT;
    state.items    = [{ qty: 1, desc: '', price: 0, confirmed: false }];

    document.getElementById('customer').value = '';
    document.getElementById('address').value  = '';
    document.getElementById('rif').value      = '';
    document.getElementById('currency').value = ' $';
    const infoEl = document.getElementById('infoText');
    if (infoEl) infoEl.value = INFO_DEFAULT;

    const today = new Date();
    state.date = today;
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('date').value = `${today.getFullYear()}-${pad(today.getMonth()+1)}-${pad(today.getDate())}`;

    els.pvCustomer.textContent = '—';
    els.pvAddress.textContent  = '';
    els.pvRif.textContent      = '';
    renderItems(state, els);
  };
  if (els.clear) els.clear.addEventListener('click', onClear);

  const importBtn = document.getElementById('importText');
  if (importBtn) importBtn.addEventListener('click', openImportModal);

  // Toggle preset de información
  const toggleInfoBtn = document.getElementById('toggleInfo');
  if (toggleInfoBtn) {
    let usingAlt = false;
    toggleInfoBtn.addEventListener('click', () => {
      usingAlt = !usingAlt;
      const next = usingAlt ? INFO_ALT : INFO_DEFAULT;
      state.info = next;
      const infoEl = document.getElementById('infoText');
      if (infoEl) infoEl.value = next;
      toggleInfoBtn.textContent = usingAlt
        ? '↩️ Volver al texto por defecto'
        : '💱 Cambiar a modo Euro BCV';
      renderItems(state, els);
    });
  }
}
