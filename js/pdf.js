// pdf.js — exportar a PDF
import { dateHuman } from './utils.js';

export async function downloadPdf(state, els) {
  const el = els.pdfTarget;

  const filename = `Presupuesto-${state.customer || 'cliente'}-${dateHuman(state.date)}.pdf`;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const scale = isMobile ? 1.35 : 2;

  // (opcional pero ayuda) esperar fuentes y layout
  await document.fonts?.ready?.catch(() => {});
  await new Promise(r => setTimeout(r, 150));

  // 👇 forzar “modo export” (ancho A4) solo durante la captura
  el.classList.add('pdf-export');

  const rect = el.getBoundingClientRect();

  const opt = {
    margin: [8, 8, 8, 8],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    pagebreak: { mode: ['css', 'legacy'] },
    html2canvas: {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: Math.ceil(rect.width),
      width: Math.ceil(rect.width),
      scrollX: 0,
      scrollY: -window.scrollY
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  const worker = window.html2pdf().set(opt).from(el);

  try {
    if (isMobile) {
      // En móvil suele imprimir mejor abriendo el PDF
      const pdf = await worker.get('pdf');
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      await worker.save();
    }
  } finally {
    // siempre volver al modo normal
    el.classList.remove('pdf-export');
  }
}
