import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { B2B_PRICE_TIERS, PRODUCTS } from '../../data/mockData';
import { generateB2BQuotePDF } from '../../utils/pdfGenerator';
import { formatCurrency, generateFolio } from '../../utils/formatters';
import {
  Building2,
  Megaphone,
  Award,
  Gift,
  Users,
  Rocket,
  ShoppingBag,
  FileDown,
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Percent,
  Upload,
  Receipt
} from 'lucide-react';

const OBJECTIVES = [
  { id: 'brand_awareness', name: 'Dar a conocer mi marca', icon: Megaphone, desc: 'Merchandising masivo de alto impacto visual y llaveros con relieve' },
  { id: 'identity', name: 'Fortalecer mi identidad', icon: Award, desc: 'Trofeos corporativos, placas de escritorio y señalética 3D personalizada' },
  { id: 'clients', name: 'Regalar a mis clientes', icon: Gift, desc: 'Kits premium de bienvenida, litofanías y detalles ejecutivos inolvidables' },
  { id: 'team', name: 'Motivar a mi equipo', icon: Users, desc: 'Reconocimientos a colaboradores, insignias y organizadores de oficina' },
  { id: 'launch', name: 'Lanzar un producto', icon: Rocket, desc: 'Prototipos rápidos y piezas promocionales para activaciones de marca' },
  { id: 'merch', name: 'Merchandising & Reventa', icon: ShoppingBag, desc: 'Artículos por volumen con precios escalonados y altos márgenes' }
];

