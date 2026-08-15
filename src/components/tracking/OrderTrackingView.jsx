import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Package,
  Layers,
  Flame,
  Wind,
  Cpu,
  ArrowRight,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatGrams, formatMinutesToHours } from '../../utils/formatters';

const OrderTrackingView = () => {
  const { viewParams, productionOrders } = useApp();
  const [searchQuery, setSearchQuery] = useState(viewParams?.queryOrderNumber || 'IDF-84920');
  const [activeOrder, setActiveOrder] = useState(null);

  // Dynamic Telemetry Micro-fluctuations
  const [nozzleTemp, setNozzleTemp] = useState(215);
  const [bedTemp, setBedTemp] = useState(60);
  const [fanSpeed, setFanSpeed] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setNozzleTemp(214 + Math.floor(Math.random() * 3));
      setBedTemp(59 + Math.floor(Math.random() * 2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Find order on mount or query change
  useEffect(() => {
    const target = searchQuery.trim().toUpperCase();
    const found = productionOrders.find((o) => o.orderNumber.toUpperCase() === target);
    if (found) {
      setActiveOrder(found);
    } else {
      setActiveOrder(productionOrders[0] || null);
    }
  }, [searchQuery, productionOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    const target = searchQuery.trim().toUpperCase();
    const found = productionOrders.find((o) => o.orderNumber.toUpperCase() === target);
    if (found) {
      setActiveOrder(found);
    }
  };

  const TRACKING_STEPS = [
    { key: 'QUEUED', label: '1. Orden Recibida & Encolada', icon: Clock, desc: 'Verificación de archivo 3D y asignación de impresora' },
    { key: 'SLICING', label: '2. Laminado G-Code', icon: Layers, desc: 'Generación de trayectorias con resolución de capa de 0.2mm' },
    { key: 'PRINTING', label: '3. En Impresión 3D', icon: Printer, desc: 'Manufactura aditiva en filamento premium' },
    { key: 'QUALITY_CONTROL', label: '4. Control de Calidad', icon: ShieldCheck, desc: 'Post-procesado térmico, remoción de soportes y calibración' },
    { key: 'READY_TO_SHIP', label: '5. Listo para Despacho', icon: Truck, desc: 'Empaquetado ecológico y guía de rastreo asignada' }
  ];

  const currentStepIndex = activeOrder
    ? TRACKING_STEPS.findIndex((s) => s.key === activeOrder.status)
    : 2;

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', paddingBottom: '5rem' }}>
      
      {/* 1. Top Search Header */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid var(--border-light)', padding: '2.5rem 0' }}>
        <div className="container" style={{ maxWidth: '750px', textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
            <Cpu size={13} /> TELEMETRÍA DE MANUFACTURA EN VIVO
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            Rastrea la Fabricación de tu Pedido 3D
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
            Ingresa tu número de folio (ej. IDF-84920) para conocer el progreso en tiempo real de nuestras impresoras 3D.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '520px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Ej. IDF-84920..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
              style={{
                flex: 1,
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '1rem',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem', fontWeight: '800' }}>
              <Search size={18} />
              <span>Buscar</span>
            </button>
          </form>

          {/* Quick Recent Orders Chips (Continuity with Profile & Cart) */}
          {productionOrders && productionOrders.length > 0 && (
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)' }}>Tus folios recientes:</span>
              {productionOrders.slice(0, 4).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(ord.orderNumber);
                    setActiveOrder(ord);
                  }}
                  style={{
                    background: activeOrder?.orderNumber === ord.orderNumber ? 'var(--color-primary)' : '#f1f5f9',
                    color: activeOrder?.orderNumber === ord.orderNumber ? '#ffffff' : '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  #{ord.orderNumber}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Order Live Status Dashboard */}
      {activeOrder && (
        <div className="container" style={{ paddingTop: '2.5rem', maxWidth: '900px' }}>
          
          {/* Main Info Card */}
          <div className="card card-elevated" style={{ padding: '2rem', marginBottom: '2rem', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>
                  FOLIO DE FABRICACIÓN
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                  {activeOrder.orderNumber}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Cliente: <strong>{activeOrder.customerName || 'Cliente'}</strong> • Fecha: {activeOrder.date}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                  Progreso General: {activeOrder.progressPercent || 65}%
                </span>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
                  Máquina Asignada: <strong>{activeOrder.assignedPrinter || 'Bambu Lab X1C #01'}</strong>
                </div>
              </div>
            </div>

            {/* LIVE 3D TELEMETRY PANEL (Sensors & Micro-metrics) */}
            {activeOrder.status === 'PRINTING' && (
              <div
                style={{
                  background: '#090e17',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(0, 229, 255, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: '800', color: '#00e5ff' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
                    <span>TRANSMISIÓN DE SENSORES EN TIEMPO REAL (FARM 3D)</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Frecuencia: 1000 Hz</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#f87171' }}>
                      <Flame size={14} />
                      <span>Boquilla (Hotend)</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.2rem', color: '#ffffff' }}>
                      {nozzleTemp}°C
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#fbbf24' }}>
                      <Layers size={14} />
                      <span>Cama Térmica</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.2rem', color: '#ffffff' }}>
                      {bedTemp}°C
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#38bdf8' }}>
                      <Wind size={14} />
                      <span>Ventilador de Capa</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.2rem', color: '#ffffff' }}>
                      {fanSpeed}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#34d399' }}>
                      <Clock size={14} />
                      <span>Tiempo Restante</span>
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '0.2rem', color: '#ffffff' }}>
                      ~28 mins
                    </div>
                  </div>
                </div>

                {/* Animated Print Head Simulation Bar */}
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    <span>Capa 182 / 310</span>
                    <span>Velocidad: 250 mm/s</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '58%',
                        height: '100%',
                        background: 'linear-gradient(90deg, #0F5F6D, #00e5ff)',
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {TRACKING_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1.25rem',
                      opacity: isPassed ? 1 : 0.4
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isCurrent ? 'var(--color-primary)' : isPassed ? '#ecfdf5' : '#f1f5f9',
                        color: isCurrent ? '#ffffff' : isPassed ? '#059669' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: isCurrent ? '3px solid #00e5ff' : 'none'
                      }}
                    >
                      <StepIcon size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a' }}>{step.label}</h3>
                        {isCurrent && (
                          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>EN CURSO</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Technical Assistance Box */}
          <div
            className="card"
            style={{
              padding: '1.75rem',
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.08) 0%, rgba(15, 95, 109, 0.08) 100%)',
              border: '1px solid rgba(37, 211, 102, 0.25)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <MessageCircle size={20} color="#25D366" />
                <h4 style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>¿Dudas o requerimientos especiales para tu pedido?</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Habla directamente con el operador de tu máquina por WhatsApp para cambios de filamento o seguimiento.
              </p>
            </div>

            <a
              href={`https://wa.me/526121234567?text=${encodeURIComponent(`Hola IdeaForm, requiero soporte para mi pedido con folio ${activeOrder.orderNumber}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#25D366', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <MessageCircle size={16} />
              <span>Chatear por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingView;
