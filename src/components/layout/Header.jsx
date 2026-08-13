import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS } from '../../data/mockData';
import IdeaFormLogo from '../common/IdeaFormLogo';
import { ShoppingBag, Search, Sparkles, Building2, Heart, Truck, Wrench, Menu, X, User, LogIn } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const Header = () => {
  const { currentView, navigateTo, totalItemsCount, setIsCartOpen, user, userRole, setIsAuthModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSelectSearchResult = (product) => {
    setSearchQuery('');
    setIsSearchOpen(false);
    if (product.subcollection === 'empresas') {
      navigateTo('empresas');
    } else if (product.subcollection === 'eventos') {
      navigateTo('eventos');
    } else {
      navigateTo('colecciones');
    }
  };

  const isOperatorOrAdmin = userRole === 'ADMIN' || userRole === 'OPERATOR_3D';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
      {/* 1. Top Alert Banner */}
      <div
        style={{
          background: '#090e17',
          color: '#ffffff',
          fontSize: '0.78rem',
          fontWeight: '600',
          padding: '0.45rem 1rem',
          textAlign: 'center',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <span>🚚 Envíos a todo México</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>🛡️ Materiales de alta calidad PLA 100% Eco-Friendly</span>
        <span style={{ opacity: 0.4 }}>|</span>
        <span>✨ Personalización sin límites en 3D</span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', gap: '1rem' }}>
        
        {/* Exact IdeaForm Brand Logo */}
        <IdeaFormLogo onClick={() => navigateTo('home')} />

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', gap: '0.5rem', alignItems: 'center' }} className="desktop-nav">
          <button
            onClick={() => navigateTo('colecciones')}
            style={{
              background: currentView === 'colecciones' ? '#FAEEEB' : 'transparent',
              color: currentView === 'colecciones' ? '#A94D43' : 'var(--text-secondary)',
              fontWeight: '700',
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: currentView === 'colecciones' ? '1px solid #F0D7D2' : 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
          >
            Colecciones
          </button>

          <button
            onClick={() => navigateTo('empresas')}
            style={{
              background: currentView === 'empresas' ? '#EDF4F8' : 'transparent',
              color: currentView === 'empresas' ? '#104F75' : 'var(--text-secondary)',
              fontWeight: '700',
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: currentView === 'empresas' ? '1px solid #D5E4ED' : 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
          >
            Empresas
          </button>

          <button
            onClick={() => navigateTo('eventos')}
            style={{
              background: currentView === 'eventos' ? '#FBF4E8' : 'transparent',
              color: currentView === 'eventos' ? '#956016' : 'var(--text-secondary)',
              fontWeight: '700',
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: currentView === 'eventos' ? '1px solid #EFE4D2' : 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
          >
            Eventos
          </button>

          <button
            onClick={() => navigateTo('tracking')}
            style={{
              background: currentView === 'tracking' ? 'rgba(15, 95, 109, 0.08)' : 'transparent',
              color: currentView === 'tracking' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              padding: '0.5rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Truck size={16} />
            <span>Rastrear</span>
          </button>

          {/* ADMIN / TALLER BUTTON: PROTECTED & ONLY VISIBLE TO ADMINS OR OPERATORS */}
          {isOperatorOrAdmin && (
            <button
              onClick={() => navigateTo('admin')}
              title="Panel de Control & Taller 3D"
              style={{
                background: currentView === 'admin' ? '#0f172a' : '#f1f5f9',
                color: currentView === 'admin' ? '#ffffff' : '#0f172a',
                fontWeight: '700',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #0f172a',
                cursor: 'pointer',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Wrench size={14} />
              <span>{userRole === 'ADMIN' ? '👑 Taller / Admin' : '🛠️ Operador 3D'}</span>
            </button>
          )}
        </nav>

        {/* Right Actions: Search + Auth/Profile + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f1f5f9',
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 0.85rem',
                gap: '0.4rem',
                width: '165px'
              }}
            >
              <Search size={15} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Buscar 3D..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.82rem',
                  width: '100%',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Predictive Search Popup */}
            {isSearchOpen && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-light)',
                  padding: '0.5rem',
                  zIndex: 200
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-tertiary)', padding: '0.35rem 0.6rem' }}>
                  RESULTADOS
                </div>
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleSelectSearchResult(prod)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#0f172a' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{prod.categoryName}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        {formatCurrency(prod.basePrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Login Button */}
          {user ? (
            <button
              onClick={() => navigateTo('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f1f5f9',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: '#0f172a'
              }}
            >
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem' }}>
                {user.firstName ? user.firstName[0] : 'U'}
              </div>
              <span>{user.firstName}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 0.85rem',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: '700',
                color: 'var(--text-secondary)'
              }}
            >
              <LogIn size={15} color="var(--color-primary)" />
              <span className="login-text">Ingresar</span>
            </button>
          )}

          {/* Cart Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              background: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '0.55rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px var(--color-primary-glow)'
            }}
          >
            <ShoppingBag size={18} />
            <span style={{ display: 'none' }} className="cart-text">Carrito</span>
            {totalItemsCount > 0 && (
              <span
                style={{
                  background: '#00e5ff',
                  color: '#0f172a',
                  borderRadius: '50%',
                  width: '1.25rem',
                  height: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800'
                }}
              >
                {totalItemsCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: '#ffffff', borderTop: '1px solid var(--border-light)', padding: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}>Inicio</button>
            <button className="btn btn-secondary" onClick={() => { navigateTo('colecciones'); setMobileMenuOpen(false); }}>Colecciones</button>
            <button className="btn btn-secondary" onClick={() => { navigateTo('empresas'); setMobileMenuOpen(false); }}>Empresas (B2B)</button>
            <button className="btn btn-secondary" onClick={() => { navigateTo('eventos'); setMobileMenuOpen(false); }}>Eventos</button>
            <button className="btn btn-secondary" onClick={() => { navigateTo('tracking'); setMobileMenuOpen(false); }}>Rastrear Pedido</button>
            
            {user ? (
              <button className="btn btn-secondary" onClick={() => { navigateTo('profile'); setMobileMenuOpen(false); }}>Mi Cuenta ({user.firstName})</button>
            ) : (
              <button className="btn btn-secondary" onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }}>Iniciar Sesión</button>
            )}

            {isOperatorOrAdmin && (
              <button className="btn btn-dark" onClick={() => { navigateTo('admin'); setMobileMenuOpen(false); }}>Taller / Admin</button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .cart-text { display: inline !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 899px) {
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
