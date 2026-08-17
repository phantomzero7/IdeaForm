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
  ShieldCheck,
  FileText,
  Printer,
  X,
  Eye,
  Type,
  Ban,
  Check
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

  // Stepper State (1 to 4)
  const [activeStep, setActiveStep] = useState(1);
  const [selectedObjective, setSelectedObjective] = useState(OBJECTIVES[0]);
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS.find((p) => p.subcollection === 'empresas') || PRODUCTS[0]);
  
  // Customization & Logo State
  const [customizationType, setCustomizationType] = useState('logo'); // 'logo' | 'text' | 'none'
  const [customBrandText, setCustomBrandText] = useState('MI EMPRESA');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [selectedColor, setSelectedColor] = useState(FILAMENT_COLORS[1]); // Azul Océano (#21658A)
  
  // Volume & Fiscal State
  const [units, setUnits] = useState(100);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [rfc, setRfc] = useState('');
  
  // Quote PDF Preview Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [generatedQuoteData, setGeneratedQuoteData] = useState(null);

  const STEPS = [
    { num: 1, label: '1. Objetivo' },
    { num: 2, label: '2. Productos' },
    { num: 3, label: '3. Personaliza & Logo' },
    { num: 4, label: '4. Cotización PDF' }
  ];

  const B2B_PRODUCTS = PRODUCTS.filter((p) => p.subcollection === 'empresas' || p.isCustomizable);

  // Pricing & Tier Calculation
  const currentTier = B2B_PRICE_TIERS.find((t) => units >= t.minUnits && units <= t.maxUnits) || B2B_PRICE_TIERS[0];
  const discountPercent = currentTier.discountPercent;
  const baseUnitPrice = selectedProduct ? selectedProduct.basePrice : 150;
  const unitPriceAfterDiscount = baseUnitPrice * (1 - discountPercent / 100);
  const subtotal = unitPriceAfterDiscount * units;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  // Handle Logo Upload & Convert to Object URL for 3D Viewport
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        showToast('El archivo supera el límite de 25 MB', 'error');
        return;
      }
      setLogoFile(file);
      const url = URL.createObjectURL(file);
      setLogoPreviewUrl(url);
      setCustomizationType('logo');
      showToast(`Logotipo "${file.name}" cargado en el visor 3D`, 'success');
    }
  };

  // Open Formal Quote PDF Modal
  const handleOpenQuoteModal = () => {
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
      productName: selectedProduct ? `${selectedProduct.name} ${customizationType === 'logo' ? '(Con Logotipo Grabado)' : customizationType === 'text' ? `(${customBrandText})` : '(Sin grabado)'}` : 'Artículo 3D Corporativo',
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

    setGeneratedQuoteData(quoteData);
    saveB2BQuote(quoteData);
    setIsQuoteModalOpen(true);
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (generatedQuoteData) {
      generateB2BQuotePDF(generatedQuoteData);
      showToast('¡Cotización PDF descargada!', 'success');
    }
  };

  // Print Quote
  const handlePrintQuote = () => {
    window.print();
  };

  return (
    <div style={{ background: '#EDF4F8', color: '#1A1A1A', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #D5E4ED', padding: '1.5rem 0' }}>
        <div className="container" style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
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

      {/* 2. Interactive Centered Stepper Bar */}
      <div className="container" style={{ maxWidth: '1140px', margin: '0 auto', paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
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

        {/* PASO 2: SELECCIÓN DE PRODUCTO CORPORATIVO */}
        {activeStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#104F75' }}>
                  Paso 2: Soluciones para "{selectedObjective.name}"
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Selecciona la pieza corporativa que deseas personalizar.
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
              {B2B_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="card card-elevated"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D5E4ED',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: '#EDF4F8', color: '#104F75', border: '1px solid #D5E4ED' }}>
                        {prod.categoryName || 'Corporativo'}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        Descuentos por Mayoreo
                      </span>
                    </div>

                    <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#EDF4F8', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building2 size={48} color="#21658A" style={{ opacity: 0.8 }} />
                      )}

                      <span
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: '#104F75',
                          color: '#ffffff',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <ShieldCheck size={11} />
                        <span>B2B SAT CFDI</span>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#104F75', marginBottom: '0.35rem' }}>
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
                      {prod.desc || prod.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid #D5E4ED', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Por unidad (volumen)</span>
                      <strong style={{ fontSize: '1.25rem', color: '#104F75', fontWeight: '800' }}>
                        {formatCurrency(prod.basePrice)}
                      </strong>
                    </div>

                    <button
                      className="btn btn-empresas"
                      style={{ width: '100%', fontWeight: '800' }}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setActiveStep(3);
                      }}
                    >
                      <span>Personalizar y Cotizar</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: FUSIÓN DE PERSONALIZACIÓN Y CARGA DE LOGOTIPO EN VIVO */}
        {activeStep === 3 && selectedProduct && (
          <div className="customizer-split-responsive">
            
            {/* Left: 3D Stage with Live Logo Overlay */}
            <div className="card card-elevated stage-3d-box" style={{ padding: '0', background: '#ffffff', position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
              <ThreeViewer
                ref={viewerRef}
                modelType={selectedProduct.modelType || 'trophy'}
                custom3DFileUrl={selectedProduct.custom3DFileUrl}
                custom3DFileType={selectedProduct.custom3DFileType}
                selectedColor={selectedColor?.hex || selectedColor || '#21658A'}
                materialType="PLA_SILK"
                customText={customizationType === 'text' ? customBrandText : customizationType === 'none' ? '' : 'IDEAFORM'}
                logoImage={customizationType === 'logo' ? logoPreviewUrl : null}
                noEngraving={customizationType === 'none'}
                fontFamily="Space Grotesk"
                showDimensions={true}
              />

              {/* Status pill overlay on canvas */}
              <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(255, 255, 255, 0.9)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', color: '#104F75', boxShadow: 'var(--shadow-sm)' }}>
                {customizationType === 'logo' && (logoFile ? `🖼️ Logo: ${logoFile.name}` : '🖼️ Modo Logotipo Activo')}
                {customizationType === 'text' && `✍️ Texto: "${customBrandText}"`}
                {customizationType === 'none' && '🛡️ Pieza Lisa Sin Grabado'}
              </div>
            </div>

            {/* Right: Unified Controls Sidebar */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#104F75', margin: 0 }}>
                  Personalización en Vivo
                </h2>
                <span className="badge" style={{ background: '#EDF4F8', color: '#104F75' }}>
                  {selectedProduct.name}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
                Elige cómo deseas estampar la identidad de tu empresa en la pieza 3D.
              </p>

              {/* 1. Customization Mode Switcher */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#104F75', display: 'block', marginBottom: '0.4rem' }}>
                  1. TIPO DE GRABADO CORPORATIVO
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                  <button
                    onClick={() => setCustomizationType('logo')}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: 'var(--radius-md)',
                      border: customizationType === 'logo' ? '2px solid #21658A' : '1px solid #D5E4ED',
                      background: customizationType === 'logo' ? 'rgba(33, 101, 138, 0.1)' : '#ffffff',
                      color: customizationType === 'logo' ? '#104F75' : '#555',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Upload size={16} />
                    <span>Con Logotipo</span>
                  </button>

                  <button
                    onClick={() => setCustomizationType('text')}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: 'var(--radius-md)',
                      border: customizationType === 'text' ? '2px solid #21658A' : '1px solid #D5E4ED',
                      background: customizationType === 'text' ? 'rgba(33, 101, 138, 0.1)' : '#ffffff',
                      color: customizationType === 'text' ? '#104F75' : '#555',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Type size={16} />
                    <span>Sólo Texto</span>
                  </button>

                  <button
                    onClick={() => setCustomizationType('none')}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: 'var(--radius-md)',
                      border: customizationType === 'none' ? '2px solid #21658A' : '1px solid #D5E4ED',
                      background: customizationType === 'none' ? 'rgba(33, 101, 138, 0.1)' : '#ffffff',
                      color: customizationType === 'none' ? '#104F75' : '#555',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Ban size={16} />
                    <span>Sin Grabado</span>
                  </button>
                </div>
              </div>

              {/* 2. File Uploader Box (if 'logo') */}
              {customizationType === 'logo' && (
                <div style={{ marginBottom: '1.5rem', border: '2px dashed #21658A', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center', background: '#FAFCFD' }}>
                  <Upload size={24} color="#21658A" style={{ margin: '0 auto 0.4rem auto' }} />
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#104F75', marginBottom: '0.2rem' }}>
                    {logoFile ? `Logo: ${logoFile.name}` : 'Sube tu logotipo (.SVG, .AI, .PNG)'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                    Máx 25 MB • Trazo mín 0.8mm para óptimo relieve 3D
                  </div>

                  <input
                    type="file"
                    id="b2b-live-logo-input"
                    accept=".svg,.ai,.eps,.pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="b2b-live-logo-input" className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', borderColor: '#21658A', color: '#104F75', fontWeight: '700', fontSize: '0.78rem' }}>
                    {logoFile ? 'Reemplazar Archivo' : 'Explorar Archivo'}
                  </label>
                </div>
              )}

              {/* 3. Text Input (if 'text') */}
              {customizationType === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#104F75', display: 'block', marginBottom: '0.4rem' }}>
                    TEXTO O SIGLAS CORPORATIVAS
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    value={customBrandText}
                    onChange={(e) => setCustomBrandText(e.target.value)}
                    placeholder="Ej. GRUPO EXPAC"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #D5E4ED',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: '#104F75',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {/* 4. Color Swatches */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#104F75' }}>
                    COLOR DE FILAMENTO CORPORATIVO
                  </label>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#21658A' }}>
                    {selectedColor?.name || 'Color Seleccionado'}
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

              {/* Action */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, borderColor: '#D5E4ED', color: '#104F75' }}
                  onClick={() => setActiveStep(2)}
                >
                  <ArrowLeft size={16} />
                  <span>Volver</span>
                </button>

                <button
                  className="btn btn-empresas"
                  style={{ flex: 1.75, fontWeight: '800' }}
                  onClick={() => setActiveStep(4)}
                >
                  <span>Paso 4: Cotizar por Volumen</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 4: CALCULADORA DE VOLUMEN & FORMULARIO FISCAL */}
        {activeStep === 4 && (
          <div className="customizer-split-responsive" style={{ alignItems: 'start' }}>
            
            {/* Left: Fiscal Form */}
            <div style={{ background: '#FFFFFF', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-xl)', padding: '2.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#104F75', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
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
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
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
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
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
                    style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', background: '#EDF4F8', border: '1px solid #D5E4ED', color: '#1A1A1A', fontSize: '0.85rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Balanced Summary & PDF Trigger */}
            <div style={{ background: '#FFFFFF', border: '1px solid #21658A', borderRadius: 'var(--radius-xl)', padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                  onClick={handleOpenQuoteModal}
                >
                  <Eye size={18} />
                  <span>Ver y Descargar Cotización PDF</span>
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Visualiza el documento oficial antes de imprimir o guardar.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODAL DE PREVISUALIZACIÓN DE COTIZACIÓN FORMAL PDF */}
      {isQuoteModalOpen && generatedQuoteData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setIsQuoteModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
              padding: '2.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #D5E4ED', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-primary" style={{ background: '#21658A', color: '#ffffff' }}>
                    DOCUMENTO OFICIAL
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#104F75' }}>
                    Folio: {generatedQuoteData.quoteNumber}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1A1A1A', margin: 0 }}>
                  Cotización Formal B2B — IdeaForm
                </h2>
              </div>

              <button
                onClick={() => setIsQuoteModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Document Body Preview */}
            <div style={{ background: '#FAFCFD', border: '1px solid #D5E4ED', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '700' }}>EMITIDO A:</div>
                  <div style={{ fontWeight: '800', color: '#104F75' }}>{generatedQuoteData.companyName}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>RFC: {generatedQuoteData.rfc}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Contacto: {generatedQuoteData.contactName}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Email: {generatedQuoteData.email}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: '700' }}>FECHA & VIGENCIA:</div>
                  <div style={{ fontWeight: '700', color: '#1A1A1A' }}>{generatedQuoteData.date}</div>
                  <div style={{ color: '#059669', fontWeight: '700', fontSize: '0.78rem' }}>Vigencia: 15 Días Naturales</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>CFDI 4.0: Gastos en General (G03)</div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                <thead>
                  <tr style={{ background: '#EDF4F8', color: '#104F75', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem', borderRadius: '4px 0 0 4px' }}>Concepto</th>
                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Cant.</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>P. Unit</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right', borderRadius: '0 4px 4px 0' }}>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #D5E4ED' }}>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <div style={{ fontWeight: '700', color: '#1A1A1A' }}>{generatedQuoteData.productName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Manufactura aditiva en PLA Seda Premium</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'center', fontWeight: '700' }}>{generatedQuoteData.units}</td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>{formatCurrency(unitPriceAfterDiscount)}</td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', fontWeight: '800', color: '#104F75' }}>{formatCurrency(subtotal)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '240px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                    <span style={{ fontWeight: '700' }}>{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>IVA (16%):</span>
                    <span style={{ fontWeight: '700' }}>{formatCurrency(iva)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: '800', color: '#104F75', borderTop: '1px solid #D5E4ED', paddingTop: '0.5rem' }}>
                    <span>Total Neto:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* SPEI Wire Transfer Info */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #D5E4ED', fontSize: '0.78rem', color: '#475569' }}>
                <strong>🏦 Datos de Pago por Transferencia Electrónica SPEI:</strong>
                <div>Banco: BBVA México | Beneficiario: IdeaForm 3D S.A.P.I. de C.V.</div>
                <div>CLABE Interbancaria: <strong>0121 8000 1234 5678 90</strong></div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={handlePrintQuote}
                style={{ borderColor: '#D5E4ED', color: '#104F75', fontWeight: '700' }}
              >
                <Printer size={16} />
                <span>Imprimir</span>
              </button>

              <button
                className="btn btn-empresas btn-lg"
                onClick={handleDownloadPDF}
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FileDown size={18} />
                <span>Descargar Archivo PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpresasRoute;
