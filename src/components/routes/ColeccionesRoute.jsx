import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, SUBCOLLECTIONS, FILAMENT_COLORS, DEFAULT_COLOR_PRESETS } from '../../data/mockData';
import ThreeViewer from '../3d/ThreeViewer';
import { formatCurrency, formatGrams } from '../../utils/formatters';
import {
  Box,
  GraduationCap,
  Briefcase,
  Home,
  User,
  Smile,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShoppingBag,
  Gift,
  ImageIcon,
  ShieldCheck,
  Truck,
  Palette,
  Layers,
  Check
} from 'lucide-react';
import IdeaFormLogo from '../common/IdeaFormLogo';

const FONTS_LIST = [
  { id: 'Poppins', name: 'Poppins Moderna' },
  { id: 'Space Grotesk', name: 'Tech Grotesk' },
  { id: 'Playfair Display', name: 'Serif Elegante' },
  { id: 'Dancing Script', name: 'Cursiva Signature' }
];

const toColorObj = (c, defaultName = 'Color') => {
  if (c && typeof c === 'object' && c.hex) {
    return {
      id: c.id || `col-${c.hex}`,
      name: c.name || defaultName,
      hex: String(c.hex),
      priceMultiplier: c.priceMultiplier || 1.0
    };
  }
  if (typeof c === 'string' && c) {
    const clean = c.toLowerCase();
    const found = FILAMENT_COLORS.find((f) => (f?.hex && String(f.hex).toLowerCase() === clean) || (f?.id && String(f.id).toLowerCase() === clean));
    if (found) return found;
    return { id: `col-${c}`, name: defaultName, hex: c, priceMultiplier: 1.0 };
  }
  return FILAMENT_COLORS[0] || { id: 'col-default', name: defaultName, hex: '#176B87', priceMultiplier: 1.0 };
};

