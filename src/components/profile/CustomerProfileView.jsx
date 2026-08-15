import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { shippingService } from '../../services/shippingService';
import { SAT_REGIMENES, SAT_USOS_CFDI, fiscalService } from '../../services/fiscalService';
import { generateInvoicePDF, downloadCFDIXML } from '../../utils/pdfGenerator';
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
  ChevronRight,
  CreditCard,
  RotateCcw,
  Star,
  Search,
  Filter,
  Check,
  AlertTriangle,
  Send,
  MessageCircle,
  HelpCircle,
  X,
  Palette,
  Layers,
  Award,
  Bell
} from 'lucide-react';

const CustomerProfileView = () => {
  const {
    user,
    userRole,
    signOut,
    productionOrders,
    b2bQuotes,
    navigateTo,
    showToast,
    savedDesigns,
    deleteCustomDesign,
    savedPaymentMethods,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    warrantyClaims,
    createWarrantyClaim,
    userReviews,
    submitOrderReview,
    reorderItem,
    addToCart
  } = useApp();

  // Active Tab: orders | designs | addresses | payments | fiscal | warranties | settings
  const [activeTab, setActiveTab] = useState('orders');

  // Orders Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL'); // ALL | IN_PRODUCTION | IN_TRANSIT | DELIVERED

  // Modal States
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const [warrantyModalOrder, setWarrantyModalOrder] = useState(null);
  const [warrantyType, setWarrantyType] = useState('IMPRESSION_DEFECT');
  const [warrantyTitle, setWarrantyTitle] = useState('');
  const [warrantyDesc, setWarrantyDesc] = useState('');

  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newCard, setNewCard] = useState({
    cardBrand: 'VISA',
    cardNumber: '',
    holderName: '',
    expiryMonth: '12',
    expiryYear: '28',
    bankName: 'BBVA México'
  });

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
      references: 'Fachada blanca con portón gris, entre 5 de Mayo y Constitución',
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
      references: 'Torre empresarial frente al Metrobús Río Churubusco',
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
    phone: '',
    references: ''
  });

  // Fiscal Data State
  const [fiscalData, setFiscalData] = useState({
    rfc: 'XAXX010101000',
    legalName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Carlos Fregoso',
    taxRegime: '612',
    cfdiUse: 'G03',
    postalCode: '23000'
  });

  // Personal Info & Notifications State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user?.firstName || 'Carlos',
    lastName: user?.lastName || 'Fregoso',
    email: user?.email || 'carlos.fregoso@gmail.com',
    phone: user?.phone || '612 140 3409'
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    whatsappPrints: true,
    whatsappShipping: true,
    emailReceipts: true,
    promoOffers: false
  });

  // CP Autocomplete
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
    setNewAddr({ recipientName: '', street: '', colonia: '', postalCode: '', city: '', state: '', phone: '', references: '' });
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
    if (!fiscalService.validateRFC(fiscalData.rfc)) {
      showToast('Por favor verifica el formato del RFC (12 o 13 caracteres)', 'error');
      return;
    }
    showToast('¡Datos fiscales SAT CFDI 4.0 guardados con éxito!', 'success');
  };

  const handleSavePersonalInfo = (e) => {
    e.preventDefault();
    showToast('Datos de contacto y preferencias actualizados', 'success');
  };

  const handleAddCardSubmit = (e) => {
    e.preventDefault();
    if (!newCard.cardNumber || newCard.cardNumber.replace(/\s+/g, '').length < 15) {
      showToast('Ingresa un número de tarjeta válido', 'error');
      return;
    }
    addPaymentMethod(newCard);
    setIsAddingPayment(false);
    setNewCard({
      cardBrand: 'VISA',
      cardNumber: '',
      holderName: '',
      expiryMonth: '12',
      expiryYear: '28',
      bankName: 'BBVA México'
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewModalOrder) return;
    submitOrderReview({
      orderNumber: reviewModalOrder.orderNumber,
      productName: reviewModalOrder.productName,
      rating: reviewRating,
      title: reviewTitle || 'Excelente pieza',
      comment: reviewComment
    });
    setReviewModalOrder(null);
    setReviewTitle('');
    setReviewComment('');
  };

  const handleWarrantySubmit = (e) => {
    e.preventDefault();
    if (!warrantyModalOrder) return;
    createWarrantyClaim({
      orderNumber: warrantyModalOrder.orderNumber,
      productName: warrantyModalOrder.productName,
      claimType: warrantyType,
      title: warrantyTitle || 'Solicitud de reposición',
      description: warrantyDesc
    });
    setWarrantyModalOrder(null);
    setWarrantyTitle('');
    setWarrantyDesc('');
    setActiveTab('warranties');
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return (productionOrders || []).filter((ord) => {
      const matchQuery =
        !orderSearch ||
        ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        ord.productName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        (ord.customText && ord.customText.toLowerCase().includes(orderSearch.toLowerCase()));

      let matchFilter = true;
      if (orderFilterStatus === 'IN_PRODUCTION') {
        matchFilter = ord.status === 'QUEUED' || ord.status === 'PRINTING' || ord.status === 'POST_PROCESSING';
      } else if (orderFilterStatus === 'IN_TRANSIT') {
        matchFilter = ord.status === 'READY_TO_SHIP' || ord.status === 'SHIPPED';
      } else if (orderFilterStatus === 'DELIVERED') {
        matchFilter = ord.status === 'DELIVERED';
      }

      return matchQuery && matchFilter;
    });
  }, [productionOrders, orderSearch, orderFilterStatus]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '540px' }}>
        <div className="card card-elevated" style={{ padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(15, 95, 109, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <User size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem', color: '#0f172a' }}>
            Inicia sesión para ver tu cuenta
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Consulta tus compras, progreso de impresión 3D en vivo, facturas SAT, diseños y garantías.
          </p>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigateTo('home')}>
            Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '85vh', paddingTop: '2rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1180px', margin: '0 auto', paddingLeft: '1rem', paddingRight: '1rem' }}>
        
        {/* 1. AMAZON / MERCADO LIBRE STYLE USER HEADER HERO */}
        <div
          style={{
            background: 'linear-gradient(135deg, #090e17 0%, #0F172A 50%, #0F5F6D 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 2.25rem',
            color: '#ffffff',
            marginBottom: '1.75rem',
            boxShadow: '0 12px 32px rgba(9, 14, 23, 0.18)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Background Glow */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00e5ff 0%, #0F5F6D 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.85rem',
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                    ¡Hola, {user.firstName}! 👋
                  </h1>
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '0.2rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid rgba(110, 231, 183, 0.4)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Check size={12} />
                    <span>Cliente Verificado IdeaForm</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  {user.email} • Taller Activo: <strong style={{ color: '#e2e8f0' }}>Granja 3D La Paz, BCS</strong>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.07)', padding: '0.6rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Compras Realizadas</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>{productionOrders.length}</div>
              </div>

              <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.07)', padding: '0.6rem 1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Diseños Guardados</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#00e5ff' }}>{savedDesigns.length}</div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={signOut}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <LogOut size={14} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN NAVIGATION & CONTENT SPLIT */}
        <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: '1.75rem', alignItems: 'start' }} className="profile-layout">
          
          {/* Navigation Sidebar Tabs */}
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '0.85rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              
              <button
                onClick={() => setActiveTab('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'orders' ? 'rgba(15, 95, 109, 0.1)' : 'transparent',
                  color: activeTab === 'orders' ? 'var(--color-primary)' : '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Package size={18} />
                  <span>Mis Compras</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: activeTab === 'orders' ? 'var(--color-primary)' : '#e2e8f0', color: activeTab === 'orders' ? '#ffffff' : '#64748b', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  {productionOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('designs')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'designs' ? 'rgba(15, 95, 109, 0.1)' : 'transparent',
                  color: activeTab === 'designs' ? 'var(--color-primary)' : '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Palette size={18} />
                  <span>Mis Diseños 3D</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: activeTab === 'designs' ? 'var(--color-primary)' : '#e2e8f0', color: activeTab === 'designs' ? '#ffffff' : '#64748b', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  {savedDesigns.length}
                </span>
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
                  background: activeTab === 'addresses' ? 'rgba(15, 95, 109, 0.1)' : 'transparent',
                  color: activeTab === 'addresses' ? 'var(--color-primary)' : '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Truck size={18} />
                <span>Direcciones de Envío</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'payments' ? 'rgba(15, 95, 109, 0.1)' : 'transparent',
                  color: activeTab === 'payments' ? 'var(--color-primary)' : '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <CreditCard size={18} />
                <span>Métodos de Pago</span>
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
                  background: activeTab === 'fiscal' ? 'rgba(15, 95, 109, 0.1)' : 'transparent',
                  color: activeTab === 'fiscal' ? 'var(--color-primary)' : '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <FileText size={18} />
                <span>Facturación SAT (CFDI)</span>
              </button>

              <button
                onClick={() => setActiveTab('warranties')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === 'warranties' ? 'rgba(15, 95, 109, 0.1)' : 'transparent',
                  color: activeTab === 'warranties' ? 'var(--color-primary)' : '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShieldCheck size={18} />
                  <span>Garantías & Ayuda</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', background: '#ecfdf5', color: '#059669', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid #a7f3d0' }}>
                  100%
                </span>
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
                  background: activeTab === 'settings' ? 'rgba(15, 95, 109, 0.1)' : 'transparent',
                  color: activeTab === 'settings' ? 'var(--color-primary)' : '#334155',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <User size={18} />
                <span>Perfil & Seguridad</span>
              </button>

              {userRole === 'ADMIN' && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => navigateTo('admin')}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: '#0F172A',
                      color: '#ffffff',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span>👑 Panel de Taller ERP</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Main Tab Body */}
          <div>
            
            {/* ========================================================================= */}
            {/* TAB 1: MIS COMPRAS & PEDIDOS (AMAZON / MERCADO LIBRE STYLE) */}
            {/* ========================================================================= */}
            {activeTab === 'orders' && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                
                {/* Search & Filter Toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Mis Compras & Manufactura 3D
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                      Revisa el estado de impresión de cada pieza, descarga facturas SAT o repite pedidos en 1-click.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
                    <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Buscar por folio, pieza o grabado..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.82rem',
                        background: '#f8fafc'
                      }}
                    />
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'ALL', label: 'Todos los pedidos' },
                    { id: 'IN_PRODUCTION', label: '⚙️ En Producción 3D' },
                    { id: 'IN_TRANSIT', label: '🚚 En Camino (DHL/FedEx)' },
                    { id: 'DELIVERED', label: '✓ Entregados' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setOrderFilterStatus(filter.id)}
                      style={{
                        background: orderFilterStatus === filter.id ? 'var(--color-primary)' : '#f1f5f9',
                        color: orderFilterStatus === filter.id ? '#ffffff' : '#475569',
                        border: 'none',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
                      <Package size={40} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>No encontramos compras registradas</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Explora nuestras colecciones y personaliza tu primer diseño 3D.</p>
                      <button className="btn btn-primary btn-sm" onClick={() => navigateTo('colecciones')}>
                        Explorar Colecciones
                      </button>
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const isPrinting = order.status === 'PRINTING';
                      const isQueued = order.status === 'QUEUED';
                      const isReady = order.status === 'READY_TO_SHIP';
                      const isPost = order.status === 'POST_PROCESSING';

                      return (
                        <div
                          key={order.id}
                          style={{
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-lg)',
                            background: '#ffffff',
                            boxShadow: 'var(--shadow-sm)',
                            overflow: 'hidden'
                          }}
                        >
                          {/* Order Top Bar (Amazon style) */}
                          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Fecha de Compra</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{order.date}</div>
                              </div>

                              <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Total Pagado</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-primary)' }}>{formatCurrency(order.total)}</div>
                              </div>

                              <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Enviar a</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{order.customerName}</div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: '700' }}>Folio de Taller</div>
                              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0F5F6D' }}>#{order.orderNumber}</div>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div style={{ padding: '1.25rem' }}>
                            
                            {/* 5-Step 3D Manufacturing & Shipping Progress Timeline (Mercado Libre Style) */}
                            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <Sparkles size={14} color="var(--color-primary)" />
                                  <span>Estado de Fabricación en Taller:</span>
                                </span>
                                <span
                                  className="badge"
                                  style={{
                                    background: isReady ? '#ecfdf5' : isPrinting ? '#eff6ff' : '#fef3c7',
                                    color: isReady ? '#059669' : isPrinting ? '#2563eb' : '#d97706',
                                    fontWeight: '800',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {isPrinting && `⚙️ Imprimiendo en Bambu Lab (${order.progressPercent || 65}%)`}
                                  {isQueued && '⏳ En Cola de Granja 3D'}
                                  {isPost && '✨ Control de Calidad y Curado'}
                                  {isReady && '🚚 En Tránsito por DHL Express'}
                                </span>
                              </div>

                              {/* Visual Progress Steps Bar */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem', alignItems: 'center', textAlign: 'center' }}>
                                {[
                                  { label: '1. Confirmado', done: true },
                                  { label: '2. En Cola 3D', done: true },
                                  { label: '3. En Impresora', done: isPrinting || isPost || isReady },
                                  { label: '4. Calidad', done: isPost || isReady },
                                  { label: '5. Enviado DHL', done: isReady }
                                ].map((step, sIdx) => (
                                  <div key={sIdx} style={{ position: 'relative' }}>
                                    <div
                                      style={{
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: step.done ? 'var(--color-primary)' : '#e2e8f0',
                                        marginBottom: '0.35rem'
                                      }}
                                    />
                                    <span style={{ fontSize: '0.68rem', fontWeight: step.done ? '800' : '600', color: step.done ? '#0f172a' : '#94a3b8' }}>
                                      {step.label}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Product Specs & 1-Click Action Bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: '#EDF4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #d5e4ed' }}>
                                  <Package size={28} color="var(--color-primary)" />
                                </div>

                                <div>
                                  <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                                    {order.productName}
                                  </h4>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    Grabado personalizado: <strong style={{ color: 'var(--color-primary)' }}>"{order.customText || 'IdeaForm'}"</strong>
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                                    Filamento: {order.filament} • Impresora: {order.assignedPrinter || 'Bambu Lab X1C'}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons (Amazon / Mercado Libre Style) */}
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                
                                {/* 1-Click Reorder Button */}
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => reorderItem(order)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800' }}
                                  title="Añade exactamente esta misma personalización al carrito"
                                >
                                  <RotateCcw size={13} />
                                  <span>Volver a Pedir</span>
                                </button>

                                {/* Live Tracking */}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => navigateTo('tracking')}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
                                >
                                  <Eye size={13} />
                                  <span>Rastrear</span>
                                </button>

                                {/* Tax Invoice SAT (CFDI 4.0 PDF / XML) */}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => generateInvoicePDF(order, fiscalData)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
                                  title="Descargar Factura SAT CFDI 4.0 en PDF"
                                >
                                  <FileDown size={13} />
                                  <span>Factura PDF</span>
                                </button>

                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => downloadCFDIXML(order, fiscalData)}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700' }}
                                  title="Descargar archivo XML timbrado SAT"
                                >
                                  <span>XML</span>
                                </button>

                                {/* Review / Rating Button */}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setReviewModalOrder(order);
                                    setReviewRating(5);
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                  title="Calificar acabado y calidad 3D"
                                >
                                  <Star size={13} color="#f59e0b" fill="#f59e0b" />
                                  <span>Opinar</span>
                                </button>

                                {/* Warranty / Help Button */}
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setWarrantyModalOrder(order);
                                    setWarrantyTitle(`Garantía para pedido #${order.orderNumber}`);
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', borderColor: '#a7f3d0' }}
                                  title="Solicitar reposición gratuita de pieza por defecto o daño"
                                >
                                  <ShieldCheck size={13} />
                                  <span>Garantía</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: MIS DISEÑOS 3D & PROYECTOS GUARDADOS (WISHLIST 3D) */}
            {/* ========================================================================= */}
            {activeTab === 'designs' && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Mis Diseños 3D & Proyectos Guardados
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                      Tus configuraciones personalizadas con colores Pantone y texto en relieve listos para ordenar.
                    </p>
                  </div>

                  <button className="btn btn-primary btn-sm" onClick={() => navigateTo('customizer')}>
                    <Plus size={15} />
                    <span>Crear Nuevo Diseño</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                  {savedDesigns.map((design) => (
                    <div
                      key={design.id}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        {/* 3D Render Preview Thumbnail */}
                        <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#EDF4F8', marginBottom: '1rem' }}>
                          <img src={design.previewImage} alt={design.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#0F172A', color: '#ffffff', fontSize: '0.68rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                            {design.materialType || 'PLA Silk'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.35rem' }}>
                          {design.name}
                        </h3>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          Relieve grabado: <strong style={{ color: 'var(--color-primary)' }}>"{design.customText}"</strong>
                        </div>

                        {/* Color Chips */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Paleta:</span>
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: design.baseColor, border: '1px solid #cbd5e1' }} title="Color Base" />
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: design.accentColor, border: '1px solid #cbd5e1' }} title="Color Acento" />
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: design.reliefColor, border: '1px solid #cbd5e1' }} title="Color Relieve" />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Precio estimado:</span>
                          <strong style={{ fontSize: '1.15rem', color: 'var(--color-primary)', fontWeight: '800' }}>
                            {formatCurrency(design.estimatedPrice)}
                          </strong>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, fontWeight: '800' }}
                            onClick={() => {
                              addToCart({
                                id: `cart-${design.id}`,
                                name: design.name,
                                price: design.estimatedPrice,
                                quantity: 1,
                                customText: design.customText,
                                selectedColor: { name: 'Color Guardado', hex: design.baseColor },
                                selectedMaterial: { name: 'PLA Silk', id: 'pla-silk' },
                                modelType: design.modelType,
                                image: design.previewImage
                              });
                            }}
                          >
                            <span>Pedir Ahora</span>
                          </button>

                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fecaca' }}
                            onClick={() => deleteCustomDesign(design.id)}
                            title="Eliminar diseño"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: DIRECCIONES DE ENVÍO */}
            {/* ========================================================================= */}
            {activeTab === 'addresses' && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Direcciones de Entrega en México
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                      Gestiona tus domicilios de envío para paquetería express DHL / FedEx / Estafeta.
                    </p>
                  </div>

                  {!isAddingAddress && (
                    <button className="btn btn-primary btn-sm" onClick={() => setIsAddingAddress(true)}>
                      <Plus size={15} />
                      <span>Nueva Dirección</span>
                    </button>
                  )}
                </div>

                {isAddingAddress && (
                  <form onSubmit={handleSaveAddress} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
                      Agregar Nueva Dirección
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                          Nombre del Destinatario *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Carlos Fregoso"
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
                          placeholder="612 123 4567"
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
                          placeholder="Av. Paseo de la Reforma 222, Depto 402"
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Referencias para el repartidor (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Casa blanca con portón café, entre Hidalgo y Morelos"
                        value={newAddr.references}
                        onChange={(e) => setNewAddr({ ...newAddr, references: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingAddress(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: '800' }}>
                        Guardar Dirección
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
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

                      {addr.references && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                          Ref: {addr.references}
                        </div>
                      )}

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

            {/* ========================================================================= */}
            {/* TAB 4: MÉTODOS DE PAGO (AMAZON / MERCADO LIBRE BILLETERA) */}
            {/* ========================================================================= */}
            {activeTab === 'payments' && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Tarjetas & Métodos de Pago
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                      Tarjetas guardadas de forma segura con cifrado SSL de 256 bits para pagos con 1-Click.
                    </p>
                  </div>

                  {!isAddingPayment && (
                    <button className="btn btn-primary btn-sm" onClick={() => setIsAddingPayment(true)}>
                      <Plus size={15} />
                      <span>Agregar Tarjeta</span>
                    </button>
                  )}
                </div>

                {/* Add Card Form */}
                {isAddingPayment && (
                  <form onSubmit={handleAddCardSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
                      Registrar Nueva Tarjeta de Débito / Crédito
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Red Emisora</label>
                        <select
                          value={newCard.cardBrand}
                          onChange={(e) => setNewCard({ ...newCard, cardBrand: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                        >
                          <option value="VISA">Visa</option>
                          <option value="MASTERCARD">Mastercard</option>
                          <option value="AMEX">American Express</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Número de Tarjeta (16 dígitos) *</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4555 1234 5678 9010"
                          value={newCard.cardNumber}
                          onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Nombre del Titular *</label>
                        <input
                          type="text"
                          required
                          placeholder="CARLOS FREGOSO"
                          value={newCard.holderName}
                          onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value.toUpperCase() })}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Mes Exp.</label>
                        <select value={newCard.expiryMonth} onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                          {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Año Exp.</label>
                        <select value={newCard.expiryYear} onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })} style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                          {['26', '27', '28', '29', '30', '31'].map((y) => (
                            <option key={y} value={y}>20{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingPayment(false)}>Cancelar</button>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: '800' }}>Guardar Tarjeta</button>
                    </div>
                  </form>
                )}

                {/* Cards List */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
                  {savedPaymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      style={{
                        background: pm.cardColor || 'linear-gradient(135deg, #0F5F6D 0%, #176B87 100%)',
                        color: '#ffffff',
                        borderRadius: 'var(--radius-xl)',
                        padding: '1.5rem',
                        position: 'relative',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '180px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '0.05em' }}>{pm.cardBrand}</span>
                        {pm.isDefault && (
                          <span style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(4px)', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', fontSize: '0.68rem', fontWeight: '800' }}>
                            Predeterminada
                          </span>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
                          •••• •••• •••• {pm.last4}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>Titular</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{pm.holderName}</div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>Expira</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{pm.expiryMonth}/{pm.expiryYear}</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                        {!pm.isDefault && (
                          <button
                            onClick={() => setDefaultPaymentMethod(pm.id)}
                            style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Hacer Principal
                          </button>
                        )}
                        <button
                          onClick={() => deletePaymentMethod(pm.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', marginLeft: 'auto' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Security Slogan */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '1.5rem', padding: '0.85rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.82rem' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span>Tus datos de pago nunca se almacenan en texto plano. Se procesan de forma cifrada mediante tokens bancarios autorizados por la CNBV.</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 5: FACTURACIÓN SAT CFDI 4.0 */}
            {/* ========================================================================= */}
            {activeTab === 'fiscal' && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Información Fiscal SAT (CFDI 4.0)
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                    Configura tus datos de facturación para recibir facturas deducibles automáticas en cada compra.
                  </p>
                </div>

                <form onSubmit={handleSaveFiscal} style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Razón Social o Nombre Fiscal *
                      </label>
                      <input
                        type="text"
                        required
                        value={fiscalData.legalName}
                        onChange={(e) => setFiscalData({ ...fiscalData, legalName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
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
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                        Régimen Fiscal SAT *
                      </label>
                      <select
                        value={fiscalData.taxRegime}
                        onChange={(e) => setFiscalData({ ...fiscalData, taxRegime: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                      >
                        {SAT_REGIMENES.map((reg) => (
                          <option key={reg.code} value={reg.code}>{reg.name}</option>
                        ))}
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
                        style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ fontWeight: '800' }}>
                    Guardar Datos Fiscales SAT
                  </button>
                </form>

                {/* Invoices History Table */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                    Historial de Facturas Emitidas
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {productionOrders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Factura #{ord.orderNumber}</strong>
                            <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
                              SAT Vigente
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                            UUID: 4A8F9201-987B-4A12-B6E3... • {ord.date} • Total: {formatCurrency(ord.total)}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => generateInvoicePDF(ord, fiscalData)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: '700' }}
                          >
                            <FileDown size={13} />
                            <span>PDF</span>
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => downloadCFDIXML(ord, fiscalData)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: '700' }}
                          >
                            <span>XML</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 6: CENTRO DE GARANTÍAS & ASISTENCIA (COMPRA PROTEGIDA) */}
            {/* ========================================================================= */}
            {activeTab === 'warranties' && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Garantía Total IdeaForm 3D
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                    Compromiso de calidad: si tu pieza llega con algún defecto de fabricación o daño en el viaje, te la reimprimimos y enviamos sin ningún costo.
                  </p>
                </div>

                {/* Banner */}
                <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <ShieldCheck size={36} color="#059669" />
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#065f46', margin: '0 0 0.2rem 0' }}>
                      Cobertura Gratuita contra Defectos de Impresión
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#047857', margin: 0 }}>
                      No tienes que devolver la pieza dañada. Solo reporta la incidencia desde tu historial de compras y nuestro taller programará un reemplazo prioritario.
                    </p>
                  </div>
                </div>

                {/* Warranty Claims List */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
                  Tickets de Garantía Activos
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {warrantyClaims.map((claim) => (
                    <div
                      key={claim.id}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        background: '#ffffff',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                              Ticket #{claim.folio} • Pedido #{claim.orderNumber}
                            </span>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid #bfdbfe' }}>
                              {claim.statusLabel}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                            Producto: <strong>{claim.productName}</strong> • Reportado el: {claim.date}
                          </div>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0.5rem 0', background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                        <strong>Detalle reportado:</strong> {claim.description}
                      </p>

                      {claim.resolution && (
                        <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', marginTop: '0.5rem' }}>
                          ✓ Resolución de Taller: {claim.resolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 7: PERFIL & NOTIFICACIONES EN TIEMPO REAL */}
            {/* ========================================================================= */}
            {activeTab === 'settings' && (
              <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ marginBottom: '1.75rem' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Datos Personales & Alertas en Vivo
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                    Personaliza cómo y cuándo deseas recibir notificaciones sobre el avance de tu pieza en el taller.
                  </p>
                </div>

                <form onSubmit={handleSavePersonalInfo}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Nombre *</label>
                      <input type="text" required value={personalInfo.firstName} onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Apellidos *</label>
                      <input type="text" value={personalInfo.lastName} onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Correo Electrónico</label>
                      <input type="email" disabled value={personalInfo.email} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem', background: '#f8fafc' }} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Teléfono WhatsApp para Avisos *</label>
                      <input type="tel" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.9rem' }} />
                    </div>
                  </div>

                  {/* Notification Channels (WhatsApp & Email) */}
                  <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', marginBottom: '1.75rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Bell size={16} color="var(--color-primary)" />
                      <span>Canales de Notificación en Tiempo Real</span>
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.whatsappPrints}
                          onChange={(e) => setNotificationPrefs({ ...notificationPrefs, whatsappPrints: e.target.checked })}
                          style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                        />
                        <span>Aviso por WhatsApp cuando la impresora 3D comience a fabricar tu pieza</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.whatsappShipping}
                          onChange={(e) => setNotificationPrefs({ ...notificationPrefs, whatsappShipping: e.target.checked })}
                          style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                        />
                        <span>Aviso por WhatsApp con número de guía cuando DHL / FedEx recolecte el paquete</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.emailReceipts}
                          onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailReceipts: e.target.checked })}
                          style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px' }}
                        />
                        <span>Envío automático de factura SAT CFDI 4.0 (PDF y XML) a tu correo</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ fontWeight: '800' }}>
                    Guardar Cambios y Preferencias
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CALIFICAR PRODUCTO / RESEÑA (ESTILO AMAZON / MERCADO LIBRE) */}
      {/* ========================================================================= */}
      {reviewModalOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 14, 23, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Calificar tu Producto 3D
              </h3>
              <button onClick={() => setReviewModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Tu opinión sobre <strong>{reviewModalOrder.productName}</strong> ayuda a otros clientes y a nuestro equipo de taller.
            </p>

            <form onSubmit={handleReviewSubmit}>
              {/* Star Rating Selector */}
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                  >
                    <Star
                      size={32}
                      color="#f59e0b"
                      fill={star <= reviewRating ? '#f59e0b' : 'transparent'}
                      style={{ transition: 'all 0.15s ease' }}
                    />
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Título de tu reseña</label>
                <input
                  type="text"
                  required
                  placeholder="¡Excelente textura y acabado de letras!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Comentarios adicionales</label>
                <textarea
                  rows={3}
                  placeholder="El filamento silk brilla muy bien y el empaque venía perfecto..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReviewModalOrder(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: '800' }}>Publicar Reseña</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SOLICITAR GARANTÍA / REEMPLAZO 3D (COMPRA PROTEGIDA) */}
      {/* ========================================================================= */}
      {warrantyModalOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(9, 14, 23, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: '500px', width: '100%', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="#059669" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Solicitud de Garantía de Taller
                </h3>
              </div>
              <button onClick={() => setWarrantyModalOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Pedido <strong>#{warrantyModalOrder.orderNumber}</strong> ({warrantyModalOrder.productName}). Te responderemos en menos de 24 horas hábiles.
            </p>

            <form onSubmit={handleWarrantySubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Motivo de la Garantía *</label>
                <select
                  value={warrantyType}
                  onChange={(e) => setWarrantyType(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                >
                  <option value="IMPRESSION_DEFECT">Defecto de impresión / Relieve irregular</option>
                  <option value="SHIPPING_DAMAGE">Daño durante el traslado por paquetería</option>
                  <option value="WRONG_COLOR">Color de filamento incorrecto</option>
                  <option value="WRONG_TEXT">Error en el texto personalizado</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Describe el detalle o incidencia *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="La pieza presenta una grieta en la esquina inferior..."
                  value={warrantyDesc}
                  onChange={(e) => setWarrantyDesc(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWarrantyModalOrder(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ fontWeight: '800', background: '#059669', borderColor: '#059669' }}>
                  Generar Ticket de Reposición
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
