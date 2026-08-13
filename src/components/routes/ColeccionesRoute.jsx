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
  Sliders,
  Layers,
  ShoppingBag
} from 'lucide-react';

const SUBCOLLECTIONS = [
  { id: 'all', name: 'Todas las Colecciones', icon: Box, count: 8 },
  { id: 'escolar', name: 'Escolar & Estudiantes', icon: GraduationCap, count: 4, desc: 'Llaveros para mochilas, portalápices y tags' },
  { id: 'oficina', name: 'Oficina & Escritorio', icon: Briefcase, count: 4, desc: 'Organizadores de escritorio, docks y placas con nombre' },
  { id: 'hogar', name: 'Hogar & Deco', icon: Home, count: 3, desc: 'Lámparas litofanía, macetas geométricas y decoración' },
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
    <div style={{ background: '#f8fafc', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner (Clean without "RUTA 1:") */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#0F5F6D',
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
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1A1A1A' }}>
              Diseña algo que sea tuyo
            </span>
          </div>

          <button className="btn btn-primary btn-sm" onClick={() => navigateTo('customizer')}>
            <Sparkles size={15} />
            <span>Abrir Personalizador 3D</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '820px', margin: '0 auto 2.5rem auto' }}>
          <div className="stepper-progress-bg" />
          <div className="stepper-progress-fill" style={{ width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

          {STEPS.map((s) => {
            const isCompleted = activeStep > s.num;
            const isActive = activeStep === s.num;

            return (
              <button
                key={s.num}
                className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => setActiveStep(s.num)}
              >
                <div className="stepper-circle">
                  {isCompleted ? <CheckCircle2 size={16} color="var(--color-primary)" /> : s.num}
                </div>
                <div className="stepper-label">{s.label}</div>
              </button>
            );
          })}
        </div>

        {/* STEP 1: SUBCOLLECTIONS GRID */}
        {activeStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1A1A1A' }}>Selecciona tu Colección Favorita</h2>
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
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                      background: isSelected ? 'rgba(15, 95, 109, 0.04)' : '#ffffff',
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
                        background: isSelected ? '#0F5F6D' : 'rgba(15, 95, 109, 0.1)',
                        color: isSelected ? '#ffffff' : 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <IconComponent size={22} />
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.35rem' }}>
                      {sub.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {sub.desc || 'Catálogo de piezas de alta precisión'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: '700' }}>
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
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1A1A1A' }}>
                  Artículos en {SUBCOLLECTIONS.find((s) => s.id === selectedSubcollection)?.name || 'Colecciones'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Selecciona una pieza para personalizarla en 3D o añadirla directo a tu carrito.
                </p>
              </div>

              {/* Subcollection Filter Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {SUBCOLLECTIONS.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcollection(sub.id)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-full)',
                      border: selectedSubcollection === sub.id ? '1px solid #0F5F6D' : '1px solid var(--border-light)',
                      background: selectedSubcollection === sub.id ? '#0F5F6D' : '#ffffff',
                      color: selectedSubcollection === sub.id ? '#ffffff' : 'var(--text-secondary)',
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
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div>
                    {/* Badge & Model */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-primary">{product.categoryName}</span>
                      {product.isCustomizable && (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          <Sparkles size={11} /> Grabable 3D
                        </span>
                      )}
                    </div>

                    {/* Image / 3D Icon preview placeholder */}
                    <div
                      style={{
                        height: '180px',
                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        position: 'relative'
                      }}
                    >
                      <Box size={44} color="var(--color-primary)" style={{ opacity: 0.8 }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                        Impresión 3D de Precisión
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.35rem' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Precio Base:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F5F6D' }}>
                        {formatCurrency(product.basePrice)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {product.isCustomizable ? (
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '0.55rem' }}
                          onClick={() => navigateTo('customizer', { productId: product.id })}
                        >
                          <Sparkles size={14} />
                          <span>Personalizar en 3D</span>
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '0.55rem' }}
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
