import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import { ShieldCheck, CreditCard, Landmark, Store, Lock, CheckCircle2, ArrowRight, ArrowLeft, Truck, Receipt, Sparkles, Copy, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const CheckoutView = () => {
  const { cart, cartSubtotal, discountAmount, shippingCost, cartTotal, isFreeShipping, createOrder, navigateTo } = useApp();

  // Step state
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // CARD | SPEI | OXXO
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    firstName: 'Sofía',
    lastName: 'Mendoza',
    email: 'sofia.mendoza@gmail.com',
    phone: '612 123 4567',
    street: 'Av. Álvaro Obregón 850 Int 4',
    neighborhood: 'Centro',
    city: 'La Paz',
    state: 'Baja California Sur',
    postalCode: '23000',
    // Card fields
    cardNumber: '•••• •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '•••',
    installments: '1',
    // Fiscal CFDI 4.0 fields
    rfc: 'MELS901015ABC',
    companyName: 'Sofía Mendoza Luna',
    fiscalRegime: '612 - Personas Físicas con Actividades Empresariales',
    cfdiUse: 'G03 - Gastos en general',
    fiscalPostalCode: '23000'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedOrderNumber = createOrder({
        shippingAddress: formData,
        paymentMethod: paymentMethod,
        invoiceData: wantsInvoice ? formData : null
      });

      setIsProcessing(false);
      setOrderConfirmed(generatedOrderNumber);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti error:', err);
      }
    }, 1200);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Tu carrito está vacío</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No hay artículos pendientes de pago.</p>
        <button className="btn btn-primary" onClick={() => navigateTo('catalog')}>
          Explorar Catálogo 3D
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Checkout Seguro</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Transacción protegida con cifrado SSL 256-bit y cumplimiento SAT CFDI 4.0</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#059669', fontSize: '0.85rem', fontWeight: '700' }}>
            <Lock size={16} />
            <span>Conexión Cifrada</span>
          </div>
        </div>

        {/* Split Form / Order Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)', gap: '2rem' }} className="checkout-split">
          
          {/* LEFT: Checkout Form */}
          <form onSubmit={handleCompleteOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* 1. Datos de Contacto y Envío */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem' }}>1</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Dirección de Entrega en México</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Apellidos *</label>
                  <input
                    type="text"
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Teléfono Celular (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Calle, Número Exterior e Interior *</label>
                  <input
                    type="text"
                    required
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Colonia / Fraccionamiento *</label>
                  <input
                    type="text"
                    required
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Código Postal *</label>
                  <input
                    type="text"
                    required
                    maxLength="5"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Ciudad *</label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Estado *</label>
                  <input
                    type="text"
                    required
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem', marginTop: '0.2rem' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Método de Pago */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '1.8rem', height: '1.8rem', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem' }}>2</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Método de Pago Seguro</h3>
              </div>

              {/* Payment Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'CARD' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                    background: paymentMethod === 'CARD' ? 'rgba(0, 130, 138, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <CreditCard size={20} color={paymentMethod === 'CARD' ? 'var(--color-primary)' : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Tarjeta (Stripe)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SPEI')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'SPEI' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                    background: paymentMethod === 'SPEI' ? 'rgba(0, 130, 138, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Landmark size={20} color={paymentMethod === 'SPEI' ? 'var(--color-primary)' : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>SPEI Transferencia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('OXXO')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'OXXO' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                    background: paymentMethod === 'OXXO' ? 'rgba(0, 130, 138, 0.05)' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Store size={20} color={paymentMethod === 'OXXO' ? 'var(--color-primary)' : 'var(--text-tertiary)'} />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>OXXO Pay</span>
                </button>
              </div>

              {/* CARD DETAILS */}
              {paymentMethod === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Número de Tarjeta</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.9rem', marginTop: '0.2rem' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Fecha Vencimiento</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.9rem', marginTop: '0.2rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Código CVC</label>
                      <input
                        type="text"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.9rem', marginTop: '0.2rem' }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    💳 Soporta Meses Sin Intereses (3, 6 MSI en compras mayores a $1,500 MXN).
                  </div>
                </div>
              )}

              {/* SPEI DETAILS */}
              {paymentMethod === 'SPEI' && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>Transferencia Interbancaria SPEI BBVA</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Al confirmar tu pedido, el sistema reservará tu turno en la cola de impresoras 3D y generará tu referencia de rastreo de pago automática.
                  </p>
                  <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <div><strong>Banco:</strong> BBVA México</div>
                    <div><strong>CLABE:</strong> 012 180 0015 9988 7744 12</div>
                    <div><strong>Beneficiario:</strong> IdeaForm México S.A. de C.V.</div>
                  </div>
                </div>
              )}

              {/* OXXO DETAILS */}
              {paymentMethod === 'OXXO' && (
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.4rem' }}>Pago en Efectivo OXXO Pay</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Recibirás un código de barras digital de 14 dígitos en tu correo para pagar en cualquier tienda OXXO de la República Mexicana.
                  </p>
                </div>
              )}
            </div>

            {/* 3. Facturación SAT (CFDI 4.0) */}
            <div className="card">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', marginBottom: wantsInvoice ? '1rem' : '0' }}>
                <input
                  type="checkbox"
                  checked={wantsInvoice}
                  onChange={(e) => setWantsInvoice(e.target.checked)}
                  style={{ accentColor: 'var(--color-primary)', width: '1.1rem', height: '1.1rem' }}
                />
                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Requiero Factura Electrónica CFDI 4.0 (México)</span>
              </label>

              {wantsInvoice && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>RFC Fiscal *</label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Razón Social / Nombre SAT *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Régimen Fiscal SAT</label>
                    <select
                      name="fiscalRegime"
                      value={formData.fiscalRegime}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}
                    >
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                      <option value="605">605 - Sueldos y Salarios</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Uso de CFDI</label>
                    <select
                      name="cfdiUse"
                      value={formData.cfdiUse}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.8rem' }}
                    >
                      <option value="G03">G03 - Gastos en general</option>
                      <option value="G01">G01 - Adquisición de mercancías</option>
                      <option value="S01">S01 - Sin efectos fiscales</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', padding: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ShieldCheck size={20} />
              <span>{isProcessing ? 'Procesando Pago Seguro...' : `Pagar ${formatCurrency(cartTotal)} MXN`}</span>
            </button>
          </form>

          {/* RIGHT: Order Summary Sidebar */}
          <div>
            <div className="card card-elevated" style={{ padding: '1.5rem', position: 'sticky', top: '5.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem' }}>Resumen del Pedido</h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.25rem', paddingRight: '0.3rem' }}>
                {cart.map((item) => (
                  <div key={item.cartItemId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: 'var(--radius-sm)', background: item.selectedColor?.hex || '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.previewSnapshot ? (
                        <img src={item.previewSnapshot} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Sparkles size={16} color="#ffffff" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Cant: {item.quantity} {item.customText && `• "${item.customText}"`}
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>
                      {formatCurrency((item.finalUnitPrice || item.basePrice) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatCurrency(cartSubtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: '700' }}>
                    <span>Descuento</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Envío a Domicilio</span>
                  <span style={{ fontWeight: '600', color: isFreeShipping ? '#059669' : '#0f172a' }}>
                    {isFreeShipping ? 'GRATIS' : formatCurrency(shippingCost)}
                  </span>
                </div>

                <div style={{ height: '1px', background: 'var(--border-light)', margin: '0.35rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Total:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      {orderConfirmed && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '520px' }}>
            <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>¡Pedido Confirmado con Éxito!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              Tu orden ha sido registrada y enviada a la cola de producción en el taller de impresión 3D de IdeaForm.
            </p>

            {/* Tracking Code Box */}
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>CÓDIGO DE RASTREO DE MANUFACTURA</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                  {orderConfirmed}
                </span>
                <button
                  onClick={() => handleCopyCode(orderConfirmed)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}
                >
                  {copiedCode ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigateTo('tracking', { queryOrderNumber: orderConfirmed })}
              >
                <span>Rastrear Avance de Impresión 3D</span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => navigateTo('home')}
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 850px) {
          .checkout-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutView;
