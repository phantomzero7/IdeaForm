import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, FILAMENT_MATERIALS, MOCK_ORDERS_KANBAN, MOCK_B2B_QUOTES, B2B_PRICE_TIERS } from '../data/mockData';
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
      status: 'QUEUED', // QUEUED -> SLICING -> PRINTING -> QUALITY_CONTROL -> READY_TO_SHIP
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

  const assignPrinter = (orderId, printerName) => {
    setProductionOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, printerAssigned: printerName, status: ord.status === 'QUEUED' ? 'PRINTING' : ord.status }
          : ord
      )
    );
    showToast(`Orden asignada a ${printerName}`, 'success');
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
