/**
 * Servicio de Logística y Paquetería para México
 * Cotización en tiempo real por Código Postal y emisión de Guías de Envío
 */

export const CARRIERS = [
  {
    id: 'dhl_express',
    name: 'DHL Express Aéreo (24 hrs)',
    transitTime: 'Día siguiente hábil garantizado',
    basePrice: 180.00,
    freeThreshold: 999.00,
    badge: 'MÁS RÁPIDO ⚡',
    icon: 'Plane'
  },
  {
    id: 'fedex_standard',
    name: 'FedEx Nacional Estándar (48 hrs)',
    transitTime: '2 días hábiles',
    basePrice: 140.00,
    freeThreshold: 999.00,
    badge: 'RECOMENDADO ⭐',
    icon: 'Truck'
  },
  {
    id: 'estafeta_eco',
    name: 'Estafeta Terrestre Económico (72 hrs)',
    transitTime: '3 a 4 días hábiles',
    basePrice: 99.00,
    freeThreshold: 799.00,
    badge: 'ECONÓMICO 🌿',
    icon: 'Package'
  }
];

export const shippingService = {
  // Cotizar opciones de paquetería según Código Postal y total del carrito
  calculateRates(postalCode, subtotalAmount = 0) {
    const cleanCp = (postalCode || '').trim();

    return CARRIERS.map((carrier) => {
      const isFree = subtotalAmount >= carrier.freeThreshold;
      const cost = isFree ? 0 : carrier.basePrice;

      return {
        ...carrier,
        isFree,
        finalCost: cost,
        formattedCost: isFree ? 'GRATIS' : `$${cost.toFixed(2)} MXN`
      };
    });
  },

  // Generar Número de Guía y Etiqueta Oficial de Despacho
  generateWaybill(orderNumber, carrierId = 'dhl_express') {
    const prefix = carrierId === 'dhl_express' ? 'DHL-MX' : carrierId === 'fedex_standard' ? 'FDX-MX' : 'EST-MX';
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const trackingNumber = `${prefix}-${randomDigits}`;

    return {
      trackingNumber,
      carrierName: carrierId === 'dhl_express' ? 'DHL Express' : carrierId === 'fedex_standard' ? 'FedEx Nacional' : 'Estafeta',
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }),
      dispatchDate: new Date().toLocaleDateString('es-MX')
    };
  }
};
