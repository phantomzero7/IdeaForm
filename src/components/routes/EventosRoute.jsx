import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, FILAMENT_MATERIALS } from '../../data/mockData';
import {
  Heart,
  Crown,
  Sparkles,
  Cake,
  GraduationCap,
  Building,
  Gift,
  Check,
  Flame,
  Tag,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const EVENT_TYPES = [
  { id: 'boda', label: 'Boda', icon: Heart, desc: 'Recuerdos inolvidables' },
  { id: 'xv', label: 'XV Años', icon: Crown, desc: 'Elegancia y brillo' },
  { id: 'bautizo', label: 'Bautizo & Baby', icon: Sparkles, desc: 'Detalles tiernos y únicos' },
  { id: 'cumple', label: 'Cumpleaños', icon: Cake, desc: 'Fiestas temáticas' },
  { id: 'graduacion', label: 'Graduación', icon: GraduationCap, desc: 'Celebración de logros' },
  { id: 'corporativo', label: 'Evento Corporativo', icon: Building, desc: 'Cenas y aniversarios' },
  { id: 'otro', label: 'Otro Evento', icon: Gift, desc: 'Diseño 100% a la medida' }
];

const EventosRoute = () => {
  const { navigateTo } = useApp();
  const [selectedEventType, setSelectedEventType] = useState('boda');
  const [activeStep, setActiveStep] = useState(1);

  const eventProducts = PRODUCTS.filter((p) => p.route === 'EVENTS' || p.isCustomizable);

  return (
    <div style={{ paddingBottom: '4rem', background: '#fdfbf9' }}>
      {/* Top Route Pill Indicator (Warm Sand Theme) */}
      <div style={{ background: '#f5efe6', borderBottom: '1px solid #e8dfd1', padding: '0.65rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <span style={{ background: '#c29d72', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.04em' }}>
            RUTA 3: EVENTOS
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#5c4a36' }}>
            Crea algo para recordar
          </span>
        </div>
      </div>

      {/* Stepper Bar (Matching Mockup 3) */}
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#e8dfd1' }} />
          <div className="stepper-progress-fill" style={{ width: activeStep === 1 ? '10%' : activeStep === 2 ? '35%' : '80%', background: 'linear-gradient(90deg, #c29d72, #00828A)' }} />

          {[
            { num: 1, label: '1. Tipo de evento' },
            { num: 2, label: '2. Detalles' },
            { num: 3, label: '3. Productos' },
            { num: 4, label: '4. Personaliza' },
            { num: 5, label: '5. Confirmación' }
          ].map((s) => (
            <button
              key={s.num}
              className={`stepper-step ${activeStep === s.num ? 'active' : activeStep > s.num ? 'completed' : ''}`}
              onClick={() => setActiveStep(s.num)}
            >
              <div className="stepper-circle" style={{ borderColor: activeStep === s.num ? '#c29d72' : '#e8dfd1', backgroundColor: activeStep === s.num ? '#c29d72' : '#ffffff' }}>
                {activeStep > s.num ? <Check size={14} color="#c29d72" /> : s.num}
              </div>
              <span className="stepper-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section (Warm Aesthetic) */}
      <section style={{ padding: '2.5rem 0 3.5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <div className="badge" style={{ background: '#f5efe6', color: '#8c6d48', border: '1px solid #e8dfd1', marginBottom: '0.85rem' }}>
            ✨ RECUERDOS & CELEBRACIONES
          </div>
          <h1 style={{ fontSize: '2.6rem', fontWeight: '800', color: '#2c2217', marginBottom: '0.85rem' }}>
            Crea algo para recordar.
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6e5d4b', lineHeight: '1.6' }}>
            Artículos personalizados con tecnología 3D para hacer de cada boda, graduación o fiesta un momento inolvidable.
          </p>
        </div>
      </section>

      {/* Event Type Grid ("¿Qué tipo de evento estás organizando?") */}
      <section style={{ padding: '2.5rem 0', background: '#ffffff', borderTop: '1px solid #f0e8dc', borderBottom: '1px solid #f0e8dc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2c2217', marginBottom: '0.25rem' }}>
              ¿Qué tipo de evento estás organizando?
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#8c7b6b' }}>Selecciona tu celebración para ver recuerdos sugeridos.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {EVENT_TYPES.map((ev) => {
              const IconComp = ev.icon;
              const isSelected = selectedEventType === ev.id;

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedEventType(ev.id);
                    setActiveStep(2);
                  }}
                  className="card"
                  style={{
                    padding: '1.25rem 0.75rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? '2px solid #c29d72' : '1px solid #e8dfd1',
                    background: isSelected ? '#fbf8f4' : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isSelected ? '#c29d72' : '#f5efe6',
                      color: isSelected ? '#ffffff' : '#8c6d48',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.65rem auto'
                    }}
                  >
                    <IconComp size={20} />
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#2c2217', marginBottom: '0.2rem' }}>{ev.label}</h4>
                  <p style={{ fontSize: '0.72rem', color: '#8c7b6b' }}>{ev.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ideas que encantan (Featured 3D Event Items) */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2c2217', marginBottom: '0.25rem' }}>Ideas que encantan</h2>
            <p style={{ fontSize: '0.9rem', color: '#8c7b6b' }}>Recuerdos y detalles personalizados con los nombres de los festejados y la fecha del evento.</p>
          </div>

          <div className="grid-responsive">
            {eventProducts.map((prod) => (
              <div
                key={prod.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid #e8dfd1'
                }}
              >
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '0.75rem', background: '#f5efe6', color: '#8c6d48', border: '1px solid #e8dfd1' }}>
                    ✨ Grabado con Nombres & Fecha
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#2c2217', marginBottom: '0.35rem' }}>{prod.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6e5d4b', marginBottom: '1rem', lineHeight: '1.5' }}>{prod.description}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0e8dc', paddingTop: '0.85rem' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#00828A' }}>
                    {formatCurrency(prod.basePrice)}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigateTo('customizer', { productId: prod.id })}
                  >
                    <span>Personalizar 3D</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Special Custom Event Proposal Box */}
          <div
            className="card"
            style={{
              marginTop: '3rem',
              padding: '2.5rem',
              background: 'linear-gradient(135deg, #2c2217 0%, #423424 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.5rem'
            }}
          >
            <div style={{ maxWidth: '550px' }}>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>
                Hagamos de tu evento algo inolvidable.
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#d4c7b8', lineHeight: '1.6' }}>
                Cuéntanos los detalles de tu celebración y te ayudamos a crear los recuerdos 3D perfectos con empaque de regalo y envío prioritario.
              </p>
            </div>

            <button
              className="btn btn-lg"
              style={{ background: '#c29d72', color: '#ffffff', fontWeight: '800', border: 'none' }}
              onClick={() => navigateTo('b2b')}
            >
              <span>Solicitar Cotización de Evento</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventosRoute;