const ColeccionesRoute = () => {
  const { navigateTo, addToCart, showToast, products, filamentInventory, isColorAvailable, isComboAvailable } = useApp();
  const viewerRef = useRef(null);

  const availableProducts = products || PRODUCTS;
  const availableFilaments = (filamentInventory && filamentInventory.length > 0) ? filamentInventory : FILAMENT_COLORS;

  // Stepper State (1 to 6)
  const [activeStep, setActiveStep] = useState(1);
  const [selectedSubcollection, setSelectedSubcollection] = useState('escolar');

  // Customization State for Chosen Product
  const [selectedProduct, setSelectedProduct] = useState(availableProducts[0] || PRODUCTS[0]);
  const [customText, setCustomText] = useState('VALENTINA');
  const [selectedFont, setSelectedFont] = useState('Poppins');

  // Multi-Layer Color State (Nike By You style)
  const [activeLayer, setActiveLayer] = useState('BASE'); // 'BASE' | 'ACCENT' | 'RELIEF'
  const [selectedBaseColor, setSelectedBaseColor] = useState(availableFilaments[0] || FILAMENT_COLORS[0]);
  const [selectedAccentColor, setSelectedAccentColor] = useState(availableFilaments[1] || FILAMENT_COLORS[1] || FILAMENT_COLORS[0]);
  const [selectedReliefColor, setSelectedReliefColor] = useState(availableFilaments[2] || FILAMENT_COLORS[2] || FILAMENT_COLORS[0]);

  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [quantity, setQuantity] = useState(1);
  const [includeGiftBox, setIncludeGiftBox] = useState(false);

  const safeBaseColor = toColorObj(selectedBaseColor, 'Color Base');
  const safeAccentColor = toColorObj(selectedAccentColor, 'Color Acento');
  const safeReliefColor = toColorObj(selectedReliefColor, 'Color Relieve');
  const currentLayerColor = activeLayer === 'BASE' ? safeBaseColor : activeLayer === 'ACCENT' ? safeAccentColor : safeReliefColor;

  const STEPS = [
    { num: 1, label: '1. Colección' },
    { num: 2, label: '2. Productos' },
    { num: 3, label: '3. Personaliza' },
    { num: 4, label: '4. Vista previa' },
    { num: 5, label: '5. Paquete' },
    { num: 6, label: '6. Carrito' }
  ];

  // Filter Products accurately by subcollection
  const filteredProducts = selectedSubcollection === 'all'
    ? availableProducts.filter((p) => p.subcollection !== 'empresas' && p.subcollection !== 'eventos' && p.isActive !== false)
    : availableProducts.filter((p) => p.subcollection === selectedSubcollection && p.isActive !== false);

  // Price calculations
  const unitPrice = selectedProduct ? selectedProduct.basePrice * (safeBaseColor?.priceMultiplier || 1.0) : 85;
  const giftBoxPrice = includeGiftBox ? 35.00 : 0;
  const subtotal = (unitPrice + giftBoxPrice) * quantity;

  // Handle Product Selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product.colorPresets && product.colorPresets.length > 0) {
      const firstAvail = product.colorPresets.find((p) => isComboAvailable(p).available) || product.colorPresets[0];
      if (firstAvail) {
        setSelectedBaseColor(toColorObj(firstAvail.baseColor, 'Color Base'));
        setSelectedAccentColor(toColorObj(firstAvail.accentColor, 'Color Acento'));
        setSelectedReliefColor(toColorObj(firstAvail.reliefColor, 'Color Relieve'));
      }
    }
    if (product.isCustomizable) {
      setActiveStep(3); // Go to Personaliza step
    } else {
      setActiveStep(5); // Go straight to Paquete / Quantity
    }
  };

  const handleColorSelect = (col) => {
    const validCol = toColorObj(col, 'Color');
    if (activeLayer === 'BASE') {
      setSelectedBaseColor(validCol);
    } else if (activeLayer === 'ACCENT') {
      setSelectedAccentColor(validCol);
    } else {
      setSelectedReliefColor(validCol);
    }
  };

  // Add to Cart from Funnel
  const handleFinalAddToCart = () => {
    let snapshotUrl = null;
    if (viewerRef.current && viewMode === '3D') {
      snapshotUrl = viewerRef.current.getSnapshot();
    }

    const cartItem = {
      ...selectedProduct,
      id: `${selectedProduct.id}-custom-${Date.now()}`,
      originalId: selectedProduct.id,
      name: selectedProduct.isCustomizable ? `${selectedProduct.name} (${customText})` : selectedProduct.name,
      customText: selectedProduct.isCustomizable ? customText : null,
      fontFamily: selectedFont,
      selectedBaseColor: toColorObj(selectedBaseColor, 'Color Base'),
      selectedAccentColor: toColorObj(selectedAccentColor, 'Color Acento'),
      selectedReliefColor: toColorObj(selectedReliefColor, 'Color Relieve'),
      selectedColor: {
        id: toColorObj(selectedBaseColor, 'Color Base').id,
        name: `${toColorObj(selectedBaseColor, 'Color Base').name} / ${toColorObj(selectedAccentColor, 'Color Acento').name} / ${toColorObj(selectedReliefColor, 'Color Relieve').name}`,
        hex: toColorObj(selectedBaseColor, 'Color Base').hex
      },
      includeGiftBox,
      finalUnitPrice: unitPrice + giftBoxPrice,
      quantity,
      snapshotUrl,
      weightGrams: selectedProduct.filamentGrams || selectedProduct.weightGrams || 25,
      printTimeMins: selectedProduct.printTimeMins || 40
    };

    addToCart(cartItem);
    setActiveStep(6);
  };

  return (
    <div style={{ background: '#FAEEEB', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #F0D7D2', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#C9685B',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.82rem',
                padding: '0.3rem 0.8rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              COLECCIONES
            </span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#A94D43', margin: 0 }}>
              Personalizador Multi-Capa 3D
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('home')}>
              ← Volver al Inicio
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        
        {/* 2. Enhanced Horizontal Stepper (Paso 1 al 6) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 2rem',
            border: '1px solid #F0D7D2',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '2.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflowX: 'auto',
            gap: '1rem'
          }}
        >
          {STEPS.map((s, idx) => {
            const isCompleted = activeStep > s.num;
            const isActive = activeStep === s.num;

            return (
              <React.Fragment key={s.num}>
                <button
                  className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => {
                    if (s.num <= activeStep) {
                      setActiveStep(s.num);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: s.num <= activeStep ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    minWidth: '70px',
                    zIndex: 2
                  }}
                >
                  <div
                    className="stepper-circle"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      background: isActive ? '#A94D43' : isCompleted ? '#C9685B' : '#F0D7D2',
                      color: isActive || isCompleted ? '#ffffff' : '#A94D43',
                      boxShadow: isActive ? '0 0 0 4px rgba(169, 77, 67, 0.15)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : s.num}
                  </div>
                  <div
                    className="stepper-label"
                    style={{
                      color: isActive ? '#A94D43' : isCompleted ? '#C9685B' : '#94a3b8',
                      fontWeight: isActive ? '800' : '600',
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {s.label}
                  </div>
                </button>

                {/* Connecting bar between steps */}
                {idx < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: '3px',
                      background: isCompleted ? '#C9685B' : '#F0D7D2',
                      marginBottom: '1.2rem',
                      minWidth: '20px'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* PASO 1: SELECCIONA COLECCIÓN */}
        {activeStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#A94D43' }}>Paso 1: Selecciona tu Colección</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Elige la categoría de artículos que deseas explorar.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              {SUBCOLLECTIONS.filter((s) => s.id !== 'all').map((sub) => {
                const isSelected = selectedSubcollection === sub.id;

                return (
                  <div
                    key={sub.id}
                    className="card"
                    onClick={() => {
                      setSelectedSubcollection(sub.id);
                      setActiveStep(2);
                    }}
                    style={{
                      padding: '1.75rem',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #C9685B' : '1px solid #F0D7D2',
                      background: '#FFFFFF',
                      transition: 'all 0.2s ease',
                      borderRadius: 'var(--radius-xl)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(201, 104, 91, 0.15)',
                        color: '#A94D43',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Box size={22} />
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.35rem' }}>
                      {sub.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                      {sub.desc}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#C9685B', fontWeight: '700' }}>
                      <span>Ver Productos</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 2: PRODUCTOS DISPONIBLES */}
        {activeStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#A94D43' }}>
                  Paso 2: Productos en {SUBCOLLECTIONS.find((s) => s.id === selectedSubcollection)?.name || 'Colección'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Selecciona la pieza que deseas personalizar o configurar.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveStep(1)}
                  style={{ borderColor: '#F0D7D2', color: '#A94D43' }}
                >
                  ← Cambiar Colección
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="card card-elevated"
                  style={{
                    padding: '1.5rem',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid #F0D7D2',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <div>
                    <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#FAEEEB', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Box size={48} color="#C9685B" style={{ opacity: 0.8 }} />
                      )}

                      {product.isCustomizable && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '0.75rem',
                            right: '0.75rem',
                            background: '#A94D43',
                            color: '#ffffff',
                            padding: '0.2rem 0.55rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          <Sparkles size={11} />
                          <span>Personalizable</span>
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.35rem' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1rem' }}>
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid #F0D7D2', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Desde</span>
                      <strong style={{ fontSize: '1.25rem', color: '#A94D43', fontWeight: '800' }}>
                        {formatCurrency(product.basePrice)}
                      </strong>
                    </div>

                    <button
                      className="btn btn-colecciones"
                      style={{ width: '100%', padding: '0.65rem' }}
                      onClick={() => handleSelectProduct(product)}
                    >
                      {product.isCustomizable ? (
                        <>
                          <Sparkles size={15} />
                          <span>Paso 3: Personalizar Pieza</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} />
                          <span>Configurar y Comprar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: PERSONALIZA TU PIEZA SELECCIONADA CON ZONAS MULTI-COLOR */}
        {activeStep === 3 && selectedProduct && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(300px, 0.8fr)', gap: '2rem' }}>
            
            {/* Left: 2D/3D Live Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card card-elevated" style={{ padding: '0', background: '#ffffff', position: 'relative', overflow: 'hidden', height: '490px', borderRadius: 'var(--radius-xl)', border: '1px solid #F0D7D2' }}>
                
                {/* 2D / 3D Toggle */}
                {selectedProduct.has3d !== false && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 30, display: 'flex', background: 'rgba(255,255,255,0.95)', padding: '0.2rem', borderRadius: 'var(--radius-full)', border: '1px solid #F0D7D2' }}>
                    <button
                      onClick={() => setViewMode('3D')}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        background: viewMode === '3D' ? '#A94D43' : 'transparent',
                        color: viewMode === '3D' ? '#ffffff' : '#A94D43',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Vista 3D
                    </button>
                    <button
                      onClick={() => setViewMode('2D')}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        background: viewMode === '2D' ? '#A94D43' : 'transparent',
                        color: viewMode === '2D' ? '#ffffff' : '#A94D43',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Foto 2D
                    </button>
                  </div>
                )}

                {viewMode === '3D' && selectedProduct.has3d !== false ? (
                  <ThreeViewer
                    ref={viewerRef}
                    modelType={selectedProduct.modelType || 'keychain'}
                    custom3DFileUrl={selectedProduct.custom3DFileUrl}
                    custom3DFileType={selectedProduct.custom3DFileType}
                    baseColor={safeBaseColor.hex}
                    accentColor={safeAccentColor.hex}
                    reliefColor={safeReliefColor.hex}
                    materialType="PLA_SILK"
                    customText={customText}
                    fontFamily={selectedFont}
                    showDimensions={true}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAEEEB', padding: '2rem', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '240px',
                        height: '240px',
                        borderRadius: 'var(--radius-xl)',
                        background: safeBaseColor.hex,
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-lg)',
                        marginBottom: '1.25rem',
                        border: `4px solid ${safeAccentColor.hex}`,
                        padding: '1rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ transform: 'scale(0.85)', marginBottom: '0.75rem' }}>
                        <IdeaFormLogo size="small" lightMode={true} showTagline={false} />
                      </div>
                      <div
                        style={{
                          fontWeight: '900',
                          fontSize: '1.2rem',
                          fontFamily: selectedFont,
                          color: safeReliefColor.hex,
                          textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                          wordBreak: 'break-word',
                          textAlign: 'center'
                        }}
                      >
                        {customText || 'IDEAFORM'}
                      </div>
                    </div>
                    <div style={{ fontWeight: '800', color: '#A94D43' }}>{selectedProduct?.name || 'Producto'}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Customization Controls */}
            <div style={{ background: '#ffffff', border: '1px solid #F0D7D2', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.3rem' }}>
                Paso 3: Personaliza "{selectedProduct.name}"
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Escribe tu grabado 3D y personaliza los colores de cada capa o detalle.
              </p>

              {/* Text Engraving */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#A94D43', display: 'block', marginBottom: '0.4rem' }}>
                  TEXTO EN RELIEVE 3D
                </label>
                <input
                  type="text"
                  maxLength={selectedProduct.maxCharacters || 18}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Tu nombre o frase..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #F0D7D2',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#A94D43',
                    outline: 'none',
                    marginBottom: '0.75rem'
                  }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {FONTS_LIST.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFont(f.id)}
                      style={{
                        padding: '0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedFont === f.id ? '2px solid #A94D43' : '1px solid #F0D7D2',
                        background: selectedFont === f.id ? '#FAEEEB' : '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        color: selectedFont === f.id ? '#A94D43' : '#666',
                        cursor: 'pointer'
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color Customization: Predefined Combos (Option 1, Option 2...) vs Free Layer Selection */}
              <div style={{ marginBottom: '1.5rem', background: '#FAEEEB', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #F0D7D2' }}>
                
                {selectedProduct.colorMode === 'PRESETS' || (selectedProduct.colorPresets && selectedProduct.colorPresets.length > 0) ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <Palette size={16} color="#A94D43" />
                      <strong style={{ fontSize: '0.85rem', color: '#A94D43' }}>
                        ELIGE TU COMBINACIÓN DE COLORES:
                      </strong>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, marginBottom: '0.85rem' }}>
                      Selecciona una de las combinaciones predefinidas creadas por IdeaForm para esta pieza:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {(selectedProduct.colorPresets || DEFAULT_COLOR_PRESETS).map((combo, cIdx) => {
                        const availability = isComboAvailable(combo);
                        const getHex = (c) => (c?.hex || c || '').toLowerCase();
                        const baseHex = combo.baseColor?.hex || combo.baseColor || '#176B87';
                        const accentHex = combo.accentColor?.hex || combo.accentColor || '#D4AF37';
                        const reliefHex = combo.reliefColor?.hex || combo.reliefColor || '#FFFFFF';

                        const isComboSelected =
                          availability.available &&
                          getHex(selectedBaseColor) === getHex(baseHex) &&
                          getHex(selectedAccentColor) === getHex(accentHex) &&
                          getHex(selectedReliefColor) === getHex(reliefHex);

                        return (
                          <div
                            key={combo.id || cIdx}
                            onClick={() => {
                              if (!availability.available) {
                                showToast(`Esta combinación está agotada (Falta: ${availability.missingColors.join(', ')})`, 'error');
                                return;
                              }
                              setSelectedBaseColor(toColorObj(combo.baseColor, 'Base'));
                              setSelectedAccentColor(toColorObj(combo.accentColor, 'Acento'));
                              setSelectedReliefColor(toColorObj(combo.reliefColor, 'Letras'));
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: !availability.available ? '#f8fafc' : isComboSelected ? '#ffffff' : 'rgba(255,255,255,0.7)',
                              border: !availability.available ? '1px dashed #cbd5e1' : isComboSelected ? '2px solid #A94D43' : '1px solid #F0D7D2',
                              borderRadius: 'var(--radius-md)',
                              padding: '0.75rem 1rem',
                              cursor: availability.available ? 'pointer' : 'not-allowed',
                              opacity: availability.available ? 1 : 0.6,
                              boxShadow: isComboSelected ? '0 4px 12px rgba(169, 77, 67, 0.12)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              {/* 3 Layer Mini Swatches */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: baseHex, border: '1.5px solid rgba(0,0,0,0.2)' }} />
                                  <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Base</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: accentHex, border: '1.5px solid rgba(0,0,0,0.2)' }} />
                                  <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Acento</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                  <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: reliefHex, border: '1.5px solid rgba(0,0,0,0.2)' }} />
                                  <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Letras</span>
                                </div>
                              </div>

                              <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: !availability.available ? '#94a3b8' : isComboSelected ? '#A94D43' : '#0F172A' }}>
                                  {combo.name}
                                </div>
                                {availability.available ? (
                                  combo.description && (
                                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                      {combo.description}
                                    </div>
                                  )
                                ) : (
                                  <div style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: '700' }}>
                                    ⚠️ Agotado Temporalmente (Falta filamento: {availability.missingColors.join(', ')})
                                  </div>
                                )}
                              </div>
                            </div>

                            {availability.available ? (
                              <div
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '50%',
                                  border: isComboSelected ? '2px solid #A94D43' : '2px solid #cbd5e1',
                                  background: isComboSelected ? '#A94D43' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#ffffff'
                                }}
                              >
                                {isComboSelected && <Check size={14} strokeWidth={3} />}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#fee2e2', color: '#dc2626' }}>
                                NO DISPONIBLE
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                      <Layers size={16} color="#A94D43" />
                      <strong style={{ fontSize: '0.82rem', color: '#A94D43' }}>
                        SELECCIONA LA CAPA A COLOREAR:
                      </strong>
                    </div>

                    {/* Layer Selector Tabs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '1rem' }}>
                      <button
                        onClick={() => setActiveLayer('BASE')}
                        style={{
                          padding: '0.5rem 0.3rem',
                          borderRadius: 'var(--radius-md)',
                          border: activeLayer === 'BASE' ? '2px solid #A94D43' : '1px solid #F0D7D2',
                          background: activeLayer === 'BASE' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          color: activeLayer === 'BASE' ? '#A94D43' : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: safeBaseColor.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                        <span>1. Base</span>
                      </button>

                      <button
                        onClick={() => setActiveLayer('ACCENT')}
                        style={{
                          padding: '0.5rem 0.3rem',
                          borderRadius: 'var(--radius-md)',
                          border: activeLayer === 'ACCENT' ? '2px solid #A94D43' : '1px solid #F0D7D2',
                          background: activeLayer === 'ACCENT' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          color: activeLayer === 'ACCENT' ? '#A94D43' : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: safeAccentColor.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                        <span>2. Acento</span>
                      </button>

                      <button
                        onClick={() => setActiveLayer('RELIEF')}
                        style={{
                          padding: '0.5rem 0.3rem',
                          borderRadius: 'var(--radius-md)',
                          border: activeLayer === 'RELIEF' ? '2px solid #A94D43' : '1px solid #F0D7D2',
                          background: activeLayer === 'RELIEF' ? '#ffffff' : 'rgba(255,255,255,0.6)',
                          color: activeLayer === 'RELIEF' ? '#A94D43' : '#64748b',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: safeReliefColor.hex, border: '1px solid rgba(0,0,0,0.2)' }} />
                        <span>3. Letras 3D</span>
                      </button>
                    </div>

                    {/* Active Layer Filament Color Swatches */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Color para {activeLayer === 'BASE' ? 'Base' : activeLayer === 'ACCENT' ? 'Acento' : 'Letras 3D'}:
                      </span>
                      <strong style={{ fontSize: '0.8rem', color: '#A94D43' }}>
                        {currentLayerColor?.name || 'Color'}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                      {availableFilaments.filter((f) => !f.isArchived).map((col) => {
                        const isAvail = isColorAvailable(col.id || col.hex);

                        return (
                          <button
                            key={col.id}
                            disabled={!isAvail}
                            onClick={() => handleColorSelect(col)}
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: col.hex,
                              border: currentLayerColor?.id === col.id ? '3px solid #A94D43' : isAvail ? '2px solid rgba(0,0,0,0.15)' : '2px dashed #dc2626',
                              boxShadow: currentLayerColor?.id === col.id ? '0 0 0 2px #ffffff' : 'none',
                              cursor: isAvail ? 'pointer' : 'not-allowed',
                              opacity: isAvail ? 1 : 0.35,
                              transition: 'transform 0.15s ease',
                              position: 'relative'
                            }}
                            title={`${col.name} ${!isAvail ? '(Agotado o Bloqueado)' : `(${col.stockGrams}g disponibles)`}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Next Step */}
              <button
                className="btn btn-colecciones btn-lg"
                style={{ width: '100%', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setActiveStep(4)}
              >
                <span>Paso 4: Ver Vista Previa y Medidas</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: VISTA PREVIA TÉCNICA & MEDIDAS */}
        {activeStep === 4 && selectedProduct && (
          <div style={{ maxWidth: '850px', margin: '0 auto', background: '#FFFFFF', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid #F0D7D2' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="badge" style={{ background: '#FAEEEB', color: '#A94D43', marginBottom: '0.5rem' }}>
                HOJA DE ESPECIFICACIONES 3D
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#A94D43' }}>
                Paso 4: Vista Previa y Medidas de Fabricación
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Verifica las dimensiones, colores de cada capa y el grabado antes de continuar.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ height: '320px', background: '#FAEEEB', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
                <ThreeViewer
                  modelType={selectedProduct.modelType || 'keychain'}
                  custom3DFileUrl={selectedProduct.custom3DFileUrl}
                  custom3DFileType={selectedProduct.custom3DFileType}
                  baseColor={selectedBaseColor?.hex || selectedBaseColor || '#176B87'}
                  accentColor={selectedAccentColor?.hex || selectedAccentColor || '#D4AF37'}
                  reliefColor={selectedReliefColor?.hex || selectedReliefColor || '#FFFFFF'}
                  customText={customText}
                  fontFamily={selectedFont}
                  showDimensions={false}
                />
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#A94D43', marginBottom: '1rem' }}>
                  {selectedProduct.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0D7D2', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Grabado 3D:</span>
                    <strong>"{customText}"</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0D7D2', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Tipografía:</span>
                    <strong>{FONTS_LIST.find((f) => f.id === selectedFont)?.name || selectedFont}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0D7D2', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Capa 1 (Base):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: safeBaseColor.hex }} />
                      <strong>{safeBaseColor.name}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0D7D2', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Capa 2 (Acento):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: safeAccentColor.hex }} />
                      <strong>{safeAccentColor.name}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0D7D2', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Capa 3 (Relieve 3D):</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: safeReliefColor.hex }} />
                      <strong>{safeReliefColor.name}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F0D7D2', paddingBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Dimensiones:</span>
                    <strong>85 mm x 30 mm x 4 mm</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveStep(3)}>
                    ← Editar Grabado o Colores
                  </button>
                  <button className="btn btn-colecciones btn-sm" style={{ flex: 1 }} onClick={() => setActiveStep(5)}>
                    Avanzar a Paso 5 →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: OPCIONES DE PAQUETE, REGALO Y CANTIDAD */}
        {activeStep === 5 && selectedProduct && (
          <div style={{ maxWidth: '680px', margin: '0 auto', background: '#FFFFFF', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid #F0D7D2' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.4rem', textAlign: 'center' }}>
              Paso 5: Selecciona Cantidad y Presentación
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2rem', textAlign: 'center' }}>
              Añade una caja de regalo premium o incrementa el número de piezas con descuento.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
              
              {/* Gift Box Addon */}
              <div
                style={{
                  border: includeGiftBox ? '2px solid #A94D43' : '1px solid #F0D7D2',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: includeGiftBox ? '#FAEEEB' : '#ffffff'
                }}
                onClick={() => setIncludeGiftBox(!includeGiftBox)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Gift size={28} color="#A94D43" />
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#A94D43' }}>Caja de Regalo IdeaForm (+ $35.00 MXN)</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Incluye empaque rígido kraft, listón de tela y tarjeta personalizada.</div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={includeGiftBox}
                  onChange={() => {}}
                  style={{ width: '18px', height: '18px', accentColor: '#A94D43' }}
                />
              </div>

              {/* Quantity Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAEEEB', padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontWeight: '700', color: '#A94D43' }}>Cantidad de Piezas:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #F0D7D2', background: '#ffffff', fontWeight: '800', cursor: 'pointer', color: '#A94D43' }}
                  >
                    -
                  </button>
                  <strong style={{ fontSize: '1.1rem', color: '#A94D43', minWidth: '24px', textAlign: 'center' }}>
                    {quantity}
                  </strong>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #F0D7D2', background: '#ffffff', fontWeight: '800', cursor: 'pointer', color: '#A94D43' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total Calculations */}
            <div style={{ borderTop: '1px solid #F0D7D2', paddingTop: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Final Calculado:</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#A94D43' }}>
                  {formatCurrency(subtotal)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveStep(4)}>
                  ← Atrás
                </button>
                <button className="btn btn-colecciones btn-lg" onClick={handleFinalAddToCart} style={{ fontWeight: '800' }}>
                  <ShoppingBag size={18} />
                  <span>Paso 6: Agregar al Carrito</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PASO 6: CONFIRMACIÓN Y CHECKOUT */}
        {activeStep === 6 && (
          <div style={{ maxWidth: '580px', margin: '0 auto', background: '#FFFFFF', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center', border: '1px solid #F0D7D2' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.5rem' }}>
              ¡Tu pieza ha sido agregada al Carrito!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Hemos guardado tus especificaciones 3D multi-capa ({safeBaseColor.name}, {safeAccentColor.name}, {safeReliefColor.name}).
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setActiveStep(1)}>
                Seguir Explorando Colecciones
              </button>
              <button className="btn btn-colecciones btn-lg" onClick={() => navigateTo('checkout')} style={{ fontWeight: '800' }}>
                Proceder al Pago Seguro →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ColeccionesRoute;
