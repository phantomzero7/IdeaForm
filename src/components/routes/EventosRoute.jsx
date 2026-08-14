import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, FILAMENT_COLORS } from '../../data/mockData';
import ThreeViewer from '../3d/ThreeViewer';
import { formatCurrency, formatGrams } from '../../utils/formatters';
import {
  Heart,
  Sparkles,
  Calendar,
  Gift,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Cake,
  GraduationCap,
  Baby,
  PartyPopper,
  ShoppingBag,
  ImageIcon,
  Box
} from 'lucide-react';

const EVENT_TYPES = [
  { id: 'boda', name: 'Bodas & Aniversarios', icon: Heart, desc: 'Litofanías fotográficas con luz, recuerdos grabados y toppers para pastel' },
  { id: 'xv', name: 'XV Años & Fiestas', icon: Sparkles, desc: 'Llaveros personalizados para invitados, velas 3D y números gigantes' },
  { id: 'bautizo', name: 'Bautizos & Primera Comunión', icon: Baby, desc: 'Cruces grabadas, ángeles y recuerdos tiernos con fecha especial' },
  { id: 'cumple', name: 'Cumpleaños & Fiestas Temáticas', icon: Cake, desc: 'Artículos 3D con nombre de festejado y figuras exclusivas' },
  { id: 'graduacion', name: 'Graduaciones & Académicos', icon: GraduationCap, desc: 'Birretes 3D, estatuillas conmemorativas y placas de generación' },
  { id: 'corporativo', name: 'Cenas & Galas Especiales', icon: PartyPopper, desc: 'Identificadores de mesa, centros de mesa y souvenirs de agradecimiento' }
];

