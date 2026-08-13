import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, Search, CheckCircle2, Clock, Box, Layers, ShieldCheck, ArrowRight, Printer, AlertCircle } from 'lucide-react';
import { formatMinutesToHours, formatCurrency } from '../../utils/formatters';

const OrderTrackingView = () => {
  const { viewParams, productionOrders } = useApp();
  const [searchCode, setSearchCode] = useState(viewParams.queryOrderNumber || 'IDF-10021');
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    const code = (searchCode || '').trim().toUpperCase();
    const found = productionOrders.find((o) => o.orderNumber.toUpperCase() === code);
    setActiveOrder(found || null);
  }, [searchCode, productionOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    const code = searchCode.trim().toUpperCase();
    const found = productionOrders.find((o) => o.orderNumber.toUpperCase() === code);
    setActiveOrder(found || null);
  };

  // Helper to map status to step index (1 to 5)
  const getStepIndex = (status) => {
    switch (status) {
      case 'QUEUED': return 1;
      case 'SLICING': return 2;
      case 'PRINTING': return 3;
      case 'QUALITY_CONTROL': return 4;
      case 'READY_TO_SHIP':
      case 'SHIPPED': return 5;
      default: return 1;
    }
  };

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '850px' }}>
      
      {/* Tracking Search Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
          <Truck size={14} /> RASTREO DE MANUFACTURA 3D EN TIEMPO REAL
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800' }}>Estado de tu Pedido</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Ingresa tu folio de compra (ej. <strong>IDF-10021</strong>) para conocer en qué fase de impresión se encuentra tu pieza.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: '480px', margin: '1.5rem auto 1rem auto' }}>
          <input
            type="text"
            placeholder="Ej. IDF-10021"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            style={{
              flex: 1,
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '1.1rem',
              fontWeight: '800',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              textAlign: 'center'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.5rem' }}>
            <Search size={18} />
            <span>Consultar</span>
          </button>
        </form>

        {/* Quick Demo Folios */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
          <span>Ejemplos para probar:</span>
          {['IDF-10021', 'IDF-10022', 'IDF-10023', 'IDF-10018'].map((f) => (
            <button
              key={f}
              onClick={() => setSearchCode(f)}
              style={{ background: '#f1f5f9', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: '700' }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Order Status Display */}
      {activeOrder ? (
        <div className="card card-elevated" style={{ padding: '2.5rem' }}>
          
          {/* Order Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>FOLIO COMERCIAL</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                {activeOrder.orderNumber}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Cliente: <strong>{activeOrder.customerName}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${currentStep === 5 ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                {activeOrder.status === 'QUEUED' && '🟡 En Cola de Taller'}
                {activeOrder.status === 'SLICING' && '🔵 Preparando Archivos (Slicing)'}
                {activeOrder.status === 'PRINTING' && '🟢 Imprimiendo en Máquina (68%)'}
                {activeOrder.status === 'QUALITY_CONTROL' && '🟣 Control de Calidad'}
                {activeOrder.status === 'READY_TO_SHIP' && '🚀 Empacado & Listo para Envío'}
              </span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
                Fecha: {activeOrder.date}
              </div>
            </div>
          </div>

          {/* Stepper Progress Visualizer */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              
              {/* Progress Background Line */}
              <div style={{ position: 'absolute', top: '20px', left: '30px', right: '30px', height: '4px', background: '#e2e8f0', zIndex: 1 }} />
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '30px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #00828A, #00e5ff)',
                  zIndex: 2,
                  width: `${((currentStep - 1) / 4) * 100}%`,
                  transition: 'width 0.5s ease'
                }}
              />

              {/* Step Circles */}
              {[
                { title: 'Cola', label: '1. Registrado' },
                { title: 'Slicing', label: '2. Slicing 3D' },
                { title: 'Impresión', label: '3. En Máquina' },
                { title: 'Calidad', label: '4. Acabado' },
                { title: 'Enviado', label: '5. Despacho' }
              ].map((step, idx) => {
                const stepNum = idx + 1;
                const isPassed = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <div key={idx} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isPassed ? 'var(--color-primary)' : '#ffffff',
                        border: isPassed ? '2px solid var(--color-primary)' : '2px solid #cbd5e1',
                        color: isPassed ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.9rem',
                        boxShadow: isCurrent ? '0 0 0 4px var(--color-primary-glow)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isPassed ? <CheckCircle2 size={18} /> : stepNum}
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? '800' : '600', color: isPassed ? '#0f172a' : 'var(--text-tertiary)' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machine & Production Details Card */}
          <div style={{ background: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Printer size={16} color="var(--color-primary)" />
              <span>Telemetría de Fabricación en Taller</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Artículo</div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{activeOrder.productName}</div>
                {activeOrder.customText && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                    Texto: "{activeOrder.customText}"
                  </div>
                )}
              </div>

              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Impresora Asignada</div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{activeOrder.assignedPrinter || 'Bambu Lab X1C #01'}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Material de Filamento</div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{activeOrder.filament}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Tiempo Estimado de Máquina</div>
                <div style={{ fontWeight: '700', color: '#0f172a' }}>{formatMinutesToHours(activeOrder.printTimeMins)}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <AlertCircle size={36} style={{ margin: '0 auto 1rem auto', color: '#f59e0b' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No se encontró el folio "{searchCode}"</h3>
          <p style={{ fontSize: '0.9rem' }}>Verifica que el código coincida con tu confirmación de compra (ej. IDF-10021).</p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingView;
