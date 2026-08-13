import React from 'react';
import { useApp } from '../../context/AppContext';
import { Box, ShieldCheck, Leaf, Truck, Receipt, Sparkles, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const { navigateTo } = useApp();

  return (
    <footer style={{ background: '#090e17', color: '#ffffff', borderTop: '1px solid #1e293b', marginTop: '4rem' }}>
      {/* 1. Value Props Banner */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '2.5rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#00e5ff' }}>
              <Leaf size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>PLA 100% Eco-Friendly</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Bioplásticos biodegradables a base de almidón de maíz, libres de toxinas y de alta durabilidad.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#00e5ff' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>Personalización 3D en Vivo</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Motor WebGL interactivo para previsualizar colores, tipografías y logos antes de imprimir.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#00e5ff' }}>
              <Receipt size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>Facturación CFDI 4.0 SAT</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Factura inmediata para personas físicas y empresas con desglose fiscal completo y XML/PDF.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ background: 'rgba(0, 130, 138, 0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', color: '#00e5ff' }}>
              <Truck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff', marginBottom: '0.25rem' }}>Envíos Seguros a Todo México</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Alianzas directas con DHL, FedEx y Estafeta con número de guía y rastreo en tiempo real.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation */}
      <div className="container" style={{ padding: '3.5rem 1.5rem 2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>
        {/* Col 1: Brand */}
        <div style={{ maxWidth: '320px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, #00828A, #00e5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
              IDEA<span style={{ color: '#00e5ff' }}>FORM</span>
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            Transformamos tus ideas y marcas en objetos tridimensionales de alta precisión con tecnología aditiva industrial.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={15} color="#00e5ff" />
              <span>La Paz, Baja California Sur, México</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={15} color="#00e5ff" />
              <span>contacto@ideaform.mx</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Phone size={15} color="#00e5ff" />
              <span>+52 (612) 123-4567</span>
            </div>
          </div>
        </div>

        {/* Col 2: Rutas & Catálogo */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.04em' }}>CATÁLOGO & RUTAS</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <li><a href="#catalog" onClick={(e) => { e.preventDefault(); navigateTo('catalog'); }} style={{ transition: 'color 0.2s' }}>Colección Escritorio & Setup</a></li>
            <li><a href="#catalog" onClick={(e) => { e.preventDefault(); navigateTo('catalog'); }} style={{ transition: 'color 0.2s' }}>Hogar & Decoración Voronoi</a></li>
            <li><a href="#customizer" onClick={(e) => { e.preventDefault(); navigateTo('customizer'); }} style={{ transition: 'color 0.2s', color: '#00e5ff' }}>Configurador 3D en Vivo</a></li>
            <li><a href="#b2b" onClick={(e) => { e.preventDefault(); navigateTo('b2b'); }} style={{ transition: 'color 0.2s' }}>Portal B2B & Mayoreo</a></li>
            <li><a href="#events" onClick={(e) => { e.preventDefault(); navigateTo('customizer', { productId: 'prod-03' }); }} style={{ transition: 'color 0.2s' }}>Recuerdos de Bodas & Eventos</a></li>
          </ul>
        </div>

        {/* Col 3: Clientes & Soporte */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.04em' }}>SOPORTE & AYUDA</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <li><a href="#tracking" onClick={(e) => { e.preventDefault(); navigateTo('tracking'); }}>Rastrear Pedido en Tiempo Real</a></li>
            <li><a href="#faq" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>Preguntas Frecuentes (FAQ)</a></li>
            <li><a href="#materials" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>Guía de Filamentos & Materiales</a></li>
            <li><a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Aviso de Privacidad: Protegemos tus datos y propiedad intelectual con cifrado SSL 256-bit bajo la ley LFPDPPP.'); }}>Aviso de Privacidad</a></li>
            <li><a href="#terms" onClick={(e) => { e.preventDefault(); alert('Términos de Manufactura: Productos personalizados se fabrican bajo demanda; incluyen garantía de satisfacción y reemplazo por defectos de fabricación.'); }}>Términos y Condiciones</a></li>
          </ul>
        </div>

        {/* Col 4: Métodos de Pago & Seguridad */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.04em' }}>PAGOS SEGUROS</h4>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.85rem' }}>
            Aceptamos las principales pasarelas con encriptación bancaria SSL 256-bit:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {['Visa', 'Mastercard', 'AMEX', 'SPEI BBVA', 'Mercado Pago', 'Stripe', 'OXXO Pay'].map((badge) => (
              <span
                key={badge}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  color: '#e2e8f0'
                }}
              >
                {badge}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#10b981' }}>
            <ShieldCheck size={16} />
            <span>Transacciones 100% Protegidas PCI-DSS</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div style={{ borderTop: '1px solid #1e293b', padding: '1.5rem 0', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        <div className="container">
          © {new Date().getFullYear()} IdeaForm México S.A. de C.V. Todos los derechos reservados. Diseñado para manufactura aditiva y personalización digital 3D.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
