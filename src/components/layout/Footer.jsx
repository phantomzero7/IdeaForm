import React from 'react';
import { useApp } from '../../context/AppContext';
import IdeaFormLogo from '../common/IdeaFormLogo';
import { Leaf, Sparkles, Receipt, Truck, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';

const Footer = () => {
  const { navigateTo } = useApp();

  return (
    <footer style={{ background: '#ffffff', color: '#0f172a', borderTop: '1px solid var(--border-light)', marginTop: '4rem' }}>
      
      {/* 1. Value Props Banner */}
      <div style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.1)', padding: '0.65rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
              <Leaf size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.2rem' }}>Materiales de Alta Calidad</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Bioplásticos PLA biodegradables de maíz y polímeros técnicos no tóxicos.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.1)', padding: '0.65rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.2rem' }}>Personalización 3D en Vivo</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Previsualiza tus nombres y logotipos en 360° antes de imprimir.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.1)', padding: '0.65rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
              <Receipt size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.2rem' }}>Facturación CFDI 4.0 SAT</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Generación inmediata de factura con validez fiscal para empresas y particulares.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.1)', padding: '0.65rem', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)' }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.2rem' }}>Envíos a Todo México</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>DHL, FedEx y Estafeta con número de guía y rastreo de producción en tiempo real.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body (Matching Mockup Footer) */}
      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
        
        {/* Brand & Slogan */}
        <div style={{ maxWidth: '300px' }}>
          <IdeaFormLogo onClick={() => navigateTo('home')} size="medium" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', marginTop: '1rem', marginBottom: '1.25rem' }}>
            Manufactura aditiva y comercio electrónico de artículos personalizados y stock para hogar, oficina y eventos.
          </p>

          {/* Social Media Channels */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <a
              href="https://wa.me/526121403409?text=Hola%20IdeaForm%20quiero%20cotizar%20un%20proyecto"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp Taller 3D"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#25D366',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <Phone size={16} />
            </a>

            <a
              href="https://www.instagram.com/ideaform.mx/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram @ideaform.mx"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <Sparkles size={16} />
            </a>

            <a
              href="https://facebook.com/ideaform3d"
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook Oficial"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#1877F2',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <Mail size={16} />
            </a>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            © {new Date().getFullYear()} IdeaForm. Todos los derechos reservados.
          </div>
        </div>

        {/* Navegación */}
        <div>
          <h4 style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '0.04em' }}>NAVEGACIÓN</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li><a href="#colecciones" onClick={(e) => { e.preventDefault(); navigateTo('colecciones'); }}>Colecciones</a></li>
            <li><a href="#empresas" onClick={(e) => { e.preventDefault(); navigateTo('empresas'); }}>Empresas</a></li>
            <li><a href="#eventos" onClick={(e) => { e.preventDefault(); navigateTo('eventos'); }}>Eventos</a></li>
            <li><a href="#customizer" onClick={(e) => { e.preventDefault(); navigateTo('customizer'); }} style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Personalizador 3D</a></li>
            <li><a href="#tracking" onClick={(e) => { e.preventDefault(); navigateTo('tracking'); }}>Rastrear Pedido</a></li>
          </ul>
        </div>

        {/* Ayuda & Políticas */}
        <div>
          <h4 style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '0.04em' }}>AYUDA</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <li><a href="#faq" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>Preguntas Frecuentes</a></li>
            <li><a href="#shipping" onClick={(e) => { e.preventDefault(); alert('Envíos rápidos a toda la República Mexicana por DHL/FedEx en 24 a 72 hrs hábiles.'); }}>Envíos y Entregas</a></li>
            <li><a href="#returns" onClick={(e) => { e.preventDefault(); alert('Garantía de calidad: Reemplazamos sin costo cualquier producto con defecto de fabricación.'); }}>Cambios y Devoluciones</a></li>
            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Aviso de Privacidad: Cuidamos tus datos conforme a la legislación mexicana LFPDPPP.'); }}>Aviso de Privacidad</a></li>
          </ul>
        </div>

        {/* Contacto Directo (Matching Mockup) */}
        <div>
          <h4 style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '0.04em' }}>CONTACTO</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={15} color="var(--color-primary)" />
              <a href="tel:+526121403409" style={{ color: 'inherit', textDecoration: 'none' }}>+52 612 140 3409</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} color="var(--color-primary)" />
              <span>hola@ideaform.mx</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={15} color="var(--color-primary)" />
              <span>La Paz, Baja California Sur</span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>MÉTODOS DE PAGO SEGUROS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {['VISA', 'Mastercard', 'AMEX', 'SPEI', 'PayPal', 'OXXO', 'Mercado Pago'].map((b) => (
                <span key={b} style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#475569' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
