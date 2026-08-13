import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';
import {
  Heart,
  Sparkles,
  Calendar,
  Gift,
  ArrowRight,
  CheckCircle2,
  Cake,
  GraduationCap,
  Baby,
  PartyPopper,
  Flame,
  Camera,
  Layers
} from 'lucide-react';

const EVENT_TYPES = [
  { id: 'boda', name: 'Bodas & Aniversarios', icon: Heart, desc: 'Litofanías fotográficas con luz, recuerdos grabados y toppers para pastel' },
  { id: 'xv', name: 'XV Años & Fiestas', icon: Sparkles, desc: 'Llaveros personalizados para invitados, velas 3D y números gigantes' },
  { id: 'bautizo', name: 'Bautizos & Primera Comunión', icon: Baby, desc: 'Cruces grabadas, ángeles y recuerdos tiernos con fecha especial' },
  { id: 'cumple', name: 'Cumpleaños & Fiestas Temáticas', icon: Cake, desc: 'Artículos 3D con nombre de festejado y figuras exclusivas' },
  { id: 'graduacion', name: 'Graduaciones & Académicos', icon: GraduationCap, desc: 'Birretes 3D, estatuillas conmemorativas y placas de generación' },
  { id: 'corporativo', name: 'Cenas & Galas Especiales', icon: PartyPopper, desc: 'Identificadores de mesa, centros de mesa y souvenirs de agradecimiento' }
];

const EventosRoute = () => {
  const { navigateTo, addToCart } = useApp();

  const [activeStep, setActiveStep] = useState(1);
  const [selectedEventType, setSelectedEventType] = useState('boda');

  const STEPS = [
    { num: 1, label: '1. Tipo de Evento' },
    { num: 2, label: '2. Detalles' },
    { num: 3, label: '3. Recuerdos 3D' },
    { num: 4, label: '4. Personaliza' },
    { num: 5, label: '5. Confirmación' }
  ];

  const EVENT_PRODUCTS = [
    {
      id: 'evt-01',
      name: 'Lámpara Litofanía DecoGlow',
      categoryName: 'Recuerdo Premium',
      basePrice: 380.00,
      description: 'Lámpara con relieve 3D que revela tu fotografía o nombres grabados al encenderse.',
      isCustomizable: true,
      modelType: 'lamp'
    },
    {
      id: 'evt-02',
      name: 'Llaveros Conmemorativos para Invitados (Pack)',
      categoryName: 'Souvenir de Mesa',
      basePrice: 45.00,
      description: 'Llaveros de alta precisión con nombres de los festejados, fecha y argolla metálica.',
      isCustomizable: true,
      modelType: 'keychain'
    },
    {
      id: 'evt-03',
      name: 'Portavelas Geométrica Mandala',
      categoryName: 'Decoración & Centro de Mesa',
      basePrice: 120.00,
      description: 'Portavelas calado en 3D que proyecta patrones de sombras cálidas en mesas.',
      isCustomizable: false,
      modelType: 'organizer'
    }
  ];

  return (
    <div style={{ background: '#FBF4E8', color: '#1A1A1A', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #EFE4D2', padding: '1.5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: '#B77B21',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.82rem',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                letterSpacing: '0.04em'
              }}
            >
              EVENTOS
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: '700', color: '#956016' }}>
              Crea algo para recordar
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#956016', fontWeight: '600' }}>
            ✨ Diseños únicos para celebraciones inolvidables
          </div>
        </div>
      </div>

      {/* 2. Interactive Stepper Bar */}
      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '1.5rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '750px', margin: '0 auto 3rem auto' }}>
          <div className="stepper-progress-bg" style={{ backgroundColor: '#EFE4D2' }} />
          <div className="stepper-progress-fill" style={{ background: '#B77B21', width: `${((activeStep - 1) / (STEPS.length - 1)) * 88}%` }} />

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
                    backgroundColor: isActive ? '#956016' : isCompleted ? '#FBF4E8' : '#FFFFFF',
                    borderColor: isActive ? '#956016' : isCompleted ? '#B77B21' : '#EFE4D2',
                    color: isActive ? '#FFFFFF' : isCompleted ? '#956016' : '#A89279'
                  }}
                >
                  {isCompleted ? <CheckCircle2 size={16} color="#956016" /> : s.num}
                </div>
                <div className="stepper-label" style={{ color: isActive ? '#956016' : '#777' }}>
                  {s.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* STEP 1: EVENT TYPE SELECTOR */}
        {activeStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ color: '#B77B21', fontWeight: '700', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                CELEBRACIÓN ESPECIAL
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#956016' }}>
                ¿Qué tipo de evento estás organizando?
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Crea recuerdos duraderos fabricados con tecnología 3D de alta definición.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {EVENT_TYPES.map((evt) => {
                const IconComponent = evt.icon;
                const isSelected = selectedEventType === evt.id;

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedEventType(evt.id);
                      setActiveStep(2);
                    }}
                    style={{
                      background: isSelected ? '#FFFFFF' : '#FFFFFF',
                      border: isSelected ? '2px solid #B77B21' : '1px solid #EFE4D2',
                      borderRadius: 'var(--radius-xl)',
                      padding: '2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = '#B77B21';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      if (!isSelected) e.currentTarget.style.borderColor = '#EFE4D2';
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: isSelected ? '#B77B21' : 'rgba(183, 123, 33, 0.15)',
                        color: isSelected ? '#FFFFFF' : '#956016',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <IconComponent size={24} />
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#956016', marginBottom: '0.4rem' }}>
                      {evt.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      {evt.desc}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#B77B21', fontWeight: '700', fontSize: '0.82rem' }}>
                      <span>Elegir recuerdos</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 & 3: PRODUCTS SELECTION */}
        {activeStep >= 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#956016' }}>
                  Recuerdos 3D para {EVENT_TYPES.find((e) => e.id === selectedEventType)?.name || 'Eventos'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Personaliza nombres, fechas y colores para tus invitados.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveStep(1)}
                  style={{ background: '#FFFFFF', borderColor: '#EFE4D2', color: '#956016' }}
                >
                  Cambiar Evento
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {EVENT_PRODUCTS.map((prod) => (
                <div
                  key={prod.id}
                  className="card card-elevated"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #EFE4D2',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge" style={{ background: '#FBF4E8', color: '#956016', border: '1px solid #EFE4D2' }}>
                        {prod.categoryName}
                      </span>
                    </div>

                    <div
                      style={{
                        height: '180px',
                        background: 'linear-gradient(135deg, #FBF4E8 0%, #F5E8D2 100%)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}
                    >
                      <Sparkles size={40} color="#B77B21" />
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#956016', marginTop: '0.5rem' }}>
                        Acabado Seda & Grabado 3D
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#956016', marginBottom: '0.35rem' }}>
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      {prod.description}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', borderTop: '1px solid #EFE4D2', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Desde:</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#956016' }}>
                        {formatCurrency(prod.basePrice)}
                      </span>
                    </div>

                    <button
                      className="btn btn-eventos"
                      style={{ width: '100%' }}
                      onClick={() => navigateTo('customizer', { modelType: prod.modelType, customText: 'NUESTRA BODA' })}
                    >
                      <Sparkles size={15} />
                      <span>Personalizar Nombres en 3D</span>
                    </button>
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

export default EventosRoute;
