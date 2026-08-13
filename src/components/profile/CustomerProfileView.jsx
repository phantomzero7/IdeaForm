import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { shippingService } from '../../services/shippingService';
import { fiscalService } from '../../services/fiscalService';
import { formatCurrency } from '../../utils/formatters';
import {
  User,
  Package,
  Truck,
  FileText,
  Building2,
  Lock,
  LogOut,
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Eye,
  FileDown,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const CustomerProfileView = () => {
  const { user, userRole, signOut, productionOrders, b2bQuotes, navigateTo, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('orders'); // orders | addresses | fiscal | quotes | settings

  // Addresses State
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 'addr-01',
      recipientName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Carlos Fregoso',
      street: 'Av. Álvaro Obregón 1420, Int 4',
      colonia: 'Zona Central',
      postalCode: '23000',
      city: 'La Paz',
      state: 'Baja California Sur',
      phone: '612 123 4567',
      isDefault: true
    },
    {
      id: 'addr-02',
      recipientName: 'Oficina Corporativa IdeaForm',
      street: 'Insurgentes Sur 1602, Piso 8',
      colonia: 'Crédito Constructor',
      postalCode: '03940',
      city: 'Benito Juárez',
      state: 'Ciudad de México',
      phone: '55 9876 5432',
      isDefault: false
    }
  ]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    recipientName: '',
    street: '',
    colonia: '',
    postalCode: '',
    city: '',
    state: '',
    phone: ''
  });

  // Fiscal State
  const [fiscalData, setFiscalData] = useState({
    rfc: 'XAXX010101000',
    legalName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Cliente General',
    taxRegime: '601',
    cfdiUse: 'G03',
    postalCode: '23000'
  });

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || 'Carlos',
    lastName: user?.lastName || 'Fregoso',
    email: user?.email || 'carlos.fregoso@gmail.com',
    phone: user?.phone || '55 1234 5678'
  });

  if (!user) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '540px' }}>
        <div className="card card-elevated" style={{ padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(15, 95, 109, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <User size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem', color: '#0f172a' }}>
            Inicia sesión para ver tu perfil
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Consulta tus pedidos, estado de impresión 3D en tiempo real, direcciones y facturación CFDI 4.0.
          </p>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigateTo('home')}>
            Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  // Handle CP Autocomplete for New Address
  const handleCpChange = (cp) => {
    setNewAddr((prev) => ({ ...prev, postalCode: cp }));
    if (cp.length === 5) {
      const data = shippingService.getPostalCodeData(cp);
      if (data) {
        setNewAddr((prev) => ({
          ...prev,
          state: data.state,
          city: data.city,
          colonia: data.colonias[0] || ''
        }));
      }
    }
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.postalCode) {
      showToast('Completa los datos de calle y código postal', 'error');
      return;
    }

    const addr = {
      id: `addr-${Date.now()}`,
      ...newAddr,
      recipientName: newAddr.recipientName || `${user.firstName} ${user.lastName || ''}`.trim(),
      isDefault: savedAddresses.length === 0
    };

    setSavedAddresses([...savedAddresses, addr]);
    setIsAddingAddress(false);
    setNewAddr({ recipientName: '', street: '', colonia: '', postalCode: '', city: '', state: '', phone: '' });
    showToast('¡Dirección de envío guardada exitosamente!', 'success');
  };

  const handleDeleteAddress = (id) => {
    setSavedAddresses(savedAddresses.filter((a) => a.id !== id));
    showToast('Dirección eliminada', 'info');
  };

  const handleSetDefaultAddress = (id) => {
    setSavedAddresses(savedAddresses.map((a) => ({ ...a, isDefault: a.id === id })));
    showToast('Dirección predeterminada actualizada', 'success');
  };

  const handleSaveFiscal = (e) => {
    e.preventDefault();
    showToast('¡Datos fiscales SAT CFDI 4.0 guardados con éxito!', 'success');
  };

  const handleSavePersonalInfo = (e) => {
    e.preventDefault();
    showToast('Datos de contacto actualizados', 'success');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* 1. Profile Header Card */}
        <div
          className="card card-elevated"
          style={{
            padding: '2rem',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0F5F6D 0%, #20A39E 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '1.75rem',
                boxShadow: '0 4px 14px rgba(15, 95, 109, 0.25)'
              }}
            >
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {user.firstName} {user.lastName || ''}
                </h1>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid #a7f3d0'
                  }}
                >
                  ✓ Cuenta Verificada
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {userRole === 'ADMIN' && (
              <button className="btn btn-dark btn-sm" onClick={() => navigateTo('admin')}>
                <span>👑 Panel de Taller / ERP</span>
              </button>
            )}

            <button
              className="btn btn-secondary btn-sm"
              onClick={signOut}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', borderColor: '#fecaca' }}
            >
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* 2. Main Profile Split Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }} className="profile-layout">
          
          {/* Navigation Sidebar Tabs */}
          <div className="card" style={{ padding: '0.75rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'orders' ? 'rgba(15, 95, 109, 0.08)' : 'transparent',
                  color: activeTab === 'orders' ? 'var(--color-primary)' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Package size={18} />
                <span>Mis Compras & Pedidos</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'addresses' ? 'rgba(15, 95, 109, 0.08)' : 'transparent',
                  color: activeTab === 'addresses' ? 'var(--color-primary)' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Truck size={18} />
                <span>Direcciones de Envío</span>
              </button>

              <button
                onClick={() => setActiveTab('fiscal')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'fiscal' ? 'rgba(15, 95, 109, 0.08)' : 'transparent',
                  color: activeTab === 'fiscal' ? 'var(--color-primary)' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <FileText size={18} />
                <span>Datos Fiscales SAT (CFDI)</span>
              </button>

              <button
                onClick={() => setActiveTab('quotes')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'quotes' ? 'rgba(15, 95, 109, 0.08)' : 'transparent',
                  color: activeTab === 'quotes' ? 'var(--color-primary)' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Building2 size={18} />
                <span>Cotizaciones B2B</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'settings' ? 'rgba(15, 95, 109, 0.08)' : 'transparent',
                  color: activeTab === 'settings' ? 'var(--color-primary)' : '#475569',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <User size={18} />
                <span>Perfil & Seguridad</span>
              </button>
            </div>
          </div>

          {/* Right Content Tab Body */}
          <div>
            
            {/* TAB 1: MIS COMPRAS & PEDIDOS */}
            {activeTab === 'orders' && (
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Historial de Compras & Manufactura 3D
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                      Monitorea el progreso de impresión y rastrea tus envíos por paquetería.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {productionOrders.map((order) => (
                    <div
                      key={order.id}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        background: '#ffffff',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>
                              Pedido #{order.orderNumber}
                            </span>
                            <span
                              className="badge"
                              style={{
                                background: order.status === 'READY_TO_SHIP' ? '#ecfdf5' : order.status === 'PRINTING' ? '#eff6ff' : '#fef3c7',
                                color: order.status === 'READY_TO_SHIP' ? '#059669' : order.status === 'PRINTING' ? '#2563eb' : '#d97706',
                                fontWeight: '800',
                                fontSize: '0.75rem'
                              }}
                            >
                              {order.status === 'PRINTING' && '⚙️ En Impresora 3D (65%)'}
                              {order.status === 'QUEUED' && '⏳ En Cola de Producción'}
                              {order.status === 'READY_TO_SHIP' && '🚚 Enviado por DHL Express'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                            Fecha de compra: {order.date} • Fabricación en granja 3D La Paz
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Total Pagado:</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                            {formatCurrency(order.total)}
                          </div>
                        </div>
                      </div>

                      {/* Items Details */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>{order.productName}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            Grabado: <strong>"{order.customText}"</strong> • Filamento: {order.filament}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigateTo('tracking')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
                          >
                            <Eye size={14} />
                            <span>Rastrear Envío</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: DIRECCIONES DE ENVÍO */}
            {activeTab === 'addresses' && (
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Direcciones de Entrega
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                      Gestiona tus domicilios para recibir tus piezas 3D por paquetería DHL / FedEx.
                    </p>
                  </div>

                  {!isAddingAddress && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsAddingAddress(true)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
                    >
                      <Plus size={16} />
                      <span>Nueva Dirección</span>
                    </button>
                  )}
                </div>

                {/* Add Address Form */}
                {isAddingAddress && (
                  <form onSubmit={handleSaveAddress} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
                      Agregar Nueva Dirección de Entrega
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                          Nombre del Destinatario *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Carlos Morales"
                          value={newAddr.recipientName}
                          onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                          Teléfono de Contacto *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="55 1234 5678"
                          value={newAddr.phone}
                          onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                          Calle y Número Exterior / Interior *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Av. Paseo de la Reforma 222, Piso 4"
                          value={newAddr.street}
                          onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                          Código Postal *
                        </label>
                        <input
                          type="text"
                          maxLength={5}
                          required
                          placeholder="23000"
                          value={newAddr.postalCode}
                          onChange={(e) => handleCpChange(e.target.value)}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Colonia</label>
                        <input type="text" value={newAddr.colonia} onChange={(e) => setNewAddr({ ...newAddr, colonia: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Ciudad / Municipio</label>
                        <input type="text" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Estado</label>
                        <input type="text" value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingAddress(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: '700' }}>
                        Guardar Dirección
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: 'var(--radius-lg)',
                        border: addr.isDefault ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                        background: addr.isDefault ? 'rgba(15, 95, 109, 0.02)' : '#ffffff',
                        position: 'relative'
                      }}
                    >
                      {addr.isDefault && (
                        <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(15, 95, 109, 0.1)', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                          Predeterminada
                        </span>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800', color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                        <MapPin size={16} color="var(--color-primary)" />
                        <span>{addr.recipientName}</span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '0.5rem' }}>
                        {addr.street}<br />
                        {addr.colonia}, C.P. {addr.postalCode}<br />
                        {addr.city}, {addr.state}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                        Tel: {addr.phone}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                        {!addr.isDefault && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => handleSetDefaultAddress(addr.id)}
                          >
                            Hacer Principal
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#dc2626', borderColor: '#fecaca', marginLeft: 'auto' }}
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DATOS FISCALES SAT CFDI 4.0 */}
            {activeTab === 'fiscal' && (
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Información Fiscal SAT (CFDI 4.0)
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                    Guarda tus datos para recibir facturas deducibles automáticamente con cada compra.
                  </p>
                </div>

                <form onSubmit={handleSaveFiscal}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Razón Social o Nombre Completo Fiscal *
                      </label>
                      <input
                        type="text"
                        required
                        value={fiscalData.legalName}
                        onChange={(e) => setFiscalData({ ...fiscalData, legalName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        RFC (12 o 13 dígitos) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={13}
                        value={fiscalData.rfc}
                        onChange={(e) => setFiscalData({ ...fiscalData, rfc: e.target.value.toUpperCase() })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Régimen Fiscal SAT *
                      </label>
                      <select
                        value={fiscalData.taxRegime}
                        onChange={(e) => setFiscalData({ ...fiscalData, taxRegime: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                      >
                        <option value="601">601 - General de Ley Personas Morales</option>
                        <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                        <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                        <option value="605">605 - Sueldos y Salarios e Ingresos Asimilados</option>
                        <option value="616">616 - Sin obligaciones fiscales</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Código Postal Fiscal *
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        required
                        value={fiscalData.postalCode}
                        onChange={(e) => setFiscalData({ ...fiscalData, postalCode: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ fontWeight: '700', marginTop: '0.5rem' }}>
                    Guardar Datos Fiscales
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: COTIZACIONES B2B */}
            {activeTab === 'quotes' && (
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Cotizaciones B2B Emitidas
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                      Presupuestos por volumen con descuentos aplicados y validez fiscal.
                    </p>
                  </div>

                  <button className="btn btn-empresas btn-sm" onClick={() => navigateTo('empresas')}>
                    <span>Nueva Cotización</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {b2bQuotes.map((quote) => (
                    <div
                      key={quote.quoteNumber}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '800', color: '#0f172a' }}>{quote.productName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                          Folio: <strong>{quote.quoteNumber}</strong> • {quote.units} piezas • {quote.date}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#104F75' }}>
                          {formatCurrency(quote.finalTotal || quote.totalAmount)}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700' }}>
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PERFIL & SEGURIDAD */}
            {activeTab === 'settings' && (
              <div className="card" style={{ padding: '2rem', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Datos de la Cuenta & Seguridad
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                    Actualiza tu información personal y opciones de acceso.
                  </p>
                </div>

                <form onSubmit={handleSavePersonalInfo}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        disabled
                        value={personalInfo.email}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', background: '#f8fafc' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Teléfono Móvil
                      </label>
                      <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ fontWeight: '700' }}>
                    Actualizar Información
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .profile-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomerProfileView;
