// render.js — dibuja los ítems y totales
import { fmtVE, toNumber } from './utils.js';

export function renderItems(state, els) {
  
  els.items.innerHTML = '';
  els.pvBody.innerHTML = '';
  
  state.items.forEach((it, i) => {
    const isLocked = !!it.confirmed;
    console.log("it  : ", it)
    // fila del formulario
    const wrap = document.createElement('div');
    if (!isLocked) {
      // ---- MODO EDICIÓN (formulario) ----
      wrap.className = 'item';
      wrap.innerHTML = `
        <div>
          <label class="form-label">Cantidad</label>
          <input class="input" type="number" min="0" step="1" value="${it.qty}" data-i="${i}" data-k="qty" />
        </div>
        <div>
          <label class="form-label">Descripción</label>
          <input class="input" type="text" value="${it.desc}" placeholder="Ej: Ucaros" data-i="${i}" data-k="desc" />
        </div>
        <div>
          <label class="form-label">Precio unidad</label>
          <input class="input" type="number" min="0" step="0.01" value="${it.price}" data-i="${i}" data-k="price" />
        </div>
        <div class="item__actions">
          <button class="btn warn" data-remove="${i}" type="button">✕</button>
        </div>
      `;
      // <button class="btn primary" data-confirm="${i}" type="button">Confirmar</button>

    } else {
      // ---- MODO LÍNEA CONFIRMADA ----
      wrap.className = 'item item--locked';
      wrap.innerHTML = `
        <div class="cell cell--desc">${it.desc}</div>
        <div class="cell cell--total">${fmtVE(it.qty * it.price, state.currency)}</div>
        <div class="item__actions">
          <button class="btn" data-unconfirm="${i}" type="button">Editar</button>
          <button class="btn warn" data-remove="${i}" type="button">✕</button>
        </div>
      `;
    }
    els.items.appendChild(wrap);

    // fila de vista previa
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="right">${it.qty}</td>
      <td>${it.desc}</td>
      <td>${fmtVE(it.price, state.currency)}</td>
      <td>${fmtVE(it.qty * it.price, state.currency)}</td>
    `;
    els.pvBody.appendChild(tr);
  });

  const total = state.items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);
  els.totalBadge.textContent = `Total: ${fmtVE(total, state.currency)}`;
  els.pvGrand.textContent = fmtVE(total, state.currency);
}
