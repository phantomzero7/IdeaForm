import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import B2BCalculator from '../b2b/B2BCalculator';
import {
  Megaphone,
  ShieldCheck,
  Gift,
  Users,
  Rocket,
  Layers,
  Check,
  Building2,
  Package,
  Award,
  Truck
} from 'lucide-react';

const OBJECTIVES = [
  { id: 'dar-a-conocer', label: 'Dar a conocer mi marca', icon: Megaphone, desc: 'Branding de alto impacto' },
  { id: 'identidad', label: 'Fortalecer mi identidad', icon: ShieldCheck, desc: 'Cultura y presencia corporativa' },
  { id: 'regalar', label: 'Regalar a mis clientes', icon: Gift, desc: 'Fidelización y agradecimiento' },
  { id: 'motivar', label: 'Motivar a mi equipo', icon: Users, desc: 'Kits de bienvenida y onboarding' },
  { id: 'lanzar', label: 'Lanzar un producto', icon: Rocket, desc: 'Eventos de lanzamiento exclusivos' },
  { id: 'merch', label: 'Merchandising y más', icon: Layers, desc: 'Artículos promocionales por volumen' }
];

const EmpresasRoute = () => {
  const [selectedObjective, setSelectedObjective] = useState('dar-a-conocer');
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Top Route Pill Indicator */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0.65rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <span style={{ background: '#00828A', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', letterSpacing: '0.04em' }}>
            RUTA 2: EMPRESAS
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>
            Haz tangible tu marca
          </span>
        </div>
      </div>

      {/* Stepper Bar (Matching Mockup 2) */}
      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1rem' }}>
        <div className="stepper-nav" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div className="stepper-progress-bg" />
          <div className="stepper-progress-fill" style={{ width: activeStep === 1 ? '10%' : activeStep === 2 ? '35%' : '80%' }} />

          {[
            { num: 1, label: '1. Objetivo' },
            { num: 2, label: '2. Productos' },
            { num: 3, label: '3. Personaliza' },
            { num: 4, label: '4. Cotiza PDF' },
            { num: 5, label: '5. Confirmación' }
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

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', padding: '2.5rem 0 3.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.85rem' }}>
            Haz tangible tu marca.
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Productos personalizados que hablan por tu negocio y dejan huella. Manufactura aditiva industrial en La Paz, BCS con envíos prioritarios a todo México.
          </p>
        </div>
      </section>

      {/* Objectives Grid ("¿Qué quieres lograr?") */}
      <section style={{ padding: '3rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>¿Qué quieres lograr?</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>Cuéntanos tu objetivo principal para adaptar la cotización.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {OBJECTIVES.map((obj) => {
              const IconComponent = obj.icon;
              const isSelected = selectedObjective === obj.id;

              return (
                <div
                  key={obj.id}
                  onClick={() => {
                    setSelectedObjective(obj.id);
                    setActiveStep(2);
                  }}
                  className="card"
                  style={{
                    padding: '1.25rem 1rem',
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
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--color-primary)' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.65rem auto'
                    }}
                  >
                    <IconComponent size={22} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.2rem' }}>{obj.label}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{obj.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Embedded B2B Calculator & Tiered Volume Engine */}
      <section style={{ paddingTop: '1rem' }}>
        <B2BCalculator />
      </section>
    </div>
  );
};

export default EmpresasRoute;
