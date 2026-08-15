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

  // White base (#FFFFFF) as default so the IdeaForm Teal/Charcoal logo shines brilliantly
  const [teaserColor, setTeaserColor] = useState('#FFFFFF');
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
          <div className="hero-split-responsive">
            
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

              <p style={{ fontSize: '1.1rem', color: '#555555', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '520px' }}>
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

                {/* Swatches: Official IdeaForm Brand Palette starting with White */}
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['#FFFFFF', '#176B87', '#0F172A', '#C9685B', '#D4AF37', '#21658A'].map((hex) => (
                    <button
                      key={hex}
                      onClick={() => setTeaserColor(hex)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: hex,
                        border: teaserColor === hex ? '2px solid #176B87' : '1px solid #cbd5e1',
                        boxShadow: teaserColor === hex ? '0 0 0 2px rgba(23, 107, 135, 0.25)' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ height: '340px', width: '100%' }}>
                <ThreeViewer
                  modelType="keychain"
                  baseColor={teaserColor}
                  accentColor="#176B87"
                  reliefColor="#0F172A"
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
            
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
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#FFFFFF',
                    color: '#A94D43',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    border: '1px solid #F0D7D2'
                  }}
                >
                  PIEZAS QUE INSPIRAN TU DÍA
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#A94D43', marginBottom: '0.75rem' }}>
                  Colecciones
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#555555', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Encuentra piezas pensadas para tu espacio, tu día a día o un regalo especial. Explora nuestras líneas y añade un toque personal a tus objetos favoritos.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#A94D43', fontWeight: '700', marginBottom: '1.5rem' }}>
                  ✓ Escolar & Estudiantes &nbsp;|&nbsp; ✓ Oficina & Escritorio &nbsp;|&nbsp; ✓ Hogar & Deco &nbsp;|&nbsp; ✓ Personal & Accesorios &nbsp;|&nbsp; ✓ Kids & Juguetes
                </div>
              </div>
              <button
                className="btn btn-lg"
                style={{ background: '#A94D43', color: '#ffffff', width: '100%', fontWeight: '800' }}
                onClick={() => navigateTo('colecciones')}
              >
                <span>Ver Colecciones</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Card 2: Empresas (Teal Deep: #00828A / #E6F3F4 / #0F5F6D) */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.25rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #C4E3E5',
                background: '#E6F3F4',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#FFFFFF',
                    color: '#0F5F6D',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    border: '1px solid #C4E3E5'
                  }}
                >
                  SOLUCIONES CORPORATIVAS
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F5F6D', marginBottom: '0.75rem' }}>
                  Empresas
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#555555', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Artículos personalizados con tu identidad de marca para clientes, colaboradores y proyectos especiales. Fabricación por volumen con cotización instantánea.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#0F5F6D', fontWeight: '700', marginBottom: '1.5rem' }}>
                  ✓ Merch & Branding &nbsp;|&nbsp; ✓ Kits de Bienvenida &nbsp;|&nbsp; ✓ Reconocimientos &nbsp;|&nbsp; ✓ Facturación SAT CFDI 4.0
                </div>
              </div>
              <button
                className="btn btn-lg"
                style={{ background: '#0F5F6D', color: '#ffffff', width: '100%', fontWeight: '800' }}
                onClick={() => navigateTo('empresas')}
              >
                <span>Cotizar para Empresas</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Card 3: Eventos (Mustard Gold: #D4AF37 / #FBF7EC / #8C6D1F) */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.25rem',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid #EFE4C3',
                background: '#FBF7EC',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#FFFFFF',
                    color: '#8C6D1F',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    border: '1px solid #EFE4C3'
                  }}
                >
                  MOMENTOS QUE PERDURAN
                </div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#8C6D1F', marginBottom: '0.75rem' }}>
                  Eventos
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#555555', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                  Haz que tu celebración sea inolvidable con detalles únicos y personalizados para bodas, graduaciones, bautizos y cumpleaños.
                </p>
                <div style={{ fontSize: '0.8rem', color: '#8C6D1F', fontWeight: '700', marginBottom: '1.5rem' }}>
                  ✓ Bodas & XV Años &nbsp;|&nbsp; ✓ Graduaciones &nbsp;|&nbsp; ✓ Bautizos & Baby Showers &nbsp;|&nbsp; ✓ Recuerdos & Distintivos
                </div>
              </div>
              <button
                className="btn btn-lg"
                style={{ background: '#8C6D1F', color: '#ffffff', width: '100%', fontWeight: '800' }}
                onClick={() => navigateTo('eventos')}
              >
                <span>Descubrir Eventos</span>
                <ArrowRight size={18} />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. PROPUESTA DE VALOR */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>POR QUÉ IDEAFORM</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>El nuevo estándar de la manufactura 3D</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem' }}>
            <div className="card card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 130, 138, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Precisión Milimétrica</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Equipos de impresión 3D de última generación con tolerancia de 0.1mm para acabados suaves y resistentes.
              </p>
            </div>

            <div className="card card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 130, 138, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Truck size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Envíos Seguros a Todo México</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Empaque protector y guías de rastreo con DHL, FedEx y Estafeta. Envío gratis en pedidos mayores a $999.
              </p>
            </div>

            <div className="card card-elevated" style={{ padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 130, 138, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Heart size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Materiales Eco-Friendly</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Utilizamos PLA biodegradable derivado del almidón de maíz, seguro para el hogar y amigable con el medio ambiente.
              </p>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.5rem' }}>
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
              padding: '2rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(15, 95, 109, 0.06) 0%, rgba(32, 163, 158, 0.08) 100%)',
              border: '1px solid rgba(15, 95, 109, 0.2)',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center'
            }}
          >
            <Mail size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1A1A1A', marginBottom: '0.4rem' }}>
              Sé el primero en conocer novedades y promociones especiales
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Suscríbete y recibe un 10% de descuento en tu primer pedido con código <strong>IDEAFORM10</strong>.
            </p>

            <form
              onSubmit={handleNewsletterSubmit}
              className="newsletter-form-responsive"
              style={{ maxWidth: '480px', margin: '0 auto' }}
            >
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
                  outline: 'none',
                  minWidth: 0
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}>
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
          .hero-split-responsive {
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
        @media (min-width: 851px) {
          .hero-split-responsive {
            display: grid;
            grid-template-columns: minmax(320px, 1.15fr) minmax(320px, 0.85fr);
            gap: 3rem;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeView;
