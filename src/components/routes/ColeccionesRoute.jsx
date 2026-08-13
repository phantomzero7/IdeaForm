import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, SUBCOLLECTIONS, FILAMENT_COLORS } from '../../data/mockData';
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
  Truck
} from 'lucide-react';

const FONTS_LIST = [
  { id: 'Poppins', name: 'Poppins Moderna' },
  { id: 'Space Grotesk', name: 'Tech Grotesk' },
  { id: 'Playfair Display', name: 'Serif Elegante' },
  { id: 'Dancing Script', name: 'Cursiva Signature' }
];

const ColeccionesRoute = () => {
  const { navigateTo, addToCart, showToast } = useApp();
  const viewerRef = useRef(null);

  // Stepper State (1 to 6)
  const [activeStep, setActiveStep] = useState(1);
  const [selectedSubcollection, setSelectedSubcollection] = useState('escolar');

  // Customization State for Chosen Product
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0]);
  const [customText, setCustomText] = useState('VALENTINA');
  const [selectedFont, setSelectedFont] = useState('Poppins');
  const [selectedColor, setSelectedColor] = useState(FILAMENT_COLORS[0]); // Coral Terracota (#C9685B)
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [quantity, setQuantity] = useState(1);
  const [includeGiftBox, setIncludeGiftBox] = useState(false);

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
    ? PRODUCTS.filter((p) => p.subcollection !== 'empresas' && p.subcollection !== 'eventos')
    : PRODUCTS.filter((p) => p.subcollection === selectedSubcollection);

  // Price calculations
  const unitPrice = selectedProduct ? selectedProduct.basePrice * (selectedColor.priceMultiplier || 1.0) : 85;
  const giftBoxPrice = includeGiftBox ? 35.00 : 0;
  const subtotal = (unitPrice + giftBoxPrice) * quantity;

  // Handle Product Selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product.isCustomizable) {
      setActiveStep(3); // Go to Personaliza step
    } else {
      setActiveStep(5); // Go straight to Paquete / Quantity
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
      selectedColor: {
        id: selectedColor.id,
        name: selectedColor.name,
        hex: selectedColor.hex
      },
      includeGiftBox,
      finalUnitPrice: unitPrice + giftBoxPrice,
      quantity,
      snapshotUrl,
      weightGrams: selectedProduct.weightGrams || 20,
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
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.04em'
              }}
            >
              COLECCIONES
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#A94D43' }}>
              Diseña algo que sea tuyo
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#A94D43', fontWeight: '600' }}>
            ✨ Manufactura 3D de alta precisión y calidad garantizada
          </div>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '840px', margin: '0 auto 2.5rem auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#F0D7D2' }} />
          <div className="stepper-progress-fill" style={{ background: '#C9685B', width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

          {STEPS.map((s) => {
            const isCompleted = activeStep > s.num;
            const isActive = activeStep === s.num;

            return (
              <button
                key={s.num}
                className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => {
                  // Only allow jumping back or to reachable step
                  if (s.num <= activeStep || isCompleted) {
                    setActiveStep(s.num);
                  }
                }}
              >
                <div
                  className="stepper-circle"
                  style={{
                    backgroundColor: isActive ? '#A94D43' : isCompleted ? '#FAEEEB' : '#FFFFFF',
                    borderColor: isActive ? '#A94D43' : isCompleted ? '#C9685B' : '#F0D7D2',
                    color: isActive ? '#FFFFFF' : isCompleted ? '#A94D43' : '#A89279'
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} color="#A94D43" /> : s.num}
                </div>
                <div className="stepper-label" style={{ color: isActive ? '#A94D43' : '#777' }}>
                  {s.label}
                </div>
              </button>
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
                  <ArrowLeft size={14} />
                  <span>Cambiar Colección</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="card card-elevated"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    background: '#ffffff',
                    border: '1px solid #F0D7D2',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: '#FAEEEB', color: '#A94D43', border: '1px solid #F0D7D2' }}>
                        {product.categoryName}
                      </span>
                      {product.isCustomizable && (
                        <span className="badge" style={{ background: 'rgba(201, 104, 91, 0.1)', color: '#C9685B', fontSize: '0.7rem' }}>
                          <Sparkles size={11} /> Grabable 3D
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        height: '180px',
                        background: 'linear-gradient(135deg, #FAEEEB 0%, #F5DDD8 100%)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Box size={44} color="#C9685B" style={{ opacity: 0.85 }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#A94D43', marginTop: '0.5rem' }}>
                        {product.has3d ? 'Modelo 3D Interactivo' : 'Fotografía 2D'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.35rem' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid #F0D7D2', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Precio Base:</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#A94D43' }}>
                        {formatCurrency(product.basePrice)}
                      </span>
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

        {/* PASO 3: PERSONALIZA TU PIEZA SELECCIONADA */}
        {activeStep === 3 && selectedProduct && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(300px, 0.8fr)', gap: '2rem' }}>
            
            {/* Left: 2D/3D Live Canvas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card card-elevated" style={{ padding: '0', background: '#ffffff', position: 'relative', overflow: 'hidden', height: '480px' }}>
                
                {/* 2D / 3D Toggle */}
                {selectedProduct.has3d && (
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

                {viewMode === '3D' && selectedProduct.has3d ? (
                  <ThreeViewer
                    ref={viewerRef}
                    modelType={selectedProduct.modelType || 'keychain'}
                    selectedColor={selectedColor.hex}
                    materialType="PLA_SILK"
                    customText={customText}
                    fontFamily={selectedFont}
                    showDimensions={true}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAEEEB', padding: '2rem', textAlign: 'center' }}>
                    <div
                      style={{
                        width: '220px',
                        height: '220px',
                        borderRadius: 'var(--radius-xl)',
                        background: selectedColor.hex,
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-lg)',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <Sparkles size={32} style={{ marginBottom: '0.5rem', opacity: 0.9 }} />
                      <span style={{ fontWeight: '800', fontSize: '1.15rem', fontFamily: selectedFont, padding: '0 1rem' }}>
                        {customText || 'IDEAFORM'}
                      </span>
                    </div>
                    <div style={{ fontWeight: '800', color: '#A94D43' }}>{selectedProduct.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Color: {selectedColor.name}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Customization Controls */}
            <div style={{ background: '#ffffff', border: '1px solid #F0D7D2', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.4rem' }}>
                Paso 3: Personaliza "{selectedProduct.name}"
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Escribe tu grabado y selecciona el color deseado.
              </p>

              {/* Text Engraving */}
              <div style={{ marginBottom: '1.5rem' }}>
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

              {/* Color Swatches */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#A94D43' }}>
                    COLOR DEL FILAMENTO
                  </label>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#C9685B' }}>
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

              {/* Next Step */}
              <button
                className="btn btn-colecciones btn-lg"
                style={{ width: '100%', fontWeight: '800' }}
                onClick={() => setActiveStep(4)}
              >
                <span>Paso 4: Ver Vista Previa y Medidas</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: VISTA PREVIA Y VALIDACIÓN */}
        {activeStep === 4 && selectedProduct && (
          <div style={{ maxWidth: '750px', margin: '0 auto', background: '#ffffff', border: '1px solid #F0D7D2', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.5rem', textAlign: 'center' }}>
              Paso 4: Validación de tu Pieza 3D
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
              Revisa los detalles técnicos antes de elegir empaque y cantidad.
            </p>

            <div style={{ background: '#FAEEEB', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#A94D43', fontWeight: '800' }}>PRODUCTO CONFIGURADO</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1A1A1A' }}>{selectedProduct.name}</div>
                <div style={{ fontSize: '0.9rem', color: '#C9685B', fontWeight: '700', marginTop: '0.2rem' }}>
                  Grabado: "{customText}" • Color: {selectedColor.name}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: '#777' }}>DIMENSIONES / PESO</div>
                <div style={{ fontWeight: '700', color: '#1A1A1A' }}>{selectedProduct.dimensions || '65 x 24 x 6 mm'}</div>
                <div style={{ fontSize: '0.8rem', color: '#777' }}>{formatGrams(selectedProduct.weightGrams || 20)} • PLA Seda</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, borderColor: '#F0D7D2', color: '#A94D43' }}
                onClick={() => setActiveStep(3)}
              >
                <ArrowLeft size={16} />
                <span>Modificar Grabado</span>
              </button>

              <button
                className="btn btn-colecciones"
                style={{ flex: 1.5, fontWeight: '800' }}
                onClick={() => setActiveStep(5)}
              >
                <span>Paso 5: Seleccionar Paquete</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 5: PAQUETE Y CANTIDAD */}
        {activeStep === 5 && selectedProduct && (
          <div style={{ maxWidth: '750px', margin: '0 auto', background: '#ffffff', border: '1px solid #F0D7D2', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.5rem', textAlign: 'center' }}>
              Paso 5: Opciones de Paquete & Unidades
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
              Selecciona cuántas piezas deseas y si requieres empaque especial para regalo.
            </p>

            {/* Quantity Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#FAEEEB', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#A94D43', fontSize: '1.05rem' }}>Cantidad de Piezas</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Precio unitario: {formatCurrency(unitPrice)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #F0D7D2', padding: '0.25rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', fontSize: '1.1rem', color: '#A94D43' }}
                >
                  -
                </button>
                <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '1rem', color: '#A94D43' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', fontSize: '1.1rem', color: '#A94D43' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Gift Packaging Box */}
            <div
              onClick={() => setIncludeGiftBox(!includeGiftBox)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: includeGiftBox ? '2px solid #C9685B' : '1px solid #F0D7D2',
                background: includeGiftBox ? '#FAEEEB' : '#ffffff',
                cursor: 'pointer',
                marginBottom: '2rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Gift size={24} color="#C9685B" />
                <div>
                  <div style={{ fontWeight: '800', color: '#A94D43', fontSize: '0.95rem' }}>Caja de Regalo Ecológica IdeaForm</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Incluye tarjeta con dedicatoria personalizada y moño satinado</div>
                </div>
              </div>
              <div style={{ fontWeight: '800', color: '#A94D43' }}>+ $35.00 MXN</div>
            </div>

            {/* Summary & Proceed */}
            <div style={{ borderTop: '1px solid #F0D7D2', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total del Paquete:</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#A94D43' }}>{formatCurrency(subtotal)}</div>
              </div>

              <button
                className="btn btn-colecciones btn-lg"
                style={{ fontWeight: '800' }}
                onClick={handleFinalAddToCart}
              >
                <ShoppingBag size={18} />
                <span>Paso 6: Añadir al Carrito</span>
              </button>
            </div>
          </div>
        )}

        {/* PASO 6: CARRITO Y CONFIRMACIÓN */}
        {activeStep === 6 && (
          <div style={{ maxWidth: '650px', margin: '0 auto', background: '#ffffff', border: '1px solid #F0D7D2', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FAEEEB', color: '#A94D43', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.5rem' }}>
              ¡Pieza Añadida a tu Carrito!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Tu producto personalizado está listo. Puedes proceder al pago con envío inmediato o seguir explorando otras colecciones.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-colecciones btn-lg"
                onClick={() => navigateTo('checkout')}
              >
                <span>Proceder al Pago Seguro ({formatCurrency(subtotal)})</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setActiveStep(1)}
                style={{ borderColor: '#F0D7D2', color: '#A94D43' }}
              >
                Diseñar Otra Pieza
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColeccionesRoute;
