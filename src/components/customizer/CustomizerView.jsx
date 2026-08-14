import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, FILAMENT_MATERIALS } from '../../data/mockData';
import ThreeViewer from '../3d/ThreeViewer';
import { formatCurrency, formatGrams } from '../../utils/formatters';
import {
  Sparkles,
  Layers,
  Palette,
  Type,
  Maximize2,
  Download,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  RotateCcw,
  Smile,
  GraduationCap,
  Building2,
  Heart,
  ImageIcon,
  Box
} from 'lucide-react';

const PRESETS = [
  {
    id: 'escolar',
    name: '🎒 Escolar / Mochila',
    text: 'VALENTINA',
    modelType: 'keychain',
    colorHex: '#C9685B',
    materialId: 'mat-02',
    font: 'Poppins'
  },
  {
    id: 'corporativo',
    name: '🏢 Oficina Ejecutiva',
    text: 'IDEA TECH',
    modelType: 'organizer',
    colorHex: '#21658A',
    materialId: 'mat-01',
    font: 'Space Grotesk'
  },
  {
    id: 'trofeo',
    name: '🏆 Reconocimiento',
    text: 'LÍDER 2026',
    modelType: 'trophy',
    colorHex: '#B77B21',
    materialId: 'mat-02',
    font: 'Poppins'
  },
  {
    id: 'boda',
    name: '💍 Boda / Aniversario',
    text: 'CARLOS & SOFÍA',
    modelType: 'lamp',
    colorHex: '#FAEEEB',
    materialId: 'mat-02',
    font: 'Dancing Script'
  },
  {
    id: 'gamer',
    name: '⚡ Gamer / Tech',
    text: 'CYBERPUNK',
    modelType: 'keychain',
    colorHex: '#EA580C',
    materialId: 'mat-03',
    font: 'Space Grotesk'
  }
];

const FONTS_LIST = [
  { id: 'Poppins', name: 'Poppins Moderna', sample: 'Aa Bb 123' },
  { id: 'Space Grotesk', name: 'Tech Grotesk', sample: 'Aa Bb 123' },
  { id: 'Playfair Display', name: 'Serif Elegante', sample: 'Aa Bb 123' },
  { id: 'Dancing Script', name: 'Cursiva Signature', sample: 'Aa Bb 123' }
];