const EmpresasRoute = () => {
  const { saveB2BQuote, showToast } = useApp();

  const [activeStep, setActiveStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState('brand_awareness');
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [units, setUnits] = useState(100);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [rfc, setRfc] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  // Stepper Definition
  const STEPS = [
    { num: 1, label: '1. Objetivo' },
    { num: 2, label: '2. Producto' },
    { num: 3, label: '3. Personaliza' },
    { num: 4, label: '4. Cotiza PDF' },
    { num: 5, label: '5. Confirmación' }
  ];

  // Calculate Tier Discount
  const currentTier = B2B_PRICE_TIERS.find((t) => units >= t.minUnits && units <= t.maxUnits) || B2B_PRICE_TIERS[0];
  const discountPercent = currentTier.discountPercent;
  const baseUnitPrice = selectedProduct ? selectedProduct.basePrice : 150;
  const unitPriceAfterDiscount = baseUnitPrice * (1 - discountPercent / 100);
  const subtotal = unitPriceAfterDiscount * units;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleGenerateQuote = () => {
    if (!companyName || !email) {
      showToast('Por favor completa la Razón Social y Correo de Contacto', 'error');
      return;
    }

    const quoteData = {
      quoteNumber: generateFolio('COT-B2B'),
      companyName,
      contactName: contactName || 'Representante de Compras',
      email,
      rfc: rfc || 'XAXX010101000',
      productName: selectedProduct ? selectedProduct.name : 'Artículo 3D Personalizado',
      quantity: units,
      units: units,
      unitPrice: baseUnitPrice,
      discountPercent: discountPercent,
      subtotal: subtotal,
      iva: iva,
      finalTotal: total,
      totalAmount: total,
      status: 'VIGENTE (15 DÍAS)',
      date: new Date().toLocaleDateString('es-MX')
    };

    saveB2BQuote(quoteData);
    generateB2BQuotePDF(quoteData);
    setActiveStep(5);
  };

  return (
    <div style={{ background: '#0e1927', color: '#ffffff', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner (Clean without "RUTA 2:") */}
      <div style={{ background: '#142236', borderBottom: '1px solid #233752', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #1D3557 0%, #20A39E 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.82rem',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.04em',
                border: '1px solid #20A39E'
              }}
            >
              EMPRESAS
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>
              Haz tangible tu marca
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: '#94a3b8' }}>
            <span>📄 Facturación CFDI 4.0</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>⚡ Descuentos por volumen hasta 40%</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '750px', margin: '0 auto 3rem auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#233752' }} />
          <div className="stepper-progress-fill" style={{ background: 'linear-gradient(90deg, #1D3557, #20A39E)', width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

          {STEPS.map((s) => {
            const isCompleted = activeStep > s.num;
            const isActive = activeStep === s.num;

            return (
              <button
                key={s.num}
                className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setActiveStep(s.num)}
              >
                <div
                  className="stepper-circle"
                  style={{
                    backgroundColor: isActive ? '#20A39E' : isCompleted ? '#1D3557' : '#142236',
                    borderColor: isActive ? '#20A39E' : isCompleted ? '#20A39E' : '#233752',
                    color: '#ffffff'
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} color="#20A39E" /> : s.num}
                </div>
                <div className="stepper-label" style={{ color: isActive ? '#ffffff' : '#94a3b8' }}>
                  {s.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* STEP 1: OBJECTIVES GRID */}
        {activeStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ color: '#20A39E', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                OBJETIVO ESTRATÉGICO
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff' }}>¿Qué quieres lograr con tu empresa?</h2>
              <p style={{ color: '#94a3b8' }}>Selecciona tu meta para recomendarte las soluciones y piezas 3D más efectivas.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {OBJECTIVES.map((obj) => {
                const IconComponent = obj.icon;
                const isSelected = selectedObjective === obj.id;

                return (
                  <div
                    key={obj.id}
                    onClick={() => {
                      setSelectedObjective(obj.id);
                      setActiveStep(2);
                    }}
                    style={{
                      background: isSelected ? 'rgba(32, 163, 158, 0.12)' : '#142236',
                      border: isSelected ? '2px solid #20A39E' : '1px solid #233752',
                      borderRadius: 'var(--radius-xl)',
                      padding: '2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 8px 24px rgba(32, 163, 158, 0.2)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#20A39E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      if (!isSelected) e.currentTarget.style.borderColor = '#233752';
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: isSelected ? '#20A39E' : 'rgba(32, 163, 158, 0.15)',
                        color: isSelected ? '#0e1927' : '#20A39E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <IconComponent size={24} />
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>
                      {obj.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      {obj.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#20A39E', fontWeight: '700', fontSize: '0.82rem' }}>
                      <span>Configurar solución</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 & 3 & 4: CALCULATOR & B2B QUOTE GENERATOR */}
        {activeStep >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 0.8fr)', gap: '2rem' }}>
            
            {/* Left: Configuration Form */}
            <div style={{ background: '#142236', border: '1px solid #233752', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={22} color="#20A39E" />
                <span>Datos Corporativos & Configuración</span>
              </h2>

              {/* Product Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  ARTÍCULO 3D BASE
                </label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const prod = PRODUCTS.find((p) => p.id === e.target.value);
                    if (prod) setSelectedProduct(prod);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#0e1927',
                    border: '1px solid #233752',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.basePrice)} unitario base</option>
                  ))}
                </select>
              </div>

              {/* Units Slider */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94a3b8' }}>
                    VOLUMEN DE PRODUCCIÓN
                  </label>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#20A39E' }}>
                    {units} piezas
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#20A39E', cursor: 'pointer' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                  <span>10 pzas (10% OFF)</span>
                  <span>100 pzas (25% OFF)</span>
                  <span>500+ pzas (40% OFF)</span>
                </div>
              </div>

              {/* Company Info Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                    Razón Social / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Grupo Expansión S.A."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#0e1927', border: '1px solid #233752', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                    RFC (Para CFDI 4.0)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. GEX180425ABC"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#0e1927', border: '1px solid #233752', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                    Contacto / Representante
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Lic. Carlos Morales"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#0e1927', border: '1px solid #233752', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>
                    Correo de Facturación / Compras *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="compras@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#0e1927', border: '1px solid #233752', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Logo Vector Uploader */}
              <div style={{ border: '2px dashed #233752', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center', background: '#0e1927' }}>
                <Upload size={24} color="#20A39E" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff' }}>
                  {logoFile ? `Logo cargado: ${logoFile.name}` : 'Sube tu logotipo para relieve 3D (.SVG, .AI, .PNG)'}
                </div>
                <input
                  type="file"
                  accept=".svg,.png,.ai,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoFile(e.target.files[0]);
                      showToast(`Logotipo "${e.target.files[0].name}" cargado`, 'success');
                    }
                  }}
                  style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}
                />
              </div>
            </div>

            {/* Right: Real-time Budget & PDF Summary */}
            <div style={{ background: '#142236', border: '1px solid #20A39E', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#20A39E', letterSpacing: '0.04em' }}>
                    PRESUPUESTO ESTIMADO
                  </span>
                  <span style={{ background: 'rgba(32, 163, 158, 0.15)', color: '#20A39E', fontSize: '0.75rem', fontWeight: '800', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                    {discountPercent}% OFF MAYOREO
                  </span>
                </div>

                <div style={{ borderBottom: '1px solid #233752', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                    <span>Precio Unitario Normal:</span>
                    <span>{formatCurrency(baseUnitPrice)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#20A39E', fontWeight: '700', marginBottom: '0.4rem' }}>
                    <span>Precio Unitario por Volumen:</span>
                    <span>{formatCurrency(unitPriceAfterDiscount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#94a3b8' }}>
                    <span>Unidades a fabricar:</span>
                    <span>{units} piezas</span>
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid #233752', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#ffffff', marginBottom: '0.4rem' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '700' }}>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                    <span>IVA (16% CFDI 4.0):</span>
                    <span>{formatCurrency(iva)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', color: '#ffffff', fontWeight: '800', marginTop: '0.5rem' }}>
                    <span>Total Neto:</span>
                    <span style={{ color: '#20A39E' }}>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', background: 'linear-gradient(135deg, #0F5F6D 0%, #20A39E 100%)', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
                  onClick={handleGenerateQuote}
                >
                  <FileDown size={20} />
                  <span>Generar & Descargar Cotización PDF</span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                  Emitida al instante con datos fiscales y cuenta CLABE para transferencia SPEI.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION SUCCESS */}
        {activeStep === 5 && (
          <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', background: '#142236', border: '1px solid #20A39E', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(32, 163, 158, 0.2)', color: '#20A39E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
              ¡Cotización B2B Generada con Éxito!
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Hemos descargado tu archivo PDF con desglose fiscal y enviado una copia a <strong>{email}</strong>. Un asesor técnico de IdeaForm revisará tu archivo y se pondrá en contacto contigo.
            </p>

            <button
              className="btn btn-secondary"
              onClick={() => setActiveStep(1)}
              style={{ background: '#0e1927', borderColor: '#233752', color: '#fff' }}
            >
              Crear Otra Cotización
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpresasRoute;
