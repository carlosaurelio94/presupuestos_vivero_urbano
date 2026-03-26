// pdf.js — generar PDF con jsPDF + AutoTable
import { dateHuman, fmtVE, toNumber } from './utils.js';

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

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

// Dibuja el bloque social justo después de yStart; devuelve la Y final
function drawSocial(doc, assets, yStart) {
  const { gmail64, ig64, fb64, wa64 } = assets;
  const W = doc.internal.pageSize.width;
  const marginX = 15;
  const colW = (W - marginX * 2) / 4;
  const iconSize = 8;
  const y = yStart;

  const socials = [
    { img: gmail64, text: 'urbanojardinypaisajismo@gmail.com' },
    { img: ig64,    text: '@urbano_jardines' },
    { img: fb64,    text: 'facebook.com/urbanojardin/' },
    { img: wa64,    text: '(0424)1681749' },
  ];

  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);

  socials.forEach((s, i) => {
    const x = marginX + i * colW;
    const cx = x + colW / 2;
    doc.addImage(s.img, 'PNG', cx - iconSize / 2, y, iconSize, iconSize);
    doc.text(s.text, cx, y + 13, { align: 'center' });
  });

  return y + 20; // altura total del bloque social
}

export async function downloadPdf(state) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');

  const W = 210;
  const H = 297;
  const marginX = 15;
  const top = 15;
  // Margen inferior para autoTable: deja espacio solo para evitar cortes bruscos
  const bottomMargin = 15;

  const filename = `Presupuesto-${state.customer || 'cliente'}-${dateHuman(state.date)}.pdf`;

  const greenHeader = [195, 214, 155];
  const textDark    = [17, 24, 39];
  const muted       = [51, 65, 85];
  const infoBg      = [248, 250, 252];
  const border      = [0, 0, 0];

  const [logo64, gmail64, ig64, fb64, wa64] = await Promise.all([
    imgToDataURL('./assets/logo_urbano.jpg'),
    imgToDataURL('./assets/gmail.png'),
    imgToDataURL('./assets/instagram.png'),
    imgToDataURL('./assets/facebook.png'),
    imgToDataURL('./assets/whatsapp.png'),
  ]);

  // ===== Logo =====
  doc.addImage(logo64, 'JPEG', marginX, top, 42, 22);

  // ===== Meta =====
  const yMeta = top + 35;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('Cliente:', marginX, yMeta);
  doc.text(state.customer || '—', marginX + 18, yMeta);
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

  // ===== Tabla =====
  const items = state.items || [];
  const body = items.map(it => {
    const qty   = toNumber(it.qty);
    const price = toNumber(it.price);
    return [qty, it.desc || '', fmtVE(price, state.currency), fmtVE(qty * price, state.currency)];
  });
  const grand = items.reduce((a, it) => a + toNumber(it.qty) * toNumber(it.price), 0);

  doc.autoTable({
    startY: yNext + 8,
    head: [['Cant', 'Descripción', 'Precio', 'Total 1']],
    body,
    theme: 'grid',
    margin: { left: marginX, right: marginX, bottom: bottomMargin },
    styles: {
      fontSize: 10,
      textColor: textDark,
      halign: 'center',
      lineColor: border,
      lineWidth: 0.2,
      cellPadding: 3,
    },
    headStyles: { fillColor: greenHeader, textColor: textDark, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 90 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
    },
  });

  // ===== TOTAL =====
  let y = doc.lastAutoTable.finalY + 6;

  // Estimar altura del bloque restante: TOTAL(10) + gap(4) + info(variable) + social(22) + margen(10)
  const infoLines = (state.info || '')
    .split('\n').map(l => l.trim()).filter(Boolean);
  // Cada línea info ocupa ~4.5mm; título 8mm; padding 8mm
  const infoH = 8 + 8 + infoLines.length * 4.5 + 4;
  const BLOCK_H = 10 + 4 + infoH + 22 + 10;

  if (y + BLOCK_H > H - bottomMargin) {
    doc.addPage();
    y = 20;
  }

  // Caja TOTAL
  const boxW = 35;
  const boxH = 10;
  const xLabel = W - marginX - boxW * 2;
  const xValue = W - marginX - boxW;
  doc.setDrawColor(...border);
  doc.rect(xLabel, y, boxW, boxH);
  doc.rect(xValue, y, boxW, boxH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...textDark);
  doc.text('TOTAL',                      xLabel + boxW / 2, y + 6.7, { align: 'center' });
  doc.text(fmtVE(grand, state.currency), xValue + boxW / 2, y + 6.7, { align: 'center' });

  // ===== Bloque Información =====
  const infoX = marginX;
  const infoY = y + 14;
  const infoW = 110;

  doc.setFillColor(...infoBg);
  doc.roundedRect(infoX, infoY, infoW, infoH, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...textDark);
  doc.text('Información', infoX + infoW / 2, infoY + 8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...muted);

  let ly = infoY + 16;
  infoLines.forEach(line => {
    // Partir líneas largas con splitTextToSize
    const wrapped = doc.splitTextToSize(`• ${line}`, infoW - 12);
    wrapped.forEach((wl, wi) => {
      doc.text(wi === 0 ? wl : `  ${wl}`, infoX + 6, ly);
      ly += 4.5;
    });
  });

  // ===== Social box justo debajo del bloque info =====
  const socialY = infoY + infoH + 6;
  drawSocial(doc, { gmail64, ig64, fb64, wa64 }, socialY);

  // ===== Guardar / Abrir =====
  if (isMobile()) {
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(filename);
  }
}
