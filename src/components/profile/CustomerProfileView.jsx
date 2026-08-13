import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Package, Sparkles, Building2, Truck, LogOut, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CustomerProfileView = () => {
  const { user, userRole, signOut, productionOrders, navigateTo } = useApp();

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Inicia sesión para ver tu perfil</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Consulta tus pedidos, estado de impresión 3D y facturas fiscales.
        </p>
        <button className="btn btn-primary" onClick={() => navigateTo('home')}>
          Ir al Inicio
        </button>
      </div>
    );
  }

  // Filter orders associated with this user or show sample customer orders
  const myOrders = productionOrders.slice(0, 3);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '900px' }}>
      
      {/* Profile Header Card */}
      <div className="card card-elevated" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: userRole === 'ADMIN' ? '#0f172a' : userRole === 'B2B_CLIENT' ? '#00828A' : 'rgba(0, 130, 138, 0.15)',
              color: userRole === 'ADMIN' || userRole === 'B2B_CLIENT' ? '#ffffff' : 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.5rem'
            }}
          >
            {user.firstName ? user.firstName[0] : <User size={30} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                {user.firstName} {user.lastName}
              </h2>
              <span
                className="badge"
                style={{
                  background: userRole === 'ADMIN' ? '#0f172a' : userRole === 'B2B_CLIENT' ? 'rgba(0, 130, 138, 0.15)' : '#ecfdf5',
                  color: userRole === 'ADMIN' ? '#ffffff' : userRole === 'B2B_CLIENT' ? 'var(--color-primary)' : '#059669',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}
              >
                {userRole === 'ADMIN' && '👑 Administrador'}
                {userRole === 'OPERATOR_3D' && '🛠️ Operador Taller'}
                {userRole === 'B2B_CLIENT' && '🏢 Cuenta Empresa B2B'}
                {userRole === 'CUSTOMER' && '👤 Cliente Personal'}
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
            {user.companyName && (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: '700', marginTop: '0.2rem' }}>
                Empresa: {user.companyName}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {userRole === 'ADMIN' && (
            <button className="btn btn-dark btn-sm" onClick={() => navigateTo('admin')}>
              <span>Abrir Panel de Taller / ERP</span>
              <ArrowRight size={14} />
            </button>
          )}

          <button className="btn btn-secondary btn-sm" onClick={signOut}>
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Mis Pedidos de Impresión 3D</h3>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{myOrders.length} pedidos registrados</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myOrders.map((ord) => (
            <div
              key={ord.id}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                background: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
                    {ord.orderNumber}
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                    {ord.status === 'PRINTING' && '🟢 En Impresión 3D (68%)'}
                    {ord.status === 'SLICING' && '🔵 Preparando Archivo'}
                    {ord.status === 'QUEUED' && '🟡 En Cola'}
                    {ord.status === 'READY_TO_SHIP' && '🚀 Listo para Envío'}
                    {ord.status === 'QUALITY_CONTROL' && '🟣 Control de Calidad'}
                  </span>
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>{ord.productName}</div>
                {ord.customText && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    Grabado: "{ord.customText}" • {ord.filament}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                    {formatCurrency(ord.total)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{ord.date}</div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigateTo('tracking', { queryOrderNumber: ord.orderNumber })}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Truck size={14} color="var(--color-primary)" />
                  <span>Rastrear</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileView;