const EventosRoute = () => {
  const { navigateTo, addToCart, showToast } = useApp();
  const viewerRef = useRef(null);

  const [activeStep, setActiveStep] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState(EVENT_TYPES[0]);
  const [celebrantNames, setCelebrantNames] = useState('SOFÍA & CARLOS');
  const [eventDate, setEventDate] = useState('18.10.2026');
  
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS.find((p) => p.subcollection === 'eventos') || PRODUCTS[2]);
  const [selectedColor, setSelectedColor] = useState(FILAMENT_COLORS[2]); // Mostaza / Oro (#B77B21)
  const [quantity, setQuantity] = useState(25);
  const [viewMode, setViewMode] = useState('3D');

  const STEPS = [
    { num: 1, label: '1. Evento' },
    { num: 2, label: '2. Festejados' },
    { num: 3, label: '3. Recuerdos' },
    { num: 4, label: '4. Personaliza' },
    { num: 5, label: '5. Paquete' },
    { num: 6, label: '6. Carrito' }
  ];

  const EVENT_PRODUCTS = PRODUCTS.filter((p) => p.subcollection === 'eventos' || p.isCustomizable);

  const unitPrice = selectedProduct ? selectedProduct.basePrice * (selectedColor.priceMultiplier || 1.0) : 42;
  const subtotal = unitPrice * quantity;

  const handleFinalAddToCart = () => {
    let snapshotUrl = null;
    if (viewerRef.current && viewMode === '3D') {
      snapshotUrl = viewerRef.current.getSnapshot();
    }

    const cartItem = {
      ...selectedProduct,
      id: `${selectedProduct.id}-custom-${Date.now()}`,
      originalId: selectedProduct.id,
      name: `${selectedProduct.name} (${celebrantNames} - ${eventDate})`,
      customText: `${celebrantNames} • ${eventDate}`,
      fontFamily: 'Dancing Script',
      selectedColor: {
        id: selectedColor.id,
        name: selectedColor.name,
        hex: selectedColor.hex
      },
      finalUnitPrice: unitPrice,
      quantity,
      snapshotUrl,
      weightGrams: selectedProduct.weightGrams || 20,
      printTimeMins: selectedProduct.printTimeMins || 30
    };

    addToCart(cartItem);
    setActiveStep(6);
  };

  return (
    <div style={{ background: '#FBF4E8', color: '#1A1A1A', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EFE4D2', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#B77B21',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.82rem',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.04em'
              }}
            >
              EVENTOS
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#956016' }}>
              Crea algo para recordar
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#956016', fontWeight: '600' }}>
            ✨ Recuerdos conmemorativos grabados en 3D
          </div>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '840px', margin: '0 auto 3rem auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#EFE4D2' }} />
          <div className="stepper-progress-fill" style={{ background: '#B77B21', width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

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
                    backgroundColor: isActive ? '#956016' : isCompleted ? '#FBF4E8' : '#FFFFFF',
                    borderColor: isActive ? '#956016' : isCompleted ? '#B77B21' : '#EFE4D2',
                    color: isActive ? '#FFFFFF' : isCompleted ? '#956016' : '#A89279'
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} color="#956016" /> : s.num}
                </div>
                <div className="stepper-label" style={{ color: isActive ? '#956016' : '#777' }}>
                  {s.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* PASO 1: TIPO DE CELEBRACIÓN */}
        {activeStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ color: '#B77B21', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                PASO 1: TIPO DE CELEBRACIÓN
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#956016' }}>
                ¿Qué tipo de evento estás organizando?
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Selecciona la ocasión para mostrarte los estilos más solicitados.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {EVENT_TYPES.map((evt) => {
                const IconComponent = evt.icon;
                const isSelected = selectedEventType.id === evt.id;

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventType(evt);
                      setActiveStep(2);
                    }}
                    style={{
                      background: '#FFFFFF',
                      border: isSelected ? '2px solid #B77B21' : '1px solid #EFE4D2',
                      borderRadius: 'var(--radius-xl)',
                      padding: '2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#B77B21';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      if (!isSelected) e.currentTarget.style.borderColor = '#EFE4D2';
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'rgba(183, 123, 33, 0.15)',
                        color: '#956016',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <IconComponent size={24} />
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#956016', marginBottom: '0.4rem' }}>
                      {evt.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      {evt.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#956016', fontWeight: '700', fontSize: '0.82rem' }}>
                      <span>Configurar evento</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PASO 2: DETALLES DE LOS FESTEJADOS */}
        {activeStep === 2 && (
          <div style={{ maxWidth: '650px', margin: '0 auto', background: '#FFFFFF', border: '1px solid #EFE4D2', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#956016', marginBottom: '0.5rem', textAlign: 'center' }}>
              Paso 2: Datos de {selectedEventType.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
              Estos nombres y fecha se grabarán con precisión en los recuerdos de tus invitados.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#956016', display: 'block', marginBottom: '0.4rem' }}>
                NOMBRES DE LOS FESTEJADOS O HOMENAJEADO
              </label>
              <input
                type="text"
                value={celebrantNames}
                onChange={(e) => setCelebrantNames(e.target.value)}
                placeholder="Ej. SOFÍA & CARLOS"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #EFE4D2',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#956016',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#956016', display: 'block', marginBottom: '0.4rem' }}>
                FECHA DEL EVENTO
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Ej. 18.10.2026"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #EFE4D2',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#956016',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, borderColor: '#EFE4D2', color: '#956016' }}
                onClick={() => setActiveStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Volver</span>
              </button>

              <button
                className="btn btn-eventos"
                style={{ flex: 1.5, fontWeight: '800' }}
                onClick={() => setActiveStep(3)}
              >
                <span>Paso 3: Elegir Recuerdos 3D</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: CATÁLOGO DE RECUERDOS */}
        {activeStep === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#956016' }}>
                  Paso 3: Catálogo de Recuerdos para {selectedEventType.name}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Selecciona la pieza que entregaremos a tus invitados.
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveStep(2)}
                style={{ borderColor: '#EFE4D2', color: '#956016' }}
              >
                <ArrowLeft size={14} />
                <span>Modificar Nombres</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {EVENT_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="card card-elevated"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #EFE4D2',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: '#FBF4E8', color: '#956016', border: '1px solid #EFE4D2' }}>
                        {prod.categoryName}
                      </span>
                    </div>

                    <div
                      style={{
                        height: '180px',
                        background: 'linear-gradient(135deg, #FBF4E8 0%, #F5E8D2 100%)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Sparkles size={40} color="#B77B21" />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#956016', marginTop: '0.5rem' }}>
                        Grabado Conmemorativo
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#956016', marginBottom: '0.35rem' }}>
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {prod.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid #EFE4D2', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Precio Unitario:</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#956016' }}>
                        {formatCurrency(prod.basePrice)}
                      </span>
                    </div>

                    <button
                      className="btn btn-eventos"
                      style={{ width: '100%', padding: '0.65rem' }}
                      onClick={() => {
                        setSelectedProduct(prod);
                        setActiveStep(4);
                      }}
                    >
                      <Sparkles size={15} />
                      <span>Paso 4: Personalizar en 3D</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 4: PERSONALIZA EN 3D */}
        {activeStep === 4 && selectedProduct && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(300px, 0.8fr)', gap: '2rem' }}>
            
            <div className="card card-elevated" style={{ padding: '0', background: '#ffffff', position: 'relative', overflow: 'hidden', height: '480px' }}>
              <ThreeViewer
                ref={viewerRef}
                modelType={selectedProduct.modelType || 'lamp'}
                selectedColor={selectedColor?.hex || selectedColor || '#FAEEEB'}
                materialType="PLA_SILK"
                customText={`${celebrantNames}`}
                fontFamily="Dancing Script"
                showDimensions={true}
              />
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #EFE4D2', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#956016', marginBottom: '0.4rem' }}>
                Paso 4: Personaliza "{selectedProduct.name}"
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Revisa el tono de filamento seda para que combine con la paleta de tu celebración.
              </p>

              <div style={{ background: '#FBF4E8', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#956016', fontWeight: '800' }}>GRABADO SELECCIONADO:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1A1A1A' }}>{celebrantNames}</div>
                <div style={{ fontSize: '0.85rem', color: '#B77B21', fontWeight: '700' }}>{eventDate}</div>
              </div>

              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#956016' }}>
                    COLOR DEL RECUERDO
                  </label>
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#B77B21' }}>
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

              <button
                className="btn btn-eventos btn-lg"
                style={{ width: '100%', fontWeight: '800' }}
                onClick={() => setActiveStep(5)}
              >
                <span>Paso 5: Seleccionar Paquete de Invitados</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* PASO 5: PAQUETE DE INVITADOS */}
        {activeStep === 5 && selectedProduct && (
          <div style={{ maxWidth: '750px', margin: '0 auto', background: '#ffffff', border: '1px solid #EFE4D2', borderRadius: 'var(--radius-xl)', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#956016', marginBottom: '0.5rem', textAlign: 'center' }}>
              Paso 5: Cantidad de Recuerdos para tus Invitados
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem' }}>
              Elige el número de recuerdos a producir.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: '#FBF4E8', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#956016', fontSize: '1.05rem' }}>Número de Souvenirs</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Precio unitario: {formatCurrency(unitPrice)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid #EFE4D2', padding: '0.25rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 5))}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', fontSize: '1.1rem', color: '#956016' }}
                >
                  -
                </button>
                <span style={{ width: '45px', textAlign: 'center', fontWeight: '800', fontSize: '1rem', color: '#956016' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 5)}
                  style={{ width: '36px', height: '36px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '800', fontSize: '1.1rem', color: '#956016' }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #EFE4D2', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total del Paquete de Evento:</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#956016' }}>{formatCurrency(subtotal)}</div>
              </div>

              <button
                className="btn btn-eventos btn-lg"
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
          <div style={{ maxWidth: '650px', margin: '0 auto', background: '#ffffff', border: '1px solid #EFE4D2', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FBF4E8', color: '#956016', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#956016', marginBottom: '0.5rem' }}>
              ¡Recuerdos Añadidos al Carrito!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Los recuerdos para <strong>{celebrantNames}</strong> ({quantity} piezas) están listos para ordenarse.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-eventos btn-lg"
                onClick={() => navigateTo('checkout')}
              >
                <span>Proceder al Pago Seguro ({formatCurrency(subtotal)})</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setActiveStep(1)}
                style={{ borderColor: '#EFE4D2', color: '#956016' }}
              >
                Diseñar Otro Recuerdo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventosRoute;
