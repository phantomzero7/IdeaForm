import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { B2B_PRICE_TIERS, PRODUCTS, FILAMENT_COLORS } from '../../data/mockData';
import ThreeViewer from '../3d/ThreeViewer';
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
  ArrowLeft,
  CheckCircle2,
  Upload,
  Sparkles,
  FileCheck,
  AlertCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';

const OBJECTIVES = [
  {
    id: 'brand_awareness',
    name: 'Dar a conocer mi marca',
    icon: Megaphone,
    desc: 'Merchandising masivo de alto impacto visual y llaveros con relieve.',
    benefits: ['Alta recordación diaria en llaves y mochilas de clientes', 'Costo unitario escalonado desde $35 MXN', 'Producción rápida en serie'],
    recommendedProductId: 'prod-b2b-02'
  },
  {
    id: 'identity',
    name: 'Fortalecer mi identidad',
    icon: Award,
    desc: 'Trofeos corporativos, placas de escritorio y señalética 3D personalizada.',
    benefits: ['Acabados bicapa Seda + Mate de grado ejecutivo', 'Grabado de logotipo y categoría de premiación', 'Elegancia para oficinas y recepciones'],
    recommendedProductId: 'prod-b2b-01'
  },
  {
    id: 'clients',
    name: 'Regalar a mis clientes',
    icon: Gift,
    desc: 'Kits premium de bienvenida, litofanías y detalles ejecutivos inolvidables.',
    benefits: ['Fidelización inmediata y agradecimiento de fin de año', 'Empaque individual listo para entrega', 'Personalización con el nombre de cada cliente'],
    recommendedProductId: 'prod-b2b-03'
  },
  {
    id: 'team',
    name: 'Motivar a mi equipo',
    icon: Users,
    desc: 'Reconocimientos a colaboradores, insignias y organizadores de oficina.',
    benefits: ['Sentido de pertenencia para onboarding', 'Premios por cumplimiento de metas y aniversarios', 'Detalles útiles para el escritorio'],
    recommendedProductId: 'prod-b2b-01'
  },
  {
    id: 'launch',
    name: 'Lanzar un producto',
    icon: Rocket,
    desc: 'Prototipos rápidos y piezas promocionales para activaciones de marca.',
    benefits: ['Fabricación ágil sin moldes costosos de inyección', 'Muestras físicas previas en 48 hrs', 'Diseños únicos no disponibles en el mercado'],
    recommendedProductId: 'prod-b2b-02'
  },
  {
    id: 'merch',
    name: 'Merchandising & Reventa',
    icon: ShoppingBag,
    desc: 'Artículos por volumen con precios escalonados y altos márgenes.',
    benefits: ['Hasta 40% de descuento por volumen', 'Facturación SAT CFDI 4.0 deducible', 'Envíos consolidados a toda la república'],
    recommendedProductId: 'prod-b2b-02'
  }
];

