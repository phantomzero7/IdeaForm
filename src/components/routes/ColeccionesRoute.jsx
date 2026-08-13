import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, FILAMENT_MATERIALS } from '../../data/mockData';
import { Sparkles, ShoppingBag, ArrowRight, Check, BookOpen, Briefcase, Home as HomeIcon, User, Smile } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const SUBCOLLECTIONS = [
  { id: 'escolar', name: 'Escolar', desc: 'Divertida y práctica', icon: BookOpen, tag: 'Estudiantes & Maestros' },
  { id: 'oficina', name: 'Oficina', desc: 'Minimal y funcional', icon: Briefcase, tag: 'Setup & Productividad' },
  { id: 'hogar', name: 'Hogar', desc: 'Útil y decorativa', icon: HomeIcon, tag: 'Espacios & Plantas' },
  { id: 'personal', name: 'Personal', desc: 'Para todos los días', icon: User, tag: 'Llaveros & Accesorios' },
  { id: 'kids', name: 'Kids', desc: 'Pequeños grandes detalles', icon: Smile, tag: 'Creatividad Infantil' }
];

const ColeccionesRoute = () => {
  const { navigateTo, addToCart } = useApp();
  const [selectedSubcol, setSelectedSubcol] = useState('oficina');
  const [activeStep, setActiveStep] = useState(1);

  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedSubcol === 'oficina') return p.category === 'escritorio';
    if (selectedSubcol === 'hogar') return p.category === 'decoracion';
    if (selectedSubcol === 'personal') return p.tags.includes('Llaveros') || p.tags.includes('Regalos');
    return true;
  });

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Top Route Pill Indicator */}
      <div style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border-light)', padding: '0.65rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <span style={{ background: '#00828A', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.04em' }}>
            RUTA 1: COLECCIONES
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Diseña algo que sea tuyo
          </span>
        </div>
      </div>

      {/* Stepper Bar (Matching Mockup 1) */}
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="stepper-progress-bg" />
          <div className="stepper-progress-fill" style={{ width: activeStep === 1 ? '15%' : activeStep === 2 ? '40%' : '75%' }} />

          {[
            { num: 1, label: '1. Colección' },
            { num: 2, label: '2. Productos' },
            { num: 3, label: '3. Personaliza' },
            { num: 4, label: '4. Vista previa' },
            { num: 5, label: '5. Paquete' },
            { num: 6, label: '6. Carrito' }
          ].map((s) => (
            <button
              key={s.num}
              className={`stepper-step ${activeStep === s.num ? 'active' : activeStep > s.num ? 'completed' : ''}`}
              onClick={() => setActiveStep(s.num)}
            >
              <div className="stepper-circle">{activeStep > s.num ? <Check size={14} /> : s.num}</div>
              <span className="stepper-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '2.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
            Diseña algo que sea tuyo
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Elige tu colección favorita, combina colores de filamento de alta gama, texturas seda y graba tus nombres en relieve 3D.
          </p>
        </div>
      </section>

      {/* Subcollections Selector */}
      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.25rem' }}>Elige tu colección</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Cada colección tiene combinaciones únicas de colores y diseños.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
            {SUBCOLLECTIONS.map((col) => {
              const IconComp = col.icon;
              const isSelected = selectedSubcol === col.id;

              return (
                <div
                  key={col.id}
                  onClick={() => {
                    setSelectedSubcol(col.id);
                    setActiveStep(2);
                  }}
                  className="card"
                  style={{
                    padding: '1.5rem 1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                    background: isSelected ? 'rgba(0, 130, 138, 0.05)' : '#ffffff',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--color-primary)' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem auto'
                    }}
                  >
                    <IconComp size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>{col.name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{col.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Products Grid for this collection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>
                Artículos en Colección: <span style={{ color: 'var(--color-primary)' }}>{selectedSubcol.toUpperCase()}</span>
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{filteredProducts.length} productos disponibles</span>
            </div>

            <div className="grid-responsive">
              {filteredProducts.map((p) => (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
                  <div>
                    <span className={`badge ${p.isCustomizable ? 'badge-primary' : 'badge-success'}`} style={{ marginBottom: '0.75rem' }}>
                      {p.isCustomizable ? '✨ Grabado en 3D' : '📦 En Stock'}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.35rem' }}>{p.name}</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{p.description}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)' }}>{formatCurrency(p.basePrice)}</div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (p.isCustomizable) {
                          navigateTo('customizer', { productId: p.id });
                        } else {
                          addToCart({
                            id: p.id,
                            name: p.name,
                            basePrice: p.basePrice,
                            finalUnitPrice: p.basePrice,
                            selectedMaterial: FILAMENT_MATERIALS[0],
                            selectedColor: FILAMENT_MATERIALS[0].colors[0],
                            quantity: 1
                          });
                        }
                      }}
                    >
                      {p.isCustomizable ? 'Personalizar' : 'Comprar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColeccionesRoute;
