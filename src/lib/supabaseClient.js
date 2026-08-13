import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-url')
);

// Initialize client if credentials exist, otherwise null
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================================================
// SUPABASE DATA LAYER HELPERS
// ==========================================================================

export const fetchProductsFromSupabase = async () => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true);
  if (error) {
    console.error('Error fetching products from Supabase:', error);
    return null;
  }
  return data;
};

export const saveCustomDesignToSupabase = async (designData) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('custom_designs')
    .insert([designData])
    .select()
    .single();
  if (error) {
    console.error('Error saving custom design:', error);
    return null;
  }
  return data;
};

export const saveOrderToSupabase = async (orderPayload) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('orders')
    .insert([orderPayload])
    .select()
    .single();
  if (error) {
    console.error('Error creating order in Supabase:', error);
    return null;
  }
  return data;
};

export const syncProductionQueueToSupabase = async (queueItem) => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('production_queue')
    .upsert([queueItem])
    .select()
    .single();
  if (error) {
    console.error('Error syncing production queue:', error);
    return null;
  }
  return data;
};
