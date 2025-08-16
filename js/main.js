// main.js
import { dateHuman } from './utils.js';
import { state } from './state.js';
import { els } from './dom.js';
import { renderItems } from './render.js';
import { bindEvents } from './events.js';
import { downloadPdf } from './pdf.js';

const iso = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
els.date.value = iso;
els.pvDate.textContent = dateHuman(state.date);

bindEvents(state, els);   // 👈 solo UNA vez
renderItems(state, els);

els.download.addEventListener('click', () => downloadPdf(state, els));
els.download2.addEventListener('click', () => downloadPdf(state, els));
