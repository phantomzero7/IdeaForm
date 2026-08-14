import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PRODUCTS,
  FILAMENT_MATERIALS,
  FILAMENT_COLORS,
  MOCK_ORDERS_KANBAN,
  MOCK_B2B_QUOTES,
  B2B_PRICE_TIERS,
  MOCK_3D_PRINTERS,
  MOCK_OPERATING_EXPENSES,
  DEFAULT_BOT_SETTINGS,
  DEFAULT_BOT_INTENTS
} from '../data/mockData';
import { generateFolio } from '../utils/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { getRoleForEmail } from '../config/authorizedUsers';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Navigation / View State
  const [currentView, setCurrentView] = useState('home'); // home | colecciones | empresas | eventos | catalog | customizer | b2b | tracking | admin | checkout | profile
  const [viewParams, setViewParams] = useState({});

  // Auth State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ideaform_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('ideaform_user_role');
    return saved || 'CUSTOMER'; // 'CUSTOMER' | 'B2B_CLIENT' | 'OPERATOR_3D' | 'ADMIN'
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ideaform_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Raw Materials (Filaments Stock in Grams - Unified Store Stock)
  const [filamentInventory, setFilamentInventory] = useState(() => {
    const saved = localStorage.getItem('ideaform_filaments');
    return saved ? JSON.parse(saved) : FILAMENT_COLORS;
  });

  const saveFilament = (newOrUpdatedFilament) => {
    setFilamentInventory((prev) => {
      const exists = prev.some((f) => f.id === newOrUpdatedFilament.id || (f.name.toLowerCase() === newOrUpdatedFilament.name.toLowerCase()));
      let updated;
      if (exists) {
        updated = prev.map((f) => (f.id === newOrUpdatedFilament.id ? { ...f, ...newOrUpdatedFilament } : f));
      } else {
        const id = newOrUpdatedFilament.id || `col-${Date.now()}`;
        updated = [...prev, { ...newOrUpdatedFilament, id }];
      }
      localStorage.setItem('ideaform_filaments', JSON.stringify(updated));
      return updated;
    });
    showToast(`Filamento "${newOrUpdatedFilament.name}" guardado en inventario`, 'success');
  };

  const toggleBlockFilament = (filamentId) => {
    setFilamentInventory((prev) => {
      const updated = prev.map((f) => {
        if (f.id === filamentId) {
          const nextBlocked = !f.isBlocked;
          showToast(`Filamento "${f.name}" ${nextBlocked ? 'bloqueado manualmente' : 'desbloqueado'}`, 'info');
          return { ...f, isBlocked: nextBlocked };
        }
        return f;
      });
      localStorage.setItem('ideaform_filaments', JSON.stringify(updated));
      return updated;
    });
  };

  const archiveFilament = (filamentId) => {
    setFilamentInventory((prev) => {
      const updated = prev.map((f) => {
        if (f.id === filamentId) {
          showToast(`Filamento "${f.name}" archivado/retirado de la tienda`, 'warning');
          return { ...f, isArchived: true };
        }
        return f;
      });
      localStorage.setItem('ideaform_filaments', JSON.stringify(updated));
      return updated;
    });
  };

  const unarchiveFilament = (filamentId) => {
    setFilamentInventory((prev) => {
      const updated = prev.map((f) => {
        if (f.id === filamentId) {
          showToast(`Filamento "${f.name}" restaurado a inventario activo`, 'success');
          return { ...f, isArchived: false };
        }
        return f;
      });
      localStorage.setItem('ideaform_filaments', JSON.stringify(updated));
      return updated;
    });
  };

  const recordStockMovement = (filamentId, type, grams, reason = '') => {
    setFilamentInventory((prev) => {
      const updated = prev.map((f) => {
        if (f.id === filamentId) {
          const delta = type === 'ENTRADA' ? Math.abs(grams) : -Math.abs(grams);
          const nextStock = Math.max(0, (f.stockGrams || 0) + delta);
          
          if (nextStock === 0) {
            showToast(`⚠️ ¡Alerta! El filamento "${f.name}" se ha AGOTADO (0g). Las opciones ligadas se desactivaron.`, 'error');
          } else if (nextStock <= (f.minAlertGrams || 300)) {
            showToast(`⚠️ Filamento "${f.name}" en STOCK BAJO (${nextStock}g restantes).`, 'warning');
          } else {
            showToast(`Stock de "${f.name}" actualizado: ${nextStock}g (${type})`, 'success');
          }

          return { ...f, stockGrams: nextStock };
        }
        return f;
      });
      localStorage.setItem('ideaform_filaments', JSON.stringify(updated));
      return updated;
    });
  };

  // Helper to check if a single color is available in inventory
  const isColorAvailable = (hexOrId) => {
    if (!hexOrId) return true;
    const clean = String(hexOrId).toLowerCase();
    const found = filamentInventory.find(
      (f) => f.id.toLowerCase() === clean || f.hex.toLowerCase() === clean
    );
    if (!found) return true; // If not in inventory system, allow by default
    return !found.isArchived && !found.isBlocked && (found.stockGrams || 0) > 0;
  };

  // Helper to check if an entire combo is available (All 3 colors must have stock > 0)
  const isComboAvailable = (combo) => {
    if (!combo) return { available: true, missingColors: [] };
    const missing = [];

    const baseHex = combo.baseColor?.hex || combo.baseColor;
    const accentHex = combo.accentColor?.hex || combo.accentColor;
    const reliefHex = combo.reliefColor?.hex || combo.reliefColor;

    if (!isColorAvailable(baseHex)) {
      missing.push(combo.baseColor?.name || 'Color Base');
    }
    if (!isColorAvailable(accentHex)) {
      missing.push(combo.accentColor?.name || 'Color Acento');
    }
    if (!isColorAvailable(reliefHex)) {
      missing.push(combo.reliefColor?.name || 'Color Relieve');
    }

    return {
      available: missing.length === 0,
      missingColors: missing
    };
  };

  // Helper to get low stock or out of stock filaments for notifications
  const getFilamentStockAlerts = () => {
    const outOfStock = filamentInventory.filter((f) => !f.isArchived && (f.stockGrams || 0) <= 0);
    const lowStock = filamentInventory.filter(
      (f) => !f.isArchived && (f.stockGrams || 0) > 0 && (f.stockGrams || 0) <= (f.minAlertGrams || 300)
    );
    const blocked = filamentInventory.filter((f) => !f.isArchived && f.isBlocked);
    return { outOfStock, lowStock, blocked };
  };

  // 3D Printer Fleet State (Persisted in localStorage)
  const [printers, setPrinters] = useState(() => {
    const saved = localStorage.getItem('ideaform_printers');
    return saved ? JSON.parse(saved) : MOCK_3D_PRINTERS;
  });

  const savePrinter = (newOrUpdatedPrinter) => {
    setPrinters((prev) => {
      const exists = prev.some((p) => p.id === newOrUpdatedPrinter.id);
      let updated;
      if (exists) {
        updated = prev.map((p) => (p.id === newOrUpdatedPrinter.id ? { ...p, ...newOrUpdatedPrinter } : p));
      } else {
        const id = newOrUpdatedPrinter.id || `prt-${Date.now()}`;
        updated = [...prev, { ...newOrUpdatedPrinter, id }];
      }
      localStorage.setItem('ideaform_printers', JSON.stringify(updated));
      return updated;
    });
    showToast(`Impresora "${newOrUpdatedPrinter.name}" guardada correctamente`, 'success');
  };

  const deletePrinter = (printerId) => {
    setPrinters((prev) => {
      const updated = prev.filter((p) => p.id !== printerId);
      localStorage.setItem('ideaform_printers', JSON.stringify(updated));
      return updated;
    });
    showToast('Impresora eliminada del parque de impresión', 'warning');
  };

  const updatePrinterStatus = (printerId, newStatus, currentJobId = null) => {
    setPrinters((prev) => {
      const updated = prev.map((p) => {
        if (p.id === printerId) {
          return {
            ...p,
            status: newStatus,
            currentJobId: currentJobId !== undefined ? currentJobId : p.currentJobId
          };
        }
        return p;
      });
      localStorage.setItem('ideaform_printers', JSON.stringify(updated));
      return updated;
    });
    showToast(`Estado de impresora actualizado a "${newStatus}"`, 'info');
  };

  // Operating Expenses State (Persisted in localStorage)
  const [operatingExpenses, setOperatingExpenses] = useState(() => {
    const saved = localStorage.getItem('ideaform_expenses');
    return saved ? JSON.parse(saved) : MOCK_OPERATING_EXPENSES;
  });

  const saveOperatingExpense = (newOrUpdatedExpense) => {
    setOperatingExpenses((prev) => {
      const exists = prev.some((e) => e.id === newOrUpdatedExpense.id);
      let updated;
      if (exists) {
        updated = prev.map((e) => (e.id === newOrUpdatedExpense.id ? { ...e, ...newOrUpdatedExpense } : e));
      } else {
        const id = newOrUpdatedExpense.id || `exp-${Date.now()}`;
        updated = [ { ...newOrUpdatedExpense, id }, ...prev ];
      }
      localStorage.setItem('ideaform_expenses', JSON.stringify(updated));
      return updated;
    });
    showToast('Gasto operativo registrado exitosamente', 'success');
  };

  const deleteOperatingExpense = (expenseId) => {
    setOperatingExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== expenseId);
      localStorage.setItem('ideaform_expenses', JSON.stringify(updated));
      return updated;
    });
    showToast('Gasto operativo eliminado', 'warning');
  };

  // Production Orders (Kanban & List Views)
  const [productionOrders, setProductionOrders] = useState(() => {
    const saved = localStorage.getItem('ideaform_kanban');
    return saved ? JSON.parse(saved) : MOCK_ORDERS_KANBAN;
  });

  // B2B Quotes
  const [b2bQuotes, setB2bQuotes] = useState(() => {
    const saved = localStorage.getItem('ideaform_quotes');
    return saved ? JSON.parse(saved) : MOCK_B2B_QUOTES;
  });

  // Products Catalog (Persisted in localStorage for client self-management)
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('ideaform_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });

  const saveProduct = (newOrUpdatedProduct) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === newOrUpdatedProduct.id);
      let updated;
      if (exists) {
        updated = prev.map((p) => (p.id === newOrUpdatedProduct.id ? newOrUpdatedProduct : p));
      } else {
        updated = [newOrUpdatedProduct, ...prev];
      }
      localStorage.setItem('ideaform_products', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProduct = (id) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('ideaform_products', JSON.stringify(updated));
      return updated;
    });
  };

  // IdeaForm Bot Knowledge Base & Settings (Persisted in localStorage)
  const [botSettings, setBotSettings] = useState(() => {
    const saved = localStorage.getItem('ideaform_bot_settings');
    return saved ? JSON.parse(saved) : DEFAULT_BOT_SETTINGS;
  });

  const [botIntents, setBotIntents] = useState(() => {
    const saved = localStorage.getItem('ideaform_bot_intents');
    return saved ? JSON.parse(saved) : DEFAULT_BOT_INTENTS;
  });

  const saveBotIntent = (newOrUpdatedIntent) => {
    setBotIntents((prev) => {
      const exists = prev.some((i) => i.id === newOrUpdatedIntent.id);
      let updated;
      if (exists) {
        updated = prev.map((i) => (i.id === newOrUpdatedIntent.id ? { ...i, ...newOrUpdatedIntent } : i));
      } else {
        const id = newOrUpdatedIntent.id || `intent-${Date.now()}`;
        updated = [...prev, { ...newOrUpdatedIntent, id }];
      }
      localStorage.setItem('ideaform_bot_intents', JSON.stringify(updated));
      return updated;
    });
    showToast(`Respuesta del Bot "${newOrUpdatedIntent.title}" guardada`, 'success');
  };

  const deleteBotIntent = (intentId) => {
    setBotIntents((prev) => {
      const updated = prev.filter((i) => i.id !== intentId);
      localStorage.setItem('ideaform_bot_intents', JSON.stringify(updated));
      return updated;
    });
    showToast('Intención del Bot eliminada', 'warning');
  };

  const toggleBotIntent = (intentId) => {
    setBotIntents((prev) => {
      const updated = prev.map((i) => (i.id === intentId ? { ...i, isActive: !i.isActive } : i));
      localStorage.setItem('ideaform_bot_intents', JSON.stringify(updated));
      return updated;
    });
  };

  const updateBotSettings = (newSettings) => {
    setBotSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('ideaform_bot_settings', JSON.stringify(updated));
      return updated;
    });
    showToast('Configuración general del Bot actualizada', 'success');
  };

  const resetBotKnowledge = () => {
    setBotSettings(DEFAULT_BOT_SETTINGS);
    setBotIntents(DEFAULT_BOT_INTENTS);
    localStorage.setItem('ideaform_bot_settings', JSON.stringify(DEFAULT_BOT_SETTINGS));
    localStorage.setItem('ideaform_bot_intents', JSON.stringify(DEFAULT_BOT_INTENTS));
    showToast('Base de conocimientos del Bot restaurada a valores de fábrica', 'info');
  };

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Supabase Real-Time Auth Listener
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email;
          const role = getRoleForEmail(email);
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
          const nameParts = fullName.split(' ');
          const authUser = {
            id: session.user.id,
            email: email,
            firstName: nameParts[0] || email.split('@')[0],
            lastName: nameParts.slice(1).join(' ') || '',
            avatarUrl: session.user.user_metadata?.avatar_url || null,
            provider: session.user.app_metadata?.provider || 'google',
            role: role
          };
          setUser(authUser);
          setUserRole(role);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const email = session.user.email;
          const role = getRoleForEmail(email);
          const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
          const nameParts = fullName.split(' ');
          const authUser = {
            id: session.user.id,
            email: email,
            firstName: nameParts[0] || email.split('@')[0],
            lastName: nameParts.slice(1).join(' ') || '',
            avatarUrl: session.user.user_metadata?.avatar_url || null,
            provider: session.user.app_metadata?.provider || 'google',
            role: role
          };
          setUser(authUser);
          setUserRole(role);
          showToast(`¡Bienvenido! Sesión activa como ${authUser.firstName}`, 'success');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRole('CUSTOMER');
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Persistence to localStorage
  useEffect(() => {
    localStorage.setItem('ideaform_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ideaform_kanban', JSON.stringify(productionOrders));
  }, [productionOrders]);

  useEffect(() => {
    localStorage.setItem('ideaform_quotes', JSON.stringify(b2bQuotes));
  }, [b2bQuotes]);

  useEffect(() => {
    localStorage.setItem('ideaform_filaments', JSON.stringify(filamentInventory));
  }, [filamentInventory]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ideaform_user', JSON.stringify(user));
      localStorage.setItem('ideaform_user_role', userRole);
    } else {
      localStorage.removeItem('ideaform_user');
      localStorage.removeItem('ideaform_user_role');
    }
  }, [user, userRole]);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigate Helper
  const navigateTo = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // AUTH METHODS
  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        showToast(error.message, 'error');
        return false;
      }

      if (data?.user) {
        const role = getRoleForEmail(data.user.email);
        const profile = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.user_metadata?.first_name || data.user.email.split('@')[0],
          lastName: data.user.user_metadata?.last_name || '',
          role: role
        };
        setUser(profile);
        setUserRole(role);
        showToast(`¡Bienvenido de vuelta, ${profile.firstName}!`, 'success');
        return true;
      }
    }

    // 2. Direct Role Resolution via config/authorizedUsers.js
    const computedRole = getRoleForEmail(cleanEmail);
    const firstName = cleanEmail.split('@')[0];
    const regularUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: '',
      role: computedRole
    };
    setUser(regularUser);
    setUserRole(computedRole);
    showToast(`Sesión iniciada como ${regularUser.firstName} (${computedRole})`, 'success');
    return true;
  };

  const signUp = async (email, password, metadata = {}) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: metadata.firstName,
            last_name: metadata.lastName,
            company_name: metadata.companyName
          }
        }
      });

      if (error) {
        showToast(error.message, 'error');
        return false;
      }
    }

    const computedRole = getRoleForEmail(cleanEmail);
    const newUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      firstName: metadata.firstName || cleanEmail.split('@')[0],
      lastName: metadata.lastName || '',
      companyName: metadata.companyName || null,
      role: computedRole
    };

    setUser(newUser);
    setUserRole(computedRole);
    showToast(`¡Cuenta creada con éxito! Bienvenido, ${newUser.firstName}`, 'success');
    return true;
  };

  // Google OAuth Login
  const loginWithGoogle = async (emailInput = '') => {
    // If Supabase OAuth is configured, launch standard Google redirect
    if (isSupabaseConfigured && supabase?.auth) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (!error) return;
      } catch (err) {
        console.warn('OAuth redirect fallback:', err);
      }
    }

    // Direct Real Email Lookup via src/config/authorizedUsers.js
    const realEmail = emailInput && emailInput.includes('@') ? emailInput.trim().toLowerCase() : 'sr.fregoso@gmail.com';
    const computedRole = getRoleForEmail(realEmail);
    const firstName = realEmail.split('@')[0];

    const googleUser = {
      id: `usr-google-${Date.now()}`,
      email: realEmail,
      firstName: firstName.charAt(0).toUpperCase() + firstName.slice(1),
      lastName: '',
      provider: 'google',
      role: computedRole
    };

    setUser(googleUser);
    setUserRole(computedRole);
    localStorage.setItem('ideaform_user', JSON.stringify(googleUser));
    localStorage.setItem('ideaform_user_role', computedRole);
    setIsAuthModalOpen(false);
    showToast(`¡Bienvenido! Sesión iniciada con Google (${realEmail}) ✨`, 'success');
    navigateTo('profile');
    return googleUser;
  };

  const signOut = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    setUserRole('CUSTOMER');
    localStorage.removeItem('ideaform_user');
    localStorage.removeItem('ideaform_user_role');
    showToast('Sesión cerrada correctamente', 'info');
    navigateTo('home');
  };

  // Cart Actions
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (c) =>
          c.id === item.id &&
          c.selectedColor?.id === item.selectedColor?.id &&
          c.selectedMaterial?.id === item.selectedMaterial?.id &&
          c.customText === item.customText
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += item.quantity || 1;
        return updated;
      }
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });

    showToast(`"${item.name}" agregado al carrito 🛒`, 'success');
    setIsCartOpen(true);
  };

  const updateCartQuantity = (index, delta) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      const newQty = (updated[index].quantity || 1) + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    showToast('Producto eliminado del carrito', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Coupon Logic
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'IDEAFORM10') {
      setAppliedCoupon({ code: 'IDEAFORM10', discountPercent: 10, label: '10% OFF Primera Compra' });
      showToast('¡Cupón del 10% aplicado!', 'success');
      return true;
    }
    if (cleanCode === 'MAYOREO20') {
      setAppliedCoupon({ code: 'MAYOREO20', discountPercent: 20, label: '20% OFF Mayoreo' });
      showToast('¡Cupón del 20% aplicado!', 'success');
      return true;
    }
    showToast('Cupón no válido o expirado', 'error');
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Cupón removido', 'info');
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.basePrice * (item.quantity || 1), 0);
  const discountAmount = appliedCoupon ? cartSubtotal * (appliedCoupon.discountPercent / 100) : 0;
  const isFreeShipping = cartSubtotal - discountAmount >= 999;
  const shippingCost = cart.length === 0 ? 0 : isFreeShipping ? 0 : 149;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);
  const totalItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Kanban & Slicing Integration
  const createOrder = (orderData) => {
    const newOrderNumber = generateFolio('IDF');
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      customerName: user ? `${user.firstName} ${user.lastName || ''}`.trim() : orderData.customerName || 'Cliente Invitado',
      customerEmail: user ? user.email : orderData.customerEmail || 'cliente@ideaform.mx',
      productName: cart[0]?.name || 'Pieza 3D Personalizada',
      customText: cart[0]?.customText || 'IdeaForm',
      filament: cart[0]?.selectedColor?.name || 'Verde Esmeralda',
      filamentColorHex: cart[0]?.selectedColor?.hex || '#0F5F6D',
      filamentGrams: (cart[0]?.filamentGrams || 45) * totalItemsCount,
      printTimeMins: (cart[0]?.printTimeMins || 120) * totalItemsCount,
      status: 'QUEUED',
      priority: 'MEDIUM',
      channel: 'WEB_AUTO',
      paymentMethod: 'STRIPE',
      paymentStatus: 'PAID',
      printerAssigned: null,
      date: new Date().toLocaleDateString('es-MX'),
      total: cartTotal
    };

    setProductionOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setProductionOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    showToast(`Estado de orden actualizado a "${newStatus}"`, 'info');
  };

  const updateOrderPriority = (orderId, priority) => {
    setProductionOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, priority } : ord))
    );
    showToast(`Prioridad de orden cambiada a "${priority}"`, 'info');
  };

  const updateOrderChannel = (orderId, channel) => {
    setProductionOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, channel } : ord))
    );
    showToast(`Canal de origen actualizado a "${channel}"`, 'info');
  };

  const assignPrinter = (orderId, printerName) => {
    setProductionOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, assignedPrinter: printerName, printerAssigned: printerName, status: ord.status === 'QUEUED' ? 'PRINTING' : ord.status }
          : ord
      )
    );
    showToast(`Orden asignada a ${printerName}`, 'success');
  };

  const createManualOrder = (orderData) => {
    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `IDF-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: orderData.customerName || 'Cliente Particular',
      productName: orderData.productName || 'Producto Personalizado 3D',
      customText: orderData.customText || '',
      filament: orderData.filament || 'Blanco Puro (#FAEEEB)',
      filamentGrams: Number(orderData.filamentGrams) || 50,
      printTimeMins: Number(orderData.printTimeMins) || 60,
      status: orderData.status || 'QUEUED',
      priority: orderData.priority || 'MEDIUM',
      channel: orderData.channel || 'WHATSAPP',
      paymentMethod: orderData.paymentMethod || 'SPEI',
      paymentStatus: orderData.paymentStatus || 'PAID',
      assignedPrinter: orderData.assignedPrinter || null,
      progressPercent: 0,
      packagingCost: Number(orderData.packagingCost) || 20,
      shippingCostReal: Number(orderData.shippingCostReal) || 135,
      total: Number(orderData.total) || 0,
      date: new Date().toISOString().split('T')[0]
    };

    setProductionOrders((prev) => [newOrder, ...prev]);
    showToast(`Orden manual ${newOrder.orderNumber} creada con éxito`, 'success');
    return newOrder;
  };

  // Raw Material Inventory (BOM Deduction)
  const updateFilamentStock = (materialId, gramsDelta) => {
    setFilamentInventory((prev) =>
      prev.map((mat) => {
        if (mat.id === materialId) {
          const newGrams = Math.max(0, (mat.stockGrams || 1000) + gramsDelta);
          return { ...mat, stockGrams: newGrams };
        }
        return mat;
      })
    );
    showToast('Inventario de filamento actualizado', 'success');
  };

  // Save B2B Quote
  const saveB2BQuote = (quoteData) => {
    setB2bQuotes((prev) => [quoteData, ...prev]);
    showToast('¡Cotización B2B guardada en tu perfil!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        viewParams,
        navigateTo,
        user,
        setUser,
        userRole,
        setUserRole,
        signIn,
        signUp,
        signOut,
        loginWithGoogle,
        isAuthModalOpen,
        setIsAuthModalOpen,
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        discountAmount,
        shippingCost,
        isFreeShipping,
        cartTotal,
        totalItemsCount,
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
        productionOrders,
        updateOrderStatus,
        updateOrderPriority,
        updateOrderChannel,
        assignPrinter,
        createOrder,
        createManualOrder,
        b2bQuotes,
        saveB2BQuote,
        products,
        setProducts,
        saveProduct,
        deleteProduct,
        botIntents,
        botSettings,
        saveBotIntent,
        deleteBotIntent,
        toggleBotIntent,
        updateBotSettings,
        resetBotKnowledge,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
export const useApp = () => useContext(AppContext);
