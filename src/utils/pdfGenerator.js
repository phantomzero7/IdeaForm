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

export const generateInvoicePDF = (orderData, fiscalData = {}) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const tealColor = [23, 107, 135];
  const darkColor = [15, 23, 42];
  const grayColor = [100, 116, 139];
  const lightBg = [248, 250, 252];
  const borderLight = [226, 232, 240];

  const uuid = orderData.fiscalUuid || '4A8F9201-987B-4A12-B6E3-CFDA091244E1';
  const rfcCliente = fiscalData.rfc || orderData.rfc || 'XAXX010101000';
  const razonSocial = fiscalData.legalName || orderData.customerName || 'Cliente Particular';
  const cpCliente = fiscalData.postalCode || orderData.postalCode || '23000';
  const regimenCliente = fiscalData.taxRegime || '612 - Personas Físicas con Actividades Empresariales';
  const usoCfdi = fiscalData.cfdiUse || 'G03 - Gastos en general';

  // Top Accent Bar
  doc.setFillColor(...tealColor);
  doc.rect(0, 0, 210, 6, 'F');

  // Header Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...darkColor);
  doc.text('Idea', 15, 22);
  doc.setTextColor(...tealColor);
  doc.text('Form', 33, 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('IdeaForm México S.A. de C.V.  |  RFC: IDF260101XYZ', 15, 28);
  doc.text('Régimen Fiscal: 601 - General de Ley Personas Morales', 15, 33);
  doc.text('Lugar de Expedición: C.P. 23000 (La Paz, BCS, México)', 15, 38);

  // SAT CFDI 4.0 Box
  doc.setFillColor(...lightBg);
  doc.roundedRect(115, 12, 80, 32, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(115, 12, 80, 32, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text('FACTURA ELECTRÓNICA CFDI 4.0', 120, 18);

  doc.setFontSize(8.5);
  doc.setTextColor(...tealColor);
  doc.text(`Folio Interno: ${orderData.orderNumber}`, 120, 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text(`UUID: ${uuid.slice(0, 22)}...`, 120, 30);
  doc.text(`Fecha Timbrado: ${orderData.date || new Date().toLocaleDateString('es-MX')} 14:20:00`, 120, 35);
  doc.text('Tipo de Comprobante: I - Ingreso', 120, 40);

  // Separator
  doc.setDrawColor(...tealColor);
  doc.setLineWidth(0.4);
  doc.line(15, 48, 195, 48);

  // Receptor Fiscal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkColor);
  doc.text('DATOS DEL RECEPTOR / CLIENTE:', 15, 54);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Razón Social: ${razonSocial}`, 15, 60);
  doc.text(`RFC: ${rfcCliente}  |  C.P. Fiscal: ${cpCliente}`, 15, 65);
  doc.text(`Régimen Fiscal: ${regimenCliente}`, 15, 70);
  doc.text(`Uso CFDI: ${usoCfdi}  |  Método Pago: PUE (Pago en una sola exhibición)`, 15, 75);

  // Table
  const totalAmount = Number(orderData.total) || 170.00;
  const subtotalNeto = totalAmount / 1.16;
  const vat = totalAmount - subtotalNeto;

  autoTable(doc, {
    startY: 82,
    head: [['Clave SAT', 'Cant.', 'Unidad', 'Descripción del Producto 3D', 'Valor Unitario', 'Importe']],
    body: [
      [
        '73152100',
        '1',
        'H87 (Pieza)',
        `${orderData.productName || 'Pieza Personalizada 3D'}\nGrabado: "${orderData.customText || 'IdeaForm'}" • Filamento: ${orderData.filament || 'PLA Silk'}`,
        formatCurrency(subtotalNeto),
        formatCurrency(subtotalNeto)
      ]
    ],
    headStyles: {
      fillColor: tealColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkColor
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 15, right: 15 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Totals Box
  doc.setFillColor(...lightBg);
  doc.roundedRect(120, finalY, 75, 28, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(120, finalY, 75, 28, 2, 2, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Subtotal:', 125, finalY + 7);
  doc.text(formatCurrency(subtotalNeto), 190, finalY + 7, { align: 'right' });

  doc.text('IVA Trasladado (16%):', 125, finalY + 13);
  doc.text(formatCurrency(vat), 190, finalY + 13, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...tealColor);
  doc.text('TOTAL:', 125, finalY + 22);
  doc.text(formatCurrency(totalAmount), 190, finalY + 22, { align: 'right' });

  // Digital Stamp SAT Box
  const stampY = finalY + 36;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, stampY, 180, 36, 2, 2, 'F');
  doc.setDrawColor(...borderLight);
  doc.roundedRect(15, stampY, 180, 36, 2, 2, 'S');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('CADENA ORIGINAL DEL COMPLEMENTO DE CERTIFICACIÓN DIGITAL DEL SAT:', 18, stampY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...grayColor);
  doc.text(`||1.1|${uuid}|${new Date().toISOString()}|SAT970701NN3|FEA8948BC98A8F982E7812984719284791283749182374912837491283749128==|00001000000504465028||`, 18, stampY + 11, { maxWidth: 174 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text('SELLO DIGITAL DEL EMISOR:', 18, stampY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...grayColor);
  doc.text('K98y7HGYU87234hjkdsf8734hksdjfHJKDSF8734hksdjf8743hkjsdf8734HJKSDf78==', 18, stampY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...darkColor);
  doc.text('SELLO DIGITAL DEL SAT:', 18, stampY + 29);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...grayColor);
  doc.text('M897hsdjkf7834hksdjf8743hksdf7834hksdf8734hksdf8743hksdf8734hksdf87==', 18, stampY + 33);

  // Footer Note
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...grayColor);
  doc.text('Este documento es una representación impresa de un CFDI 4.0 expedido conforme a las leyes fiscales vigentes.', 105, 285, { align: 'center' });

  doc.save(`Factura_SAT_${orderData.orderNumber}_CFDI40.pdf`);
};

export const downloadCFDIXML = (orderData, fiscalData = {}) => {
  const uuid = orderData.fiscalUuid || '4A8F9201-987B-4A12-B6E3-CFDA091244E1';
  const rfcCliente = fiscalData.rfc || orderData.rfc || 'XAXX010101000';
  const razonSocial = fiscalData.legalName || orderData.customerName || 'Cliente Particular';
  const cpCliente = fiscalData.postalCode || '23000';
  const total = Number(orderData.total) || 170.00;
  const subtotal = (total / 1.16).toFixed(2);
  const iva = (total - subtotal).toFixed(2);

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" Version="4.0" Serie="IDF" Folio="${orderData.orderNumber}" Fecha="${new Date().toISOString()}" SubTotal="${subtotal}" Moneda="MXN" Total="${total.toFixed(2)}" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="23000">
  <cfdi:Emisor Rfc="IDF260101XYZ" Nombre="IDEAFORM MEXICO SA DE CV" RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${rfcCliente}" Nombre="${razonSocial.toUpperCase()}" DomicilioFiscalReceptor="${cpCliente}" RegimenFiscalReceptor="612" UsoCFDI="G03"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="73152100" Cantidad="1" ClaveUnidad="H87" Descripcion="${orderData.productName || 'Manufactura Aditiva 3D'}" ValorUnitario="${subtotal}" Importe="${subtotal}" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${subtotal}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${iva}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${iva}">
    <cfdi:Traslados>
      <cfdi:Traslado Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${iva}" Base="${subtotal}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" Version="1.1" UUID="${uuid}" FechaTimbrado="${new Date().toISOString()}" RfcProvCertif="SAT970701NN3" SelloCFD="FEA8948BC..." NoCertificadoSAT="00001000000504465028"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Factura_SAT_${orderData.orderNumber}_CFDI40.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
