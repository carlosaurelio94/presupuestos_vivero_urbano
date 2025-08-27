// pdf.js — exportar a PDF
import { dateHuman } from './utils.js';

export async function downloadPdf(state, els) {
  const el = els.pdfTarget.cloneNode(true);;
  clone.classList.add("pdf-export"); // 👈 layout especial para exportar

  const filename = `Presupuesto-${state.customer || 'cliente'}-${dateHuman(state.date)}.pdf`;
  const opt = {
    margin: [8,8,8,8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  await new Promise(r => setTimeout(r, 50));
  window.html2pdf().set(opt).from(clone).save();
}