const EmpresasRoute = () => {
  const { saveB2BQuote, showToast } = useApp();
  const viewerRef = useRef(null);

  const [activeStep, setActiveStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState(OBJECTIVES[0]);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS.find((p) => p.subcollection === 'empresas') || PRODUCTS[0]);
  const [customBrandText, setCustomBrandText] = useState('MI EMPRESA');
  const [selectedColor, setSelectedColor] = useState(FILAMENT_COLORS[1]); // Azul Océano (#21658A)
  const [units, setUnits] = useState(100);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [rfc, setRfc] = useState('');
  const [logoFile, setLogoFile] = useState(null);

  const STEPS = [
    { num: 1, label: '1. Objetivo' },
    { num: 2, label: '2. Productos' },
    { num: 3, label: '3. Personaliza' },
    { num: 4, label: '4. Archivo Logo' },
    { num: 5, label: '5. Cotiza PDF' },
    { num: 6, label: '6. Confirmación' }
  ];

  const B2B_PRODUCTS = PRODUCTS.filter((p) => p.subcollection === 'empresas' || p.isCustomizable);

  // Calculate Tier Discount
  const currentTier = B2B_PRICE_TIERS.find((t) => units >= t.minUnits && units <= t.maxUnits) || B2B_PRICE_TIERS[0];
  const discountPercent = currentTier.discountPercent;
  const baseUnitPrice = selectedProduct ? selectedProduct.basePrice : 150;
  const unitPriceAfterDiscount = baseUnitPrice * (1 - discountPercent / 100);
  const subtotal = unitPriceAfterDiscount * units;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        showToast('El archivo supera el límite de 25 MB', 'error');
        return;
      }
      setLogoFile(file);
      showToast(`Archivo "${file.name}" cargado exitosamente`, 'success');
    }
  };

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
      productName: selectedProduct ? `${selectedProduct.name} (${customBrandText})` : 'Artículo 3D Corporativo',
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
    setActiveStep(6);
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: '#104F75', fontWeight: '600' }}>
            <span>📄 Facturación CFDI 4.0</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span>⚡ Descuentos por volumen hasta 40%</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '840px', margin: '0 auto 3rem auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#D5E4ED' }} />
          <div className="stepper-progress-fill" style={{ background: '#21658A', width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

          {STEPS.map((s) => {
            const isCompleted = activeStep > s.num;
            const isActive = activeStep === s.num;

            return (
              <button
                key={s.num}
                className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  if (s.num <= activeStep || isCompleted) {
                    setActiveStep(s.num);
                  }
                }}
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

        {/* PASO 1: OBJETIVO ESTRATÉGICO */}
        {activeStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ color: '#21658A', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                PASO 1: OBJETIVO EMPRESARIAL
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#104F75' }}>¿Qué quieres lograr con tu empresa?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Selecciona tu meta para mostrarte las soluciones con mayores beneficios.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {OBJECTIVES.map((obj) => {
                const IconComponent = obj.icon;
                const isSelected = selectedObjective.id === obj.id;

                return (
                  <div
                    key={obj.id}
                    onClick={() => {
                      setSelectedObjective(obj);
                      const recProd = PRODUCTS.find((p) => p.id === obj.recommendedProductId) || B2B_PRODUCTS[0];
                      setSelectedProduct(recProd);
                      setActiveStep(2);
                    }}
                    style={{
                      background: '#FFFFFF',
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
                        background: 'rgba(33, 101, 138, 0.15)',
                        color: '#104F75',
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
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {obj.desc}
                    </p>

                    {/* Benefits List */}
                    <div style={{ borderTop: '1px solid #D5E4ED', paddingTop: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#21658A', marginBottom: '0.35rem' }}>BENEFICIOS CLAVE:</div>
                      {obj.benefits.map((b, idx) => (
                        <div key={idx} style={{ fontSize: '0.78rem', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem' }}>
                          <CheckCircle2 size={12} color="#21658A" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#104F75', fontWeight: '700', fontSize: '0.82rem' }}>
                      <span>Elegir productos recomendados</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 2: PRODUCTOS CORPORATIVOS */}
        {activeStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#104F75' }}>
                  Paso 2: Soluciones para "{selectedObjective.name}"
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Selecciona la pieza corporativa que deseas personalizar con el logo de tu empresa.
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveStep(1)}
                style={{ borderColor: '#D5E4ED', color: '#104F75' }}
              >
                <ArrowLeft size={14} />
                <span>Cambiar Objetivo</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {B2B_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="card card-elevated"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D5E4ED',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: '#EDF4F8', color: '#104F75', border: '1px solid #D5E4ED' }}>
                        {prod.categoryName}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        Descuentos por Mayoreo
                      </span>
                    </div>

                    <div
                      style={{
                        height: '180px',
                        background: 'linear-gradient(135deg, #EDF4F8 0%, #D5E4ED 100%)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Building2 size={44} color="#21658A" style={{ opacity: 0.85 }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#104F75', marginTop: '0.5rem' }}>
                        Inserción de Logo 3D
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#104F75', marginBottom: '0.35rem' }}>
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {prod.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid #D5E4ED', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Precio Unitario Base:</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#104F75' }}>
                        {formatCurrency(prod.basePrice)}
                      </span>
                    </div>

                    <button
                      className="btn btn-empresas"
                      style={{ width: '100%', padding: '0.65rem' }}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setActiveStep(3);
                      }}
                    >
                      <Sparkles size={15} />
                      <span>Paso 3: Personalizar con mi Marca</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: PERSONALIZA TU MARCA EN 3D */}
        {activeStep === 3 && selectedProduct && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(300px, 0.8fr)', gap: '2rem' }}>
            
            {/* 3D Visualizer */}
            <div className="card card-elevated" style={{ padding: '0', background: '#ffffff', position: 'relative', overflow: 'hidden', height: '480px' }}>
              <ThreeViewer
                ref={viewerRef}
                modelType={selectedProduct.modelType || 'trophy'}
                selectedColor={selectedColor.hex}
                materialType="PLA_SILK"
                customText={customBrandText}
                fontFamily="Space Grotesk"
                showDimensions={true}
              />
            </div>

            {/* Controls */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#104F75', marginBottom: '0.4rem' }}>
                Paso 3: Configura el Grabado de "{selectedProduct.name}"
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Visualiza el texto de tu empresa y el color corporativo.
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#104F75', display: 'block', marginBottom: '0.4rem' }}>
                  NOMBRE O LEMA CORPORATIVO
                </label>
                <input
                  type="text"
                  maxLength={selectedProduct.maxCharacters || 24}
                  value={customBrandText}
                  onChange={(e) => setCustomBrandText(e.target.value)}
                  placeholder="Ej. GRUPO TECH"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #D5E4ED',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#104F75',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#104F75' }}>
                    COLOR CORPORATIVO
                  </label>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#21658A' }}>
                    {selectedColor.name}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {FILAMENT_COLORS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setSelectedColor(col)}
                      className={`swatch-btn ${selectedColor.id === col.id ? 'selected' : ''}`}
                      style={{ background: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              <button
                className="btn btn-empresas btn-lg"
                style={{ width: '100%', fontWeight: '800' }}
                onClick={() => setActiveStep(4)}
              >
                <span>Paso 4: Subir Archivo de Logotipo</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: ESPECIFICACIONES DE ARCHIVO Y UPLOADER */}
        {activeStep === 4 && (
          <div style={{ maxWidth: '750px', margin: '0 auto', background: '#FFFFFF', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#104F75', marginBottom: '0.5rem', textAlign: 'center' }}>
              Paso 4: Sube el Logotipo de tu Empresa
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
              Nuestro equipo técnico adaptará tu vector para extrusión tridimensional perfecta.
            </p>

            {/* Technical Specifications Guide */}
            <div style={{ background: '#EDF4F8', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', color: '#104F75', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <ShieldCheck size={18} color="#21658A" />
                <span>ESPECIFICACIONES TÉCNICAS REQUERIDAS:</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#4a5568', lineHeight: '1.6' }}>
                <li><strong>Formatos admitidos:</strong> Vectorial <code>.SVG</code> o <code>.AI</code> (Recomendado), o <code>.PNG</code> de alta resolución sin fondo.</li>
                <li><strong>Tamaño máximo de archivo:</strong> 25 MB por archivo.</li>
                <li><strong>Grosor de trazo mínimo:</strong> 0.8 mm para garantizar relieve físico nítido sin deformaciones.</li>
                <li><strong>Colores:</strong> El logo se adaptará al tono de filamento corporativo seleccionado.</li>
              </ul>
            </div>

            {/* Uploader Box */}
            <div style={{ border: '2px dashed #21658A', borderRadius: 'var(--radius-lg)', padding: '2.5rem', textAlign: 'center', background: '#FAFCFD', marginBottom: '2rem' }}>
              <Upload size={36} color="#21658A" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#104F75', marginBottom: '0.35rem' }}>
                {logoFile ? `Archivo Cargado: ${logoFile.name}` : 'Arrastra tu archivo aquí o haz clic para examinar'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
                Archivos SVG, AI, EPS, PDF o PNG (Máx 25 MB)
              </p>

              <input
                type="file"
                id="b2b-logo-input"
                accept=".svg,.ai,.eps,.pdf,.png"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="b2b-logo-input" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', borderColor: '#21658A', color: '#104F75', fontWeight: '700' }}>
                {logoFile ? 'Reemplazar Archivo' : 'Seleccionar Archivo'}
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, borderColor: '#D5E4ED', color: '#104F75' }}
                onClick={() => setActiveStep(3)}
              >
                <ArrowLeft size={16} />
                <span>Volver</span>
              </button>

              <button
                className="btn btn-empresas"
                style={{ flex: 1.5, fontWeight: '800' }}
                onClick={() => setActiveStep(5)}
              >
                <span>Paso 5: Cotizar por Volumen y Descargar PDF</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 5: CALCULADORA DE VOLUMEN Y DESCARGA DE COTIZACIÓN */}
        {activeStep === 5 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 0.8fr)', gap: '2rem' }}>
            
            {/* Left: Form */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#104F75', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={22} color="#21658A" />
                <span>Datos Fiscales & Volumen</span>
              </h2>

              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#104F75' }}>
                    VOLUMEN DE PRODUCCIÓN
                  </label>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#104F75' }}>
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
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Corporativo Innovación S.A."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    RFC (CFDI 4.0)
                  </label>
                  <input
                    type="text"
                    placeholder="CIN180425ABC"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Contacto / Compras
                  </label>
                  <input
                    type="text"
                    placeholder="Lic. Carlos Morales"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Correo Electrónico *
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
            </div>

            {/* Right: Summary & PDF Trigger */}
            <div style={{ background: '#FFFFFF', border: '1px solid #21658A', borderRadius: 'var(--radius-xl)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#104F75', letterSpacing: '0.04em' }}>
                    PRESUPUESTO FORMAL
                  </span>
                  <span style={{ background: 'rgba(33, 101, 138, 0.15)', color: '#104F75', fontSize: '0.75rem', fontWeight: '800', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                    {discountPercent}% AHORRO MAYOREO
                  </span>
                </div>

                <div style={{ borderBottom: '1px solid #D5E4ED', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    <span>Producto:</span>
                    <span style={{ fontWeight: '700', color: '#1A1A1A' }}>{selectedProduct.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#104F75', fontWeight: '700', marginBottom: '0.4rem' }}>
                    <span>Precio Unitario con Descuento:</span>
                    <span>{formatCurrency(unitPriceAfterDiscount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <span>Cantidad:</span>
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
                  <span>Paso 6: Descargar Cotización PDF</span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Comprobante formal con CLABE para transferencia SPEI BBVA.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 6: CONFIRMACIÓN */}
        {activeStep === 6 && (
          <div style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', background: '#FFFFFF', border: '1px solid #21658A', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(33, 101, 138, 0.15)', color: '#104F75', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#104F75', marginBottom: '0.5rem' }}>
              ¡Cotización Formal B2B Emitida!
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Hemos descargado tu archivo PDF y enviado una copia a <strong>{email}</strong>. Un especialista técnico de IdeaForm revisará tu archivo vectorial para validar la producción.
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
