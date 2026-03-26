// main.js
import { dateHuman } from './utils.js';
import { state } from './state.js';
import { els } from './dom.js';
import { renderItems, bindPreviewNav } from './render.js';
import { bindEvents } from './events.js';
import { downloadPdf } from './pdf.js';

const iso = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
els.date.value = iso;
els.pvDate.textContent = dateHuman(state.date);

bindEvents(state, els);
bindPreviewNav();       // registra los botones ◀ ▶ de la vista previa
renderItems(state, els);

// Ocultar campos vacíos al inicio
if (!state.address) els.pvAddress.parentElement.style.display = "none";
if (!state.rif) els.pvRif.parentElement.style.display = "none";

els.download.addEventListener('click', () => downloadPdf(state));
els.download2.addEventListener('click', () => downloadPdf(state));
