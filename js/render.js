// render.js — dibuja los ítems, totales y pagina la vista previa
import { fmtVE, toNumber } from './utils.js';

const ROWS_PER_PAGE = 18;

export function renderItems(state, els) {
  els.items.innerHTML = '';
  els.pvBody.innerHTML = '';

  state.items.forEach((it, i) => {
    const isLocked = !!it.confirmed;
    const wrap = document.createElement('div');

    if (!isLocked) {
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
    } else {
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

    // fila fantasma para pvBody (necesario para events.js)
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

  renderPreviewPages(state, els);
}

// ─── Vista previa paginada ────────────────────────────────────────────────────

function renderPreviewPages(state, els) {
  const container = document.getElementById('previewPagesContainer');
  if (!container) return;

  const total = state.items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);

  const pages = [];
  for (let i = 0; i < state.items.length; i += ROWS_PER_PAGE) {
    pages.push(state.items.slice(i, i + ROWS_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  container.innerHTML = '';

  pages.forEach((pageItems, pageIdx) => {
    const isLast = pageIdx === pages.length - 1;
    const page = document.createElement('div');
    page.className = 'page';
    page.dataset.page = pageIdx;

    const numStr = state.number
      ? `<div class="pv-number">#${String(state.number).padStart(4, '0')}</div>`
      : '';

    const metaBlock = pageIdx === 0 ? `
      <img class="main-logo" src="./assets/logo_urbano.jpg" alt="">
      ${numStr}
      <div class="meta">
        <div class="field cliente">
          <div class="label">Cliente:</div>
          <div>${els.pvCustomer.textContent}</div>
        </div>
        <div class="field fecha right">
          <div>${els.pvDate.textContent}</div>
        </div>
        <div class="field direccion" style="${state.address ? '' : 'display:none'}">
          <div class="label">Dirección:</div>
          <div>${state.address || ''}</div>
        </div>
        <div class="field rif" style="${state.rif ? '' : 'display:none'}">
          <div class="label">RIF:</div>
          <div>${state.rif || ''}</div>
        </div>
      </div>` : `<div class="page-continuation-header">
        <span class="label">Cliente:</span> ${els.pvCustomer.textContent}
        <span style="float:right">${els.pvDate.textContent}</span>
      </div>`;

    const rows = pageItems.map((it, localIdx) => {
      const globalIdx = pageIdx * ROWS_PER_PAGE + localIdx;
      return `<tr data-i="${globalIdx}">
        <td class="right">${it.qty}</td>
        <td>${it.desc}</td>
        <td>${fmtVE(it.price, state.currency)}</td>
        <td>${fmtVE(it.qty * it.price, state.currency)}</td>
      </tr>`;
    }).join('');

    const totalFoot = isLast ? `
      <tfoot>
        <tr>
          <td></td><td></td>
          <td class="text-center totales">TOTAL</td>
          <td class="text-center totales">${fmtVE(total, state.currency)}</td>
        </tr>
      </tfoot>` : '';

    // Info como lista de bullets a partir del texto (cada línea = un bullet)
    const infoLines = (state.info || '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => `<li>${l}</li>`)
      .join('');

    // Social box + info solo en la última página, justo debajo del bloque info
    const footerBlock = isLast ? `
      <div class="info">
        <h4>Información</h4>
        <ul>${infoLines}</ul>
      </div>
      <div class="social-box">
        <div class="social-cell">
          <img class="social-icon" src="./assets/gmail.png" alt="gmail">
          <span class="social-text">urbanojardinypaisajismo@gmail.com</span>
        </div>
        <div class="social-cell">
          <img class="social-icon" src="./assets/instagram.png" alt="Instagram">
          <span class="social-text">@urbano_jardines</span>
        </div>
        <div class="social-cell">
          <img class="social-icon" src="./assets/facebook.png" alt="Facebook">
          <span class="social-text">facebook.com/urbanojardin/</span>
        </div>
        <div class="social-cell">
          <img class="social-icon" src="./assets/whatsapp.png" alt="WhatsApp">
          <span class="social-text">(0424)1681749</span>
        </div>
      </div>` : '';

    page.innerHTML = `
      ${metaBlock}
      <table>
        <thead>
          <tr>
            <th class="cantidad">Cant</th>
            <th class="descripcion">Descripción</th>
            <th class="precio">Precio</th>
            <th class="total">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        ${totalFoot}
      </table>
      ${footerBlock}
    `;

    container.appendChild(page);
  });

  updatePaginator(pages.length);
}

// ─── Paginador ────────────────────────────────────────────────────────────────

let currentPage = 0;

function updatePaginator(total) {
  const nav = document.getElementById('previewNav');
  if (!nav) return;

  nav.style.display = total <= 1 ? 'none' : 'flex';
  if (currentPage >= total) currentPage = total - 1;

  document.getElementById('pvPageCount').textContent = `${currentPage + 1} / ${total}`;
  document.getElementById('pvPrev').disabled = currentPage === 0;
  document.getElementById('pvNext').disabled = currentPage === total - 1;

  showPage(currentPage);
}

function showPage(idx) {
  currentPage = idx;
  document.querySelectorAll('#previewPagesContainer .page').forEach((p, i) => {
    p.style.display = i === idx ? '' : 'none';
  });
}

export function bindPreviewNav() {
  document.getElementById('pvPrev')?.addEventListener('click', () => {
    const total = document.querySelectorAll('#previewPagesContainer .page').length;
    if (currentPage > 0) { currentPage--; updatePaginator(total); }
  });
  document.getElementById('pvNext')?.addEventListener('click', () => {
    const total = document.querySelectorAll('#previewPagesContainer .page').length;
    if (currentPage < total - 1) { currentPage++; updatePaginator(total); }
  });
}
