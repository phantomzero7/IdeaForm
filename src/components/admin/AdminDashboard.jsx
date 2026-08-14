import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FILAMENT_MATERIALS, PRODUCTS, B2B_PRICE_TIERS, SUBCOLLECTIONS, DEFAULT_COLOR_PRESETS } from '../../data/mockData';
import { shippingService } from '../../services/shippingService';
import { generateB2BQuotePDF } from '../../utils/pdfGenerator';
import { formatCurrency, formatGrams, formatMinutesToHours, generateFolio } from '../../utils/formatters';
import IdeaFormLogo from '../common/IdeaFormLogo';
import ThreeViewer from '../3d/ThreeViewer';
import {
  LayoutDashboard,
  Layers,
  FileSpreadsheet,
  BarChart3,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  ArrowLeft,
  Truck,
  Plus,
  Send,
  MessageCircle,
  FileText,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Eye,
  FileDown,
  Printer as PrintIcon,
  Bell,
  Mail,
  Search,
  Filter,
  Check,
  X,
  RefreshCw,
  Archive,
  Ban,
  Tag,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  Upload,
  Box,
  Palette,
  FileUp,
  Maximize2,
  List,
  Flame,
  Scale,
  Receipt,
  Cpu,
  PackageCheck,
  Sliders,
  HelpCircle,
  Info,
  Wrench,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

const KANBAN_STAGES = [
  { id: 'QUEUED', label: '1. En Cola', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'SLICING', label: '2. Slicing G-Code', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'PRINTING', label: '3. En Impresora 3D', color: '#176B87', bg: '#e0f2fe' },
  { id: 'QUALITY_CONTROL', label: '4. Control Calidad', color: '#8b5cf6', bg: '#f3e8ff' },
  { id: 'READY_TO_SHIP', label: '5. Listo para Envío', color: '#10b981', bg: '#ecfdf5' }
];

const AdminDashboard = () => {
  const {
    user,
    userRole,
    setUser,
    setUserRole,
    productionOrders,
    updateOrderStatus,
    updateOrderPriority,
    updateOrderChannel,
    assignPrinter,
    createManualOrder,
    filamentInventory,
    saveFilament,
    toggleBlockFilament,
    archiveFilament,
    unarchiveFilament,
    recordStockMovement,
    isColorAvailable,
    isComboAvailable,
    getFilamentStockAlerts,
    updateFilamentStock,
    printers,
    savePrinter,
    deletePrinter,
    updatePrinterStatus,
    operatingExpenses,
    saveOperatingExpense,
    deleteOperatingExpense,
    b2bQuotes,
    saveB2BQuote,
    products,
    saveProduct,
    deleteProduct,
    navigateTo,
    showToast
  } = useApp();

  // Active Main Navigation Tab
  // 'production' | 'printers' | 'inventory' | 'finance' | 'costs' | 'products' | 'quotes'
  const [activeTab, setActiveTab] = useState('production');
  const [staffPin, setStaffPin] = useState('');

  // 1. Production Line State (Kanban vs List View, Priorities & Filters)
  const [productionViewMode, setProductionViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL' | 'URGENT' | 'MEDIUM' | 'LOW'
  const [channelFilter, setChannelFilter] = useState('ALL'); // 'ALL' | 'WEB_AUTO' | 'WHATSAPP' | 'INSTAGRAM' | 'B2B' | 'LOCAL'
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [orderNotesMap, setOrderNotesMap] = useState({});

  // 2. Image Retouch / Vectorization Inspector Modal State
  const [selectedOrderForImage, setSelectedOrderForImage] = useState(null);
  const [retouchStatus, setRetouchStatus] = useState('READY');

  // 3. Multi-Channel Manual Order Creator Modal State
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [manualOrderData, setManualOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    channel: 'WHATSAPP',
    priority: 'MEDIUM',
    productName: 'Llavero Tag 3D con Relieve',
    customText: '',
    filament: 'Blanco Puro (#FAEEEB)',
    filamentGrams: 40,
    printTimeMins: 60,
    packagingCost: 20,
    shippingCostReal: 135,
    total: 150
  });

  // 4. 3D Printer Fleet State & Modals
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState(null);
  const [printerFormData, setPrinterFormData] = useState({
    name: '',
    model: 'Bambu Lab X1-Carbon',
    nozzleSize: '0.4 mm Hardened Steel',
    bedType: 'PEI Texturizado',
    bedDimensions: '256 x 256 x 256 mm',
    printHours: 0,
    status: 'AVAILABLE'
  });
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedPrinterForMaint, setSelectedPrinterForMaint] = useState(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // 5. Filament Inventory Modals (Technical Sheet, Tara Scale Calibration & Stock In)
  const [isFilamentDetailsModalOpen, setIsFilamentDetailsModalOpen] = useState(false);
  const [selectedFilamentDetails, setSelectedFilamentDetails] = useState(null);
  const [isTaraCalibrationModalOpen, setIsTaraCalibrationModalOpen] = useState(false);
  const [taraData, setTaraData] = useState({
    filament: null,
    grossWeight: 1000,
    spoolTare: 220,
    calculatedNet: 780
  });
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({
    name: '',
    type: 'PLA_SILK',
    hex: '#176B87',
    stockGrams: 1000,
    minAlertGrams: 400,
    costPerKg: 450,
    supplier: 'Polymaker México',
    extrusionTemp: '205 - 225 °C',
    bedTemp: '55 - 65 °C',
    density: '1.24 g/cm³',
    batchNumber: 'LOT-2026-08',
    notes: 'Acabado brillante de seda ideal para relieve nítido',
    isBlocked: false,
    isArchived: false
  });
  const [movementModal, setMovementModal] = useState({ isOpen: false, material: null, type: 'ENTRADA', grams: 1000, reason: '' });

  // 6. Operating Expenses State & Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    category: 'PACKAGING', // 'PACKAGING' | 'SHIPPING' | 'ELECTRICITY' | 'SUPPLIES' | 'FIXED'
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    recurring: 'Mensual'
  });

  // 7. Quotes & Products
  const [quotesList, setQuotesList] = useState(b2bQuotes);
  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState(null);
  const [quoteSearchTerm, setQuoteSearchTerm] = useState('');
  const productsCatalog = products || PRODUCTS;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    subcollection: 'hogar',
    basePrice: 180,
    description: '',
    modelType: 'sphere',
    custom3DFileUrl: null,
    custom3DFileType: null,
    filamentGrams: 60,
    printTimeMins: 120,
    allowBaseColor: true,
    allowAccentColor: true,
    allowReliefColor: true,
    allowCustomText: true,
    allowLogoUpload: true,
    previewBaseColor: '#FFFFFF',
    previewAccentColor: '#176B87',
    previewReliefColor: '#0F172A',
    isActive: true,
    image2D: null
  });

  // RBAC GUARD
  const isAuthorized = user && (userRole === 'ADMIN' || userRole === 'OPERATOR_3D');

  const handleStaffPinUnlock = (e) => {
    e.preventDefault();
    if (staffPin === '1234' || staffPin === 'admin' || staffPin === 'ideaform') {
      const adminUser = {
        id: 'usr-admin-01',
        email: 'taller@ideaform.mx',
        firstName: 'Ing. Taller',
        lastName: 'IdeaForm',
        role: 'ADMIN'
      };
      setUser(adminUser);
      setUserRole('ADMIN');
      showToast('¡Sesión de Taller y Administrador iniciada!', 'success');
    } else {
      showToast('PIN incorrecto. Intenta con "1234"', 'error');
    }
  };

  // --- FILTERED PRODUCTION ORDERS ---
  const filteredProductionOrders = useMemo(() => {
    return productionOrders.filter((ord) => {
      // Priority filter
      if (priorityFilter !== 'ALL' && ord.priority !== priorityFilter) return false;
      // Channel filter
      if (channelFilter !== 'ALL' && ord.channel !== channelFilter) return false;
      // Search query
      if (orderSearchQuery.trim()) {
        const query = orderSearchQuery.toLowerCase();
        const matchesFolio = ord.orderNumber?.toLowerCase().includes(query);
        const matchesClient = ord.customerName?.toLowerCase().includes(query);
        const matchesProd = ord.productName?.toLowerCase().includes(query);
        const matchesText = ord.customText?.toLowerCase().includes(query);
        if (!matchesFolio && !matchesClient && !matchesProd && !matchesText) return false;
      }
      return true;
    });
  }, [productionOrders, priorityFilter, channelFilter, orderSearchQuery]);

  // --- KANBAN STAGE TRANSITIONS ---
  const handleMoveStage = (orderId, currentStage, direction) => {
    const currentIndex = KANBAN_STAGES.findIndex((s) => s.id === currentStage);
    if (currentIndex === -1) return;
    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < KANBAN_STAGES.length) {
      const nextStage = KANBAN_STAGES[newIndex].id;
      updateOrderStatus(orderId, nextStage);
    }
  };

  // --- WHATSAPP NOTIFIER ---
  const handleSendWhatsApp = (order, templateType) => {
    const cleanPhone = (order.customerPhone || '526121403409').replace(/\D/g, '');
    let msg = '';
    if (templateType === 'PRODUCTION') {
      msg = `¡Hola ${order.customerName}! 🛠️ Te informamos que tu pedido de impresión 3D #${order.orderNumber} (${order.productName}) ha comenzado su fabricación en nuestro taller IdeaForm. ¡Pronto te compartiremos fotos del resultado!`;
    } else if (templateType === 'READY') {
      msg = `¡Hola ${order.customerName}! ✨ Tu pedido #${order.orderNumber} ha superado el Control de Calidad con éxito y se encuentra empacado y listo para envío. ¡Muchas gracias por tu confianza en IdeaForm!`;
    }
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // --- CALCULATIONS FOR FINANCIALS & REAL NET PROFIT ---
  const financialMetrics = useMemo(() => {
    const totalOrders = productionOrders.length;
    const totalRevenue = productionOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Channel breakdown
    const channelCounts = {
      WEB_AUTO: 0,
      WHATSAPP: 0,
      INSTAGRAM: 0,
      B2B: 0,
      LOCAL: 0
    };
    const channelRevenue = {
      WEB_AUTO: 0,
      WHATSAPP: 0,
      INSTAGRAM: 0,
      B2B: 0,
      LOCAL: 0
    };

    productionOrders.forEach((o) => {
      const ch = o.channel || 'WEB_AUTO';
      if (channelCounts[ch] !== undefined) {
        channelCounts[ch]++;
        channelRevenue[ch] += Number(o.total) || 0;
      }
    });

    // Expenses breakdown
    const totalExpenses = (operatingExpenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalFilamentCost = productionOrders.reduce((sum, o) => sum + ((Number(o.filamentGrams) || 40) * 0.45), 0); // ~$0.45 MXN per gram
    const totalPackagingCost = productionOrders.reduce((sum, o) => sum + (Number(o.packagingCost) || 20), 0);
    const totalShippingCost = productionOrders.reduce((sum, o) => sum + (Number(o.shippingCostReal) || 135), 0);

    const totalDirectAndOperatingCosts = totalExpenses + totalFilamentCost + totalPackagingCost;
    const netProfit = totalRevenue - totalDirectAndOperatingCosts;
    const netProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      avgTicket,
      channelCounts,
      channelRevenue,
      totalExpenses,
      totalFilamentCost,
      totalPackagingCost,
      totalShippingCost,
      totalDirectAndOperatingCosts,
      netProfit,
      netProfitMargin
    };
  }, [productionOrders, operatingExpenses]);

  // Auth unlock screen
  if (!isAuthorized) {
    return (
      <div className="container" style={{ paddingTop: '5rem', paddingBottom: '5rem', maxWidth: '500px', textAlign: 'center' }}>
        <div className="card card-elevated" style={{ padding: '3rem 2.25rem', background: '#ffffff', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <IdeaFormLogo size="medium" />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
            Panel de Control del Taller
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
            Acceso restringido a operadores y administradores para gestión de línea de producción, parque 3D, catálogo e inventario.
          </p>

          <form onSubmit={handleStaffPinUnlock} style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder="PIN de Operador (1234)"
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.92rem',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: '800' }}>
                Entrar
              </button>
            </div>
          </form>

          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={() => navigateTo('home')}>
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Top Banner: Workshop Workspace Status */}
      <div style={{ background: '#0F172A', color: '#ffffff', padding: '1rem 0', borderBottom: '1px solid #1e293b' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: '#176B87', padding: '0.45rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wrench size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                  Taller & Administración IdeaForm
                </h1>
                <span style={{ background: '#10b981', color: '#ffffff', fontSize: '0.65rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)' }}>
                  EN LÍNEA
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                Operador: <strong>{user?.firstName || 'Ingeniero'}</strong> ({userRole}) | Parque de Impresión 3D Activo
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button
              onClick={() => setIsManualOrderModalOpen(true)}
              className="btn btn-sm"
              style={{ background: '#10b981', color: '#ffffff', border: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={14} />
              <span>+ Nuevo Pedido Manual</span>
            </button>

            <button
              onClick={() => navigateTo('home')}
              className="btn btn-secondary btn-sm"
              style={{ color: '#ffffff', borderColor: '#475569', background: 'rgba(255,255,255,0.05)' }}
            >
              Ir a la Tienda
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0.65rem 0', position: 'sticky', top: 0, zIndex: 90 }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', overflowX: 'auto' }}>
          
          {/* 1. Línea de Producción */}
          <button
            onClick={() => setActiveTab('production')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'production' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'production' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <Layers size={16} />
            <span>1. Línea de Producción ({productionOrders.length})</span>
          </button>

          {/* 2. Parque de Impresoras 3D */}
          <button
            onClick={() => setActiveTab('printers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'printers' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'printers' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>2. Parque de Impresoras ({printers.length})</span>
          </button>

          {/* 3. Inventario de Filamentos */}
          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'inventory' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'inventory' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <Activity size={16} />
            <span>3. Inventario de Filamentos ({filamentInventory.length})</span>
          </button>

          {/* 4. Analítica Financiera */}
          <button
            onClick={() => setActiveTab('finance')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'finance' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'finance' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <BarChart3 size={16} />
            <span>4. Analítica Financiera & Canales</span>
          </button>

          {/* 5. Costos & Gastos de Operación */}
          <button
            onClick={() => setActiveTab('costs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'costs' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'costs' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <Receipt size={16} />
            <span>5. Costos & Utilidad Neta</span>
          </button>

          {/* 6. Catálogo de Productos */}
          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'products' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'products' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <Tag size={16} />
            <span>6. Catálogo de Productos ({productsCatalog.length})</span>
          </button>

          {/* 7. Cotizaciones B2B */}
          <button
            onClick={() => setActiveTab('quotes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'quotes' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'quotes' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>7. Cotizaciones B2B ({quotesList.length})</span>
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '1.5rem', paddingBottom: '4rem' }}>

        {/* Real-Time Stock & Filament Alert Notification Banner for Editor */}
        {(() => {
          const alerts = getFilamentStockAlerts();
          const hasAlerts = alerts.outOfStock.length > 0 || alerts.lowStock.length > 0 || alerts.blocked.length > 0;
          if (!hasAlerts) return null;

          return (
            <div
              style={{
                background: '#fff1f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-lg)',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle color="#e11d48" size={20} />
                <div style={{ fontSize: '0.82rem', color: '#9f1239' }}>
                  <strong style={{ fontSize: '0.88rem' }}>Alertas de Filamento en Taller:</strong>
                  <div style={{ marginTop: '0.15rem' }}>
                    {alerts.outOfStock.length > 0 && (
                      <span style={{ fontWeight: '800', color: '#be123c', marginRight: '0.75rem' }}>
                        🔴 {alerts.outOfStock.length} Agotados ({alerts.outOfStock.map((f) => f.name).join(', ')}).
                      </span>
                    )}
                    {alerts.lowStock.length > 0 && (
                      <span style={{ color: '#b45309', fontWeight: '700', marginRight: '0.75rem' }}>
                        🟠 {alerts.lowStock.length} Stock Bajo ({alerts.lowStock.map((f) => `${f.name}: ${f.stockGrams}g`).join(', ')}).
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('inventory')}
                className="btn btn-sm"
                style={{ background: '#e11d48', color: '#ffffff', border: 'none', fontWeight: '800', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                Reabastecer
              </button>
            </div>
          );
        })()}

        {/* =========================================================================
            TAB 1: LÍNEA DE PRODUCCIÓN (Vistas Kanban & Lista, Prioridades y Canales)
           ========================================================================= */}
        {activeTab === 'production' && (
          <div>
            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Línea de Producción</span>
                  <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#176B87', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                    {filteredProductionOrders.length} órdenes activas
                  </span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.15rem' }}>
                  Administra el flujo de manufactura aditiva, prioridades operativas y canal de venta de cada pedido.
                </p>
              </div>

              {/* View Mode Switcher: Kanban vs List */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
                <button
                  onClick={() => setProductionViewMode('kanban')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: productionViewMode === 'kanban' ? '#176B87' : 'transparent',
                    color: productionViewMode === 'kanban' ? '#ffffff' : '#475569',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  <Layers size={14} />
                  <span>Tablero Kanban</span>
                </button>

                <button
                  onClick={() => setProductionViewMode('list')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: productionViewMode === 'list' ? '#176B87' : 'transparent',
                    color: productionViewMode === 'list' ? '#ffffff' : '#475569',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  <List size={14} />
                  <span>Vista Lista / Tabla</span>
                </button>
              </div>
            </div>

            {/* Filters Bar: Search, Priority Filter, Channel Filter */}
            <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Search input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', width: '280px' }}>
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Buscar por folio, cliente, texto grabado..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', width: '100%' }}
                />
              </div>

              {/* Priority Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>Prioridad:</span>
                {['ALL', 'URGENT', 'MEDIUM', 'LOW'].map((p) => {
                  const labels = { ALL: 'Todas', URGENT: '🔴 Urgente', MEDIUM: '🟡 Medio', LOW: '🟢 Bajo' };
                  return (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: 'var(--radius-full)',
                        border: priorityFilter === p ? '1px solid #176B87' : '1px solid #e2e8f0',
                        background: priorityFilter === p ? '#e0f2fe' : '#ffffff',
                        color: priorityFilter === p ? '#176B87' : '#64748b',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>

              {/* Channel Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>Origen:</span>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    background: '#ffffff',
                    color: '#0F172A'
                  }}
                >
                  <option value="ALL">Todos los Canales</option>
                  <option value="WEB_AUTO">🌐 Web Automático</option>
                  <option value="WHATSAPP">💬 WhatsApp Directo</option>
                  <option value="INSTAGRAM">📸 Instagram DM</option>
                  <option value="B2B">🏢 B2B Corporativo</option>
                  <option value="LOCAL">🏬 Taller / Local</option>
                </select>
              </div>
            </div>

            {/* VIEW 1: KANBAN BOARD */}
            {productionViewMode === 'kanban' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', alignItems: 'start' }} className="kanban-grid">
                {KANBAN_STAGES.map((stage) => {
                  const stageOrders = filteredProductionOrders.filter((o) => o.status === stage.id);

                  return (
                    <div
                      key={stage.id}
                      style={{
                        background: '#ffffff',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '580px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Column Header */}
                      <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: stage.bg, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: stage.color }}>
                          {stage.label}
                        </span>
                        <span style={{ background: '#ffffff', color: stage.color, fontWeight: '800', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,0,0,0.06)' }}>
                          {stageOrders.length}
                        </span>
                      </div>

                      {/* Orders Cards */}
                      <div style={{ padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1, overflowY: 'auto' }}>
                        {stageOrders.map((ord) => {
                          const priorityBadge = ord.priority === 'URGENT'
                            ? { label: 'URGENTE', bg: '#fee2e2', color: '#dc2626', icon: Flame }
                            : ord.priority === 'LOW'
                            ? { label: 'BAJO', bg: '#f0fdf4', color: '#16a34a', icon: Clock }
                            : { label: 'MEDIO', bg: '#fef3c7', color: '#d97706', icon: Activity };
                          const IconComp = priorityBadge.icon;

                          return (
                            <div
                              key={ord.id}
                              style={{
                                background: '#ffffff',
                                border: ord.priority === 'URGENT' ? '1.5px solid #f87171' : '1px solid #e2e8f0',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.85rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                              }}
                            >
                              {/* Card Header: Order #, Priority & Channel */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.85rem' }}>
                                    #{ord.orderNumber}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{ord.customerName}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                  {/* Priority tag selector */}
                                  <select
                                    value={ord.priority || 'MEDIUM'}
                                    onChange={(e) => updateOrderPriority(ord.id, e.target.value)}
                                    style={{
                                      fontSize: '0.65rem',
                                      fontWeight: '800',
                                      padding: '0.15rem 0.35rem',
                                      borderRadius: '4px',
                                      background: priorityBadge.bg,
                                      color: priorityBadge.color,
                                      border: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="URGENT">🔴 Urgente</option>
                                    <option value="MEDIUM">🟡 Medio</option>
                                    <option value="LOW">🟢 Bajo</option>
                                  </select>

                                  <span style={{ fontSize: '0.62rem', fontWeight: '700', padding: '0.1rem 0.35rem', borderRadius: '3px', background: '#f1f5f9', color: '#475569' }}>
                                    {ord.channel === 'WEB_AUTO' ? '🌐 Web' : ord.channel === 'WHATSAPP' ? '💬 WhatsApp' : ord.channel === 'INSTAGRAM' ? '📸 IG' : ord.channel === 'B2B' ? '🏢 B2B' : '🏬 Local'}
                                  </span>
                                </div>
                              </div>

                              {/* Product & Custom Engraving Info */}
                              <div style={{ background: '#f8fafc', padding: '0.45rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                <div style={{ fontWeight: '700', color: '#0F172A' }}>{ord.productName}</div>
                                {ord.customText && (
                                  <div style={{ color: '#176B87', fontWeight: '800', marginTop: '0.15rem' }}>
                                    Grabado: "{ord.customText}"
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.7rem', marginTop: '0.3rem' }}>
                                  <span>{ord.filamentGrams}g</span>
                                  <span>{ord.printTimeMins} min</span>
                                  <strong style={{ color: '#0F172A' }}>{formatCurrency(ord.total)}</strong>
                                </div>
                              </div>

                              {/* Assigned Printer Selection */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Printer size={13} color="#64748b" />
                                <select
                                  value={ord.assignedPrinter || ''}
                                  onChange={(e) => assignPrinter(ord.id, e.target.value)}
                                  style={{
                                    flex: 1,
                                    fontSize: '0.72rem',
                                    padding: '0.25rem 0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid #cbd5e1',
                                    background: '#ffffff'
                                  }}
                                >
                                  <option value="">-- Sin Asignar --</option>
                                  {printers.map((p) => (
                                    <option key={p.id} value={p.name}>
                                      {p.name} ({p.status})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Action Buttons: WhatsApp & Move Stage */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem', borderTop: '1px solid #f1f5f9' }}>
                                <button
                                  onClick={() => handleSendWhatsApp(ord, stage.id === 'READY_TO_SHIP' ? 'READY' : 'PRODUCTION')}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.25rem 0.5rem',
                                    fontSize: '0.68rem',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                  title="Notificar avance al cliente por WhatsApp"
                                >
                                  <MessageCircle size={12} />
                                  <span>WhatsApp</span>
                                </button>

                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  {stage.id !== 'QUEUED' && (
                                    <button
                                      onClick={() => handleMoveStage(ord.id, stage.id, 'backward')}
                                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.25rem 0.45rem', cursor: 'pointer' }}
                                      title="Retroceder etapa"
                                    >
                                      <ArrowLeft size={12} />
                                    </button>
                                  )}
                                  {stage.id !== 'READY_TO_SHIP' && (
                                    <button
                                      onClick={() => handleMoveStage(ord.id, stage.id, 'forward')}
                                      style={{ background: '#176B87', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                      title="Avanzar etapa"
                                    >
                                      <ArrowRight size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {stageOrders.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                            Sin órdenes en esta etapa
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: HIGH-DENSITY OPERATIONAL LIST / TABLE */}
            {productionViewMode === 'list' && (
              <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Folio</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Cliente</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Origen</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Producto & Grabado</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Filamento</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Prioridad</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Impresora</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Estado</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Total</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProductionOrders.map((ord) => (
                        <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F172A' }}>
                            #{ord.orderNumber}
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: '700', color: '#0F172A' }}>{ord.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{ord.date}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                              {ord.channel === 'WEB_AUTO' ? '🌐 Web' : ord.channel === 'WHATSAPP' ? '💬 WhatsApp' : ord.channel === 'INSTAGRAM' ? '📸 IG' : ord.channel === 'B2B' ? '🏢 B2B' : '🏬 Local'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: '700', color: '#0F172A' }}>{ord.productName}</div>
                            {ord.customText && (
                              <div style={{ color: '#176B87', fontWeight: '800', fontSize: '0.75rem' }}>
                                "{ord.customText}"
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                            <div>{ord.filament}</div>
                            <div style={{ fontSize: '0.7rem' }}>{ord.filamentGrams}g | ~{ord.printTimeMins}m</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <select
                              value={ord.priority || 'MEDIUM'}
                              onChange={(e) => updateOrderPriority(ord.id, e.target.value)}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: ord.priority === 'URGENT' ? '#fee2e2' : ord.priority === 'LOW' ? '#f0fdf4' : '#fef3c7',
                                color: ord.priority === 'URGENT' ? '#dc2626' : ord.priority === 'LOW' ? '#16a34a' : '#d97706'
                              }}
                            >
                              <option value="URGENT">🔴 Urgente</option>
                              <option value="MEDIUM">🟡 Medio</option>
                              <option value="LOW">🟢 Bajo</option>
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <select
                              value={ord.assignedPrinter || ''}
                              onChange={(e) => assignPrinter(ord.id, e.target.value)}
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            >
                              <option value="">-- Sin asignar --</option>
                              {printers.map((p) => (
                                <option key={p.id} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: '800',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc'
                              }}
                            >
                              {KANBAN_STAGES.map((st) => (
                                <option key={st.id} value={st.id}>{st.label}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F172A' }}>
                            {formatCurrency(ord.total)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleSendWhatsApp(ord, ord.status === 'READY_TO_SHIP' ? 'READY' : 'PRODUCTION')}
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              WhatsApp
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: PARQUE DE IMPRESORAS 3D (Configuración & Telemetría)
           ========================================================================= */}
        {activeTab === 'printers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Parque de Impresoras 3D & Hardware
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.15rem' }}>
                  Configura tus máquinas, boquillas, tipos de cama, ranuras AMS y asigna trabajos de impresión.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPrinter(null);
                  setPrinterFormData({
                    name: `Bambu Lab P1S #${printers.length + 1}`,
                    model: 'Bambu Lab P1S',
                    nozzleSize: '0.4 mm Hardened',
                    bedType: 'PEI Texturizado',
                    bedDimensions: '256 x 256 x 256 mm',
                    printHours: 0,
                    status: 'AVAILABLE'
                  });
                  setIsPrinterModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} />
                <span>+ Registrar Nueva Impresora</span>
              </button>
            </div>

            {/* Fleet Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {printers.map((printer) => {
                const statusBadge = printer.status === 'PRINTING'
                  ? { label: 'IMPRIMIENDO', color: '#0284c7', bg: '#e0f2fe' }
                  : printer.status === 'AVAILABLE'
                  ? { label: 'LISTA / DISPONIBLE', color: '#16a34a', bg: '#dcfce7' }
                  : printer.status === 'MAINTENANCE'
                  ? { label: 'EN MANTENIMIENTO', color: '#d97706', bg: '#fef3c7' }
                  : { label: 'DETENIDA / ERROR', color: '#dc2626', bg: '#fee2e2' };

                return (
                  <div
                    key={printer.id}
                    className="card card-elevated"
                    style={{
                      padding: '1.25rem',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      border: printer.status === 'PRINTING' ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    {/* Card Top: Machine Name & Status Selector */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                          <Printer size={20} color="#176B87" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0F172A' }}>{printer.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{printer.model}</div>
                        </div>
                      </div>

                      <select
                        value={printer.status}
                        onChange={(e) => updatePrinterStatus(printer.id, e.target.value)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: statusBadge.bg,
                          color: statusBadge.color,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="AVAILABLE">🟢 Lista / Disponible</option>
                        <option value="PRINTING">🔵 Imprimiendo</option>
                        <option value="MAINTENANCE">🟠 En Mantenimiento</option>
                        <option value="ERROR">🔴 Detenida / Error</option>
                      </select>
                    </div>

                    {/* Hardware Specs Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Boquilla: </span>
                        <strong>{printer.nozzleSize}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Cama: </span>
                        <strong>{printer.bedType}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Volumen: </span>
                        <strong>{printer.bedDimensions}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Horas de Uso: </span>
                        <strong style={{ color: '#176B87' }}>{printer.printHours} hrs</strong>
                      </div>
                    </div>

                    {/* AMS / Multi-Color Loaded Filament Slots */}
                    {printer.amsSlots && printer.amsSlots.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', marginBottom: '0.35rem' }}>
                          RANURAS AMS / FILAMENTOS CARGADOS:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                          {printer.amsSlots.map((slot) => (
                            <div
                              key={slot.slot}
                              style={{
                                background: '#f1f5f9',
                                padding: '0.35rem 0.45rem',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}
                            >
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: slot.hex, border: '1px solid #cbd5e1' }} />
                              <span style={{ fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                #{slot.slot} {slot.colorName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Live Job Progress (if printing) */}
                    {printer.status === 'PRINTING' && (
                      <div style={{ background: '#e0f2fe', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '800', color: '#0369a1', marginBottom: '0.35rem' }}>
                          <span>Trabajo en progreso: #{printer.currentJobId || 'ORD-Activa'}</span>
                          <span>{printer.currentJobProgress || 65}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#bae6fd', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${printer.currentJobProgress || 65}%`, background: '#0284c7', borderRadius: 'var(--radius-full)' }} />
                        </div>
                      </div>
                    )}

                    {/* Maintenance Notes & Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        Último mant.: {printer.lastMaintenance ? printer.lastMaintenance.split(' ')[0] : 'Al día'}
                      </span>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => {
                            setSelectedPrinterForMaint(printer);
                            setMaintenanceNotes(printer.lastMaintenance || '');
                            setIsMaintenanceModalOpen(true);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                        >
                          Mantenimiento
                        </button>

                        <button
                          onClick={() => deletePrinter(printer.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}
                          title="Eliminar impresora"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: INVENTARIO DE FILAMENTOS (Con Modales No Invasivos)
           ========================================================================= */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Inventario de Filamentos & Materias Primas
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.15rem' }}>
                  Monitorea bobinas activas, calibra pesos con tara de carrete y abre las fichas técnicas en modales limpios.
                </p>
              </div>

              <button
                onClick={() => setIsNewMaterialModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} />
                <span>+ Registrar Nueva Bobina</span>
              </button>
            </div>

            {/* Filament Spools Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filamentInventory.map((fil) => {
                const stockPercent = Math.min(100, Math.round(((fil.stockGrams || 0) / 1000) * 100));
                const isOutOfStock = (fil.stockGrams || 0) <= 0;
                const isLowStock = !isOutOfStock && (fil.stockGrams || 0) <= (fil.minAlertGrams || 400);

                return (
                  <div
                    key={fil.id}
                    className="card card-elevated"
                    style={{
                      padding: '1.25rem',
                      background: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      border: isOutOfStock ? '1.5px solid #f87171' : isLowStock ? '1.5px solid #fbbf24' : '1px solid #e2e8f0',
                      opacity: fil.isArchived ? 0.6 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    {/* Spool Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: fil.hex,
                            border: '2px solid #cbd5e1',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>{fil.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fil.type} • {fil.supplier || 'Polymaker'}</div>
                        </div>
                      </div>

                      {fil.isBlocked ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#f1f5f9', color: '#64748b', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          BLOQUEADO
                        </span>
                      ) : isOutOfStock ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#fee2e2', color: '#dc2626', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          AGOTADO
                        </span>
                      ) : isLowStock ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#fef3c7', color: '#d97706', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          STOCK BAJO
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', background: '#dcfce7', color: '#16a34a', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          DISPONIBLE
                        </span>
                      )}
                    </div>

                    {/* Live Grams Progress Bar */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: '#64748b' }}>Gramos restantes:</span>
                        <strong style={{ color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#0F172A' }}>
                          {formatGrams(fil.stockGrams || 0)}
                        </strong>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${stockPercent}%`,
                            background: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#176B87',
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick Modal Triggers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                      <button
                        onClick={() => {
                          setSelectedFilamentDetails(fil);
                          setIsFilamentDetailsModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        <FileText size={13} />
                        <span>Ficha Técnica</span>
                      </button>

                      <button
                        onClick={() => {
                          setTaraData({
                            filament: fil,
                            grossWeight: (fil.stockGrams || 0) + 220,
                            spoolTare: 220,
                            calculatedNet: fil.stockGrams || 0
                          });
                          setIsTaraCalibrationModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        <Scale size={13} />
                        <span>Calibrar Tara</span>
                      </button>
                    </div>

                    {/* Bottom Status Toggles */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                      <button
                        onClick={() => toggleBlockFilament(fil.id)}
                        style={{ background: 'none', border: 'none', color: fil.isBlocked ? '#16a34a' : '#64748b', cursor: 'pointer', fontWeight: '700' }}
                      >
                        {fil.isBlocked ? '✓ Desbloquear' : '🚫 Bloquear'}
                      </button>

                      <button
                        onClick={() => fil.isArchived ? unarchiveFilament(fil.id) : archiveFilament(fil.id)}
                        style={{ background: 'none', border: 'none', color: fil.isArchived ? '#0284c7' : '#ef4444', cursor: 'pointer', fontWeight: '700' }}
                      >
                        {fil.isArchived ? 'Restaurar' : 'Archivar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: ANALÍTICA FINANCIERA & CANALES DE VENTA
           ========================================================================= */}
        {activeTab === 'finance' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Analítica Financiera & Canales de Venta
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.15rem' }}>
                Monitorea ingresos automáticos de la web vs pedidos de WhatsApp, Instagram, cotizaciones B2B y mostrador.
              </p>
            </div>

            {/* Financial KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card card-elevated" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>INGRESOS TOTALES</div>
                <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#176B87', margin: '0.35rem 0' }}>
                  {formatCurrency(financialMetrics.totalRevenue)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981' }}>↑ Ventas registradas en plataforma</div>
              </div>

              <div className="card card-elevated" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>TICKET PROMEDIO</div>
                <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0F172A', margin: '0.35rem 0' }}>
                  {formatCurrency(financialMetrics.avgTicket)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Por pedido finalizado</div>
              </div>

              <div className="card card-elevated" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>PEDIDOS TOTALES</div>
                <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0F172A', margin: '0.35rem 0' }}>
                  {financialMetrics.totalOrders}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Todas las etapas</div>
              </div>

              <div className="card card-elevated" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '700' }}>VENTAS AUTOMÁTICAS (WEB)</div>
                <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#10b981', margin: '0.35rem 0' }}>
                  {financialMetrics.channelCounts.WEB_AUTO} pedidos
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981' }}>{formatCurrency(financialMetrics.channelRevenue.WEB_AUTO)}</div>
              </div>
            </div>

            {/* Sales Channels Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              
              {/* Channel Breakdown Card */}
              <div className="card card-elevated" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
                  Distribución de Ingresos por Canal de Origen
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { id: 'WEB_AUTO', name: '🌐 Plataforma Web (Automático)', color: '#176B87' },
                    { id: 'WHATSAPP', name: '💬 WhatsApp Directo', color: '#25D366' },
                    { id: 'INSTAGRAM', name: '📸 Instagram DM / Redes', color: '#E1306C' },
                    { id: 'B2B', name: '🏢 B2B Corporativo & Eventos', color: '#6366F1' },
                    { id: 'LOCAL', name: '🏬 Taller & Mostrador Presencial', color: '#F59E0B' }
                  ].map((ch) => {
                    const rev = financialMetrics.channelRevenue[ch.id] || 0;
                    const count = financialMetrics.channelCounts[ch.id] || 0;
                    const pct = financialMetrics.totalRevenue > 0 ? Math.round((rev / financialMetrics.totalRevenue) * 100) : 0;

                    return (
                      <div key={ch.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '700', color: '#0F172A' }}>{ch.name} ({count})</span>
                          <strong>{formatCurrency(rev)} ({pct}%)</strong>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: ch.color, borderRadius: 'var(--radius-full)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="card card-elevated" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
                  Métodos de Pago & Pasarelas
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>Stripe / Tarjetas de Crédito & Débito</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Cobro automático en checkout web</div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: '800', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Activo
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>Transferencia SPEI / Banco</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Validación con comprobante de depósito</div>
                    </div>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', fontWeight: '800', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Manual
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>Mercado Pago / OXXO Pay</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Pagos en efectivo y billeteras digitales</div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#16a34a', fontWeight: '800', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Activo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: COSTOS Y GASTOS DE OPERACIÓN (Utilidad Neta Real)
           ========================================================================= */}
        {activeTab === 'costs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Costos de Operación & Margen Neto Real
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.15rem' }}>
                  Registra empaque, embalaje, guías de paquetería, luz eléctrica e insumos para conocer tu rentabilidad exacta.
                </p>
              </div>

              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} />
                <span>+ Registrar Gasto Operativo</span>
              </button>
            </div>

            {/* Net Profit Summary Hero Card */}
            <div
              className="card card-elevated"
              style={{
                padding: '1.75rem',
                background: 'linear-gradient(135deg, #0F172A 0%, #176B87 100%)',
                color: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '700' }}>INGRESOS TOTALES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff' }}>
                  {formatCurrency(financialMetrics.totalRevenue)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '700' }}>TOTAL COSTOS & GASTOS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f87171' }}>
                  - {formatCurrency(financialMetrics.totalDirectAndOperatingCosts)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: '700' }}>UTILIDAD NETA REAL</div>
                <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#10b981' }}>
                  {formatCurrency(financialMetrics.netProfit)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: '700' }}>MARGEN DE GANANCIA NETO</div>
                <div style={{ fontSize: '2.1rem', fontWeight: '800', color: '#38bdf8' }}>
                  {financialMetrics.netProfitMargin.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Operating Expenses Table */}
            <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: '800', color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Bitácora de Gastos de Operación Registrados</span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{operatingExpenses.length} registros</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Fecha</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Categoría</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Descripción del Gasto</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Proveedor</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Frecuencia</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Monto</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operatingExpenses.map((exp) => {
                      const catLabels = {
                        PACKAGING: { label: '📦 Empaque / Embalaje', bg: '#fef3c7', color: '#b45309' },
                        SHIPPING: { label: '🚚 Paquetería / Guías', bg: '#e0f2fe', color: '#0284c7' },
                        ELECTRICITY: { label: '⚡ Luz / Electricidad', bg: '#fef9c3', color: '#a16207' },
                        SUPPLIES: { label: '🛠️ Insumos / Taller', bg: '#f3e8ff', color: '#7e22ce' },
                        FIXED: { label: '💼 Gastos Fijos', bg: '#f1f5f9', color: '#475569' }
                      };
                      const cat = catLabels[exp.category] || catLabels.FIXED;

                      return (
                        <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{exp.date}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: cat.bg, color: cat.color }}>
                              {cat.label}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: '#0F172A' }}>{exp.description}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{exp.supplier || 'N/A'}</td>
                          <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{exp.recurring || 'Único'}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#dc2626', textAlign: 'right' }}>
                            - {formatCurrency(exp.amount)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                            <button
                              onClick={() => deleteOperatingExpense(exp.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: CATÁLOGO Y EDITOR DE PRODUCTOS (Vinculado a Filamentos Reales)
           ========================================================================= */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Catálogo de Productos & Configuración 3D
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.15rem' }}>
                  Edita tus productos. Los colores seleccionables se sincronizan directamente con tu inventario de filamentos.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductFormData({
                    name: '',
                    subcollection: 'hogar',
                    basePrice: 180,
                    description: '',
                    modelType: 'sphere',
                    custom3DFileUrl: null,
                    custom3DFileType: null,
                    filamentGrams: 60,
                    printTimeMins: 120,
                    allowBaseColor: true,
                    allowAccentColor: true,
                    allowReliefColor: true,
                    allowCustomText: true,
                    allowLogoUpload: true,
                    previewBaseColor: '#FFFFFF',
                    previewAccentColor: '#176B87',
                    previewReliefColor: '#0F172A',
                    isActive: true,
                    image2D: null
                  });
                  setIsProductModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} />
                <span>+ Crear Nuevo Producto</span>
              </button>
            </div>

            {/* Products Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {productsCatalog.map((prod) => (
                <div
                  key={prod.id}
                  className="card card-elevated"
                  style={{
                    padding: '1.25rem',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#0F172A' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.categoryName || prod.subcollection}</div>
                      </div>
                      <strong style={{ color: '#176B87', fontSize: '1rem' }}>{formatCurrency(prod.basePrice)}</strong>
                    </div>

                    <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4', margin: '0.5rem 0' }}>
                      {prod.description || 'Sin descripción'}
                    </p>

                    <div style={{ background: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Modelo: <strong>{prod.modelType || 'keychain'}</strong></span>
                      <span>Filamento: <strong>{prod.weightGrams || 50}g</strong></span>
                      <span>Tiempo: <strong>~{prod.printTimeMins || 60}m</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setProductFormData({
                          ...prod,
                          previewBaseColor: prod.previewBaseColor || '#FFFFFF',
                          previewAccentColor: prod.previewAccentColor || '#176B87',
                          previewReliefColor: prod.previewReliefColor || '#0F172A'
                        });
                        setIsProductModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      <Edit3 size={13} />
                      <span>Editar Producto</span>
                    </button>

                    <button
                      onClick={() => deleteProduct(prod.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.35rem' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: COTIZACIONES B2B
           ========================================================================= */}
        {activeTab === 'quotes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Gestor de Cotizaciones B2B & Empresas
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.15rem' }}>
                  Genera propuestas comerciales mayoristas con cálculo de escalado y descarga en PDF oficial.
                </p>
              </div>
            </div>

            <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '800' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Folio</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Empresa / Contacto</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Producto</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Unidades</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Descuento</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Total con IVA</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotesList.map((q) => (
                      <tr key={q.quoteNumber} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#176B87' }}>{q.quoteNumber}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{q.companyName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{q.contactName} • {q.email}</div>
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>{q.productName}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '800' }}>{q.units || q.quantity} u</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#10b981', fontWeight: '800' }}>{q.discountPercent}% OFF</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: '#0F172A' }}>
                          {formatCurrency(q.finalTotal || q.totalAmount)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => generateB2BQuotePDF(q)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                          >
                            <FileDown size={13} />
                            <span>Descargar PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: FICHA TÉCNICA DE FILAMENTO
         ========================================================================= */}
      {isFilamentDetailsModalOpen && selectedFilamentDetails && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: selectedFilamentDetails.hex, border: '2px solid #cbd5e1' }} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  Ficha Técnica: {selectedFilamentDetails.name}
                </h3>
              </div>
              <button onClick={() => setIsFilamentDetailsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b' }}>Tipo de Polímero:</span>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{selectedFilamentDetails.type}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b' }}>Fabricante / Proveedor:</span>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{selectedFilamentDetails.supplier || 'Polymaker México'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b' }}>Temp. Extrusión Sugerida:</span>
                <div style={{ fontWeight: '800', color: '#176B87' }}>{selectedFilamentDetails.extrusionTemp || '205 - 225 °C'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b' }}>Temp. Cama Caliente:</span>
                <div style={{ fontWeight: '800', color: '#176B87' }}>{selectedFilamentDetails.bedTemp || '55 - 65 °C'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b' }}>Densidad:</span>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{selectedFilamentDetails.density || '1.24 g/cm³'}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: '#64748b' }}>Lote / Batch:</span>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>{selectedFilamentDetails.batchNumber || 'LOT-2026-08'}</div>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: '#166534', marginBottom: '1.25rem' }}>
              <strong>Notas de Impresión: </strong>
              {selectedFilamentDetails.notes || 'Excelente adherencia entre capas y acabado silk suave con alta definición en relieves tridimensionales.'}
            </div>

            <button onClick={() => setIsFilamentDetailsModalOpen(false)} className="btn btn-primary" style={{ width: '100%', fontWeight: '800' }}>
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: CALIBRACIÓN DE TARA / BÁSCULA
         ========================================================================= */}
      {isTaraCalibrationModalOpen && taraData.filament && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scale size={20} color="#176B87" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  Calibración de Tara: {taraData.filament.name}
                </h3>
              </div>
              <button onClick={() => setIsTaraCalibrationModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.45', marginBottom: '1.25rem' }}>
              Coloca el carrete en la báscula de taller. Ingresa el peso bruto y el sistema restará el peso del plástico vacío (tara) para calcular los gramos netos exactos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                  PESO BRUTO EN BÁSCULA (GRAMOS)
                </label>
                <input
                  type="number"
                  value={taraData.grossWeight}
                  onChange={(e) => {
                    const gross = Number(e.target.value) || 0;
                    const net = Math.max(0, gross - taraData.spoolTare);
                    setTaraData({ ...taraData, grossWeight: gross, calculatedNet: net });
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                  TARA CARRETE VACÍO (GRAMOS)
                </label>
                <input
                  type="number"
                  value={taraData.spoolTare}
                  onChange={(e) => {
                    const tare = Number(e.target.value) || 0;
                    const net = Math.max(0, taraData.grossWeight - tare);
                    setTaraData({ ...taraData, spoolTare: tare, calculatedNet: net });
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800' }}
                />
              </div>

              <div style={{ background: '#e0f2fe', padding: '0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: '700' }}>STOCK NETO CALCULADO</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0284c7', margin: '0.2rem 0' }}>
                  {taraData.calculatedNet} g
                </div>
                <div style={{ fontSize: '0.72rem', color: '#0369a1' }}>
                  Valor residual: {formatCurrency((taraData.calculatedNet / 1000) * (taraData.filament.costPerKg || 450))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsTaraCalibrationModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  saveFilament({ ...taraData.filament, stockGrams: taraData.calculatedNet });
                  setIsTaraCalibrationModalOpen(false);
                }}
                className="btn btn-primary"
                style={{ flex: 1, fontWeight: '800' }}
              >
                Guardar Calibración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: REGISTRO DE GASTO OPERATIVO
         ========================================================================= */}
      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={20} color="#176B87" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  Registrar Gasto Operativo
                </h3>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!expenseFormData.description || !expenseFormData.amount) {
                  showToast('Por favor completa la descripción y el monto', 'warning');
                  return;
                }
                saveOperatingExpense({
                  ...expenseFormData,
                  amount: Number(expenseFormData.amount)
                });
                setIsExpenseModalOpen(false);
                setExpenseFormData({
                  category: 'PACKAGING',
                  description: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  supplier: '',
                  recurring: 'Mensual'
                });
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                  CATEGORÍA DE GASTO
                </label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                >
                  <option value="PACKAGING">📦 Empaque & Embalaje (Cajas, burbuja, stickers)</option>
                  <option value="SHIPPING">🚚 Paquetería & Guías (DHL, Estafeta, FedEx)</option>
                  <option value="ELECTRICITY">⚡ Consumo Eléctrico (CFE / Taller 3D)</option>
                  <option value="SUPPLIES">🛠️ Insumos & Mantenimiento (Alcohol, boquillas, PEI)</option>
                  <option value="FIXED">💼 Gastos Fijos (Renta, internet, servicios)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                  DESCRIPCIÓN DEL GASTO
                </label>
                <input
                  type="text"
                  placeholder="Ej. 100 Cajas Kraft 15x15 + Cinta de embalaje"
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                    MONTO (MXN $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '0.3rem' }}>
                    PROVEEDOR
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Empaques MX"
                    value={expenseFormData.supplier}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, supplier: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: '800' }}>
                  Guardar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: CREACIÓN DE PEDIDO MANUAL MULTICANAL
         ========================================================================= */}
      {isManualOrderModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="#176B87" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  Crear Pedido Manual (WhatsApp / IG / Local)
                </h3>
              </div>
              <button onClick={() => setIsManualOrderModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createManualOrder(manualOrderData);
                setIsManualOrderModalOpen(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    CANAL DE ORIGEN
                  </label>
                  <select
                    value={manualOrderData.channel}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, channel: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: '700' }}
                  >
                    <option value="WHATSAPP">💬 WhatsApp Directo</option>
                    <option value="INSTAGRAM">📸 Instagram DM</option>
                    <option value="B2B">🏢 B2B Corporativo</option>
                    <option value="LOCAL">🏬 Taller / Local</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    PRIORIDAD
                  </label>
                  <select
                    value={manualOrderData.priority}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: '700' }}
                  >
                    <option value="URGENT">🔴 Urgente Express</option>
                    <option value="MEDIUM">🟡 Medio Estándar</option>
                    <option value="LOW">🟢 Bajo / Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                  NOMBRE DEL CLIENTE
                </label>
                <input
                  type="text"
                  placeholder="Ej. Carlos Mendoza"
                  value={manualOrderData.customerName}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, customerName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    PRODUCTO
                  </label>
                  <input
                    type="text"
                    value={manualOrderData.productName}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, productName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    GRABADO / RELIEVE 3D
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. VALENTINA"
                    value={manualOrderData.customText}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, customText: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    TOTAL COBRADO ($ MXN)
                  </label>
                  <input
                    type="number"
                    value={manualOrderData.total}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, total: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    FILAMENTO CONSUMIDO (G)
                  </label>
                  <input
                    type="number"
                    value={manualOrderData.filamentGrams}
                    onChange={(e) => setManualOrderData({ ...manualOrderData, filamentGrams: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '800' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsManualOrderModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: '800' }}>
                  Crear e Ingresar a Cola
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: REGISTRAR / EDITAR IMPRESORA 3D
         ========================================================================= */}
      {isPrinterModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={20} color="#176B87" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  {editingPrinter ? 'Editar Impresora' : 'Registrar Nueva Impresora 3D'}
                </h3>
              </div>
              <button onClick={() => setIsPrinterModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                savePrinter(printerFormData);
                setIsPrinterModalOpen(false);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                  NOMBRE / IDENTIFICADOR DE TALLER
                </label>
                <input
                  type="text"
                  placeholder="Ej. Bambu Lab X1C #03"
                  value={printerFormData.name}
                  onChange={(e) => setPrinterFormData({ ...printerFormData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    MODELO
                  </label>
                  <select
                    value={printerFormData.model}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, model: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    <option value="Bambu Lab X1-Carbon">Bambu Lab X1-Carbon</option>
                    <option value="Bambu Lab P1S">Bambu Lab P1S</option>
                    <option value="Bambu Lab A1">Bambu Lab A1</option>
                    <option value="Creality K1 Max">Creality K1 Max</option>
                    <option value="Original Prusa MK4">Original Prusa MK4</option>
                    <option value="Ender 3 V3">Ender 3 V3</option>
                    <option value="Otro Modelo">Otro Modelo Custom</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    BOQUILLA ACTIVA
                  </label>
                  <select
                    value={printerFormData.nozzleSize}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, nozzleSize: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    <option value="0.2 mm Detail">0.2 mm (Ultra Detalle)</option>
                    <option value="0.4 mm Hardened Steel">0.4 mm (Estándar Taller)</option>
                    <option value="0.6 mm High Flow">0.6 mm (Rápida / Alta Resistencia)</option>
                    <option value="0.8 mm Draft">0.8 mm (Gran Formato)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    TIPO DE CAMA
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. PEI Texturizado"
                    value={printerFormData.bedType}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, bedType: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    VOLUMEN X Y Z (MM)
                  </label>
                  <input
                    type="text"
                    placeholder="256 x 256 x 256 mm"
                    value={printerFormData.bedDimensions}
                    onChange={(e) => setPrinterFormData({ ...printerFormData, bedDimensions: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsPrinterModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: '800' }}>
                  Guardar Impresora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: REGISTRO DE MANTENIMIENTO DE IMPRESORA
         ========================================================================= */}
      {isMaintenanceModalOpen && selectedPrinterForMaint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={20} color="#176B87" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>
                  Mantenimiento: {selectedPrinterForMaint.name}
                </h3>
              </div>
              <button onClick={() => setIsMaintenanceModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                  DETALLE DEL MANTENIMIENTO REALIZADO
                </label>
                <textarea
                  rows={4}
                  placeholder="Ej. Limpieza y desengrase de varillas de carbono, lubricación de husillo Z, cambio de boquilla 0.4mm y calibración de nivelación de cama."
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setIsMaintenanceModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    savePrinter({
                      ...selectedPrinterForMaint,
                      lastMaintenance: `${todayStr} (${maintenanceNotes})`,
                      status: 'AVAILABLE'
                    });
                    setIsMaintenanceModalOpen(false);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, fontWeight: '800' }}
                >
                  Registrar & Marcar Lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 7: EDITAR PRODUCTO & ZONAS 3D DINÁMICAS (LIGADAS AL STOCK)
         ========================================================================= */}
      {isProductModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card card-elevated" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', maxWidth: '960px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={20} color="#176B87" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                  {editingProduct ? `Editar: ${editingProduct.name}` : 'Crear Nuevo Producto 3D'}
                </h3>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
              {/* Left Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProduct({
                    ...productFormData,
                    id: editingProduct ? editingProduct.id : `prod-${Date.now()}`
                  });
                  setIsProductModalOpen(false);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    NOMBRE DEL PRODUCTO
                  </label>
                  <input
                    type="text"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                      COLECCIÓN
                    </label>
                    <select
                      value={productFormData.subcollection}
                      onChange={(e) => setProductFormData({ ...productFormData, subcollection: e.target.value })}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    >
                      <option value="escolar">Escolar & Estudiantes</option>
                      <option value="oficina">Oficina & Escritorio</option>
                      <option value="hogar">Hogar & Deco</option>
                      <option value="personal">Personal & Accesorios</option>
                      <option value="kids">Kids & Juguetes</option>
                      <option value="empresas">Empresas (B2B)</option>
                      <option value="eventos">Eventos & Recuerdos</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                      PRECIO BASE ($ MXN)
                    </label>
                    <input
                      type="number"
                      value={productFormData.basePrice}
                      onChange={(e) => setProductFormData({ ...productFormData, basePrice: Number(e.target.value) })}
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '800' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '0.25rem' }}>
                    GEOMETRÍA / MODELO 3D
                  </label>
                  <select
                    value={productFormData.modelType}
                    onChange={(e) => setProductFormData({ ...productFormData, modelType: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  >
                    <option value="keychain">Llavero / Placa Tag (2 Caras Grabadas)</option>
                    <option value="trophy">Trofeo Corporativo / Prisma Award</option>
                    <option value="sphere">Esfera Geométrica / Deco</option>
                    <option value="car">Vehículo / Modelo Articulado</option>
                    <option value="cup">Taza / Portalápices de Escritorio</option>
                    <option value="planter">Maceta Hexagonal con Relieve</option>
                  </select>
                </div>

                {/* Live Filament-Linked Color Palette */}
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.4rem' }}>
                    COLORES LIGADOS AL STOCK DISPONIBLE
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {filamentInventory.filter((f) => !f.isArchived).map((fil) => (
                      <button
                        key={fil.id}
                        type="button"
                        onClick={() => setProductFormData({ ...productFormData, previewBaseColor: fil.hex })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '4px',
                          border: productFormData.previewBaseColor === fil.hex ? '2px solid #176B87' : '1px solid #cbd5e1',
                          background: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: fil.hex, border: '1px solid #cbd5e1' }} />
                        <span>{fil.name} ({fil.stockGrams}g)</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: '800' }}>
                    Guardar Producto
                  </button>
                </div>
              </form>

              {/* Right Live 3D Tester */}
              <div style={{ background: '#f1f5f9', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <IdeaFormLogo size="small" showTagline={false} />
                  <span style={{ fontSize: '0.65rem', color: '#176B87', fontWeight: '800', paddingLeft: '0.4rem', borderLeft: '1.5px solid #cbd5e1', letterSpacing: '0.05em' }}>
                    3D LIVE
                  </span>
                </div>

                <div style={{ height: '320px', background: '#ffffff', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                  <ThreeViewer
                    modelType={productFormData.modelType}
                    baseColor={productFormData.previewBaseColor}
                    accentColor={productFormData.previewAccentColor}
                    reliefColor={productFormData.previewReliefColor}
                    materialType="PLA_SILK"
                    customText="IDEAFORM"
                    showDimensions={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .kanban-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .kanban-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
