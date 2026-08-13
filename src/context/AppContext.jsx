import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, FILAMENT_MATERIALS, MOCK_ORDERS_KANBAN, MOCK_B2B_QUOTES, B2B_PRICE_TIERS } from '../data/mockData';
import { generateFolio } from '../utils/formatters';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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

  // Raw Materials (Filaments Stock in Grams)
  const [filamentInventory, setFilamentInventory] = useState(() => {
    const saved = localStorage.getItem('ideaform_filaments');
    return saved ? JSON.parse(saved) : FILAMENT_MATERIALS;
  });

  // Kanban Production Orders
  const [productionOrders, setProductionOrders] = useState(() => {
    const saved = localStorage.getItem('ideaform_kanban');
    return saved ? JSON.parse(saved) : MOCK_ORDERS_KANBAN;
  });

  // B2B Quotes
  const [b2bQuotes, setB2bQuotes] = useState(() => {
    const saved = localStorage.getItem('ideaform_quotes');
    return saved ? JSON.parse(saved) : MOCK_B2B_QUOTES;
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

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

    // 1. Check if Supabase Auth is active
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
        const profile = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.user_metadata?.first_name || 'Usuario',
          lastName: data.user.user_metadata?.last_name || '',
          role: data.user.user_metadata?.role || 'CUSTOMER'
        };
        setUser(profile);
        setUserRole(profile.role);
        showToast(`¡Bienvenido de vuelta, ${profile.firstName}!`, 'success');
        return true;
      }
    }

    // 2. Demo Auth Fallback with RBAC
    if (cleanEmail === 'admin@ideaform.mx' || cleanEmail === 'admin') {
      const adminUser = {
        id: 'usr-admin-01',
        email: 'admin@ideaform.mx',
        firstName: 'Ing. Rodrigo',
        lastName: 'Fregoso',
        role: 'ADMIN'
      };
      setUser(adminUser);
      setUserRole('ADMIN');
      showToast('Acceso como Administrador de IdeaForm concedido 👑', 'success');
      return true;
    }

    if (cleanEmail === 'operador@ideaform.mx' || cleanEmail === 'operador') {
      const opUser = {
        id: 'usr-op-02',
        email: 'operador@ideaform.mx',
        firstName: 'Marco',
        lastName: 'Taller 3D',
        role: 'OPERATOR_3D'
      };
      setUser(opUser);
      setUserRole('OPERATOR_3D');
      showToast('Acceso como Operador de Taller 3D concedido 🛠️', 'success');
      return true;
    }

    if (cleanEmail.includes('empresa') || cleanEmail.includes('innovacion')) {
      const b2bUser = {
        id: 'usr-b2b-03',
        email: cleanEmail,
        firstName: 'Lic. Sofía',
        lastName: 'Mendoza',
        companyName: 'Innovación Tecnológica S.A. de C.V.',
        rfc: 'ITE180425ABC',
        role: 'B2B_CLIENT'
      };
      setUser(b2bUser);
      setUserRole('B2B_CLIENT');
      showToast('Acceso como Cuenta Corporativa B2B concedido 🏢', 'success');
      return true;
    }

    // Default Customer
    const regularUser = {
      id: `usr-cust-${Date.now()}`,
      email: cleanEmail,
      firstName: cleanEmail.split('@')[0].toUpperCase(),
      lastName: '',
      role: 'CUSTOMER'
    };
    setUser(regularUser);
    setUserRole('CUSTOMER');
    showToast(`Sesión iniciada como ${regularUser.firstName}`, 'success');
    return true;
  };

  const signUp = async (email, password, metadata = {}) => {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: metadata.firstName,
            last_name: metadata.lastName,
            company_name: metadata.companyName,
            role: metadata.role || 'CUSTOMER'
          }
        }
      });

      if (error) {
        showToast(error.message, 'error');
        return false;
      }
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      firstName: metadata.firstName || 'Cliente',
      lastName: metadata.lastName || '',
      companyName: metadata.companyName || null,
      role: metadata.role || 'CUSTOMER'
    };

    setUser(newUser);
    setUserRole(newUser.role);
    showToast(`¡Cuenta creada con éxito! Bienvenido, ${newUser.firstName}`, 'success');
    return true;
  };

  const signOut = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    setUserRole('CUSTOMER');
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
      } else {
        return [
          ...prevCart,
          {
            ...item,
            cartItemId: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            quantity: item.quantity || 1
          }
        ];
      }
    });

    showToast(`"${item.name}" añadido a tu carrito`, 'success');
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Artículo eliminado del carrito', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Coupon Logic
  const applyCoupon = (code) => {
    const cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === 'IDEAFORM10' || cleanCode === 'DESCUENTO10') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 10 });
      showToast('¡Cupón del 10% aplicado con éxito!', 'success');
      return true;
    } else if (cleanCode === 'ENVIOGRATIS') {
      setAppliedCoupon({ code: cleanCode, freeShipping: true });
      showToast('¡Cupón de Envío Gratis aplicado!', 'success');
      return true;
    } else {
      showToast('Cupón inválido o expirado. Prueba con "IDEAFORM10"', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Cupón removido', 'info');
  };

  // Totals Calculations
  const cartSubtotal = cart.reduce((acc, item) => {
    const price = item.finalUnitPrice || item.basePrice || 0;
    return acc + price * item.quantity;
  }, 0);

  const discountAmount = appliedCoupon?.discountPercent
    ? (cartSubtotal * appliedCoupon.discountPercent) / 100
    : 0;

  const isFreeShipping =
    cartSubtotal >= 999 || appliedCoupon?.freeShipping || cart.length === 0;
  const shippingCost = isFreeShipping ? 0 : 150.00;

  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Production Kanban Actions (Restricted to OPERATOR_3D and ADMIN)
  const updateOrderStatus = (orderId, newStatus) => {
    if (userRole !== 'ADMIN' && userRole !== 'OPERATOR_3D') {
      showToast('Acceso denegado: Solo operadores o administradores pueden modificar estados de impresión.', 'error');
      return;
    }

    setProductionOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          let progress = 0;
          if (newStatus === 'QUEUED') progress = 0;
          if (newStatus === 'SLICING') progress = 20;
          if (newStatus === 'PRINTING') progress = 65;
          if (newStatus === 'QUALITY_CONTROL') progress = 90;
          if (newStatus === 'READY_TO_SHIP') progress = 100;
          return { ...order, status: newStatus, progressPercent: progress };
        }
        return order;
      })
    );
    showToast(`Estado de orden actualizado a ${newStatus}`, 'info');
  };

  const assignPrinter = (orderId, printerName) => {
    if (userRole !== 'ADMIN' && userRole !== 'OPERATOR_3D') {
      showToast('Acceso denegado: Solo operadores pueden asignar impresoras 3D.', 'error');
      return;
    }

    setProductionOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, assignedPrinter: printerName } : order))
    );
    showToast(`Impresora asignada: ${printerName}`, 'success');
  };

  // Deduct filament grams when an order is created
  const createOrder = (orderData) => {
    const orderNumber = generateFolio('IDF');
    const newKanbanOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNumber,
      customerName: `${orderData.shippingAddress?.firstName || 'Cliente'} ${orderData.shippingAddress?.lastName || ''}`,
      productName: cart.map((c) => `${c.name} (x${c.quantity})`).join(', '),
      customText: cart.find((c) => c.customText)?.customText || null,
      filament: cart[0]?.selectedMaterial?.name || 'PLA Estándar',
      filamentGrams: cart.reduce((acc, c) => acc + (c.weightGrams || 25) * c.quantity, 0),
      printTimeMins: cart.reduce((acc, c) => acc + (c.printTimeMins || 45) * c.quantity, 0),
      status: 'QUEUED',
      assignedPrinter: 'Bambu Lab X1C #01',
      progressPercent: 0,
      total: cartTotal,
      date: new Date().toISOString().split('T')[0]
    };

    setProductionOrders((prev) => [newKanbanOrder, ...prev]);

    // Deduct grams from inventory
    const totalGramsUsed = newKanbanOrder.filamentGrams;
    setFilamentInventory((prev) =>
      prev.map((mat) => ({
        ...mat,
        colors: mat.colors.map((col) => ({
          ...col,
          stockGrams: Math.max(0, col.stockGrams - totalGramsUsed / (mat.colors.length * 2))
        }))
      }))
    );

    clearCart();
    return orderNumber;
  };

  // Add B2B Quote
  const saveB2BQuote = (quote) => {
    setB2bQuotes((prev) => [quote, ...prev]);
    showToast(`Cotización ${quote.quoteNumber} guardada exitosamente`, 'success');
  };

  // Adjust stock of filament (Restricted to ADMIN)
  const updateFilamentStock = (materialId, colorId, addedGrams) => {
    if (userRole !== 'ADMIN') {
      showToast('Acceso denegado: Solo administradores pueden ajustar el inventario de insumos.', 'error');
      return;
    }

    setFilamentInventory((prev) =>
      prev.map((mat) => {
        if (mat.id === materialId) {
          return {
            ...mat,
            colors: mat.colors.map((col) => {
              if (col.id === colorId) {
                return { ...col, stockGrams: Math.max(0, col.stockGrams + Number(addedGrams)) };
              }
              return col;
            })
          };
        }
        return mat;
      })
    );
    showToast('Inventario de filamento actualizado', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        viewParams,
        navigateTo,
        user,
        userRole,
        signIn,
        signUp,
        signOut,
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
        updateFilamentStock,
        productionOrders,
        updateOrderStatus,
        assignPrinter,
        createOrder,
        b2bQuotes,
        saveB2BQuote,
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
