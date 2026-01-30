// pdf.js — generar PDF REAL (estable en móvil y PC) con jsPDF + AutoTable
import { dateHuman, fmtVE, toNumber } from './utils.js';

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Convierte una imagen (url local) a DataURL para poder incrustarla en el PDF
async function imgToDataURL(url) {
  const res = await fetch(url, { cache: 'no-store' });
  const blob = await res.blob();

  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function downloadPdf(state) {
  // jsPDF está en window.jspdf (por el UMD)
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  // ====== Config de página ======
  const W = 210;     // A4 ancho mm
  const H = 297;     // A4 alto mm
  const marginX = 15;
  const top = 15;

  const filename = `Presupuesto-${state.customer || 'cliente'}-${dateHuman(state.date)}.pdf`;

  // ====== Colores / estilos (parecido a tu HTML) ======
  const greenHeader = [195, 214, 155]; // #C3D69B
  const textDark = [17, 24, 39];       // #111827 aprox
  const muted = [51, 65, 85];          // #334155 aprox
  const infoBg = [248, 250, 252];      // #f8fafc
  const border = [0, 0, 0];

  // ====== Assets (ajustá paths si cambian) ======
  const logoUrl = './assets/logo_urbano.jpg';
  const iconGmail = './assets/gmail.png';
  const iconIg = './assets/instagram.png';
  const iconFb = './assets/facebook.png';
  const iconWa = './assets/whatsapp.png';

  // Cargar imágenes como dataURL
  const [logo64, gmail64, ig64, fb64, wa64] = await Promise.all([
    imgToDataURL(logoUrl),
    imgToDataURL(iconGmail),
    imgToDataURL(iconIg),
    imgToDataURL(iconFb),
    imgToDataURL(iconWa),
  ]);

  // ====== Logo ======
  // Tamaño similar al diseño actual (se ve bien en A4)
  doc.addImage(logo64, 'JPEG', marginX, top, 42, 22);

  // ====== Meta: Cliente / Fecha / Dirección / RIF ======
  const yMeta = top + 35;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);

  // Cliente (izq)
  doc.text('Cliente:', marginX, yMeta);
  doc.text(state.customer || '—', marginX + 18, yMeta);

  // Fecha (der)
  doc.setTextColor(...textDark);
  doc.text(dateHuman(state.date), W - marginX, yMeta, { align: 'right' });

  let yNext = yMeta + 8;

  if (state.address) {
    doc.setTextColor(...muted);
    doc.text('Dirección:', marginX, yNext);
    doc.setTextColor(...textDark);
    doc.text(state.address, marginX + 20, yNext);
    yNext += 7;
  }

  if (state.rif) {
    doc.setTextColor(...muted);
    doc.text('RIF:', marginX, yNext);
    doc.setTextColor(...textDark);
    doc.text(state.rif, marginX + 12, yNext);
    yNext += 7;
  }

  // ====== Tabla ======
  const items = state.items || [];
  const body = items.map((it) => {
    const qty = toNumber(it.qty);
    const price = toNumber(it.price);
    const total = qty * price;

    return [
      String(qty),
      it.desc || '',
      fmtVE(price, state.currency),
      fmtVE(total, state.currency),
    ];
  });

  const grand = items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);

  // AutoTable (plugin ya cargado por el script)
  doc.autoTable({
    startY: yNext + 8,
    head: [['Cant', 'Descripción', 'Precio', 'Total 1']],
    body,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      textColor: textDark,
      halign: 'center',
      lineColor: border,
      lineWidth: 0.2,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: greenHeader,
      textColor: textDark,
      fontStyle: 'bold',
      lineColor: border,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 20 },  // Cant
      1: { cellWidth: 90 },  // Descripción
      2: { cellWidth: 35 },  // Precio
      3: { cellWidth: 35 },  // Total
    },
  });

  // Total (como tu fila final)
  const yAfterTable = doc.lastAutoTable.finalY + 6;

  // Dibujar “TOTAL” y monto con cajitas tipo tu tfoot
  const boxWLabel = 35;
  const boxWValue = 35;
  const boxH = 10;
  const xTotalLabel = W - marginX - boxWLabel - boxWValue;
  const xTotalValue = W - marginX - boxWValue;

  doc.setDrawColor(...border);
  doc.setLineWidth(0.2);

  // Caja label
  doc.rect(xTotalLabel, yAfterTable, boxWLabel, boxH);
  // Caja valor
  doc.rect(xTotalValue, yAfterTable, boxWValue, boxH);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', xTotalLabel + boxWLabel / 2, yAfterTable + 6.7, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(fmtVE(grand, state.currency), xTotalValue + boxWValue / 2, yAfterTable + 6.7, { align: 'center' });

  // ====== Info box ======
  const infoY = yAfterTable + 18;
  const infoX = marginX;
  const infoW = 110;
  const infoH = 42;

  doc.setFillColor(...infoBg);
  doc.roundedRect(infoX, infoY, infoW, infoH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('Información', infoX + infoW / 2, infoY + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...muted);

  const infoLines = [
    '• El siguiente presupuesto no incluye IVA.',
    '• Al momento de aprobar el presupuesto debe cancelar el',
    '  80% del monto total y el 20% restante al momento de',
    '  culminar el trabajo.',
    '• Métodos de pago: aceptamos efectivo en divisa,',
    '  transferencias nacionales como Banesco, Provincial,',
    '  Mercantil, Venezolano de Crédito y Banco de Venezuela.'
  ];

  let yy = infoY + 16;
  for (const line of infoLines) {
    doc.text(line, infoX + 6, yy);
    yy += 4.5;
  }

  // ====== Redes (iconos + texto) ======
  // Similar a tu “social-box” (4 columnas)
  const socialY = H - 32;         // cerca del fondo
  const colW = (W - marginX * 2) / 4;
  const iconSize = 8;

  const socials = [
    { img: gmail64, text1: 'urbanojardinypaisajismo@gmail.com' },
    { img: ig64,    text1: '@urbano_jardines' },
    { img: fb64,    text1: 'facebook.com/urbanojardin/' },
    { img: wa64,    text1: '(0424)1681749' },
  ];

  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);

  socials.forEach((s, i) => {
    const x = marginX + i * colW;
    const centerX = x + colW / 2;

    doc.addImage(s.img, 'PNG', centerX - iconSize / 2, socialY, iconSize, iconSize);
    doc.text(s.text1, centerX, socialY + 14, { align: 'center' });
  });

  // ====== Guardar / abrir ======
  if (isMobile()) {
    // iOS/Android: suele ser mejor abrirlo
    const url = doc.output('bloburl');
    window.open(url, '_blank');
  } else {
    doc.save(filename);
  }
}
