import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, FILAMENT_MATERIALS, TESTIMONIALS, FAQS } from '../../data/mockData';
import ThreeViewer from '../3d/ThreeViewer';
import {
  Sparkles,
  Building2,
  Box,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Layers,
  Star,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Percent
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const HomeView = () => {
  const { navigateTo, addToCart } = useApp();

  // Interactive Teaser in Hero
  const [teaserColor, setTeaserColor] = useState('#00828A');
  const [teaserMaterial, setTeaserMaterial] = useState('PLA_SILK');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '3.5rem 0 4rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.1fr) minmax(320px, 0.9fr)', gap: '2.5rem', alignItems: 'center' }} className="hero-split">
            
            {/* Left Hero Content */}
            <div>
              <div className="badge badge-primary" style={{ marginBottom: '1rem', fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}>
                <Sparkles size={14} /> MANUFACTURA ADITIVA 3D DE ALTA PRECISIÓN
              </div>

              <h1 style={{ fontWeight: '800', lineHeight: '1.15', marginBottom: '1.25rem', color: '#0f172a' }}>
                Ideas que toman <span style={{ color: 'var(--color-primary)' }}>forma tridimensional.</span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
                La primera plataforma e-commerce de impresión 3D en México con stock para envío inmediato, personalizador interactivo en tiempo real y cotizador corporativo por mayoreo.
              </p>

              {/* 3 Pathway Action Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
                <div
                  onClick={() => navigateTo('catalog')}
                  className="card"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                >
                  <Box size={22} color="var(--color-primary)" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>1. Catálogo Stock</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Despacho en 24h</div>
                </div>

                <div
                  onClick={() => navigateTo('customizer')}
                  className="card"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--color-primary)',
                    background: 'rgba(0, 130, 138, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Sparkles size={22} color="var(--color-primary)" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>2. Personalizador 3D</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '700' }}>WebGL Interactivo</div>
                </div>

                <div
                  onClick={() => navigateTo('b2b')}
                  className="card"
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                >
                  <Building2 size={22} color="var(--color-primary)" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>3. Empresas B2B</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Cotizador PDF SAT</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigateTo('customizer')}>
                  <Sparkles size={18} />
                  <span>Personalizar mi Artículo 3D</span>
                  <ArrowRight size={18} />
                </button>

                <button className="btn btn-secondary btn-lg" onClick={() => navigateTo('b2b')}>
                  <Building2 size={18} />
                  <span>Cotizar por Mayoreo</span>
                </button>
              </div>
            </div>

            {/* Right Hero: Live Interactive 3D Teaser */}
            <div className="card card-elevated" style={{ padding: '1rem', background: '#ffffff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem 1rem 0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                  <Box size={16} color="var(--color-primary)" />
                  <span>Visor 3D en Vivo: Llavero Hexa</span>
                </div>

                {/* Color quick switch */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['#00828A', '#D4AF37', '#1E293B', '#EA580C'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setTeaserColor(hex)}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: hex,
                        border: teaserColor === hex ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ height: '360px', width: '100%' }}>
                <ThreeViewer
                  modelType="keychain"
                  selectedColor={teaserColor}
                  materialType={teaserMaterial}
                  customText="IDEAFORM"
                  showDimensions={false}
                />
              </div>

              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => navigateTo('customizer', { productId: 'prod-01' })}
                >
                  <span>Abrir en Configurador Completo</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST STATS & METRICS */}
      <section style={{ padding: '3rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>0.05mm</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>Resolución de Capa</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Acabados lisos de alta fidelidad</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>24-48h</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>Tiempo de Fabricación</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Granja de impresión optimizada</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>100%</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>PLA Biodegradable</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Bioplásticos eco-friendly</div>
            </div>

            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>+10,000</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>Piezas Fabricadas</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Para clientes y eventos en México</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BESTSELLERS */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>DESTACADOS</div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Los Favoritos de la Comunidad</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Modelos listos para tu setup o configurables con tus nombres y logotipos.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigateTo('catalog')}>
              <span>Ver Todo el Catálogo</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid-responsive">
            {featuredProducts.map((prod) => (
              <div key={prod.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className={`badge ${prod.isCustomizable ? 'badge-primary' : 'badge-success'}`}>
                    {prod.isCustomizable ? '✨ Personalizable' : '📦 Stock'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b' }}>
                    <Star size={13} fill="#f59e0b" />
                    <span>{prod.rating}</span>
                  </div>
                </div>

                <div
                  onClick={() => prod.isCustomizable ? navigateTo('customizer', { productId: prod.id }) : navigateTo('catalog')}
                  style={{
                    height: '160px',
                    borderRadius: 'var(--radius-md)',
                    background: 'radial-gradient(circle, #ffffff 0%, #f1f5f9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '14px', background: 'linear-gradient(135deg, #00828A, #00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                    <Box size={28} />
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.25rem' }}>{prod.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{prod.description}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#0f172a' }}>{formatCurrency(prod.basePrice)}</div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (prod.isCustomizable) {
                        navigateTo('customizer', { productId: prod.id });
                      } else {
                        addToCart({
                          id: prod.id,
                          name: prod.name,
                          basePrice: prod.basePrice,
                          finalUnitPrice: prod.basePrice,
                          selectedMaterial: FILAMENT_MATERIALS[0],
                          selectedColor: FILAMENT_MATERIALS[0].colors[0],
                          quantity: 1
                        });
                      }
                    }}
                  >
                    {prod.isCustomizable ? 'Personalizar' : 'Comprar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FILAMENT MATERIALS GUIDE */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>CIENCIA DE MATERIALES</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Polímeros de Grado Industrial</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Seleccionamos los mejores filamentos para garantizar resistencia mecánica y acabados excepcionales.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {FILAMENT_MATERIALS.map((mat) => (
              <div key={mat.id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{mat.name}</h3>
                  <span className="badge badge-primary">Lead: {mat.leadTimeHours}h</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  {mat.description}
                </p>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>COLORES POPULARES:</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {mat.colors.slice(0, 5).map((col) => (
                    <span
                      key={col.id}
                      style={{ width: '22px', height: '22px', borderRadius: '50%', background: col.hex, border: '1px solid #cbd5e1' }}
                      title={col.name}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>OPINIONES REALES</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Lo que dicen nuestros clientes</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Event planners, empresas y entusiastas del diseño que confían en IdeaForm.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b', marginBottom: '1rem' }}>
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} size={16} fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: '0.92rem', color: '#0f172a', lineHeight: '1.6', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                    "{t.comment}"
                  </p>
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0f172a' }}>{t.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{t.role} • {t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>RESOLVEMOS TUS DUDAS</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Preguntas Frecuentes</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="card"
                  style={{ padding: '1.25rem', cursor: 'pointer' }}
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>{faq.q}</h3>
                    {isOpen ? <ChevronUp size={20} color="var(--color-primary)" /> : <ChevronDown size={20} color="var(--text-tertiary)" />}
                  </div>
                  {isOpen && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: '1.6', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 850px) {
          .hero-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeView;
