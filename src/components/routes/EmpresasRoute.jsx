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
  Upload
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

  const STEPS = [
    { num: 1, label: '1. Objetivo' },
    { num: 2, label: '2. Producto' },
    { num: 3, label: '3. Personaliza' },
    { num: 4, label: '4. Cotiza PDF' },
    { num: 5, label: '5. Confirmación' }
  ];

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
      productName: selectedProduct ? selectedProduct.name : 'Artículo 3D Corporativo',
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
    <div style={{ background: '#EDF4F8', color: '#1A1A1A', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #D5E4ED', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#21658A',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.82rem',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.04em'
              }}
            >
              EMPRESAS
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#104F75' }}>
              Haz tangible tu marca
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: '#21658A', fontWeight: '600' }}>
            <span>📄 Facturación CFDI 4.0</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>⚡ Descuentos por volumen hasta 40%</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '750px', margin: '0 auto 3rem auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#D5E4ED' }} />
          <div className="stepper-progress-fill" style={{ background: '#21658A', width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

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
                    backgroundColor: isActive ? '#104F75' : isCompleted ? '#EDF4F8' : '#FFFFFF',
                    borderColor: isActive ? '#104F75' : isCompleted ? '#21658A' : '#D5E4ED',
                    color: isActive ? '#FFFFFF' : isCompleted ? '#104F75' : '#718096'
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} color="#104F75" /> : s.num}
                </div>
                <div className="stepper-label" style={{ color: isActive ? '#104F75' : '#718096' }}>
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
              <div style={{ color: '#21658A', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                OBJETIVO ESTRATÉGICO
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#104F75' }}>¿Qué quieres lograr con tu empresa?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Selecciona tu meta para recomendarte las piezas 3D más efectivas.</p>
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
                      background: isSelected ? '#FFFFFF' : '#FFFFFF',
                      border: isSelected ? '2px solid #21658A' : '1px solid #D5E4ED',
                      borderRadius: 'var(--radius-xl)',
                      padding: '2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#21658A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      if (!isSelected) e.currentTarget.style.borderColor = '#D5E4ED';
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: isSelected ? '#21658A' : 'rgba(33, 101, 138, 0.15)',
                        color: isSelected ? '#FFFFFF' : '#104F75',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <IconComponent size={24} />
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#104F75', marginBottom: '0.4rem' }}>
                      {obj.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      {obj.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#21658A', fontWeight: '700', fontSize: '0.82rem' }}>
                      <span>Configurar solución</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 & 3 & 4: CALCULATOR */}
        {activeStep >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 0.8fr)', gap: '2rem' }}>
            
            {/* Left Form */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#104F75', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={22} color="#21658A" />
                <span>Datos Corporativos & Configuración</span>
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
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
                    background: '#EDF4F8',
                    border: '1px solid #D5E4ED',
                    color: '#1A1A1A',
                    fontSize: '0.9rem',
                    outline: 'none',
                    fontWeight: '600'
                  }}
                >
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {formatCurrency(p.basePrice)} unitario base</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    VOLUMEN DE PRODUCCIÓN
                  </label>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#104F75' }}>
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
                  style={{ width: '100%', accentColor: '#104F75', cursor: 'pointer' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                  <span>10 pzas (10% OFF)</span>
                  <span>100 pzas (25% OFF)</span>
                  <span>500+ pzas (40% OFF)</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Razón Social / Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Grupo Expansión S.A."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    RFC (Para CFDI 4.0)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. GEX180425ABC"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Contacto / Representante
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Lic. Carlos Morales"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Correo de Facturación *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="compras@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ border: '2px dashed #D5E4ED', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center', background: '#EDF4F8' }}>
                <Upload size={24} color="#21658A" style={{ margin: '0 auto 0.5rem auto' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#104F75' }}>
                  {logoFile ? `Logo cargado: ${logoFile.name}` : 'Sube tu logotipo para grabado 3D (.SVG, .AI, .PNG)'}
                </div>
                <input
                  type="file"
                  accept=".svg,.png,.ai,.pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setLogoFile(e.target.files[0]);
                      showToast(`Logotipo cargado`, 'success');
                    }
                  }}
                  style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                />
              </div>
            </div>

            {/* Right Summary */}
            <div style={{ background: '#FFFFFF', border: '1px solid #21658A', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#104F75', letterSpacing: '0.04em' }}>
                    PRESUPUESTO ESTIMADO
                  </span>
                  <span style={{ background: 'rgba(33, 101, 138, 0.15)', color: '#104F75', fontSize: '0.75rem', fontWeight: '800', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                    {discountPercent}% OFF MAYOREO
                  </span>
                </div>

                <div style={{ borderBottom: '1px solid #D5E4ED', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Precio Unitario Normal:</span>
                    <span>{formatCurrency(baseUnitPrice)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#104F75', fontWeight: '700', marginBottom: '0.4rem' }}>
                    <span>Precio Unitario por Volumen:</span>
                    <span>{formatCurrency(unitPriceAfterDiscount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <span>Unidades a fabricar:</span>
                    <span>{units} piezas</span>
                  </div>
                </div>

                <div style={{ borderBottom: '1px solid #D5E4ED', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#1A1A1A', marginBottom: '0.4rem' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: '700' }}>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>IVA (16% CFDI 4.0):</span>
                    <span>{formatCurrency(iva)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', color: '#104F75', fontWeight: '800', marginTop: '0.5rem' }}>
                    <span>Total Neto:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  className="btn btn-empresas btn-lg"
                  style={{ width: '100%', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}
                  onClick={handleGenerateQuote}
                >
                  <FileDown size={20} />
                  <span>Generar & Descargar Cotización PDF</span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Emitida al instante con desglose SAT y cuenta CLABE para SPEI.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION SUCCESS */}
        {activeStep === 5 && (
          <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', background: '#FFFFFF', border: '1px solid #21658A', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(33, 101, 138, 0.15)', color: '#104F75', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#104F75', marginBottom: '0.5rem' }}>
              ¡Cotización B2B Generada con Éxito!
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Hemos descargado tu archivo PDF con validez fiscal y enviado una copia a <strong>{email}</strong>.
            </p>

            <button
              className="btn btn-empresas"
              onClick={() => setActiveStep(1)}
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
