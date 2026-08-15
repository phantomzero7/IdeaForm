import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, B2B_PRICE_TIERS, FILAMENT_MATERIALS } from '../../data/mockData';
import { generateB2BQuotePDF } from '../../utils/pdfGenerator';
import { generateFolio, formatCurrency } from '../../utils/formatters';
import { Building2, FileDown, UploadCloud, CheckCircle, ShieldCheck, HelpCircle, ArrowRight, Sparkles, Clock, Percent } from 'lucide-react';

const B2BCalculator = () => {
  const { saveB2BQuote, addToCart, navigateTo, showToast } = useApp();

  // B2B Products
  const b2bProducts = PRODUCTS.filter((p) => p.route === 'ENTERPRISES' || p.isCustomizable);

  const [selectedProduct, setSelectedProduct] = useState(b2bProducts[0]);
  const [quantity, setQuantity] = useState(150);
  const [selectedMaterial, setSelectedMaterial] = useState(FILAMENT_MATERIALS[0]);
  const [uploadedLogoName, setUploadedLogoName] = useState('logo-corporativo-vector.svg');
  const [includePackaging, setIncludePackaging] = useState(true);
  const [requirePhysicalSample, setRequirePhysicalSample] = useState(false);

  // Form info
  const [companyName, setCompanyName] = useState('Innovación Tecnológica S.A. de C.V.');
  const [rfc, setRfc] = useState('ITE180425ABC');
  const [contactName, setContactName] = useState('Lic. Sofía Mendoza');
  const [contactEmail, setContactEmail] = useState('compras@innovacion.mx');
  const [contactPhone, setContactPhone] = useState('612 123 4567');
  const [projectName, setProjectName] = useState('Llaveros e Insumos Promocionales Lanzamiento 2026');

  // Find active discount tier
  const activeTier =
    B2B_PRICE_TIERS.find((t) => quantity >= t.minQty && quantity <= t.maxQty) ||
    B2B_PRICE_TIERS[B2B_PRICE_TIERS.length - 1];

  const discountPercent = activeTier.discountPercent;
  const listPricePerUnit = selectedProduct.basePrice;
  const unitDiscount = (listPricePerUnit * discountPercent) / 100;
  const unitNetPrice = listPricePerUnit - unitDiscount;

  const grossTotal = listPricePerUnit * quantity;
  const discountSavings = unitDiscount * quantity;
  const subtotalItems = unitNetPrice * quantity;

  const packagingCostPerUnit = 3.5;
  const packagingTotal = includePackaging ? packagingCostPerUnit * quantity : 0;
  const sampleCost = requirePhysicalSample ? 150 : 0;
  const setupFee = uploadedLogoName ? 0 : activeTier.setupFee;

  const subtotalNet = subtotalItems + packagingTotal + sampleCost + setupFee;
  const shippingCost = quantity >= 100 ? 0 : 250;
  const vatTax = subtotalNet * 0.16; // 16% IVA México
  const finalTotal = subtotalNet + shippingCost + vatTax;

  // Handle Logo Upload Simulation
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedLogoName(file.name);
      showToast(`Archivo "${file.name}" cargado y validado vectorialmente`, 'success');
    }
  };

  // Generate and Download PDF
  const handleDownloadPDF = () => {
    const quoteNumber = generateFolio('COT-2026-B2B');
    const quotePayload = {
      quoteNumber,
      companyName,
      rfc,
      contactName,
      contactEmail,
      productSKU: selectedProduct.id,
      productName: selectedProduct.name,
      materialName: selectedMaterial.name,
      quantity,
      unitListPrice: listPricePerUnit,
      discountPercent,
      unitNetPrice,
      grossTotal,
      discountSavings,
      subtotalItems,
      includePackaging,
      packagingTotal,
      setupFee,
      sampleCost,
      shippingCost,
      vatTax,
      finalTotal,
      date: new Date().toLocaleDateString('es-MX'),
      expiresAt: '15 días naturales'
    };

    // Save to App State
    saveB2BQuote(quotePayload);

    // Trigger PDF Download
    generateB2BQuotePDF(quotePayload);
  };

  // Place B2B Order / Checkout
  const handleProceedB2BOrder = () => {
    addToCart({
      id: selectedProduct.id,
      name: `${selectedProduct.name} [Lote B2B x${quantity}]`,
      basePrice: listPricePerUnit,
      finalUnitPrice: unitNetPrice + (includePackaging ? packagingCostPerUnit : 0),
      selectedMaterial: selectedMaterial,
      selectedColor: selectedMaterial.colors[0],
      customText: `Lote B2B: ${companyName} (${quantity} unidades)`,
      quantity: quantity,
      isB2B: true,
      weightGrams: (selectedProduct.weightGrams || 20) * quantity
    });

    navigateTo('checkout');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 2.5rem auto' }}>
        <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
          <Building2 size={14} /> PORTAL CORPORATIVO & MAYOREO
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800' }}>Calculadora B2B de Manufactura 3D</h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Cotiza en tiempo real lotes corporativos de 10 a 1,000+ piezas con descuentos escalonados y genera tu presupuesto formal en PDF con validez fiscal SAT (CFDI 4.0).
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="customizer-split-responsive" style={{ gap: '2rem' }}>
        
        {/* LEFT COLUMN: Configurador de Lote B2B */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Selector de Producto B2B */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>1. Producto Base Corporativo</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {b2bProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedProduct.id === p.id ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                    background: selectedProduct.id === p.id ? 'rgba(0, 130, 138, 0.05)' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '700', marginTop: '0.25rem' }}>
                    Lista: {formatCurrency(p.basePrice)} c/u
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Slider de Volumen & Tabla de Descuentos */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>2. Cantidad Requerida</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                  style={{
                    width: '90px',
                    padding: '0.4rem 0.6rem',
                    textAlign: 'center',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-primary)',
                    color: 'var(--color-primary)'
                  }}
                />
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>unidades</span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={quantity > 500 ? 500 : quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--color-primary)',
                height: '8px',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
            />

            {/* Tiers Visual Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>ESCALAFONES DE DESCUENTO POR VOLUMEN</div>
              {B2B_PRICE_TIERS.slice(0, 5).map((tier, idx) => {
                const isSelectedTier = quantity >= tier.minQty && quantity <= tier.maxQty;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelectedTier ? 'rgba(0, 130, 138, 0.1)' : '#f8fafc',
                      border: isSelectedTier ? '1px solid var(--color-primary)' : '1px solid transparent',
                      fontSize: '0.82rem'
                    }}
                  >
                    <span style={{ fontWeight: isSelectedTier ? '700' : '500', color: isSelectedTier ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                      {tier.minQty} a {tier.maxQty} pcs
                    </span>
                    <span style={{ fontWeight: '800', color: tier.discountPercent > 0 ? '#059669' : 'var(--text-secondary)' }}>
                      {tier.discountPercent > 0 ? `-${tier.discountPercent}% descuento` : 'Precio Lista'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {tier.leadTimeDays}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Carga de Logotipo Vectorial / Archivo 3D */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>3. Logotipo o Archivo 3D</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Sube el logo de tu empresa en formato vectorial (.SVG, .AI, .PDF) o modelo 3D (.STL).
            </p>

            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem',
                border: '2px dashed var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 130, 138, 0.02)',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              <UploadCloud size={32} color="var(--color-primary)" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
                {uploadedLogoName ? `Archivo cargado: ${uploadedLogoName}` : 'Arrastra tu archivo aquí o haz clic para buscar'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                Acepta SVG, AI, STL, STEP, PNG alta resolución (Máx 25MB)
              </div>
              <input type="file" accept=".svg,.ai,.pdf,.stl,.step,.png" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            {/* Additional Options Checkboxes */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={includePackaging}
                  onChange={(e) => setIncludePackaging(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)', width: '1.1rem', height: '1.1rem' }}
                />
                <span><strong>Empaque Individual Personalizado</strong> (+{formatCurrency(packagingCostPerUnit)}/unidad con etiqueta de tu marca)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={requirePhysicalSample}
                  onChange={(e) => setRequirePhysicalSample(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)', width: '1.1rem', height: '1.1rem' }}
                />
                <span><strong>Muestra Física Previa de Aprobación</strong> (+{formatCurrency(150)} envío express de 1 unidad de prueba)</span>
              </label>
            </div>
          </div>

          {/* 4. Datos de la Empresa Cliente */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem' }}>4. Datos Fiscales para Facturación CFDI 4.0</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Razón Social / Empresa</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>RFC de la Empresa</label>
                <input
                  type="text"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Contacto / Responsable</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.25rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Correo Electrónico</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.25rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Resumen Financiero & Generador PDF */}
        <div style={{ position: 'sticky', top: '5.5rem', height: 'fit-content' }}>
          <div className="card card-elevated" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Resumen de Cotización</h3>
              <span className="badge badge-success">Válido 15 Días</span>
            </div>

            {/* Detailed financial lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Producto:</span>
                <strong style={{ color: '#0f172a' }}>{selectedProduct.name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cantidad:</span>
                <strong style={{ color: '#0f172a' }}>{quantity} piezas</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Precio Lista:</span>
                <span>{formatCurrency(listPricePerUnit)} c/u</span>
              </div>

              {discountPercent > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '700' }}>
                  <span>Descuento B2B ({discountPercent}%):</span>
                  <span>-{formatCurrency(discountSavings)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Precio Unitario Neto:</span>
                <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(unitNetPrice)} c/u</strong>
              </div>

              {includePackaging && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Empaque individual:</span>
                  <span>{formatCurrency(packagingTotal)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Envío Nacional (FedEx/DHL):</span>
                <strong style={{ color: quantity >= 100 ? '#059669' : '#0f172a' }}>
                  {quantity >= 100 ? 'GRATIS (Volumen ≥100)' : formatCurrency(shippingCost)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IVA (16% SAT CFDI 4.0):</span>
                <span>{formatCurrency(vatTax)}</span>
              </div>

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.5rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>TOTAL NETO:</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {formatCurrency(finalTotal)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Incluye impuestos y factura fiscal</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleProceedB2BOrder}
              >
                <span>Aprobar y Pagar en Línea</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleDownloadPDF}
              >
                <FileDown size={18} color="var(--color-primary)" />
                <span>Descargar Cotización PDF</span>
              </button>
            </div>

            {/* Payment & Terms Note */}
            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
              🔒 <strong>Condiciones Comerciales:</strong> Aceptamos SPEI con validación automática, tarjeta de crédito y transferencias bancarias BBVA. Despacho garantizado en 5-7 días hábiles.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .b2b-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default B2BCalculator;
