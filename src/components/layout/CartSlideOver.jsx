import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Sparkles, Check, Truck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CartSlideOver = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    discountAmount,
    shippingCost,
    isFreeShipping,
    cartTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    navigateTo
  } = useApp();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      {/* Click outside backdrop */}
      <div style={{ flex: 1 }} onClick={() => setIsCartOpen(false)} />

      {/* Drawer Body */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          background: '#ffffff',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1001,
          animation: 'slideLeft 0.25s ease'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Tu Carrito ({cart.length})</h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '0.25rem'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div style={{ padding: '0.85rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isFreeShipping ? '#059669' : 'var(--text-secondary)' }}>
              <Truck size={14} />
              {isFreeShipping ? '¡Felicidades! Tienes Envío Gratis 🚀' : `Agrega ${formatCurrency(remainingForFreeShipping)} más para Envío Gratis`}
            </span>
            <span style={{ color: 'var(--text-tertiary)' }}>{Math.round(progressPercent)}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: isFreeShipping ? '#10b981' : 'linear-gradient(90deg, #00828A, #00e5ff)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Drawer Scrollable Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
              <div style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem auto', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Tu carrito está vacío</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Explora nuestras colecciones o personaliza un artículo 3D único.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('customizer');
                }}
              >
                ✨ Ir al Personalizador 3D
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemUnitPrice = item.finalUnitPrice || item.basePrice || 0;
              const itemTotal = itemUnitPrice * item.quantity;

              return (
                <div
                  key={item.cartItemId}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: '#ffffff',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: 'var(--radius-sm)',
                      background: item.selectedColor?.hex || '#f1f5f9',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {item.previewSnapshot ? (
                      <img src={item.previewSnapshot} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Sparkles size={24} color="#ffffff" />
                    )}
                  </div>

                  {/* Item Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.1rem' }}
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Custom details */}
                    {item.customText && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600', marginTop: '0.2rem' }}>
                        Grabado: "{item.customText}"
                      </div>
                    )}

                    {item.selectedMaterial && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.selectedColor?.hex || '#00828A', display: 'inline-block' }} />
                        <span>{item.selectedMaterial.name} ({item.selectedColor?.name})</span>
                      </div>
                    )}

                    {/* Price and Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>
                        {formatCurrency(itemTotal)}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                          style={{ padding: '0.2rem 0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ padding: '0 0.5rem', fontSize: '0.82rem', fontWeight: '700' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                          style={{ padding: '0.2rem 0.4rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer (Coupons & Totals) */}
        {cart.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-light)', background: '#ffffff' }}>
            {/* Coupon Form */}
            <div style={{ marginBottom: '1rem' }}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#065f46' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '700' }}>
                    <Check size={14} /> Cupón {appliedCoupon.code} activado
                  </span>
                  <button onClick={removeCoupon} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: '700', textDecoration: 'underline' }}>
                    Quitar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Código de descuento (ej. IDEAFORM10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.82rem',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 0.85rem' }}>
                    Aplicar
                  </button>
                </form>
              )}
            </div>

            {/* Financial Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatCurrency(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Descuento aplicado</span>
                  <span style={{ fontWeight: '700' }}>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Envío a domicilio (México)</span>
                <span style={{ fontWeight: '600', color: isFreeShipping ? '#059669' : 'var(--text-primary)' }}>
                  {isFreeShipping ? 'GRATIS' : formatCurrency(shippingCost)}
                </span>
              </div>

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.35rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                <span>Total a Pagar</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => {
                setIsCartOpen(false);
                navigateTo('checkout');
              }}
            >
              <span>Proceder al Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CartSlideOver;
