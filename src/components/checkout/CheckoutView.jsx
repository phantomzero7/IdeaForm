import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CARRIERS, shippingService } from '../../services/shippingService';
import { SAT_REGIMENES, SAT_USOS_CFDI, fiscalService } from '../../services/fiscalService';
import { supabaseService } from '../../services/supabaseService';
import { formatCurrency } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  Building,
  Store,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  Plane
} from 'lucide-react';

const CheckoutView = () => {
  const {
    cart,
    cartSubtotal,
    discountAmount,
    appliedCoupon,
    clearCart,
    createOrder,
    navigateTo,
    showToast,
    user
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState('card'); // card | spei | oxxo
  const [selectedCarrierId, setSelectedCarrierId] = useState('dhl_express');

  // Shipping details
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('612 123 4567');
  const [street, setStreet] = useState('Av. Álvaro Obregón 1420');
  const [colony, setColony] = useState('Centro');
  const [city, setCity] = useState('La Paz');
  const [state, setState] = useState('Baja California Sur');
  const [postalCode, setPostalCode] = useState('23000');

  // Fiscal CFDI 4.0 details
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [rfc, setRfc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [regimenFiscal, setRegimenFiscal] = useState('601');
  const [usoCFDI, setUsoCFDI] = useState('G01');
  const [cpFiscal, setCpFiscal] = useState('23000');

  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrderFolio, setCreatedOrderFolio] = useState(null);

  // Autocomplete City/State when Mexican Postal Code changes
  const handlePostalCodeChange = (e) => {
    const val = e.target.value;
    setPostalCode(val);
    if (val.length === 5) {
      const match = shippingService.lookupPostalCode(val);
      if (match) {
        setCity(match.city);
        setState(match.state);
        if (match.colony) setColony(match.colony);
        showToast(`📍 Ubicación detectada: ${match.city}, ${match.state}`, 'info');
      }
    }
  };

  // Calculate Shipping Rates dynamically
  const carrierRates = shippingService.calculateRates(postalCode, cartSubtotal);
  const selectedCarrier = carrierRates.find((c) => c.id === selectedCarrierId) || carrierRates[0];
  const shippingCost = selectedCarrier.finalCost;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  const handleCompleteOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Tu carrito está vacío', 'error');
      return;
    }

    if (wantsInvoice && !fiscalService.validateRFC(rfc)) {
      showToast('El RFC ingresado no tiene una estructura válida para el SAT', 'error');
      return;
    }

    setIsProcessing(true);

    // Prepare order payload
    const orderData = {
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: {
        firstName,
        lastName,
        street,
        colony,
        city,
        state,
        postalCode,
        carrier: selectedCarrier.name
      },
      subtotal: cartSubtotal,
      discountAmount,
      shippingCost,
      total: finalTotal,
      paymentMethod,
      fiscalData: wantsInvoice
        ? {
            rfc: rfc.toUpperCase(),
            razonSocial,
            regimenFiscal,
            usoCFDI,
            cpFiscal,
            ...fiscalService.generateTimbradoSAT()
          }
        : null
    };

    // 1. Create order in context and local farm Kanban
    const orderFolio = createOrder(orderData);

    // 2. Persist to Supabase Database (if active)
    await supabaseService.createOrderInCloud({
      ...orderData,
      orderNumber: orderFolio
    });

    setIsProcessing(false);
    setCreatedOrderFolio(orderFolio);

    // Confetti Celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (createdOrderFolio) {
    return (
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '5rem', maxWidth: '650px', textAlign: 'center' }}>
        <div className="card card-elevated" style={{ padding: '3rem 2rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <CheckCircle2 size={40} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
            ¡Pedido Confirmado con Éxito!
          </h1>

          <div style={{ display: 'inline-block', background: 'rgba(15, 95, 109, 0.1)', color: '#0F5F6D', fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '1.25rem', padding: '0.4rem 1.25rem', borderRadius: 'var(--radius-full)', margin: '1rem 0' }}>
            Folio: {createdOrderFolio}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Hemos recibido tu orden y programado la manufactura aditiva en nuestra granja 3D. Te enviamos un correo a <strong>{email}</strong> con los detalles.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-primary btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onClick={() => navigateTo('tracking', { queryOrderNumber: createdOrderFolio })}
            >
              <Truck size={18} />
              <span>Ver Rastreador de Fabricación 3D en Vivo</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => navigateTo('home')}
            >
              Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>Finalizar Compra</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ingresa tus datos de envío, opciones de paquetería y método de pago seguro.
        </p>
      </div>

      <form onSubmit={handleCompleteOrder} className="customizer-split-responsive" style={{ gap: '2rem' }}>
        
        {/* Left: Shipping, Carrier & Payment Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* 1. Datos de Envío */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <Truck size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>1. Dirección de Entrega en México</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Nombre(s) *</label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Apellidos *</label>
                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Correo Electrónico *</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Teléfono / WhatsApp *</label>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Calle y Número *</label>
              <input type="text" required value={street} onChange={(e) => setStreet(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Colonia *</label>
                <input type="text" required value={colony} onChange={(e) => setColony(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Ciudad *</label>
                <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Código Postal *</label>
                <input type="text" required maxLength={5} value={postalCode} onChange={handlePostalCodeChange} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem', fontWeight: '700' }} />
              </div>
            </div>
          </div>

          {/* 2. Opciones de Paquetería en Tiempo Real */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <Plane size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>2. Método de Envío (C.P. {postalCode})</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {carrierRates.map((carrier) => {
                const isSelected = selectedCarrierId === carrier.id;

                return (
                  <div
                    key={carrier.id}
                    onClick={() => setSelectedCarrierId(carrier.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                      background: isSelected ? 'rgba(15, 95, 109, 0.05)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="radio"
                        name="carrier"
                        checked={isSelected}
                        onChange={() => setSelectedCarrierId(carrier.id)}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>
                          {carrier.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                          {carrier.transitTime} • {carrier.badge}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontWeight: '800', fontSize: '1rem', color: carrier.isFree ? '#059669' : '#0f172a' }}>
                      {carrier.formattedCost}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Facturación SAT CFDI 4.0 */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: wantsInvoice ? '1.25rem' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--color-primary)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>3. ¿Requieres Factura Fiscal SAT (CFDI 4.0)?</h2>
              </div>
              <input
                type="checkbox"
                checked={wantsInvoice}
                onChange={(e) => setWantsInvoice(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            {wantsInvoice && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>RFC *</label>
                    <input
                      type="text"
                      required={wantsInvoice}
                      placeholder="XAXX010101000"
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Razón Social / Nombre Fiscal *</label>
                    <input
                      type="text"
                      required={wantsInvoice}
                      placeholder="Empresa S.A. de C.V."
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Régimen Fiscal *</label>
                    <select
                      value={regimenFiscal}
                      onChange={(e) => setRegimenFiscal(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                    >
                      {SAT_REGIMENES.map((r) => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Uso de CFDI *</label>
                    <select
                      value={usoCFDI}
                      onChange={(e) => setUsoCFDI(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.85rem' }}
                    >
                      {SAT_USOS_CFDI.map((u) => (
                        <option key={u.code} value={u.code}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Método de Pago */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <CreditCard size={20} color="var(--color-primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>4. Método de Pago Seguro</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'card' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                  background: paymentMethod === 'card' ? 'rgba(15, 95, 109, 0.06)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <CreditCard size={22} color="var(--color-primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>Tarjeta</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Crédito / Débito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('spei')}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'spei' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                  background: paymentMethod === 'spei' ? 'rgba(15, 95, 109, 0.06)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Building size={22} color="var(--color-primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>SPEI BBVA</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('oxxo')}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'oxxo' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                  background: paymentMethod === 'oxxo' ? 'rgba(15, 95, 109, 0.06)' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Store size={22} color="var(--color-primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: '700' }}>OXXO Pay</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>En efectivo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div>
          <div className="card card-elevated" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>Resumen del Pedido</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {cart.map((item) => (
                <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{item.name} (x{item.quantity})</div>
                    {item.customText && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)' }}>
                        Grabado: "{item.customText}"
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: '700' }}>
                    {formatCurrency((item.finalUnitPrice || item.basePrice) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#059669', fontWeight: '700' }}>
                  <span>Descuento ({appliedCoupon?.code}):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <span>Envío ({selectedCarrier.name}):</span>
                <span>{selectedCarrier.formattedCost}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span>Total a Pagar:</span>
                <span style={{ color: 'var(--color-primary)' }}>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || cart.length === 0}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: '800' }}
            >
              {isProcessing ? 'Procesando pago seguro...' : `Pagar ${formatCurrency(finalTotal)}`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '1rem' }}>
              <Lock size={14} color="#059669" />
              <span>Transacción cifrada SSL de 256 bits</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutView;
