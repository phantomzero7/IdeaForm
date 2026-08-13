import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS } from '../../data/mockData';
import { ShoppingBag, Search, Box, Sparkles, Building2, Truck, Wrench, Menu, X, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const Header = () => {
  const { currentView, navigateTo, totalItemsCount, setIsCartOpen } = useApp();
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
    if (product.isCustomizable) {
      navigateTo('customizer', { productId: product.id });
    } else {
      navigateTo('catalog', { selectedProductId: product.id });
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#ffffff', boxShadow: 'var(--shadow-sm)' }}>
      {/* 1. Alert / Trust Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, #090e17 0%, #00828A 50%, #090e17 100%)',
          color: '#ffffff',
          fontSize: '0.78rem',
          fontWeight: '600',
          padding: '0.4rem 1rem',
          textAlign: 'center',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem'
        }}
      >
        <span>✨ Envíos GRATIS a todo México en compras mayores a $999</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>⚡ Tiempo de fabricación 3D promedio: 24 - 48 hrs</span>
        <span style={{ opacity: 0.5 }}>|</span>
        <span>🏷️ 10% OFF con código <strong>IDEAFORM10</strong></span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.5rem', gap: '1rem' }}>
        {/* Brand Logo */}
        <div
          onClick={() => navigateTo('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div
            style={{
              width: '2.4rem',
              height: '2.4rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #00828A 0%, #00e5ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px var(--color-primary-glow)'
            }}
          >
            <Box size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
              IDEA<span style={{ color: 'var(--color-primary)' }}>FORM</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', fontWeight: '600', letterSpacing: '0.05em' }}>
              IDEAS QUE TOMAN FORMA
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', gap: '0.5rem', alignItems: 'center' }} className="desktop-nav">
          <button
            onClick={() => navigateTo('home')}
            style={{
              background: currentView === 'home' ? 'rgba(0, 130, 138, 0.08)' : 'transparent',
              color: currentView === 'home' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
          >
            Inicio
          </button>

          <button
            onClick={() => navigateTo('catalog')}
            style={{
              background: currentView === 'catalog' ? 'rgba(0, 130, 138, 0.08)' : 'transparent',
              color: currentView === 'catalog' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.15s ease'
            }}
          >
            Colecciones
          </button>

          <button
            onClick={() => navigateTo('customizer')}
            style={{
              background: currentView === 'customizer' ? 'rgba(0, 130, 138, 0.12)' : 'transparent',
              color: currentView === 'customizer' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 130, 138, 0.25)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={15} color="var(--color-primary)" />
            <span>Personalizador 3D</span>
            <span style={{ fontSize: '0.65rem', background: '#00828A', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>WEBGL</span>
          </button>

          <button
            onClick={() => navigateTo('b2b')}
            style={{
              background: currentView === 'b2b' ? 'rgba(0, 130, 138, 0.08)' : 'transparent',
              color: currentView === 'b2b' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Building2 size={16} />
            <span>Empresas (B2B)</span>
          </button>

          <button
            onClick={() => navigateTo('tracking')}
            style={{
              background: currentView === 'tracking' ? 'rgba(0, 130, 138, 0.08)' : 'transparent',
              color: currentView === 'tracking' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              padding: '0.5rem 0.9rem',
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

          <button
            onClick={() => navigateTo('admin')}
            title="Panel de Control & Taller 3D"
            style={{
              background: currentView === 'admin' ? '#0f172a' : 'transparent',
              color: currentView === 'admin' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Wrench size={15} />
            <span>Taller / Admin</span>
          </button>
        </nav>

        {/* Right Utility Buttons (Search + Cart) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Search Trigger */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f1f5f9',
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 0.85rem',
                gap: '0.4rem',
                width: '190px'
              }}
            >
              <Search size={16} color="var(--text-tertiary)" />
              <input
                type="text"
                placeholder="Buscar artículo 3D..."
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
                  fontSize: '0.85rem',
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
                  RESULTADOS ENCONTRADOS
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
                      <span className={`badge ${prod.isCustomizable ? 'badge-primary' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                        {prod.isCustomizable ? 'Personalizar' : 'Stock'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Trigger */}
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
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px var(--color-primary-glow)',
              transition: 'transform 0.15s ease'
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
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
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
            <button className="btn btn-secondary" onClick={() => { navigateTo('catalog'); setMobileMenuOpen(false); }}>Colecciones (Stock)</button>
            <button className="btn btn-primary" onClick={() => { navigateTo('customizer'); setMobileMenuOpen(false); }}>✨ Personalizador 3D</button>
            <button className="btn btn-secondary" onClick={() => { navigateTo('b2b'); setMobileMenuOpen(false); }}>Empresas (B2B)</button>
            <button className="btn btn-secondary" onClick={() => { navigateTo('tracking'); setMobileMenuOpen(false); }}>Rastrear Pedido</button>
            <button className="btn btn-dark" onClick={() => { navigateTo('admin'); setMobileMenuOpen(false); }}>Taller / Admin</button>
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
