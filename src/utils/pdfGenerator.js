import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './formatters';

export const generateB2BQuotePDF = (quoteData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [0, 130, 138]; // #00828A
  const darkColor = [15, 23, 42]; // #0F172A
  const grayColor = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC

  // --- HEADER DECORATION ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 8, 'F');

  // --- BRAND & EMISOR ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('IDEAFORM', 15, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Ideas que toman forma • Manufactura Aditiva & 3D B2B', 15, 27);
  doc.text('Razón Social: IdeaForm México S.A. de C.V.  |  RFC: IDF260101XYZ', 15, 32);
  doc.text('Calle Revolución 450, Col. Centro, La Paz, BCS, C.P. 23000', 15, 36);
  doc.text('contacto@ideaform.mx  |  Tel: +52 (612) 123-4567  |  ideaform.mx', 15, 40);

  // --- FOLIO BOX (RIGHT) ---
  doc.setFillColor(...lightBg);
  doc.roundedRect(125, 14, 70, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(125, 14, 70, 28, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('COTIZACIÓN FORMAL B2B', 130, 20);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`Folio: ${quoteData.quoteNumber || 'COT-2026-B2B-0941'}`, 130, 26);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Fecha Emisión: ${quoteData.date || new Date().toLocaleDateString('es-MX')}`, 130, 31);
  doc.text(`Vencimiento: ${quoteData.expiresAt || '15 días naturales'}`, 130, 36);

  // --- SEPARADOR ---
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, 45, 195, 45);

  // --- DATOS DEL CLIENTE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text('DATOS DE LA EMPRESA / CLIENTE:', 15, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);

  const clientCompany = quoteData.companyName || 'Empresa Cliente S.A. de C.V.';
  const clientRFC = quoteData.rfc || 'XAXX010101000';
  const clientContact = quoteData.contactName || 'Atención: Departamento de Compras / Marketing';
  const clientEmail = quoteData.contactEmail || 'contacto@empresa.com';

  doc.text(`Razón Social: ${clientCompany}`, 15, 57);
  doc.text(`RFC: ${clientRFC}  |  Régimen Fiscal: 601 General de Ley`, 15, 62);
  doc.text(`${clientContact}  |  Email: ${clientEmail}`, 15, 67);

  // --- TABLA DE CONCEPTOS ---
  const tableData = [
    [
      '1',
      quoteData.productSKU || 'IDF-B2B-01',
      `${quoteData.productName || 'Llavero Corporativo con Logo en Relieve'}\n• Material: ${quoteData.materialName || 'PLA Seda Turquesa'}\n• Acabado: Argolla de acero incluida + Grabado 3D bicapa`,
      `${quoteData.quantity || 150} pcs`,
      formatCurrency(quoteData.unitListPrice || 85),
      `${quoteData.discountPercent || 25}%`,
      formatCurrency(quoteData.unitNetPrice || 63.75),
      formatCurrency(quoteData.subtotalItems || 9562.50)
    ]
  ];

  if (quoteData.includePackaging) {
    tableData.push([
      '2',
      'SRV-PKG-B2B',
      'Empaque Individual Personalizado\n• Bolsa sellada con sticker y logotipo de la empresa cliente',
      `${quoteData.quantity || 150} pcs`,
      '$3.50 MXN',
      '0%',
      '$3.50 MXN',
      formatCurrency((quoteData.quantity || 150) * 3.5)
    ]);
  }

  if (quoteData.setupFee && quoteData.setupFee > 0) {
    tableData.push([
      '3',
      'SRV-MOD-3D',
      'Servicio de Adaptación y Optimización Vectorial 3D',
      '1 serv',
      formatCurrency(quoteData.setupFee),
      '100%',
      '$0.00 MXN',
      '$0.00 MXN (Bonificado)'
    ]);
  }

  autoTable(doc, {
    startY: 72,
    head: [['#', 'SKU', 'Descripción Detallada del Concepto', 'Cant.', 'Precio Lista', 'Desc.', 'Precio Neto', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 68 },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 24, halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // --- TOTALES Y RESUMEN FINANCIERO (DERECHA) ---
  const totalsX = 120;
  const valuesX = 195;

  doc.setFillColor(...lightBg);
  doc.roundedRect(115, finalY, 80, 42, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(115, finalY, 80, 42, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);

  doc.text('Subtotal Bruto:', totalsX, finalY + 6);
  doc.text(formatCurrency(quoteData.grossTotal || 12750), valuesX, finalY + 6, { align: 'right' });

  doc.text(`Descuento B2B (-${quoteData.discountPercent || 25}%):`, totalsX, finalY + 12);
  doc.setTextColor(220, 38, 38);
  doc.text(`-${formatCurrency(quoteData.discountSavings || 3187.5)}`, valuesX, finalY + 12, { align: 'right' });

  doc.setTextColor(...grayColor);
  doc.text('Envío Nacional (FedEx/DHL):', totalsX, finalY + 18);
  doc.text(quoteData.shippingCost === 0 ? 'GRATIS (Volumen)' : formatCurrency(quoteData.shippingCost || 0), valuesX, finalY + 18, { align: 'right' });

  doc.text('IVA (16% CFDI 4.0):', totalsX, finalY + 24);
  doc.text(formatCurrency(quoteData.vatTax || 1614), valuesX, finalY + 24, { align: 'right' });

  doc.setDrawColor(...primaryColor);
  doc.line(totalsX, finalY + 28, valuesX, finalY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL NETO:', totalsX, finalY + 35);
  doc.text(formatCurrency(quoteData.finalTotal || 11701.50), valuesX, finalY + 35, { align: 'right' });

  // --- DATOS BANCARIOS SPEI (IZQUIERDA) ---
  doc.setFillColor(...lightBg);
  doc.roundedRect(15, finalY, 95, 42, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, finalY, 95, 42, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text('DATOS PARA TRANSFERENCIA BANCARIA (SPEI)', 20, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Banco Destino: BBVA México', 20, finalY + 12);
  doc.text('Titular: IdeaForm México S.A. de C.V.', 20, finalY + 17);
  doc.text('CLABE Interbancaria: 012 180 0015 9988 7744 12', 20, finalY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(`Referencia Obligatoria: ${quoteData.quoteNumber || 'COT-2026-B2B-0941'}`, 20, finalY + 28);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Tiempo estimado de producción: 5 a 7 días hábiles', 20, finalY + 35);

  // --- POLÍTICAS Y FOOTER ---
  const footerY = 250;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, footerY, 195, footerY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('TÉRMINOS Y CONDICIONES DE MANUFACTURA 3D:', 15, footerY + 5);
  doc.text('1. Cotización válida por 15 días naturales a partir de su emisión.', 15, footerY + 9);
  doc.text('2. La cola de impresión inicia automáticamente al confirmar el pago o anticipo mediante transferencia o pasarela digital.', 15, footerY + 13);
  doc.text('3. Al tratarse de productos personalizados bajo demanda, no se aceptan cancelaciones posteriores al inicio del proceso de slicing/impresión.', 15, footerY + 17);
  doc.text('4. Se incluye factura electrónica CFDI 4.0 con validez fiscal SAT.', 15, footerY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('IdeaForm • www.ideaform.mx • contacto@ideaform.mx', 105, footerY + 30, { align: 'center' });

  // SAVE AS PDF
  doc.save(`${quoteData.quoteNumber || 'COT-2026-B2B-0941'}_IdeaForm.pdf`);
};
