// pdf.js — exportar a PDF
import { dateHuman } from './utils.js';

export async function downloadPdf(state, els) {
  const el = els.pdfTarget;
  const filename = `Presupuesto-${state.customer || 'cliente'}-${dateHuman(state.date)}.pdf`;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Espera a que asienten fuentes/layout
  await document.fonts?.ready?.catch(() => {});
  await new Promise(r => setTimeout(r, 120));

  // ========= DESKTOP (volver a lo que te funcionaba) =========
  if (!isMobile) {
    const opt = {
      margin: [8, 8, 8, 8],
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    return window.html2pdf().set(opt).from(el).save();
  }

  // ========= MOBILE (modo corregido) =========
  el.classList.add('pdf-export');

  const rect = el.getBoundingClientRect();
  const optMobile = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    pagebreak: { mode: ['css', 'legacy'] },
    html2canvas: {
      scale: 1.35,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: Math.ceil(rect.width),
      width: Math.ceil(rect.width),
      scrollX: 0,
      scrollY: -window.scrollY
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const worker = window.html2pdf().set(optMobile).from(el);

  try {
    // En móvil suele imprimir mejor abriendo el PDF
    const pdf = await worker.get('pdf');
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } finally {
    el.classList.remove('pdf-export');
  }
}
