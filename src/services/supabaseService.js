import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { PRODUCTS, FILAMENT_MATERIALS, MOCK_ORDERS_KANBAN, MOCK_B2B_QUOTES } from '../data/mockData';

/**
 * Servicio de Base de Datos e Integración con Supabase
 * Maneja persistencia en la nube y suscripciones Realtime.
 */
export const supabaseService = {
  // 1. OBTENER PRODUCTOS
  async getProducts() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Error al consultar productos de Supabase, usando catálogo local:', err);
      }
    }
    return PRODUCTS;
  },

  // 2. CREAR ORDEN EN SUPABASE
  async createOrderInCloud(orderPayload) {
    if (isSupabaseConfigured && supabase) {
      try {
        // Insertar en tabla orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              order_number: orderPayload.orderNumber,
              user_id: orderPayload.userId || null,
              customer_name: orderPayload.customerName,
              customer_email: orderPayload.customerEmail,
              customer_phone: orderPayload.customerPhone,
              shipping_address: orderPayload.shippingAddress,
              subtotal: orderPayload.subtotal,
              discount_amount: orderPayload.discountAmount || 0,
              shipping_cost: orderPayload.shippingCost || 0,
              total: orderPayload.total,
              payment_method: orderPayload.paymentMethod,
              payment_status: 'PAID',
              cfdi_required: !!orderPayload.fiscalData,
              cfdi_data: orderPayload.fiscalData || null
            }
          ])
          .select()
          .single();

        if (orderError) throw orderError;

        // Insertar en tabla production_queue (Taller 3D)
        const { error: queueError } = await supabase
          .from('production_queue')
          .insert([
            {
              order_id: orderData.id,
              status: 'QUEUED',
              assigned_printer: 'Bambu Lab X1C #01',
              filament_type: orderPayload.filament || 'PLA_SILK',
              total_filament_grams: orderPayload.filamentGrams || 50,
              estimated_print_minutes: orderPayload.printTimeMins || 60,
              progress_percent: 0
            }
          ]);

        if (queueError) console.warn('Error al encolar en taller:', queueError);

        return { success: true, orderId: orderData.id };
      } catch (err) {
        console.warn('Fallo guardado en Supabase, persistiendo en memoria local:', err);
      }
    }
    return { success: true, localOnly: true };
  },

  // 3. SUSCRIPCIÓN EN TIEMPO REAL AL TABLERO KANBAN (REALTIME)
  subscribeToWorkshopUpdates(onUpdate) {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel('public:production_queue')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'production_queue' },
          (payload) => {
            onUpdate(payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    return () => {};
  },

  // 4. GUARDAR COTIZACIÓN B2B
  async saveQuoteInCloud(quoteData) {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .insert([
            {
              quote_number: quoteData.quoteNumber,
              company_name: quoteData.companyName,
              contact_name: quoteData.contactName,
              contact_email: quoteData.email,
              rfc: quoteData.rfc,
              total_units: quoteData.units || quoteData.quantity,
              unit_price: quoteData.unitPrice,
              discount_percent: quoteData.discountPercent,
              subtotal: quoteData.subtotal,
              iva_amount: quoteData.iva,
              total_amount: quoteData.finalTotal || quoteData.totalAmount,
              status: 'PENDING'
            }
          ])
          .select()
          .single();

        if (!error) return { success: true, data };
      } catch (err) {
        console.warn('Error guardando cotización en Supabase:', err);
      }
    }
    return { success: true, localOnly: true };
  }
};