const CustomizerView = () => {
  const { viewParams, addToCart, navigateTo, showToast } = useApp();
  const viewerRef = useRef(null);

  const initialProduct = PRODUCTS.find((p) => p.id === viewParams?.productId) || PRODUCTS[0];
  const defaultMat = FILAMENT_MATERIALS[0] || {
    id: 'PLA_SILK',
    name: 'PLA Seda Premium (Biodegradable)',
    priceMultiplier: 1.0,
    colors: [
      { id: 'col-teal', name: 'Teal IdeaForm', hex: '#00828A' }
    ]
  };
  const defaultColor = (defaultMat.colors && defaultMat.colors[0]) || { id: 'col-teal', name: 'Teal IdeaForm', hex: '#00828A' };

  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [modelType, setModelType] = useState(viewParams?.modelType || initialProduct.modelType || 'keychain');
  const [selectedMaterial, setSelectedMaterial] = useState(defaultMat);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [customText, setCustomText] = useState(viewParams?.customText || 'IDEAFORM');
  const [selectedFont, setSelectedFont] = useState('Poppins');
  const [quantity, setQuantity] = useState(1);
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [showScaleReference, setShowScaleReference] = useState(false);

  useEffect(() => {
    if (viewParams?.productId) {
      const prod = PRODUCTS.find((p) => p.id === viewParams.productId);
      if (prod) {
        setSelectedProduct(prod);
        if (prod.modelType) setModelType(prod.modelType);
      }
    }
    if (viewParams?.customText) setCustomText(viewParams.customText);
    if (viewParams?.modelType) setModelType(viewParams.modelType);
  }, [viewParams]);

  // Price Calculation
  const materialMultiplier = selectedMaterial?.priceMultiplier || 1.0;
  const basePrice = selectedProduct?.basePrice || 150.00;
  const unitPrice = basePrice * materialMultiplier;
  const subtotal = unitPrice * quantity;

  // Apply Preset
  const handleApplyPreset = (preset) => {
    setModelType(preset.modelType);
    setCustomText(preset.text);
    setSelectedFont(preset.font);

    const mat = FILAMENT_MATERIALS.find((m) => m.id === preset.materialId) || FILAMENT_MATERIALS[0] || defaultMat;
    setSelectedMaterial(mat);

    const col = (mat.colors && mat.colors.find((c) => c.hex.toLowerCase() === preset.colorHex.toLowerCase())) || (mat.colors && mat.colors[0]) || defaultColor;
    setSelectedColor(col);

    showToast(`Plantilla "${preset.name}" aplicada ✨`, 'info');
  };

  // Download High-Res Snapshot
  const handleDownloadSnapshot = () => {
    if (viewerRef.current && viewMode === '3D') {
      const dataUrl = viewerRef.current.getSnapshot();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `ideaform-${modelType}-${customText.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
        showToast('¡Imagen 3D descargada en alta resolución!', 'success');
      }
    } else {
      showToast('Descarga disponible en vista 3D', 'info');
    }
  };

  // Add to Cart
  const handleAddToCart = () => {
    let snapshotUrl = null;
    if (viewerRef.current && viewMode === '3D') {
      snapshotUrl = viewerRef.current.getSnapshot();
    }

    const customizedItem = {
      ...selectedProduct,
      id: `${selectedProduct.id}-custom-${Date.now()}`,
      originalId: selectedProduct.id,
      name: `${selectedProduct.name} Personalizado`,
      modelType,
      customText,
      fontFamily: selectedFont,
      selectedMaterial: {
        id: selectedMaterial.id,
        name: selectedMaterial.name
      },
      selectedColor: {
        id: selectedColor.id,
        name: selectedColor.name,
        hex: selectedColor.hex
      },
      finalUnitPrice: unitPrice,
      quantity,
      snapshotUrl,
      weightGrams: selectedProduct.weightGrams || 25,
      printTimeMins: selectedProduct.printTimeMins || 45
    };

    addToCart(customizedItem);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', paddingBottom: '6rem' }}>
      
      {/* 1. Header Bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '1.25rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className="badge badge-primary">
                <Sparkles size={13} /> PERSONALIZADOR DE PRODUCTOS
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                Visualización Dual 2D & 3D
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a' }}>
              Personaliza tu Pieza
            </h1>
          </div>

          {/* Preset Buttons Hub */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', marginRight: '0.25rem' }}>
              PLANTILLAS:
            </span>
            {PRESETS.map((pr) => (
              <button
                key={pr.id}
                onClick={() => handleApplyPreset(pr)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: '#ffffff', borderRadius: 'var(--radius-full)' }}
              >
                {pr.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Studio Split */}
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        <div className="customizer-split-responsive">
          
          {/* Left: Dual 2D / 3D Stage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card card-elevated stage-3d-box" style={{ padding: '0', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
              
              {/* 2D / 3D Mode Toggle Tabs */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 30, display: 'flex', background: 'rgba(255,255,255,0.95)', padding: '0.25rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-light)' }}>
                <button
                  onClick={() => setViewMode('3D')}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: viewMode === '3D' ? '#0F5F6D' : 'transparent',
                    color: viewMode === '3D' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Box size={14} />
                  <span>Vista 3D</span>
                </button>

                <button
                  onClick={() => setViewMode('2D')}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: viewMode === '2D' ? '#0F5F6D' : 'transparent',
                    color: viewMode === '2D' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ImageIcon size={14} />
                  <span>Foto 2D</span>
                </button>
              </div>

              {/* RENDER 3D STAGE */}
              {viewMode === '3D' ? (
                <ThreeViewer
                  ref={viewerRef}
                  modelType={modelType}
                  selectedColor={selectedColor?.hex || selectedColor || '#00828A'}
                  materialType={selectedMaterial?.typeCode || selectedMaterial?.id || 'PLA_SILK'}
                  customText={customText}
                  fontFamily={selectedFont}
                  showDimensions={true}
                />
              ) : (
                /* RENDER 2D GALLERY & FALLBACK */
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAEEEB', padding: '2rem', textAlign: 'center' }}>
                  <div
                    style={{
                      width: '240px',
                      height: '240px',
                      borderRadius: 'var(--radius-xl)',
                      background: selectedColor?.hex || '#00828A',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-xl)',
                      border: '4px solid #ffffff',
                      marginBottom: '1.5rem',
                      position: 'relative'
                    }}
                  >
                    <Sparkles size={36} style={{ marginBottom: '0.75rem', opacity: 0.9 }} />
                    <span style={{ fontWeight: '800', fontSize: '1.25rem', letterSpacing: '0.04em', fontFamily: selectedFont, padding: '0 1rem' }}>
                      {customText || 'IDEAFORM'}
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.4rem' }}>
                      {selectedMaterial?.name || 'PLA Seda Premium'}
                    </span>
                  </div>

                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1A1A1A' }}>
                    {selectedProduct?.name || 'Producto Personalizado'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Color: {selectedColor?.name || 'Color'} ({selectedColor?.hex || '#00828A'})
                  </div>
                </div>
              )}

              {/* Real-scale Coin Comparison Overlay */}
              {showScaleReference && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.78rem',
                    zIndex: 20,
                    maxWidth: '240px',
                    border: '1px solid rgba(0, 229, 255, 0.3)'
                  }}
                >
                  <div style={{ fontWeight: '800', color: '#00e5ff', marginBottom: '0.25rem' }}>
                    🪙 Referencia de Escala Real
                  </div>
                  <div>
                    {modelType === 'keychain' && 'Tamaño: 65 mm (aprox. 2.3 monedas de $10 pesos mexicanas).'}
                    {modelType === 'organizer' && 'Tamaño: 140 mm de ancho (cabe un iPhone Pro y 4 plumas).'}
                    {modelType === 'lamp' && 'Tamaño: 135 mm de alto (lámpara decorativa de mesa).'}
                    {modelType === 'trophy' && 'Tamaño: 190 mm de alto (estatuilla conmemorativa).'}
                  </div>
                </div>
              )}

              {/* Action Floating Buttons */}
              <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '0.5rem', zIndex: 10 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowScaleReference(!showScaleReference)}
                  style={{ background: showScaleReference ? '#00e5ff' : 'rgba(255, 255, 255, 0.95)', color: '#0f172a', fontWeight: '700' }}
                  title="Ver referencia de tamaño real en cm"
                >
                  <span>{showScaleReference ? 'Ocultar Escala' : '📏 Ver Escala Real'}</span>
                </button>

                {viewMode === '3D' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleDownloadSnapshot}
                    style={{ background: 'rgba(255, 255, 255, 0.95)', color: '#0f172a', fontWeight: '700' }}
                    title="Descargar captura 3D en alta resolución"
                  >
                    <Download size={14} />
                    <span>Guardar Imagen 3D</span>
                  </button>
                )}
              </div>
            </div>

            {/* SLA Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#065f46' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="#059669" />
                <span><strong>⏰ Manufactura Prioritaria:</strong> Pide en las próximas 3 hrs para imprimir tu pieza hoy mismo.</span>
              </div>
              <span className="badge badge-success">SLA 24-48h</span>
            </div>
          </div>

          {/* Right: Controls & Parameters Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              
              {/* 1. Model Type Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  1. TIPO DE OBJETO
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[
                    { id: 'keychain', label: 'Llavero Hexagonal', base: 150 },
                    { id: 'organizer', label: 'Estación HexaDesk', base: 280 },
                    { id: 'lamp', label: 'Lámpara DecoGlow', base: 380 },
                    { id: 'trophy', label: 'Trofeo Prisma', base: 450 }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setModelType(item.id);
                        const prod = PRODUCTS.find((p) => p.modelType === item.id) || PRODUCTS[0];
                        setSelectedProduct(prod);
                      }}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        border: modelType === item.id ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                        background: modelType === item.id ? 'rgba(15, 95, 109, 0.08)' : '#ffffff',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        color: modelType === item.id ? 'var(--color-primary)' : '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>{item.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{formatCurrency(item.base)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Text Engraving & Font Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  2. TEXTO EN RELIEVE
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Escribe aquí tu nombre o marca..."
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    outline: 'none',
                    marginBottom: '0.75rem'
                  }}
                />

                {/* Font Selector Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  {FONTS_LIST.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFont(f.id)}
                      style={{
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: selectedFont === f.id ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                        background: selectedFont === f.id ? 'rgba(15, 95, 109, 0.08)' : '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textAlign: 'center',
                        fontFamily: f.id
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Polymer & Filament Material */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
                  3. TIPO DE POLÍMERO 3D
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {FILAMENT_MATERIALS.map((mat) => {
                    const isSelected = selectedMaterial.id === mat.id;

                    return (
                      <div
                        key={mat.id}
                        onClick={() => {
                          setSelectedMaterial(mat);
                          setSelectedColor(mat.colors[0]);
                        }}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                          background: isSelected ? 'rgba(15, 95, 109, 0.04)' : '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a' }}>{mat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{mat.description}</div>
                        </div>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: '800' }}>
                          x{mat.priceMultiplier}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Color Swatches */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                    4. COLOR DEL FILAMENTO
                  </label>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {selectedColor?.name || 'Color Seleccionado'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {(selectedMaterial?.colors || []).map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setSelectedColor(col)}
                      className={`swatch-btn ${selectedColor?.id === col.id ? 'selected' : ''}`}
                      style={{ background: col.hex }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>

              {/* 5. Pricing & Add to Cart */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Precio Unitario:</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                      {formatCurrency(unitPrice)}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800' }}
                    >
                      -
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontWeight: '700', fontSize: '0.9rem' }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', fontWeight: '800' }}
                  onClick={handleAddToCart}
                >
                  <ShoppingBag size={18} />
                  <span>Añadir al Carrito ({formatCurrency(subtotal)})</span>
                </button>
              </div>
            </div>
          </div>
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
