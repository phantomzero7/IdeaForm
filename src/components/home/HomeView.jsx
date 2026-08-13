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
  Heart,
  Layers,
  Star,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  PenTool,
  PackageCheck,
  UserCheck
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const HomeView = () => {
  const { navigateTo, addToCart, showToast } = useApp();

  const [teaserColor, setTeaserColor] = useState('#00828A');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast(`¡Gracias! Hemos enviado tu código IDEAFORM10 (10% OFF) a ${newsletterEmail}`, 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION (Matching Mockup 4) */}
      <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '3.5rem 0 4rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 0.85fr)', gap: '3rem', alignItems: 'center' }} className="hero-split">
            
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: '#f1f5f9',
                  color: 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.05em',
                  marginBottom: '1.25rem'
                }}
              >
                PERSONALIZAMOS TUS IDEAS
              </div>

              <h1 style={{ fontWeight: '800', lineHeight: '1.15', marginBottom: '1.25rem', color: '#0f172a' }}>
                Ideas que <br />
                <span style={{ color: 'var(--color-primary)' }}>toman forma.</span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '520px' }}>
                Del concepto al objeto. Diseñamos y creamos productos personalizados para acompañar tu día a día, hacer crecer tu marca y convertir momentos especiales en recuerdos.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigateTo('customizer')}>
                  <span>Explora lo que podemos crear</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Hero Visual: 3D Interactive Stage */}
            <div className="card card-elevated" style={{ padding: '1rem', background: '#ffffff', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem 0.75rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                  <Sparkles size={16} color="var(--color-primary)" />
                  <span>Configurador 3D en Vivo</span>
                </div>

                {/* Swatches */}
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

              <div style={{ height: '340px', width: '100%' }}>
                <ThreeViewer
                  modelType="keychain"
                  selectedColor={teaserColor}
                  materialType="PLA_SILK"
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
                  <span>Abrir en Personalizador Completo</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ¿QUÉ QUIERES CREAR HOY? (3 Rutas Principales - Matching Mockup 4) */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '0.25rem' }}>
              ✨ ¿Qué quieres crear hoy? ✨
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>
              Elige la ruta que mejor se adapte a lo que necesitas.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            {/* Card 1: Colecciones */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                background: '#ffffff',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 130, 138, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Box size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Colecciones</h3>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
                  Diseña algo que sea tuyo.
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Productos personalizados para escuela, oficina, regalos y uso diario listos para ordenar o diseñar.
                </p>
              </div>

              <button className="btn btn-primary" onClick={() => navigateTo('colecciones')}>
                <span>Explorar colecciones</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Card 2: Empresas */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                background: '#ffffff',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Building2 size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>Empresas</h3>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>
                  Haz tangible tu marca.
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Productos personalizados para promover tu negocio, fortalecer tu identidad corporativa y cotizar por mayoreo.
                </p>
              </div>

              <button className="btn btn-dark" onClick={() => navigateTo('empresas')}>
                <span>Ver soluciones para empresas</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Card 3: Eventos */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #e8dfd1',
                background: '#fdfbf9',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f5efe6', color: '#8c6d48', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Heart size={24} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2c2217', marginBottom: '0.25rem' }}>Eventos</h3>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#8c6d48', marginBottom: '0.75rem' }}>
                  Crea algo para recordar.
                </div>
                <p style={{ fontSize: '0.9rem', color: '#6e5d4b', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Recuerdos y artículos personalizados para bodas, XV años, graduaciones y celebraciones especiales.
                </p>
              </div>

              <button className="btn" style={{ background: '#c29d72', color: '#ffffff', fontWeight: '700' }} onClick={() => navigateTo('eventos')}>
                <span>Descubrir opciones para eventos</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST BAR (Matching Mockup 4) */}
      <section style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', padding: '1.75rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} color="var(--color-primary)" />
              <span>Hecho con amor en 3D</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
              <span>Materiales de alta calidad</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--color-primary)" />
              <span>Diseños exclusivos y originales</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} color="var(--color-primary)" />
              <span>Envíos a todo México</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="var(--color-primary)" />
              <span>Atención personalizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ASÍ DE FÁCIL (3 Pasos Claros - Matching Mockup 4) */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '0.25rem' }}>
              ✨ Así de fácil ✨
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Cómo funciona IdeaForm</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            
            {/* Step 1 */}
            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 130, 138, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Box size={24} />
              </div>
              <div style={{ display: 'inline-block', background: '#00828A', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', lineHeight: '22px', marginBottom: '0.5rem' }}>1</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>Elige</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Escoge tu colección, producto o solución ideal.</p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 130, 138, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <PenTool size={24} />
              </div>
              <div style={{ display: 'inline-block', background: '#00828A', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', lineHeight: '22px', marginBottom: '0.5rem' }}>2</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>Personaliza</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Agrega nombres, colores, logos y detalles únicos.</p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 130, 138, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <PackageCheck size={24} />
              </div>
              <div style={{ display: 'inline-block', background: '#00828A', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', lineHeight: '22px', marginBottom: '0.5rem' }}>3</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>Recibe</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lo fabricamos con calidad y lo enviamos hasta ti.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INSPÍRATE (UGC Showcase - Matching Mockup 4) */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-main)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '700', marginBottom: '0.25rem' }}>
                ✨ Inspírate ✨
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Proyectos reales de nuestros clientes</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Descubre ideas, nuevos productos y piezas personalizadas terminadas.</p>
            </div>
            <button className="btn btn-secondary" onClick={() => navigateTo('customizer')}>
              <span>Ver configurador 3D</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { name: 'Llavero Valentina', tag: 'Turquesa Seda', bg: '#00828A', text: 'Valentina' },
              { name: 'Tag Corporativo', tag: 'Negro Obsidiana', bg: '#1E293B', text: 'IDEA' },
              { name: 'Organizador de Ideas', tag: 'Arena Mate', bg: '#c29d72', text: 'Organiza tus ideas' },
              { name: 'Portaplumas Emma', tag: 'Rosa Seda', bg: '#e11d48', text: 'Emma' },
              { name: 'Taza Oficial IdeaForm', tag: 'Cerámica & PLA', bg: '#00828A', text: 'IdeaForm' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: 'var(--radius-md)',
                    background: item.bg,
                    color: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Sparkles size={24} style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                  <span style={{ fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.04em' }}>"{item.text}"</span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{item.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER / PROMO BOX (Matching Mockup 4) */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div
            className="card"
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, rgba(0, 130, 138, 0.08) 0%, rgba(0, 229, 255, 0.08) 100%)',
              border: '1px solid rgba(0, 130, 138, 0.2)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center'
            }}
          >
            <Mail size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
              Sé el primero en conocer novedades y promociones especiales
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Suscríbete y recibe un 10% de descuento en tu primer pedido personalizado con código <strong>IDEAFORM10</strong>.
            </p>

            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '480px', margin: '0 auto' }}>
              <input
                type="email"
                required
                placeholder="Escribe tu correo electrónico..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
                <span>Suscribirme</span>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-main)', borderTop: '1px solid var(--border-light)' }}>
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
