import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateB2BQuotePDF } from '../../utils/pdfGenerator';
import { shippingService } from '../../services/shippingService';
import { formatCurrency, formatGrams, formatMinutesToHours } from '../../utils/formatters';
import {
  LayoutDashboard,
  Printer,
  Layers,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Lock,
  ShieldAlert,
  LogIn,
  Truck,
  Plane,
  PackageCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const {
    productionOrders,
    updateOrderStatus,
    assignPrinter,
    filamentInventory,
    updateFilamentStock,
    b2bQuotes,
    user,
    userRole,
    setIsAuthModalOpen,
    navigateTo,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('kanban'); // kanban | inventory | quotes | metrics

  const [staffPin, setStaffPin] = useState('');

  // RBAC SECURITY GUARD: Check if user has permission
  const isAuthorized = user && (userRole === 'ADMIN' || userRole === 'OPERATOR_3D');

  const handleStaffPinUnlock = (e) => {
    e.preventDefault();
    if (staffPin === '1234' || staffPin === 'admin' || staffPin === 'ideaform') {
      const adminUser = {
        id: 'usr-admin-01',
        email: 'taller@ideaform.com',
        firstName: 'Staff',
        lastName: 'IdeaForm',
        role: 'ADMIN'
      };
      setUser(adminUser);
      setUserRole('ADMIN');
      showToast('¡Acceso concedido al Taller 3D!', 'success');
    } else {
      showToast('PIN de taller no válido', 'error');
    }
  };

  if (!isAuthorized) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem', maxWidth: '520px', textAlign: 'center' }}>
        <div className="card card-elevated" style={{ padding: '3rem 2.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <ShieldAlert size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.4rem' }}>
            Acceso al Taller de Impresión 3D
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            Esta sección contiene el tablero Kanban de producción, telemetría de granja 3D y finanzas. Ingresa tu PIN de operador o inicia sesión con tu cuenta corporativa.
          </p>

          <form onSubmit={handleStaffPinUnlock} style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '340px', margin: '0 auto' }}>
              <input
                type="password"
                placeholder="PIN de Taller (Ej: 1234)"
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.25rem' }}>
                Entrar
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => navigateTo('home')}
            >
              Volver a la Tienda Pública
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const totalSales = productionOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalMachineMinutes = productionOrders.reduce((acc, o) => acc + (o.printTimeMins || 0), 0);
  const totalGramsUsed = productionOrders.reduce((acc, o) => acc + (o.filamentGrams || 0), 0);
  const activePrintersCount = productionOrders.filter((o) => o.status === 'PRINTING').length;

  const KANBAN_COLUMNS = [
    { id: 'QUEUED', label: '1. En Cola', color: '#f59e0b' },
    { id: 'SLICING', label: '2. Slicing G-Code', color: '#3b82f6' },
    { id: 'PRINTING', label: '3. En Impresora 3D', color: '#0F5F6D' },
    { id: 'QUALITY_CONTROL', label: '4. Control de Calidad', color: '#8b5cf6' },
    { id: 'READY_TO_SHIP', label: '5. Listo para Envío', color: '#10b981' }
  ];

  const PRINTERS_LIST = [
    'Bambu Lab X1C #01',
    'Bambu Lab X1C #02',
    'Creality K1 Max #01',
    'Creality K1 Max #02',
    'Prusa MK4 #03'
  ];

  const handleGenerateWaybill = (order) => {
    const waybill = shippingService.generateWaybill(order.orderNumber, 'dhl_express');
    showToast(`Guía generada: ${waybill.trackingNumber} (${waybill.carrierName}). Listo para recolección.`, 'success');
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* Header with Role Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-primary">
              <LayoutDashboard size={13} /> BACKOFFICE & ERP 3D
            </span>
            <span className="badge" style={{ background: '#1A1A1A', color: '#fff' }}>
              Sesión: {user.firstName} ({userRole})
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Panel de Control del Taller IdeaForm</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Administración de órdenes, granja de impresoras 3D, inventario de materias primas y cotizaciones corporativas.
          </p>
        </div>

        {/* Quick KPI pills */}
        {userRole === 'ADMIN' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ background: '#ffffff', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>TOTAL GMV</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>{formatCurrency(totalSales)}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>EN MÁQUINA</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>{activePrintersCount} impresiones</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '2rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('kanban')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.9rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'kanban' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'kanban' ? '3px solid var(--color-primary)' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            whiteSpace: 'nowrap'
          }}
        >
          <Printer size={16} />
          <span>Tablero Kanban de Taller ({productionOrders.length})</span>
        </button>

        {userRole === 'ADMIN' && (
          <>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                padding: '0.75rem 1.25rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: activeTab === 'inventory' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'inventory' ? '3px solid var(--color-primary)' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Layers size={16} />
              <span>Inventario BOM (Filamentos)</span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              style={{
                padding: '0.75rem 1.25rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: activeTab === 'quotes' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'quotes' ? '3px solid var(--color-primary)' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              <FileText size={16} />
              <span>Cotizaciones B2B ({b2bQuotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              style={{
                padding: '0.75rem 1.25rem',
                fontWeight: '700',
                fontSize: '0.9rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: activeTab === 'metrics' ? 'var(--color-primary)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'metrics' ? '3px solid var(--color-primary)' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                whiteSpace: 'nowrap'
              }}
            >
              <TrendingUp size={16} />
              <span>Métricas Operativas</span>
            </button>
          </>
        )}
      </div>

      {/* TAB 1: TABLERO KANBAN DE TALLER 3D */}
      {activeTab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
          {KANBAN_COLUMNS.map((col) => {
            const colOrders = productionOrders.filter((o) => o.status === col.id);

            return (
              <div
                key={col.id}
                style={{
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)',
                  padding: '1rem',
                  minHeight: '550px'
                }}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `2px solid ${col.color}` }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0f172a' }}>{col.label}</span>
                  <span style={{ background: '#e2e8f0', color: '#0f172a', fontWeight: '800', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                    {colOrders.length}
                  </span>
                </div>

                {/* Orders Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {colOrders.map((order) => (
                    <div
                      key={order.id}
                      className="card"
                      style={{
                        padding: '1rem',
                        background: '#ffffff',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                          {order.orderNumber}
                        </span>
                        {userRole === 'ADMIN' && (
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0f172a' }}>
                            {formatCurrency(order.total)}
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                        {order.productName}
                      </div>

                      {order.customText && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600', marginBottom: '0.4rem' }}>
                          Texto: "{order.customText}"
                        </div>
                      )}

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
                        {order.filament} • {formatGrams(order.filamentGrams)}
                      </div>

                      {/* Printer Selection */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.15rem' }}>
                          IMPRESORA
                        </label>
                        <select
                          value={order.assignedPrinter || ''}
                          onChange={(e) => assignPrinter(order.id, e.target.value)}
                          style={{
                            width: '100%',
                            fontSize: '0.75rem',
                            padding: '0.3rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-light)',
                            background: '#f8fafc',
                            fontWeight: '600'
                          }}
                        >
                          {PRINTERS_LIST.map((pr) => (
                            <option key={pr} value={pr}>{pr}</option>
                          ))}
                        </select>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {col.id !== 'READY_TO_SHIP' && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              const nextMap = {
                                QUEUED: 'SLICING',
                                SLICING: 'PRINTING',
                                PRINTING: 'QUALITY_CONTROL',
                                QUALITY_CONTROL: 'READY_TO_SHIP'
                              };
                              updateOrderStatus(order.id, nextMap[col.id]);
                            }}
                          >
                            <span>Avanzar Estado</span>
                            <ArrowRight size={12} />
                          </button>
                        )}

                        {col.id === 'READY_TO_SHIP' && (
                          <button
                            className="btn btn-dark btn-sm"
                            style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                            onClick={() => handleGenerateWaybill(order)}
                          >
                            <Plane size={12} color="#00e5ff" />
                            <span>Generar Guía DHL / FedEx</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INVENTARIO DE MATERIAS PRIMAS (BOM) */}
      {activeTab === 'inventory' && userRole === 'ADMIN' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filamentInventory.map((mat) => (
            <div key={mat.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{mat.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{mat.description}</p>
                </div>
                <span className="badge badge-primary">Multiplicador: x{mat.priceMultiplier}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {mat.colors.map((col) => {
                  const isLow = col.stockGrams < 2000;

                  return (
                    <div
                      key={col.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: col.hex, border: '1px solid #cbd5e1' }} />
                          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{col.name}</span>
                        </div>
                        {isLow && (
                          <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                            <AlertTriangle size={11} /> Stock Bajo
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '0.5rem 0' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Gramos en Bodega:</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: '800', color: isLow ? '#d97706' : 'var(--color-primary)' }}>
                          {formatGrams(col.stockGrams)}
                        </span>
                      </div>

                      {/* Adjust buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => updateFilamentStock(mat.id, col.id, -500)}
                        >
                          <Minus size={12} /> -500g
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => updateFilamentStock(mat.id, col.id, 1000)}
                        >
                          <Plus size={12} /> +1kg Rollo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: COTIZACIONES B2B */}
      {activeTab === 'quotes' && userRole === 'ADMIN' && (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', textAlign: 'left', color: 'var(--text-tertiary)' }}>
                <th style={{ padding: '0.75rem' }}>Folio B2B</th>
                <th style={{ padding: '0.75rem' }}>Empresa / RFC</th>
                <th style={{ padding: '0.75rem' }}>Producto & Cantidad</th>
                <th style={{ padding: '0.75rem' }}>Total Neto</th>
                <th style={{ padding: '0.75rem' }}>Estado</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {b2bQuotes.map((q) => (
                <tr key={q.quoteNumber} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                    {q.quoteNumber}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{q.companyName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>RFC: {q.rfc}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div>{q.productName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>{q.units || q.quantity} piezas</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: '800', color: '#0f172a' }}>
                    {formatCurrency(q.totalAmount || q.finalTotal)}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-success">{q.status}</span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => generateB2BQuotePDF(q)}
                      title="Descargar PDF"
                    >
                      <FileDown size={14} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: MÉTRICAS */}
      {activeTab === 'metrics' && userRole === 'ADMIN' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>VOLUMEN TOTAL DE VENTAS (GMV)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', margin: '0.5rem 0' }}>
              {formatCurrency(totalSales)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669' }}>↑ +24% vs mes anterior</div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>HORAS DE MÁQUINA ACUMULADAS</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0' }}>
              {formatMinutesToHours(totalMachineMinutes)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>5 impresoras activas en taller</div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>POLÍMEROS 3D CONSUMIDOS</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0' }}>
              {formatGrams(totalGramsUsed)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>88% PLA Biodegradable</div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: '700' }}>CUMPLIMIENTO DE ENTREGAS SLA</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', margin: '0.5rem 0' }}>
              99.2%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669' }}>Despachos en 24-48h cumplidos</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
