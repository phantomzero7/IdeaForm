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
  Maximize2
} from 'lucide-react';

const KANBAN_STAGES = [
  { id: 'QUEUED', label: '1. En Cola', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'SLICING', label: '2. Slicing G-Code', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'PRINTING', label: '3. En Impresora 3D', color: '#176B87', bg: '#e0f2fe' },
  { id: 'QUALITY_CONTROL', label: '4. Control de Calidad', color: '#8b5cf6', bg: '#f3e8ff' },
  { id: 'READY_TO_SHIP', label: '5. Listo para Envío', color: '#10b981', bg: '#ecfdf5' }
];

const PRINTERS_LIST = [
  'Bambu Lab X1C #01',
  'Bambu Lab X1C #02',
  'Creality K1 Max #01',
  'Creality K1 Max #02',
  'Prusa MK4 #03'
];

const AdminDashboard = () => {
  const {
    user,
    userRole,
    setUser,
    setUserRole,
    productionOrders,
    updateOrderStatus,
    assignPrinter,
    filamentInventory,
    updateFilamentStock,
    b2bQuotes,
    saveB2BQuote,
    products,
    saveProduct,
    deleteProduct,
    navigateTo,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('kanban'); // kanban | inventory | quotes | metrics | products
  const [staffPin, setStaffPin] = useState('');

  // 1. Kanban Internal Comments & Order Inspection State
  const [selectedOrderForNotes, setSelectedOrderForNotes] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [orderNotesMap, setOrderNotesMap] = useState({});

  // 2. Image Retouch / Vectorization Inspector Modal State
  const [selectedOrderForImage, setSelectedOrderForImage] = useState(null);
  const [retouchStatus, setRetouchStatus] = useState('READY'); // 'PENDING' | 'READY' | 'UNSUPPORTED'

  // 3. Multi-Channel Manual Order Creator Modal State
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [manualOrderData, setManualOrderData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    channel: 'WHATSAPP', // 'WHATSAPP' | 'INSTAGRAM' | 'STORE' | 'PHONE'
    productName: 'Llavero Corporativo Relieve 3D',
    customText: '',
    filament: 'Azul Océano Seda',
    quantity: 50,
    totalPrice: 2400
  });

  // 4. Filament Inventory Full Management State
  const [inventoryList, setInventoryList] = useState(filamentInventory || FILAMENT_MATERIALS);
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState(false);
  const [newMaterialData, setNewMaterialData] = useState({
    name: '',
    type: 'PLA_SILK',
    hex: '#176B87',
    stockGrams: 1000,
    costPerKg: 450,
    supplier: 'Polymaker México',
    isActive: true
  });
  const [kardexHistory, setKardexHistory] = useState([
    { id: 'k-1', date: '13/08/2026', materialName: 'PLA Seda Turquesa', type: 'ENTRADA', grams: 2000, reason: 'Compra Proveedor Lote #941' },
    { id: 'k-2', date: '13/08/2026', materialName: 'PLA Oro Imperial', type: 'SALIDA', grams: 180, reason: 'Producción Orden #IDF-84920' },
    { id: 'k-3', date: '12/08/2026', materialName: 'PLA Plata Satinado', type: 'MERMA', grams: 45, reason: 'Ajuste de calibración de boquilla' }
  ]);
  const [movementModal, setMovementModal] = useState({ isOpen: false, material: null, type: 'ENTRADA', grams: 1000, reason: '' });

  // 5. Quotes Editor & Communication Modal State
  const [quotesList, setQuotesList] = useState(b2bQuotes);
  const [selectedQuoteForDetail, setSelectedQuoteForDetail] = useState(null);
  const [quoteSearchTerm, setQuoteSearchTerm] = useState('');

  // 6. Metrics Date & Channel Filters State
  const [metricsPeriod, setMetricsPeriod] = useState('MONTH'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'

  // 7. Product Catalog & 3D Multi-Color Zone Configurator State
  const productsCatalog = products || PRODUCTS;
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    subcollection: 'hogar',
    basePrice: 180,
    description: '',
    modelType: 'sphere', // keychain | trophy | sphere | car | cup | planter | custom_file
    custom3DFileUrl: null,
    custom3DFileType: null,
    filamentGrams: 60,
    printTimeMins: 120,
    allowBaseColor: true,
    allowAccentColor: true,
    allowReliefColor: true,
    allowCustomText: true,
    allowLogoUpload: true,
    previewBaseColor: '#176B87',
    previewAccentColor: '#D4AF37',
    previewReliefColor: '#FFFFFF',
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
      showToast('¡Acceso concedido al Taller 3D!', 'success');
    } else {
      showToast('PIN de taller no válido', 'error');
    }
  };

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
            Acceso restringido a operadores y administradores para gestión de granja 3D, catálogo e inventario.
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

  // --- KANBAN FUNCTIONS (MOVE FORWARD / BACKWARD) ---
  const handleMoveStage = (orderId, currentStage, direction) => {
    const currentIndex = KANBAN_STAGES.findIndex((s) => s.id === currentStage);
    if (currentIndex === -1) return;

    const newIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < KANBAN_STAGES.length) {
      const nextStage = KANBAN_STAGES[newIndex].id;
      updateOrderStatus(orderId, nextStage);
      showToast(`Orden movida a ${KANBAN_STAGES[newIndex].label}`, 'info');
    }
  };

  const handleAddComment = (orderNumber) => {
    if (!newCommentText.trim()) return;
    const currentNotes = orderNotesMap[orderNumber] || [];
    const newNote = {
      id: Date.now(),
      author: user?.firstName || 'Operador',
      text: newCommentText.trim(),
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    };
    setOrderNotesMap({ ...orderNotesMap, [orderNumber]: [...currentNotes, newNote] });
    setNewCommentText('');
    showToast('Nota de taller registrada', 'success');
  };

  const handleSendWhatsApp = (order, templateType) => {
    const cleanPhone = (order.customerPhone || '526121234567').replace(/\D/g, '');
    let msg = '';

    if (templateType === 'PRODUCTION') {
      msg = `¡Hola ${order.customerName}! 🛠️ Te informamos que tu pedido de impresión 3D #${order.orderNumber} (${order.productName}) ha comenzado su fabricación en nuestro taller IdeaForm. ¡Pronto te enviaremos fotos del resultado!`;
    } else if (templateType === 'IMAGE_ISSUE') {
      msg = `Hola ${order.customerName}, te escribimos de IdeaForm respecto a tu pedido #${order.orderNumber}. Notamos un detalle en el archivo de logotipo que nos compartiste (requiere trazo mínimo de 0.8mm para el relieve 3D). ¿Podrías confirmarnos si deseas que nuestro equipo de diseño lo ajuste sin costo?`;
    } else if (templateType === 'READY') {
      msg = `¡Hola ${order.customerName}! ✨ Tu pedido #${order.orderNumber} ha superado el Control de Calidad con éxito y se encuentra empacado y listo para envío por DHL Express. ¡Muchas gracias por tu confianza en IdeaForm!`;
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // --- MULTI-CHANNEL ORDER CREATOR ---
  const handleCreateManualOrder = (e) => {
    e.preventDefault();
    const newOrd = {
      id: `ord-man-${Date.now()}`,
      orderNumber: generateFolio('IDF-MAN'),
      customerName: manualOrderData.customerName || 'Cliente Mostrador',
      customerEmail: manualOrderData.customerEmail || 'cliente@whatsapp.com',
      customerPhone: manualOrderData.customerPhone || '55 1234 5678',
      channel: manualOrderData.channel,
      productName: manualOrderData.productName,
      customText: manualOrderData.customText || 'IdeaForm',
      filament: manualOrderData.filament,
      filamentGrams: 50 * manualOrderData.quantity,
      printTimeMins: 45 * manualOrderData.quantity,
      status: 'QUEUED',
      printerAssigned: null,
      date: new Date().toLocaleDateString('es-MX'),
      total: manualOrderData.totalPrice
    };

    productionOrders.unshift(newOrd);
    setIsManualOrderModalOpen(false);
    showToast(`¡Pedido #${newOrd.orderNumber} registrado desde ${manualOrderData.channel}!`, 'success');
  };

  // --- FILAMENT INVENTORY MANAGEMENT ---
  const handleAddNewMaterial = (e) => {
    e.preventDefault();
    const newMat = {
      id: `mat-${Date.now()}`,
      ...newMaterialData
    };
    const updated = [...inventoryList, newMat];
    setInventoryList(updated);
    setIsNewMaterialModalOpen(false);
    setKardexHistory([
      {
        id: `k-${Date.now()}`,
        date: new Date().toLocaleDateString('es-MX'),
        materialName: newMat.name,
        type: 'ENTRADA',
        grams: newMat.stockGrams,
        reason: `Alta inicial de nuevo material (${newMat.supplier})`
      },
      ...kardexHistory
    ]);
    showToast(`Nuevo material "${newMat.name}" agregado al inventario`, 'success');
  };

  const handleToggleMaterialStatus = (id) => {
    const updated = inventoryList.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m));
    setInventoryList(updated);
    showToast('Estado de disponibilidad actualizado para clientes', 'info');
  };

  const handleApplyMovement = (e) => {
    e.preventDefault();
    const { material, type, grams, reason } = movementModal;
    const delta = type === 'ENTRADA' ? Number(grams) : -Number(grams);

    const updated = inventoryList.map((m) =>
      m.id === material.id ? { ...m, stockGrams: Math.max(0, m.stockGrams + delta) } : m
    );
    setInventoryList(updated);
    setKardexHistory([
      {
        id: `k-${Date.now()}`,
        date: new Date().toLocaleDateString('es-MX'),
        materialName: material.name,
        type: type,
        grams: Number(grams),
        reason: reason || (type === 'ENTRADA' ? 'Reabastecimiento de carrete' : 'Salida de taller')
      },
      ...kardexHistory
    ]);
    setMovementModal({ isOpen: false, material: null, type: 'ENTRADA', grams: 1000, reason: '' });
    showToast(`Movimiento de ${type} (${grams}g) registrado en Kardex`, 'success');
  };

  // --- QUOTES MANAGEMENT & COMMUNICATION ---
  const handleUpdateQuote = (updatedQuote) => {
    const updated = quotesList.map((q) => (q.quoteNumber === updatedQuote.quoteNumber ? updatedQuote : q));
    setQuotesList(updated);
    setSelectedQuoteForDetail(updatedQuote);
    showToast('Cotización actualizada y guardada', 'success');
  };

  const handleSendQuoteWhatsApp = (quote) => {
    const msg = `Hola ${quote.contactName || quote.companyName}, te compartimos la cotización formal de IdeaForm #${quote.quoteNumber} por un total de ${formatCurrency(quote.finalTotal || quote.totalAmount)} con descuento por volumen aplicado. ¡Quedamos atentos a tus comentarios!`;
    window.open(`https://wa.me/526121234567?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- PRODUCT CATALOG & DIRECT 2D/3D FILE UPLOADER ---
  const handleOpenNewProductModal = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      subcollection: 'hogar',
      basePrice: 180,
      description: 'Pieza de manufactura aditiva con zonas de color personalizables.',
      modelType: 'sphere',
      custom3DFileUrl: null,
      custom3DFileType: null,
      filamentGrams: 55,
      printTimeMins: 110,
      colorMode: 'FREE', // 'FREE' (libre por capas) | 'PRESETS' (combos fijos opc 1, opc 2...)
      colorPresets: DEFAULT_COLOR_PRESETS,
      allowBaseColor: true,
      allowAccentColor: true,
      allowReliefColor: true,
      allowCustomText: true,
      allowLogoUpload: true,
      previewBaseColor: '#176B87',
      previewAccentColor: '#D4AF37',
      previewReliefColor: '#FFFFFF',
      isActive: true,
      image2D: null
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name,
      subcollection: prod.subcollection || 'hogar',
      basePrice: prod.basePrice,
      description: prod.description || '',
      modelType: prod.modelType || 'keychain',
      custom3DFileUrl: prod.custom3DFileUrl || null,
      custom3DFileType: prod.custom3DFileType || null,
      filamentGrams: prod.filamentGrams || 50,
      printTimeMins: prod.printTimeMins || 100,
      colorMode: prod.colorMode || (prod.colorPresets?.length > 0 ? 'PRESETS' : 'FREE'),
      colorPresets: prod.colorPresets || DEFAULT_COLOR_PRESETS,
      allowBaseColor: prod.allowBaseColor !== false,
      allowAccentColor: prod.allowAccentColor !== false,
      allowReliefColor: prod.allowReliefColor !== false,
      allowCustomText: prod.isCustomizable !== false,
      allowLogoUpload: prod.allowLogoUpload !== false,
      previewBaseColor: prod.previewBaseColor || '#176B87',
      previewAccentColor: prod.previewAccentColor || '#D4AF37',
      previewReliefColor: prod.previewReliefColor || '#FFFFFF',
      isActive: prod.isActive !== false,
      image2D: prod.image || null
    });
    setIsProductModalOpen(true);
  };

  // 2D Image Reader (Converts to Data URL for instant rendering & offline persistence)
  const handle2DImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProductFormData((prev) => ({
          ...prev,
          image2D: event.target.result
        }));
        showToast(`Imagen 2D cargada: ${file.name}`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // 3D Model File Reader (.GLB, .GLTF, .STL)
  const handle3DModelFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['glb', 'gltf', 'stl'].includes(ext)) {
        showToast('Formato 3D no compatible. Usa .GLB, .GLTF o .STL', 'error');
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      setProductFormData((prev) => ({
        ...prev,
        modelType: 'custom_file',
        custom3DFileUrl: fileUrl,
        custom3DFileType: ext
      }));
      showToast(`¡Modelo 3D (${ext.toUpperCase()}) cargado en visor!`, 'success');
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const productToSave = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: productFormData.name,
      categoryName: SUBCOLLECTIONS.find((s) => s.id === productFormData.subcollection)?.name || 'Colección General',
      subcollection: productFormData.subcollection,
      basePrice: Number(productFormData.basePrice),
      description: productFormData.description,
      modelType: productFormData.modelType,
      custom3DFileUrl: productFormData.custom3DFileUrl,
      custom3DFileType: productFormData.custom3DFileType,
      filamentGrams: Number(productFormData.filamentGrams),
      printTimeMins: Number(productFormData.printTimeMins),
      allowBaseColor: productFormData.allowBaseColor,
      allowAccentColor: productFormData.allowAccentColor,
      allowReliefColor: productFormData.allowReliefColor,
      isCustomizable: productFormData.allowCustomText,
      allowLogoUpload: productFormData.allowLogoUpload,
      isActive: productFormData.isActive,
      image: productFormData.image2D || (editingProduct ? editingProduct.image : null)
    };

    saveProduct(productToSave);
    showToast(`¡Producto "${productToSave.name}" guardado y publicado en la tienda!`, 'success');
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`¿Estás seguro de eliminar "${name}" del catálogo?`)) {
      deleteProduct(id);
      showToast(`Producto "${name}" eliminado`, 'info');
    }
  };

  // --- METRICS CALCULATION ---
  const totalRevenue = productionOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalGramsConsumed = productionOrders.reduce((sum, o) => sum + (o.filamentGrams || 45), 0);
  const totalMachineHours = productionOrders.reduce((sum, o) => sum + (o.printTimeMins || 60), 0) / 60;
  const activePrintersCount = productionOrders.filter((o) => o.status === 'PRINTING').length;

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', paddingBottom: '5rem' }}>
      
      {/* Top Admin Header */}
      <div style={{ background: '#0F172A', color: '#ffffff', padding: '1.25rem 0', borderBottom: '1px solid #334155' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <IdeaFormLogo size="small" lightMode={true} showTagline={false} />
            <span style={{ height: '24px', width: '1px', background: '#334155' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ background: '#176B87', color: '#ffffff', fontSize: '0.75rem', fontWeight: '800', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)' }}>
                TALLER 3D ERP
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e2e8f0' }}>
                Centro de Operaciones & Manufactura
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsManualOrderModalOpen(true)}
              style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} />
              <span>+ Nuevo Pedido Multicanal</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigateTo('home')}
              style={{ color: '#ffffff', borderColor: '#475569', background: 'rgba(255,255,255,0.05)' }}
            >
              Ir a la Tienda
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Header Tabs */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 0' }}>
        <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('kanban')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'kanban' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'kanban' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Layers size={17} />
            <span>1. Tablero Kanban ({productionOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'inventory' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'inventory' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Activity size={17} />
            <span>2. Inventario de Filamentos ({inventoryList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'quotes' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'quotes' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={17} />
            <span>3. Gestor de Cotizaciones B2B ({quotesList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'metrics' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'metrics' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <BarChart3 size={17} />
            <span>4. Métricas & Analítica</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.15rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === 'products' ? 'rgba(23, 107, 135, 0.12)' : 'transparent',
              color: activeTab === 'products' ? '#176B87' : '#64748b',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Tag size={17} />
            <span>5. Catálogo & Archivos 2D/3D ({productsCatalog.length})</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '2rem' }}>
        
        {/* =========================================================================
            TAB 1: TABLERO KANBAN DE MANUFACTURA
           ========================================================================= */}
        {activeTab === 'kanban' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Línea de Producción & Fabricación 3D
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                  Controla el avance por etapas, retrocede órdenes por incidencias y contacta al cliente vía WhatsApp.
                </p>
              </div>

              {/* Granja 3D Telemetría */}
              <div style={{ display: 'flex', gap: '1rem', background: '#ffffff', padding: '0.65rem 1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.82rem' }}>
                  <span style={{ color: '#64748b' }}>Impresoras Activas: </span>
                  <strong style={{ color: '#10b981' }}>{activePrintersCount} / {PRINTERS_LIST.length}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
                  <span style={{ color: '#64748b' }}>Filamento Estimado: </span>
                  <strong style={{ color: '#176B87' }}>{formatGrams(totalGramsConsumed)}</strong>
                </div>
              </div>
            </div>

            {/* Kanban Columns Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', alignItems: 'start' }} className="kanban-grid">
              {KANBAN_STAGES.map((stage) => {
                const stageOrders = productionOrders.filter((o) => o.status === stage.id);

                return (
                  <div
                    key={stage.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '620px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Stage Header */}
                    <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: stage.bg, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: stage.color }}>
                        {stage.label}
                      </span>
                      <span style={{ background: '#ffffff', color: stage.color, fontWeight: '800', fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        {stageOrders.length}
                      </span>
                    </div>

                    {/* Stage Cards List */}
                    <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
                      {stageOrders.map((ord) => {
                        const notes = orderNotesMap[ord.orderNumber] || [];

                        return (
                          <div
                            key={ord.id}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: 'var(--radius-md)',
                              padding: '1rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.6rem'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.88rem' }}>
                                  #{ord.orderNumber}
                                </span>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.customerName}</div>
                              </div>

                              <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '4px', background: ord.channel === 'WHATSAPP' ? '#dcfce7' : '#f1f5f9', color: ord.channel === 'WHATSAPP' ? '#15803d' : '#475569' }}>
                                {ord.channel || 'WEB'}
                              </span>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '0.5rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                              <div style={{ fontWeight: '700', color: '#0F172A' }}>{ord.productName}</div>
                              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                Grabado: <strong>"{ord.customText}"</strong> • {ord.filament}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Printer size={13} color="#64748b" />
                              <select
                                value={ord.printerAssigned || ''}
                                onChange={(e) => assignPrinter(ord.id, e.target.value)}
                                style={{ flex: 1, padding: '0.3rem', fontSize: '0.72rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                              >
                                <option value="">Sin impresora</option>
                                {PRINTERS_LIST.map((p) => (
                                  <option key={p} value={p}>{p}</option>
                                ))}
                              </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.35rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                              <button
                                title="Enviar WhatsApp al cliente"
                                onClick={() => handleSendWhatsApp(ord, stage.id === 'READY_TO_SHIP' ? 'READY' : 'PRODUCTION')}
                                style={{ flex: 1, padding: '0.35rem', background: '#25D366', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', fontSize: '0.72rem', fontWeight: '700' }}
                              >
                                <MessageCircle size={13} />
                                <span>WA</span>
                              </button>

                              <button
                                title="Ver archivo y estado de vectorización"
                                onClick={() => setSelectedOrderForImage(ord)}
                                style={{ padding: '0.35rem 0.5rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                <ImageIcon size={13} />
                              </button>

                              <button
                                title="Bitácora y comentarios internos"
                                onClick={() => setSelectedOrderForNotes(ord)}
                                style={{ padding: '0.35rem 0.5rem', background: notes.length > 0 ? '#e0f2fe' : '#f1f5f9', color: notes.length > 0 ? '#176B87' : '#334155', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem', fontWeight: '700' }}
                              >
                                <Edit3 size={13} />
                                {notes.length > 0 && <span>{notes.length}</span>}
                              </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.4rem', marginTop: '0.2rem' }}>
                              <button
                                disabled={stage.id === 'QUEUED'}
                                onClick={() => handleMoveStage(ord.id, stage.id, 'backward')}
                                style={{
                                  flex: 1,
                                  padding: '0.35rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  background: stage.id === 'QUEUED' ? '#f1f5f9' : '#ffffff',
                                  color: stage.id === 'QUEUED' ? '#94a3b8' : '#334155',
                                  cursor: stage.id === 'QUEUED' ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                <ArrowLeft size={12} />
                                <span>Atrás</span>
                              </button>

                              <button
                                disabled={stage.id === 'READY_TO_SHIP'}
                                onClick={() => handleMoveStage(ord.id, stage.id, 'forward')}
                                style={{
                                  flex: 1.5,
                                  padding: '0.35rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: stage.id === 'READY_TO_SHIP' ? '#f1f5f9' : '#176B87',
                                  color: stage.id === 'READY_TO_SHIP' ? '#94a3b8' : '#ffffff',
                                  cursor: stage.id === 'READY_TO_SHIP' ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                <span>Avanzar</span>
                                <ArrowRight size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: INVENTARIO DE FILAMENTOS
           ========================================================================= */}
        {activeTab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Inventario de Filamentos & Insumos 3D
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                  Control de stock en gramos, registro de entradas/salidas en Kardex y retiro de colores obsoletos.
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsNewMaterialModalOpen(true)}
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>+ Agregar Nuevo Material</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {inventoryList.map((mat) => {
                const isLowStock = mat.stockGrams < 200;

                return (
                  <div
                    key={mat.id}
                    className="card"
                    style={{
                      background: '#ffffff',
                      border: isLowStock ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: mat.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                          <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>{mat.name}</strong>
                        </div>

                        <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', background: mat.isActive !== false ? '#ecfdf5' : '#fee2e2', color: mat.isActive !== false ? '#059669' : '#dc2626' }}>
                          {mat.isActive !== false ? 'Activo en Web' : 'Oculto / Retirado'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem' }}>
                        Tipo: <strong>{mat.type}</strong> • Prov: {mat.supplier || 'Polymaker'}
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                          <span style={{ color: '#64748b' }}>Stock Disponible:</span>
                          <strong style={{ color: isLowStock ? '#dc2626' : '#176B87' }}>{mat.stockGrams} g</strong>
                        </div>
                        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.min(100, (mat.stockGrams / 1000) * 100)}%`, background: isLowStock ? '#ef4444' : '#176B87' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <button
                        onClick={() => setMovementModal({ isOpen: true, material: mat, type: 'ENTRADA', grams: 1000, reason: '' })}
                        style={{ flex: 1, padding: '0.4rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        + Entrada
                      </button>

                      <button
                        onClick={() => setMovementModal({ isOpen: true, material: mat, type: 'SALIDA', grams: 100, reason: '' })}
                        style={{ flex: 1, padding: '0.4rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        - Salida / Merma
                      </button>

                      <button
                        title={mat.isActive !== false ? 'Retirar de opciones para clientes' : 'Reactivar en catálogo'}
                        onClick={() => handleToggleMaterialStatus(mat.id)}
                        style={{ padding: '0.4rem 0.6rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        {mat.isActive !== false ? <Ban size={14} color="#dc2626" /> : <Check size={14} color="#059669" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '1rem' }}>
                Historial de Movimientos de Almacén (Kardex)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Fecha</th>
                    <th style={{ padding: '0.6rem' }}>Material</th>
                    <th style={{ padding: '0.6rem' }}>Tipo</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Cantidad</th>
                    <th style={{ padding: '0.6rem' }}>Motivo / Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {kardexHistory.map((k) => (
                    <tr key={k.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.65rem', color: '#64748b' }}>{k.date}</td>
                      <td style={{ padding: '0.65rem', fontWeight: '700', color: '#0F172A' }}>{k.materialName}</td>
                      <td style={{ padding: '0.65rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: k.type === 'ENTRADA' ? '#ecfdf5' : k.type === 'MERMA' ? '#fff1f2' : '#eff6ff', color: k.type === 'ENTRADA' ? '#059669' : k.type === 'MERMA' ? '#e11d48' : '#2563eb' }}>
                          {k.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem', textAlign: 'right', fontWeight: '800', color: k.type === 'ENTRADA' ? '#059669' : '#dc2626' }}>
                        {k.type === 'ENTRADA' ? `+${k.grams} g` : `-${k.grams} g`}
                      </td>
                      <td style={{ padding: '0.65rem', color: '#475569' }}>{k.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: GESTOR DE COTIZACIONES B2B
           ========================================================================= */}
        {activeTab === 'quotes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Gestor de Cotizaciones Formales B2B
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                  Edita presupuestos, aplica notas de reembolso, exporta PDFs simétricos y envía notificaciones por WhatsApp/Email.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', top: '50%', left: '0.75rem', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Buscar por empresa o folio..."
                    value={quoteSearchTerm}
                    onChange={(e) => setQuoteSearchTerm(e.target.value)}
                    style={{ padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div className="card" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Folio</th>
                    <th style={{ padding: '0.75rem' }}>Empresa / Cliente</th>
                    <th style={{ padding: '0.75rem' }}>Piezas</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total Neto</th>
                    <th style={{ padding: '0.75rem' }}>Estado</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Acciones Directas</th>
                  </tr>
                </thead>
                <tbody>
                  {quotesList
                    .filter((q) => (q.companyName || '').toLowerCase().includes(quoteSearchTerm.toLowerCase()) || (q.quoteNumber || '').toLowerCase().includes(quoteSearchTerm.toLowerCase()))
                    .map((quote) => (
                      <tr key={quote.quoteNumber} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: '800', color: '#176B87' }}>
                          {quote.quoteNumber}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: '700', color: '#0F172A' }}>{quote.companyName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>RFC: {quote.rfc || 'XAXX010101000'}</div>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: '700' }}>{quote.units || quote.quantity || 100} pcs</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '800', color: '#0F172A' }}>
                          {formatCurrency(quote.finalTotal || quote.totalAmount)}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#ecfdf5', color: '#059669' }}>
                            {quote.status || 'VIGENTE'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                            <button
                              title="Editar o Corregir Datos"
                              onClick={() => setSelectedQuoteForDetail(quote)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '700' }}
                            >
                              <Edit3 size={13} />
                              <span>Editar</span>
                            </button>

                            <button
                              title="Descargar PDF Oficial"
                              onClick={() => generateB2BQuotePDF(quote)}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '700' }}
                            >
                              <FileDown size={13} />
                              <span>PDF</span>
                            </button>

                            <button
                              title="Enviar WhatsApp"
                              onClick={() => handleSendQuoteWhatsApp(quote)}
                              style={{ padding: '0.35rem 0.6rem', background: '#25D366', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', fontWeight: '700' }}
                            >
                              <MessageCircle size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: MÉTRICAS & ANALÍTICA
           ========================================================================= */}
        {activeTab === 'metrics' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Analítica Financiera & Desempeño 3D
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                  Filtra por período temporal, canal de captación y analiza rendimientos de granja.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', background: '#ffffff', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
                <button
                  onClick={() => setMetricsPeriod('TODAY')}
                  style={{ padding: '0.4rem 0.75rem', border: 'none', borderRadius: '4px', background: metricsPeriod === 'TODAY' ? '#176B87' : 'transparent', color: metricsPeriod === 'TODAY' ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Hoy
                </button>
                <button
                  onClick={() => setMetricsPeriod('WEEK')}
                  style={{ padding: '0.4rem 0.75rem', border: 'none', borderRadius: '4px', background: metricsPeriod === 'WEEK' ? '#176B87' : 'transparent', color: metricsPeriod === 'WEEK' ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Esta Semana
                </button>
                <button
                  onClick={() => setMetricsPeriod('MONTH')}
                  style={{ padding: '0.4rem 0.75rem', border: 'none', borderRadius: '4px', background: metricsPeriod === 'MONTH' ? '#176B87' : 'transparent', color: metricsPeriod === 'MONTH' ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Este Mes
                </button>
                <button
                  onClick={() => setMetricsPeriod('ALL')}
                  style={{ padding: '0.4rem 0.75rem', border: 'none', borderRadius: '4px', background: metricsPeriod === 'ALL' ? '#176B87' : 'transparent', color: metricsPeriod === 'ALL' ? '#ffffff' : '#64748b', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Histórico Total
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>VENTAS TOTALES</span>
                  <DollarSign size={20} color="#10b981" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
                  {formatCurrency(totalRevenue)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem', fontWeight: '700' }}>
                  ↑ +18.4% vs mes anterior
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>HORAS MÁQUINA</span>
                  <Clock size={20} color="#3b82f6" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
                  {totalMachineHours.toFixed(1)} hrs
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                  En 5 impresoras activas
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>FILAMENTO IMPRESO</span>
                  <Activity size={20} color="#176B87" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
                  {formatGrams(totalGramsConsumed)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                  Merma global: <strong>2.8%</strong> (Óptima)
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>CONTROL DE CALIDAD</span>
                  <ShieldCheck size={20} color="#8b5cf6" />
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F172A' }}>
                  98.2%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.3rem', fontWeight: '700' }}>
                  Tasa de aprobación en primer intento
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: CATÁLOGO DE PRODUCTOS & CARGA DIRECTA DE ARCHIVOS 2D / 3D
           ========================================================================= */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Gestión Total de Catálogo & Archivos 2D / 3D
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, marginTop: '0.2rem' }}>
                  Sube fotos 2D o modelos 3D (.GLB, .GLTF, .STL), configura colores por zonas y publica directamente sin tocar código.
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={handleOpenNewProductModal}
                style={{ fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={16} />
                <span>+ Crear / Subir Nuevo Producto</span>
              </button>
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {productsCatalog.map((prod) => (
                <div
                  key={prod.id}
                  className="card"
                  style={{
                    background: '#ffffff',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                        {prod.subcollection || 'General'}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', background: prod.isActive !== false ? '#ecfdf5' : '#fee2e2', color: prod.isActive !== false ? '#059669' : '#dc2626' }}>
                        {prod.isActive !== false ? 'Activo en Tienda' : 'Oculto'}
                      </span>
                    </div>

                    {/* 2D Image or 3D Icon */}
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', overflow: 'hidden' }}>
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <Box size={36} color="#176B87" style={{ opacity: 0.8 }} />
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', fontWeight: '700' }}>
                            {prod.modelType === 'custom_file' ? `3D Custom (${(prod.custom3DFileType || '3D').toUpperCase()})` : `3D ${prod.modelType}`}
                          </div>
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '0.25rem' }}>
                      {prod.name}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                      {prod.description}
                    </p>

                    {/* Enabled Zones Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(23, 107, 135, 0.1)', color: '#176B87' }}>
                        🎨 Base
                      </span>
                      {prod.allowAccentColor !== false && (
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#fef3c7', color: '#b45309' }}>
                          ✨ Acento
                        </span>
                      )}
                      {prod.isCustomizable !== false && (
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#f3e8ff', color: '#7e22ce' }}>
                          ✍️ Relieve 3D
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.6rem', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Precio Base:</span>
                      <strong style={{ fontSize: '1.15rem', color: '#176B87' }}>{formatCurrency(prod.basePrice)}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1, fontSize: '0.75rem', fontWeight: '700' }}
                        onClick={() => handleEditProduct(prod)}
                      >
                        <Edit3 size={13} />
                        <span>Editar / Zonas</span>
                      </button>

                      <button
                        title="Eliminar Producto"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        style={{ padding: '0.4rem 0.6rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', color: '#dc2626' }}
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
      </div>

      {/* =========================================================================
          MODAL 5: ALTA / EDICIÓN CON CARGA DIRECTA 2D Y 3D Y TESTER DE RELIEVE
         ========================================================================= */}
      {isProductModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '980px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>
                  {editingProduct ? `Editar Producto: ${editingProduct.name}` : 'Cargar & Publicar Nuevo Producto'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, marginTop: '0.2rem' }}>
                  Sube fotos 2D o modelos 3D (.GLB, .GLTF, .STL) y configura los colores por zonas.
                </p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Form: Product Data & Uploads */}
              <form onSubmit={handleSaveProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Esfera Navideña Personalizada"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                      Subcolección / Categoría *
                    </label>
                    <select
                      value={productFormData.subcollection}
                      onChange={(e) => setProductFormData({ ...productFormData, subcollection: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="escolar">Escolar & Estudiantes</option>
                      <option value="oficina">Oficina & Escritorio</option>
                      <option value="hogar">Hogar & Decoración</option>
                      <option value="personal">Personal & Accesorios</option>
                      <option value="kids">Kids & Juguetes 3D</option>
                      <option value="empresas">Empresas & B2B</option>
                      <option value="eventos">Eventos & Souvenirs</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                      Precio Base ($ MXN) *
                    </label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={productFormData.basePrice}
                      onChange={(e) => setProductFormData({ ...productFormData, basePrice: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                      Geometría 3D Base
                    </label>
                    <select
                      value={productFormData.modelType}
                      onChange={(e) => setProductFormData({ ...productFormData, modelType: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    >
                      <option value="sphere">Esfera Decorativa / Navideña</option>
                      <option value="keychain">Llavero / Tag Bicapa</option>
                      <option value="car">Auto a Escala</option>
                      <option value="cup">Taza / Cilindro</option>
                      <option value="planter">Maceta Geométrica</option>
                      <option value="trophy">Trofeo Ejecutivo</option>
                      <option value="custom_file">📁 Modelo 3D Subido (.GLB/.STL)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                      Gramos BOM (g)
                    </label>
                    <input
                      type="number"
                      value={productFormData.filamentGrams}
                      onChange={(e) => setProductFormData({ ...productFormData, filamentGrams: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                {/* 2D Image Upload & Live Thumbnail Box */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ImageIcon size={16} color="#176B87" />
                      <strong style={{ fontSize: '0.82rem', color: '#0F172A' }}>
                        Imagen 2D / Render Fotográfico
                      </strong>
                    </div>

                    {productFormData.image2D && (
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#ecfdf5', color: '#059669' }}>
                        ✓ Imagen Cargada
                      </span>
                    )}
                  </div>

                  {productFormData.image2D ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                      <img
                        src={productFormData.image2D}
                        alt="Preview 2D"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>Vista Previa en Tienda Activa</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Se mostrará en la tarjeta de producto</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductFormData({ ...productFormData, image2D: null })}
                        style={{ padding: '0.35rem 0.65rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handle2DImageChange}
                        style={{ fontSize: '0.82rem', width: '100%' }}
                      />
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Formatos soportados: .PNG, .JPG, .WEBP (hasta 25 MB)
                      </div>
                    </div>
                  )}
                </div>

                {/* 3D Model File Uploader & Status Box */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileUp size={16} color="#176B87" />
                      <strong style={{ fontSize: '0.82rem', color: '#0F172A' }}>
                        Archivo 3D Personalizado (.GLB / .GLTF / .STL)
                      </strong>
                    </div>

                    {productFormData.custom3DFileUrl && (
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
                        ✓ Modelo 3D Activo
                      </span>
                    )}
                  </div>

                  {productFormData.custom3DFileUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0F172A' }}>
                          Archivo 3D: {(productFormData.custom3DFileType || '3D').toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Renderizándose en vivo en el visor derecho</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductFormData({ ...productFormData, modelType: 'keychain', custom3DFileUrl: null, custom3DFileType: null })}
                        style={{ padding: '0.35rem 0.65rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Revertir a Estándar
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept=".glb,.gltf,.stl"
                        onChange={handle3DModelFileChange}
                        style={{ fontSize: '0.82rem', width: '100%' }}
                      />
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Sube archivos 3D exportados de Fusion 360, Blender o Tinkercad.
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Customization Mode (Free vs Predefined Options/Combos) */}
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <Palette size={16} color="#176B87" />
                    <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>
                      Modo de Selección de Colores para el Cliente
                    </strong>
                  </div>

                  {/* Mode Selector Radio */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, colorMode: 'FREE' })}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: productFormData.colorMode !== 'PRESETS' ? '2px solid #176B87' : '1px solid #cbd5e1',
                        background: productFormData.colorMode !== 'PRESETS' ? '#e0f2fe' : '#ffffff',
                        color: productFormData.colorMode !== 'PRESETS' ? '#0369a1' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      🎨 Selección Libre por Capas
                    </button>

                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, colorMode: 'PRESETS' })}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: productFormData.colorMode === 'PRESETS' ? '2px solid #176B87' : '1px solid #cbd5e1',
                        background: productFormData.colorMode === 'PRESETS' ? '#e0f2fe' : '#ffffff',
                        color: productFormData.colorMode === 'PRESETS' ? '#0369a1' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      🎯 Combos / Opciones Fijas
                    </button>
                  </div>

                  {productFormData.colorMode === 'PRESETS' ? (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.6rem' }}>
                        El comprador solo podrá elegir entre las siguientes combinaciones configuradas:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                        {(productFormData.colorPresets || []).map((preset, pIdx) => (
                          <div
                            key={preset.id || pIdx}
                            onClick={() => {
                              setProductFormData((prev) => ({
                                ...prev,
                                previewBaseColor: preset.baseColor.hex,
                                previewAccentColor: preset.accentColor.hex,
                                previewReliefColor: preset.reliefColor.hex
                              }));
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#ffffff',
                              padding: '0.5rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ display: 'flex', gap: '3px' }}>
                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.baseColor.hex, border: '1px solid rgba(0,0,0,0.2)' }} title="Base" />
                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.accentColor.hex, border: '1px solid rgba(0,0,0,0.2)' }} title="Acento" />
                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: preset.reliefColor.hex, border: '1px solid rgba(0,0,0,0.2)' }} title="Relieve" />
                              </div>
                              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A' }}>
                                {preset.name}
                              </span>
                            </div>

                            <span style={{ fontSize: '0.7rem', color: '#176B87', fontWeight: '700' }}>
                              👁️ Probar 3D
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={productFormData.allowBaseColor}
                          onChange={(e) => setProductFormData({ ...productFormData, allowBaseColor: e.target.checked })}
                        />
                        <span><strong>Zona 1: Color Base / Cuerpo Principal</strong></span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={productFormData.allowAccentColor}
                          onChange={(e) => setProductFormData({ ...productFormData, allowAccentColor: e.target.checked })}
                        />
                        <span><strong>Zona 2: Color de Acentos / Bisel</strong></span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={productFormData.allowReliefColor}
                          onChange={(e) => setProductFormData({ ...productFormData, allowReliefColor: e.target.checked })}
                        />
                        <span><strong>Zona 3: Color de Relieve / Texto 3D</strong></span>
                      </label>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ fontWeight: '800' }}>
                    Guardar y Publicar en Tienda
                  </button>
                </div>
              </form>

              {/* Right: Live Interactive 3D Model Tester */}
              <div style={{ background: '#f1f5f9', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#176B87', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Sparkles size={16} />
                  <span>Previsualizador 3D en Vivo</span>
                </div>

                <div style={{ height: '320px', background: '#ffffff', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
                  <ThreeViewer
                    modelType={productFormData.modelType}
                    custom3DFileUrl={productFormData.custom3DFileUrl}
                    custom3DFileType={productFormData.custom3DFileType}
                    baseColor={productFormData.previewBaseColor}
                    accentColor={productFormData.previewAccentColor}
                    reliefColor={productFormData.previewReliefColor}
                    textColor={productFormData.previewReliefColor}
                    customText="MUESTRA 3D"
                  />
                </div>

                {/* Color Swatches Tester for the Admin */}
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '700', color: '#334155' }}>Color de Base / Fondo:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="color"
                        value={productFormData.previewBaseColor}
                        onChange={(e) => setProductFormData({ ...productFormData, previewBaseColor: e.target.value })}
                        style={{ border: 'none', width: '28px', height: '24px', cursor: 'pointer', borderRadius: '4px' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{productFormData.previewBaseColor}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '700', color: '#334155' }}>Color de Acento / Bisel:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="color"
                        value={productFormData.previewAccentColor}
                        onChange={(e) => setProductFormData({ ...productFormData, previewAccentColor: e.target.value })}
                        style={{ border: 'none', width: '28px', height: '24px', cursor: 'pointer', borderRadius: '4px' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{productFormData.previewAccentColor}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontWeight: '700', color: '#334155' }}>Color de Relieve / Texto 3D:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <input
                        type="color"
                        value={productFormData.previewReliefColor}
                        onChange={(e) => setProductFormData({ ...productFormData, previewReliefColor: e.target.value })}
                        style={{ border: 'none', width: '28px', height: '24px', cursor: 'pointer', borderRadius: '4px' }}
                      />
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{productFormData.previewReliefColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: EDICIÓN Y DETALLE COMPLETO DE COTIZACIÓN B2B
         ========================================================================= */}
      {selectedQuoteForDetail && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedQuoteForDetail(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '700px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-primary" style={{ background: '#176B87' }}>
                  FOLIO: {selectedQuoteForDetail.quoteNumber}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                  Detalle & Edición de Cotización
                </h3>
              </div>
              <button onClick={() => setSelectedQuoteForDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Razón Social</label>
                <input
                  type="text"
                  value={selectedQuoteForDetail.companyName}
                  onChange={(e) => setSelectedQuoteForDetail({ ...selectedQuoteForDetail, companyName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>RFC (CFDI 4.0)</label>
                <input
                  type="text"
                  value={selectedQuoteForDetail.rfc || ''}
                  onChange={(e) => setSelectedQuoteForDetail({ ...selectedQuoteForDetail, rfc: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Piezas / Volumen</label>
                <input
                  type="number"
                  value={selectedQuoteForDetail.units || selectedQuoteForDetail.quantity || 100}
                  onChange={(e) => {
                    const newUnits = Number(e.target.value);
                    const unitPrice = selectedQuoteForDetail.unitPrice || 85;
                    const disc = selectedQuoteForDetail.discountPercent || 25;
                    const sub = unitPrice * (1 - disc / 100) * newUnits;
                    const iva = sub * 0.16;
                    setSelectedQuoteForDetail({
                      ...selectedQuoteForDetail,
                      units: newUnits,
                      quantity: newUnits,
                      subtotal: sub,
                      iva: iva,
                      finalTotal: sub + iva,
                      totalAmount: sub + iva
                    });
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Descuento B2B (%)</label>
                <input
                  type="number"
                  value={selectedQuoteForDetail.discountPercent || 25}
                  onChange={(e) => {
                    const newDisc = Number(e.target.value);
                    const newUnits = selectedQuoteForDetail.units || 100;
                    const unitPrice = selectedQuoteForDetail.unitPrice || 85;
                    const sub = unitPrice * (1 - newDisc / 100) * newUnits;
                    const iva = sub * 0.16;
                    setSelectedQuoteForDetail({
                      ...selectedQuoteForDetail,
                      discountPercent: newDisc,
                      subtotal: sub,
                      iva: iva,
                      finalTotal: sub + iva,
                      totalAmount: sub + iva
                    });
                  }}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Total Summary */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Neto Calculado:</div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#176B87' }}>
                  {formatCurrency(selectedQuoteForDetail.finalTotal || selectedQuoteForDetail.totalAmount)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => generateB2BQuotePDF(selectedQuoteForDetail)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}
                >
                  <FileDown size={14} />
                  <span>Descargar PDF</span>
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleUpdateQuote(selectedQuoteForDetail)}
                  style={{ fontWeight: '700' }}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: BITÁCORA Y NOTAS DE TALLER
         ========================================================================= */}
      {selectedOrderForNotes && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setSelectedOrderForNotes(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '540px',
              padding: '2rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                Bitácora de Taller — #{selectedOrderForNotes.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrderForNotes(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {(orderNotesMap[selectedOrderForNotes.orderNumber] || []).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '1rem' }}>
                  No hay notas registradas para esta orden.
                </div>
              ) : (
                (orderNotesMap[selectedOrderForNotes.orderNumber] || []).map((n) => (
                  <div key={n.id} style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.72rem', marginBottom: '0.2rem' }}>
                      <strong>{n.author}</strong>
                      <span>{n.timestamp}</span>
                    </div>
                    <div style={{ color: '#0F172A' }}>{n.text}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Escribe una nota interna..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
              />
              <button
                className="btn btn-primary"
                onClick={() => handleAddComment(selectedOrderForNotes.orderNumber)}
                style={{ fontWeight: '700', padding: '0.65rem 1rem' }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: NUEVO PEDIDO MANUAL MULTICANAL
         ========================================================================= */}
      {isManualOrderModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setIsManualOrderModalOpen(false)}
        >
          <form
            onSubmit={handleCreateManualOrder}
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                Registrar Pedido Multicanal
              </h3>
              <button type="button" onClick={() => setIsManualOrderModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Canal de Captación</label>
                <select
                  value={manualOrderData.channel}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, channel: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="WHATSAPP">WhatsApp Business</option>
                  <option value="INSTAGRAM">Instagram Direct</option>
                  <option value="STORE">Mostrador / Taller Físico</option>
                  <option value="PHONE">Llamada Telefónica</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Nombre del Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Lic. Fernando Garza"
                  value={manualOrderData.customerName}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, customerName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Teléfono de Contacto (WhatsApp)</label>
                <input
                  type="tel"
                  placeholder="612 123 4567"
                  value={manualOrderData.customerPhone}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, customerPhone: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Cantidad de Piezas</label>
                <input
                  type="number"
                  min="1"
                  value={manualOrderData.quantity}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, quantity: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Producto a Fabricar</label>
                <input
                  type="text"
                  value={manualOrderData.productName}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, productName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Monto Total ($ MXN)</label>
                <input
                  type="number"
                  value={manualOrderData.totalPrice}
                  onChange={(e) => setManualOrderData({ ...manualOrderData, totalPrice: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsManualOrderModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: '800' }}>
                Registrar e Iniciar en Cola
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: REGISTRO DE MOVIMIENTO KARDEX
         ========================================================================= */}
      {movementModal.isOpen && movementModal.material && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setMovementModal({ ...movementModal, isOpen: false })}
        >
          <form
            onSubmit={handleApplyMovement}
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '480px',
              padding: '2rem',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
                {movementModal.type === 'ENTRADA' ? '📥 Registrar Entrada de Carrete' : '📤 Registrar Salida / Merma'}
              </h3>
              <button type="button" onClick={() => setMovementModal({ ...movementModal, isOpen: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.2rem' }}>Material Seleccionado:</div>
              <strong style={{ fontSize: '1.05rem', color: '#176B87' }}>{movementModal.material.name}</strong>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Cantidad (Gramos) *</label>
              <input
                type="number"
                required
                min="1"
                value={movementModal.grams}
                onChange={(e) => setMovementModal({ ...movementModal, grams: e.target.value })}
                style={{ width: '100%', padding: '0.7rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: '800' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Motivo / Proveedor / Lote *</label>
              <input
                type="text"
                required
                placeholder="Ej. Compra de 2 carretes Polymaker Lote #89"
                value={movementModal.reason}
                onChange={(e) => setMovementModal({ ...movementModal, reason: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setMovementModal({ ...movementModal, isOpen: false })}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontWeight: '800' }}>
                Aplicar al Kardex
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .kanban-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
