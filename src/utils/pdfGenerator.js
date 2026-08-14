import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './formatters';

export const generateB2BQuotePDF = (quoteData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const tealColor = [23, 107, 135]; // #176B87 Official Teal
  const darkColor = [15, 23, 42]; // #0F172A Official Black
  const grayColor = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderLight = [226, 232, 240];

  // --- TOP ACCENT BAR ---
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, 210, 6, 'F');

  // --- BRAND LOGO (Vectorized Official Bulb & Typography) ---
  // 1. Bulb Icon
  doc.setDrawColor(...tealColor);
  doc.setLineWidth(0.9);
  
  // Rays
  doc.line(16, 17, 13, 14);
  doc.line(22, 14, 22, 10);
  doc.line(28, 17, 31, 14);

  // Outer Bulb Dome
  doc.circle(22, 23, 6, 'S');
  
  // Filament 'if' Loop
  doc.setFillColor(...tealColor);
  doc.circle(20, 21, 0.9, 'F'); // 'i' dot
  doc.line(20, 24, 20, 28); // 'i' vertical stem
  doc.line(20, 28, 24, 28); // bottom curve
  doc.line(24, 28, 24, 22); // 'f' stem
  doc.line(22, 24, 26, 24); // 'f' crossbar

  // 2. Wordmark "IdeaForm"
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...darkColor);
  doc.text('Idea', 34, 25);
  
  doc.setTextColor(...tealColor);
  doc.text('Form', 50, 25);

  // 3. Slogan
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Ideas que toman forma • Manufactura Aditiva 3D B2B', 34, 30);
  doc.text('Razón Social: IdeaForm México S.A. de C.V.  |  RFC: IDF260101XYZ', 15, 36);
  doc.text('Calle Revolución 450, Col. Centro, La Paz, BCS, C.P. 23000', 15, 40);
  doc.text('contacto@ideaform.mx  |  Tel: +52 (612) 123-4567  |  ideaform.mx', 15, 44);

  // --- FOLIO BOX (RIGHT - PERFECTLY ALIGNED TO MARGIN 195mm) ---
  doc.setFillColor(...lightBg);
  doc.roundedRect(120, 12, 75, 32, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(120, 12, 75, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkColor);
  doc.text('COTIZACIÓN FORMAL B2B', 125, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...tealColor);
  doc.text(`Folio: ${quoteData.quoteNumber || 'COT-B2B-69316'}`, 125, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Fecha Emisión: ${quoteData.date || new Date().toLocaleDateString('es-MX')}`, 125, 30);
  doc.text(`Vencimiento: ${quoteData.expiresAt || '15 días naturales'}`, 125, 35);
  doc.text(`Canal: ${quoteData.channel || 'Ventas B2B Corporativo'}`, 125, 40);

  // --- SEPARADOR LINE ---
  doc.setDrawColor(...tealColor);
  doc.setLineWidth(0.4);
  doc.line(15, 48, 195, 48);

  // --- DATOS DEL CLIENTE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text('DATOS DE LA EMPRESA / CLIENTE:', 15, 54);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);

  const clientCompany = quoteData.companyName || 'Empresa Cliente S.A. de C.V.';
  const clientRFC = quoteData.rfc || 'XAXX010101000';
  const clientContact = quoteData.contactName || 'Atención: Departamento de Compras / Dirección';
  const clientEmail = quoteData.email || quoteData.contactEmail || 'contacto@empresa.com';

  doc.text(`Razón Social: ${clientCompany}`, 15, 59);
  doc.text(`RFC: ${clientRFC}  |  Régimen Fiscal: 601 General de Ley Personas Morales`, 15, 64);
  doc.text(`${clientContact}  |  Email: ${clientEmail}`, 15, 69);

  // --- TABLA DE CONCEPTOS (EXACT 180mm WIDTH - CENTERED MARGIN 15 TO 195) ---
  const listPrice = quoteData.unitListPrice || quoteData.unitPrice || 85;
  const discPercent = quoteData.discountPercent || 25;
  const netPrice = listPrice * (1 - discPercent / 100);
  const qty = quoteData.quantity || quoteData.units || 100;
  const subtotalLine = netPrice * qty;

  const tableData = [
    [
      '1',
      quoteData.productSKU || 'IDF-B2B-01',
      `${quoteData.productName || 'Artículo Corporativo 3D Personalizado'}\n• Material: ${quoteData.materialName || 'PLA Seda Premium'}\n• Grabado en relieve 3D bicapa con logotipo`,
      `${qty} pcs`,
      formatCurrency(listPrice),
      `${discPercent}%`,
      formatCurrency(netPrice),
      formatCurrency(subtotalLine)
    ]
  ];

  if (quoteData.includePackaging) {
    tableData.push([
      '2',
      'SRV-PKG-B2B',
      'Empaque Individual Personalizado\n• Bolsa protectora sellada con sticker y logotipo corporativo',
      `${qty} pcs`,
      '$3.50 MXN',
      '0%',
      '$3.50 MXN',
      formatCurrency(qty * 3.5)
    ]);
  }

  autoTable(doc, {
    startY: 74,
    head: [['#', 'SKU', 'Descripción Detallada del Concepto', 'Cant.', 'Precio Lista', 'Desc.', 'Precio Neto', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: tealColor,
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
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 64 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 18, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // --- DATOS BANCARIOS SPEI (IZQUIERDA: 15mm a 105mm = 90mm ancho) ---
  doc.setFillColor(...lightBg);
  doc.roundedRect(15, finalY, 90, 44, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(15, finalY, 90, 44, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text('DATOS PARA TRANSFERENCIA BANCARIA (SPEI):', 20, finalY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text('Banco Destino: BBVA México', 20, finalY + 13);
  doc.text('Titular: IdeaForm México S.A. de C.V.', 20, finalY + 18);
  doc.text('CLABE Interbancaria: 012 180 0015 9988 7744 12', 20, finalY + 23);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...tealColor);
  doc.text(`Referencia Obligatoria: ${quoteData.quoteNumber || 'COT-B2B-69316'}`, 20, finalY + 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text('Tiempo estimado de manufactura: 3 a 5 días hábiles.', 20, finalY + 36);
  doc.text('Precios vigentes sujetos a validación de archivos.', 20, finalY + 40);

  // --- TOTALES Y RESUMEN FINANCIERO (DERECHA: 110mm a 195mm = 85mm ancho) ---
  const totalsX = 115;
  const valuesX = 190;

  doc.setFillColor(...lightBg);
  doc.roundedRect(110, finalY, 85, 44, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(110, finalY, 85, 44, 2, 2, 'S');

  const grossTotal = listPrice * qty;
  const savings = grossTotal * (discPercent / 100);
  const subtotalNeto = quoteData.subtotal || (grossTotal - savings);
  const vat = quoteData.iva || (subtotalNeto * 0.16);
  const totalNeto = quoteData.finalTotal || quoteData.totalAmount || (subtotalNeto + vat);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);

  doc.text('Subtotal Bruto:', totalsX, finalY + 7);
  doc.text(formatCurrency(grossTotal), valuesX, finalY + 7, { align: 'right' });

  doc.text(`Descuento B2B (-${discPercent}%):`, totalsX, finalY + 13);
  doc.setTextColor(220, 38, 38);
  doc.text(`-${formatCurrency(savings)}`, valuesX, finalY + 13, { align: 'right' });

  doc.setTextColor(...grayColor);
  doc.text('Envío Nacional (FedEx/DHL):', totalsX, finalY + 19);
  doc.text('GRATIS (Mayoreo)', valuesX, finalY + 19, { align: 'right' });

  doc.text('IVA (16% CFDI 4.0):', totalsX, finalY + 25);
  doc.text(formatCurrency(vat), valuesX, finalY + 25, { align: 'right' });

  doc.setDrawColor(...tealColor);
  doc.setLineWidth(0.3);
  doc.line(totalsX, finalY + 29, valuesX, finalY + 29);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...tealColor);
  doc.text('TOTAL NETO:', totalsX, finalY + 36);
  doc.text(formatCurrency(totalNeto), valuesX, finalY + 36, { align: 'right' });

  // --- FOOTER & SAT CFDI 4.0 NOTICE ---
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(
    'Comprobante emitido de conformidad con la legislación mercantil de los Estados Unidos Mexicanos y lineamientos del SAT para CFDI 4.0.',
    105,
    285,
    { align: 'center' }
  );

  doc.save(`Cotizacion_IdeaForm_${quoteData.quoteNumber || 'B2B'}.pdf`);
};

export const generateInvoicePDF = (orderData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFontSize(16);
  doc.text(`Comprobante de Compra #${orderData.orderNumber}`, 15, 20);
  doc.setFontSize(10);
  doc.text(`Cliente: ${orderData.customerName}`, 15, 30);
  doc.text(`Total: ${formatCurrency(orderData.total)}`, 15, 40);
  doc.save(`Pedido_${orderData.orderNumber}.pdf`);
};
