import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FAQS } from '../../data/mockData';
import ThreeViewer from '../3d/ThreeViewer';
import IdeaFormLogo from '../common/IdeaFormLogo';
import {
  Sparkles,
  Building2,
  Box,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  ChevronDown,
  ChevronUp,
  Mail,
  Send,
  PenTool,
  PackageCheck,
  UserCheck
} from 'lucide-react';

const HomeView = () => {
  const { navigateTo, showToast } = useApp();

  const [teaserColor, setTeaserColor] = useState('#C9685B');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      showToast(`¡Gracias! Código IDEAFORM10 enviado a ${newsletterEmail}`, 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '3.5rem 0 4rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 0.85fr)', gap: '3rem', alignItems: 'center' }} className="hero-split">
            
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(15, 95, 109, 0.1)',
                  color: 'var(--color-primary)',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.05em',
                  marginBottom: '1.25rem'
                }}
              >
                PERSONALIZAMOS TUS IDEAS EN 3D
              </div>

              <h1 style={{ fontWeight: '800', lineHeight: '1.15', marginBottom: '1.25rem', color: '#1A1A1A' }}>
                Ideas que <br />
                <span style={{ color: 'var(--color-primary)' }}>toman forma.</span>
              </h1>

              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '520px' }}>
                Del concepto al objeto. Diseñamos y creamos productos personalizados para acompañar tu día a día, hacer crecer tu marca y convertir momentos especiales en recuerdos.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigateTo('colecciones')}>
                  <span>Explora lo que podemos crear</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Hero Visual: 3D Stage with Official IdeaForm Brand Emblem */}
            <div className="card card-elevated" style={{ padding: '1rem', background: '#ffffff', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem 0.75rem 0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IdeaFormLogo size="small" showTagline={false} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: '800', paddingLeft: '0.4rem', borderLeft: '1.5px solid #cbd5e1', letterSpacing: '0.05em' }}>
                    3D LIVE
                  </span>
                </div>

                {/* Swatches matching official section colors */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['#C9685B', '#21658A', '#B77B21', '#1A1A1A'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setTeaserColor(hex)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: hex,
                        border: teaserColor === hex ? '2px solid #1A1A1A' : '1px solid #cbd5e1',
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
                  onClick={() => navigateTo('colecciones')}
                >
                  <span>Explorar y Personalizar en Colecciones</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ¿QUÉ QUIERES CREAR HOY? (3 Secciones con sus Colores Oficiales Pantone) */}
      <section style={{ padding: '4.5rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '800', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
              ✨ ¿QUÉ QUIERES CREAR HOY? ✨
            </div>
            <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#1A1A1A' }}>
              Elige la categoría que mejor se adapte a lo que necesitas
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            {/* Card 1: Colecciones (Coral Terracotta: #C9685B / #FAEEEB / #A94D43) */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.25rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #F0D7D2',
                background: '#FAEEEB',
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
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(201, 104, 91, 0.2)', color: '#A94D43', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Box size={26} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.3rem' }}>Colecciones</h3>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#C9685B', marginBottom: '0.85rem' }}>
                  Diseña algo que sea tuyo.
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
                  Productos personalizados para escuela, oficina, regalos y uso diario listos para ordenar o diseñar en 6 pasos.
                </p>
              </div>

              <button className="btn btn-colecciones" onClick={() => navigateTo('colecciones')}>
                <span>Explorar Colecciones</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Card 2: Empresas (Ocean Navy: #21658A / #EDF4F8 / #104F75) */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.25rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #D5E4ED',
                background: '#EDF4F8',
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
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(33, 101, 138, 0.2)', color: '#104F75', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Building2 size={26} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#104F75', marginBottom: '0.3rem' }}>Empresas</h3>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#21658A', marginBottom: '0.85rem' }}>
                  Haz tangible tu marca.
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
                  Productos corporativos para promover tu negocio, fortalecer tu identidad y cotizar mayoreo con CFDI 4.0.
                </p>
              </div>

              <button className="btn btn-empresas" onClick={() => navigateTo('empresas')}>
                <span>Ver Soluciones para Empresas</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Card 3: Eventos (Golden Ochre: #B77B21 / #FBF4E8 / #956016) */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.25rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #EFE4D2',
                background: '#FBF4E8',
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
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(183, 123, 33, 0.2)', color: '#956016', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <Heart size={26} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#956016', marginBottom: '0.3rem' }}>Eventos</h3>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#B77B21', marginBottom: '0.85rem' }}>
                  Crea algo para recordar.
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.75rem' }}>
                  Recuerdos y artículos 3D personalizados para bodas, XV años, graduaciones y celebraciones especiales.
                </p>
              </div>

              <button className="btn btn-eventos" onClick={() => navigateTo('eventos')}>
                <span>Descubrir Opciones para Eventos</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST BAR */}
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

      {/* 4. ASÍ DE FÁCIL */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '800', marginBottom: '0.25rem' }}>
              ✨ ASÍ DE FÁCIL ✨
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1A1A1A' }}>Cómo funciona IdeaForm</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(15, 95, 109, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Box size={24} />
              </div>
              <div style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', lineHeight: '22px', marginBottom: '0.5rem' }}>1</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.4rem' }}>Elige</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Escoge tu colección, producto o solución ideal.</p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(15, 95, 109, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <PenTool size={24} />
              </div>
              <div style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', lineHeight: '22px', marginBottom: '0.5rem' }}>2</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.4rem' }}>Personaliza</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Agrega nombres, colores, logos y detalles únicos.</p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(15, 95, 109, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <PackageCheck size={24} />
              </div>
              <div style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', width: '22px', height: '22px', borderRadius: '50%', lineHeight: '22px', marginBottom: '0.5rem' }}>3</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.4rem' }}>Recibe</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Lo fabricamos con calidad y lo enviamos hasta ti.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER BOX */}
      <section style={{ padding: '3.5rem 0', background: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div
            className="card"
            style={{
              padding: '2.5rem',
              background: 'linear-gradient(135deg, rgba(15, 95, 109, 0.06) 0%, rgba(32, 163, 158, 0.08) 100%)',
              border: '1px solid rgba(15, 95, 109, 0.2)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center'
            }}
          >
            <Mail size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.4rem' }}>
              Sé el primero en conocer novedades y promociones especiales
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Suscríbete y recibe un 10% de descuento en tu primer pedido con código <strong>IDEAFORM10</strong>.
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

      {/* 6. FAQ ACCORDION */}
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
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1A1A1A' }}>{faq.q}</h3>
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
