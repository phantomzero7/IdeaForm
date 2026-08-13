import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';
import {
  Box,
  GraduationCap,
  Briefcase,
  Home,
  User,
  Smile,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';

const SUBCOLLECTIONS = [
  { id: 'all', name: 'Todas las Colecciones', icon: Box, count: 8 },
  { id: 'escolar', name: 'Escolar & Estudiantes', icon: GraduationCap, count: 4, desc: 'Llaveros para mochilas, portalápices y tags con nombre' },
  { id: 'oficina', name: 'Oficina & Escritorio', icon: Briefcase, count: 4, desc: 'Organizadores de escritorio, docks y placas personalizadas' },
  { id: 'hogar', name: 'Hogar & Deco', icon: Home, count: 3, desc: 'Lámparas litofanía, macetas y decoración moderna' },
  { id: 'personal', name: 'Personal & Accesorios', icon: User, count: 5, desc: 'Llaveros con relieve, pines y artículos de bolsillo' },
  { id: 'kids', name: 'Kids & Juguetes', icon: Smile, count: 2, desc: 'Letreros con luz suave para cuarto y juguetes articulados' }
];

const ColeccionesRoute = () => {
  const { navigateTo, addToCart } = useApp();

  const [activeStep, setActiveStep] = useState(1);
  const [selectedSubcollection, setSelectedSubcollection] = useState('all');

  const filteredProducts = selectedSubcollection === 'all'
    ? PRODUCTS
    : PRODUCTS.filter((p) => {
        if (selectedSubcollection === 'escolar') return p.tags.includes('escolar') || p.category === 'accesorios';
        if (selectedSubcollection === 'oficina') return p.tags.includes('oficina') || p.category === 'organizadores';
        if (selectedSubcollection === 'hogar') return p.tags.includes('hogar') || p.category === 'decoracion';
        if (selectedSubcollection === 'personal') return p.tags.includes('personal') || p.category === 'accesorios';
        if (selectedSubcollection === 'kids') return p.tags.includes('kids') || p.tags.includes('regalo');
        return true;
      });

  const STEPS = [
    { num: 1, label: '1. Colección' },
    { num: 2, label: '2. Productos' },
    { num: 3, label: '3. Personaliza' },
    { num: 4, label: '4. Vista previa' },
    { num: 5, label: '5. Paquete' },
    { num: 6, label: '6. Carrito' }
  ];

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

          <button
            className="btn btn-colecciones btn-sm"
            onClick={() => navigateTo('customizer')}
          >
            <Sparkles size={15} />
            <span>Abrir Personalizador 3D</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '820px', margin: '0 auto 2.5rem auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#F0D7D2' }} />
          <div className="stepper-progress-fill" style={{ background: '#C9685B', width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

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

        {/* STEP 1: SUBCOLLECTIONS GRID */}
        {activeStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#A94D43' }}>Selecciona tu Colección Favorita</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Explora piezas diseñadas para tu día a día, escuela o regalos únicos.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              {SUBCOLLECTIONS.map((sub) => {
                const IconComponent = sub.icon;
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
                      background: isSelected ? '#FFFFFF' : '#FFFFFF',
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
                        background: isSelected ? '#C9685B' : 'rgba(201, 104, 91, 0.15)',
                        color: isSelected ? '#ffffff' : '#A94D43',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <IconComponent size={22} />
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.35rem' }}>
                      {sub.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {sub.desc || 'Catálogo de piezas de alta precisión'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#C9685B', fontWeight: '700' }}>
                      <span>{sub.count} Artículos</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: PRODUCTS CATALOG */}
        {activeStep >= 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#A94D43' }}>
                  Artículos en {SUBCOLLECTIONS.find((s) => s.id === selectedSubcollection)?.name || 'Colecciones'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Selecciona una pieza para personalizarla en 3D o añadirla directo a tu carrito.
                </p>
              </div>

              {/* Filter Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {SUBCOLLECTIONS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcollection(sub.id)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      border: selectedSubcollection === sub.id ? '1px solid #A94D43' : '1px solid #F0D7D2',
                      background: selectedSubcollection === sub.id ? '#A94D43' : '#FFFFFF',
                      color: selectedSubcollection === sub.id ? '#ffffff' : '#A94D43',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {sub.name}
                  </button>
                ))}
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
                    padding: '1.25rem',
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
                        Impresión 3D de Precisión
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.35rem' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid #F0D7D2', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Precio Base:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#A94D43' }}>
                        {formatCurrency(product.basePrice)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {product.isCustomizable ? (
                        <button
                          className="btn btn-colecciones"
                          style={{ flex: 1, padding: '0.55rem' }}
                          onClick={() => navigateTo('customizer', { productId: product.id })}
                        >
                          <Sparkles size={14} />
                          <span>Personalizar en 3D</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '0.55rem', borderColor: '#F0D7D2', color: '#A94D43' }}
                          onClick={() => addToCart({ ...product, quantity: 1 })}
                        >
                          <ShoppingBag size={14} />
                          <span>Añadir al Carrito</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColeccionesRoute;
