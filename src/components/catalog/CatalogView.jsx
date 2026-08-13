import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PRODUCTS, CATEGORIES, FILAMENT_MATERIALS } from '../../data/mockData';
import { Sparkles, ShoppingBag, Filter, ArrowUpDown, Check, Box, Star, Layers, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CatalogView = () => {
  const { navigateTo, addToCart } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all | stock | custom
  const [sortBy, setSortBy] = useState('popular'); // popular | price-asc | price-desc
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Filter products
  let filtered = PRODUCTS.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (filterType === 'stock' && p.isCustomizable) return false;
    if (filterType === 'custom' && !p.isCustomizable) return false;
    return true;
  });

  // Sort products
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.basePrice - a.basePrice);
  } else {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  const handleProductAction = (product) => {
    if (product.isCustomizable) {
      navigateTo('customizer', { productId: product.id });
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        basePrice: product.basePrice,
        finalUnitPrice: product.basePrice,
        selectedMaterial: FILAMENT_MATERIALS[0],
        selectedColor: FILAMENT_MATERIALS[0].colors[0],
        quantity: 1,
        weightGrams: product.weightGrams,
        printTimeMins: product.printTimeMins
      });
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Catalog Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Catálogo & Colecciones 3D
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          Artículos en inventario listos para despacho inmediato y piezas exclusivas configurables con tu grabado en relieve.
        </p>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: selectedCategory === cat.id ? 'var(--color-primary)' : '#f1f5f9',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Filters & Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Stock / Custom Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="all">Todos los tipos</option>
            <option value="stock">📦 Stock Inmediato (24h)</option>
            <option value="custom">✨ Personalizables en 3D</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
              outline: 'none',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="popular">Más Populares</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid-responsive">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1.25rem',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Top Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className={`badge ${product.isCustomizable ? 'badge-primary' : 'badge-success'}`}>
                {product.isCustomizable ? (
                  <>
                    <Sparkles size={12} /> Personalizable
                  </>
                ) : (
                  <>
                    <Box size={12} /> Stock Directo
                  </>
                )}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', fontWeight: '700', color: '#f59e0b' }}>
                <Star size={14} fill="#f59e0b" />
                <span>{product.rating}</span>
                <span style={{ color: 'var(--text-tertiary)', fontWeight: '400' }}>({product.reviewsCount})</span>
              </div>
            </div>

            {/* Geometric 3D Visual Box / Preview */}
            <div
              onClick={() => setQuickViewProduct(product)}
              style={{
                width: '100%',
                height: '190px',
                borderRadius: 'var(--radius-md)',
                background: 'radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: 'pointer',
                marginBottom: '1rem',
                position: 'relative',
                transition: 'transform 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #00828A, #00e5ff)',
                  boxShadow: '0 8px 20px var(--color-primary-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}
              >
                <Box size={34} />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.75rem', fontWeight: '600' }}>
                {product.dimensions}
              </div>
            </div>

            {/* Product Meta */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                {product.categoryName}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.description}
              </p>
            </div>

            {/* Price and Action Button */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Precio</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                  {formatCurrency(product.basePrice)}
                </div>
              </div>

              <button
                className={product.isCustomizable ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                onClick={() => handleProductAction(product)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {product.isCustomizable ? (
                  <>
                    <Sparkles size={14} />
                    <span>Personalizar</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    <span>Añadir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="modal-overlay" onClick={() => setQuickViewProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{quickViewProduct.categoryName}</span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{quickViewProduct.name}</h2>
              </div>
              <button
                onClick={() => setQuickViewProduct(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-tertiary)' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {quickViewProduct.description}
            </p>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>CARACTERÍSTICAS TÉCNICAS</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {quickViewProduct.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={14} color="#00828A" />
                    <span>{f}</span>
                  </li>
                ))}
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Layers size={14} color="#00828A" />
                  <span>Dimensiones físicas: {quickViewProduct.dimensions}</span>
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                {formatCurrency(quickViewProduct.basePrice)}
              </div>

              <button
                className="btn btn-primary"
                onClick={() => {
                  const p = quickViewProduct;
                  setQuickViewProduct(null);
                  handleProductAction(p);
                }}
              >
                {quickViewProduct.isCustomizable ? 'Abrir en Personalizador 3D ✨' : 'Añadir al Carrito 🛒'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogView;
