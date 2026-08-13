import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, FILAMENT_MATERIALS } from '../../data/mockData';
import ThreeViewer from '../3d/ThreeViewer';
import { Sparkles, Check, ShoppingBag, ArrowRight, ArrowLeft, Clock, Shield, Layers, Palette, Type, HelpCircle } from 'lucide-react';
import { formatCurrency, formatGrams } from '../../utils/formatters';

const CustomizerView = () => {
  const { viewParams, addToCart, navigateTo } = useApp();
  const threeViewerRef = useRef(null);

  // Available customizable products
  const customizableProducts = PRODUCTS.filter((p) => p.isCustomizable);

  // Initial Product selection from viewParams or default
  const defaultProduct =
    customizableProducts.find((p) => p.id === viewParams.productId) || customizableProducts[0];

  const [selectedProduct, setSelectedProduct] = useState(defaultProduct);
  const [selectedMaterial, setSelectedMaterial] = useState(FILAMENT_MATERIALS[0]);
  const [selectedColor, setSelectedColor] = useState(FILAMENT_MATERIALS[0].colors[0]);
  const [customText, setCustomText] = useState('SOFIA & CARLOS');
  const [fontFamily, setFontFamily] = useState('Plus Jakarta Sans');
  const [activeStep, setActiveStep] = useState(1); // 1: Modelo | 2: Filamento | 3: Grabado | 4: Resumen
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Handle product change
  const handleProductChange = (prod) => {
    setSelectedProduct(prod);
  };

  // Price Calculation
  const materialMultiplier = selectedMaterial?.priceMultiplier || 1.0;
  const unitPrice = selectedProduct.basePrice * materialMultiplier;
  const totalPrice = unitPrice * quantity;

  // Add to cart with 3D canvas snapshot
  const handleAddToCart = () => {
    setIsAdding(true);
    let snapshot = null;
    if (threeViewerRef.current) {
      snapshot = threeViewerRef.current.getSnapshot();
    }

    setTimeout(() => {
      addToCart({
        id: selectedProduct.id,
        name: selectedProduct.name,
        basePrice: selectedProduct.basePrice,
        finalUnitPrice: unitPrice,
        selectedMaterial: selectedMaterial,
        selectedColor: selectedColor,
        customText: customText.trim(),
        fontFamily: fontFamily,
        previewSnapshot: snapshot,
        weightGrams: selectedProduct.weightGrams,
        printTimeMins: selectedProduct.printTimeMins,
        quantity: quantity,
        isCustom: true
      });
      setIsAdding(false);
    }, 400);
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Stepper Navigation Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 2.5rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> TALLER DIGITAL EN VIVO
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Personalizador 3D Interactivo</h1>
          <p style={{ fontSize: '0.95rem' }}>Diseña tu pieza única paso a paso y visualiza cada capa en tiempo real.</p>
        </div>

        {/* Stepper Bar */}
        <div className="stepper-nav">
          <div className="stepper-progress-bg" />
          <div
            className="stepper-progress-fill"
            style={{
              width: activeStep === 1 ? '0%' : activeStep === 2 ? '33%' : activeStep === 3 ? '66%' : '100%'
            }}
          />

          <button
            className={`stepper-step ${activeStep === 1 ? 'active' : activeStep > 1 ? 'completed' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <div className="stepper-circle">{activeStep > 1 ? <Check size={16} /> : '1'}</div>
            <span className="stepper-label">1. Modelo Base</span>
          </button>

          <button
            className={`stepper-step ${activeStep === 2 ? 'active' : activeStep > 2 ? 'completed' : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <div className="stepper-circle">{activeStep > 2 ? <Check size={16} /> : '2'}</div>
            <span className="stepper-label">2. Filamento & Color</span>
          </button>

          <button
            className={`stepper-step ${activeStep === 3 ? 'active' : activeStep > 3 ? 'completed' : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <div className="stepper-circle">{activeStep > 3 ? <Check size={16} /> : '3'}</div>
            <span className="stepper-label">3. Grabado en Relieve</span>
          </button>

          <button
            className={`stepper-step ${activeStep === 4 ? 'active' : ''}`}
            onClick={() => setActiveStep(4)}
          >
            <div className="stepper-circle">4</div>
            <span className="stepper-label">4. Resumen & Pedido</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left 3D Canvas (60%) / Right Configuration Panel (40%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)', gap: '2rem', alignItems: 'start' }} className="customizer-split">
        
        {/* LEFT: 3D WebGL Canvas Card */}
        <div
          className="card card-elevated"
          style={{
            padding: '1rem',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            position: 'sticky',
            top: '5.5rem'
          }}
        >
          <ThreeViewer
            ref={threeViewerRef}
            modelType={selectedProduct.model3dType || 'keychain'}
            selectedColor={selectedColor.hex}
            materialType={selectedMaterial.id}
            customText={customText}
            fontFamily={fontFamily}
          />

          {/* Quick specs under canvas */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <Clock size={15} color="var(--color-primary)" />
              <span>Fabricación: <strong>{selectedMaterial.leadTimeHours} hrs</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <Layers size={15} color="var(--color-primary)" />
              <span>Peso filamento: <strong>{formatGrams(selectedProduct.weightGrams)}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontWeight: '700' }}>
              <Shield size={15} />
              <span>Garantía 100%</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Step-by-Step Configuration Form */}
        <div className="card" style={{ padding: '2rem' }}>
          {/* STEP 1: Seleccionar Modelo Base */}
          {activeStep === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>1</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Selecciona el Artículo Base</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {customizableProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleProductChange(prod)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: selectedProduct.id === prod.id ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                      background: selectedProduct.id === prod.id ? 'rgba(0, 130, 138, 0.04)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{prod.dimensions} • {prod.categoryName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                        {formatCurrency(prod.basePrice)}
                      </div>
                      <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{prod.badge}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveStep(2)}>
                <span>Continuar a Filamentos & Colores</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* STEP 2: Seleccionar Filamento y Color */}
          {activeStep === 2 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>2</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Elige Tipo de Filamento y Color</h3>
              </div>

              {/* Material Type Tabs */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  TIPO DE POLÍMERO 3D
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {FILAMENT_MATERIALS.map((mat) => (
                    <button
                      key={mat.id}
                      onClick={() => {
                        setSelectedMaterial(mat);
                        setSelectedColor(mat.colors[0]);
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedMaterial.id === mat.id ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                        background: selectedMaterial.id === mat.id ? 'rgba(0, 130, 138, 0.05)' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>{mat.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                        {mat.priceMultiplier > 1.0 ? `+${Math.round((mat.priceMultiplier - 1) * 100)}% valor` : 'Precio base'}
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                  💡 {selectedMaterial.description}
                </p>
              </div>

              {/* Color Swatches */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.75rem' }}>
                  COLOR DISPONIBLE: <strong style={{ color: 'var(--text-primary)' }}>{selectedColor.name}</strong>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {selectedMaterial.colors.map((col) => (
                    <button
                      key={col.id}
                      className={`swatch-btn ${selectedColor.id === col.id ? 'selected' : ''}`}
                      style={{ backgroundColor: col.hex }}
                      onClick={() => setSelectedColor(col)}
                      title={`${col.name} (${formatGrams(col.stockGrams)} disponibles)`}
                    />
                  ))}
                </div>
              </div>

              {/* Step 2 Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveStep(1)}>
                  <ArrowLeft size={16} />
                  <span>Atrás</span>
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActiveStep(3)}>
                  <span>Continuar a Grabado 3D</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Grabado y Tipografía */}
          {activeStep === 3 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>3</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Personaliza Texto en Relieve</h3>
              </div>

              {/* Text Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                    TEXTO A GRABAR
                  </label>
                  <span style={{ fontSize: '0.75rem', color: customText.length > selectedProduct.maxCharacters ? '#dc2626' : 'var(--text-tertiary)' }}>
                    {customText.length} / {selectedProduct.maxCharacters} letras
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={selectedProduct.maxCharacters}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Escribe tu texto..."
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    fontSize: '1.05rem',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    outline: 'none',
                    fontFamily: fontFamily
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                  El texto se extruirá en 3D en capas sucesivas de 0.2mm de altura.
                </p>
              </div>

              {/* Font Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                  TIPOGRAFÍA EN RELIEVE
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'Plus Jakarta Sans', label: 'Moderna (Sans)' },
                    { id: 'Space Grotesk', label: 'Tech & Geométrica' },
                    { id: 'Arial', label: 'Clásica Bold' },
                    { id: 'Georgia', label: 'Elegante Serif' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFontFamily(f.id)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: fontFamily === f.id ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                        background: fontFamily === f.id ? 'rgba(0, 130, 138, 0.05)' : '#ffffff',
                        fontFamily: f.id,
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3 Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveStep(2)}>
                  <ArrowLeft size={16} />
                  <span>Atrás</span>
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActiveStep(4)}>
                  <span>Ver Resumen & Confirmar</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Resumen y Añadir al Carrito */}
          {activeStep === 4 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.85rem' }}>4</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Confirmación de Manufactura</h3>
              </div>

              {/* Item Specs Box */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                  {selectedProduct.name}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Grabado:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>"{customText}"</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Filamento:</span>
                    <strong>{selectedMaterial.name} ({selectedColor.name})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tiempo de Impresión:</span>
                    <strong>{selectedMaterial.leadTimeHours} hrs hábiles</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Dimensiones:</span>
                    <strong>{selectedProduct.dimensions}</strong>
                  </div>
                </div>
              </div>

              {/* Quantity selector */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>Cantidad de Piezas:</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ padding: '0.5rem 0.85rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.85rem', fontWeight: '800', fontSize: '0.95rem' }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ padding: '0.5rem 0.85rem', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price Display */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Total:</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {formatCurrency(totalPrice)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {quantity > 1 ? `${formatCurrency(unitPrice)} por unidad` : 'IVA incluido'}
                  </div>
                </div>
              </div>

              {/* Add to Cart CTA */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveStep(3)}>
                  <ArrowLeft size={16} />
                  <span>Modificar</span>
                </button>

                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  <ShoppingBag size={20} />
                  <span>{isAdding ? 'Generando Render 3D...' : 'Añadir al Carrito'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .customizer-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomizerView;
