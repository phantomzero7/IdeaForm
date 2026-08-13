-- ==========================================================================
-- IDEAFORM - SCHEMA MAESTRO DE BASE DE DATOS (POSTGRESQL / SUPABASE)
-- ==========================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================================================
-- MÓDULO 1: USUARIOS, PERFILES B2B Y DIRECCIONES
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(30) DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'B2B_CLIENT', 'OPERATOR_3D', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.b2b_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name VARCHAR(200) NOT NULL,
  rfc VARCHAR(13) NOT NULL,
  fiscal_regime VARCHAR(10) NOT NULL,
  postal_code_fiscal VARCHAR(5) NOT NULL,
  contact_position VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'SHIPPING' CHECK (type IN ('SHIPPING', 'BILLING')),
  street_and_num VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(5) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- MÓDULO 2: CATÁLOGO Y VARIANTES
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  route_type VARCHAR(30) NOT NULL CHECK (route_type IN ('COLLECTIONS', 'ENTERPRISES', 'EVENTS')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  product_type VARCHAR(30) NOT NULL CHECK (product_type IN ('STOCK_RETAIL', 'CUSTOM_B2C', 'B2B_CORPORATE')),
  model_3d_type VARCHAR(50), -- 'keychain', 'organizer', 'lamp', 'trophy'
  base_price DECIMAL(10,2) NOT NULL,
  is_customizable BOOLEAN DEFAULT FALSE,
  max_characters INT DEFAULT 0,
  weight_grams DECIMAL(8,2) NOT NULL DEFAULT 50,
  print_time_mins INT NOT NULL DEFAULT 60,
  dimensions VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sku VARCHAR(50) UNIQUE NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7) NOT NULL,
  material_type VARCHAR(30) NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0.00,
  stock_quantity INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- MÓDULO 3: PERSONALIZACIÓN 3D Y DISEÑOS DE CLIENTE
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.custom_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  custom_text VARCHAR(100),
  font_family VARCHAR(50),
  selected_color VARCHAR(30) NOT NULL,
  material_type VARCHAR(30) NOT NULL,
  logo_file_url VARCHAR(500),
  preview_render_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- MÓDULO 4: MOTOR B2B Y COTIZACIONES
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.b2b_price_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  min_quantity INT NOT NULL,
  max_quantity INT NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  setup_fee DECIMAL(10,2) DEFAULT 0.00,
  lead_time_days VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number VARCHAR(30) UNIQUE NOT NULL,
  b2b_profile_id UUID REFERENCES public.b2b_profiles(id) ON DELETE SET NULL,
  company_name VARCHAR(200) NOT NULL,
  rfc VARCHAR(13) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'PAID')),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- MÓDULO 5: PEDIDOS Y TABLERO KANBAN DE TALLER 3D
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(30) UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  order_status VARCHAR(30) DEFAULT 'PENDING_PAYMENT' CHECK (order_status IN ('PENDING_PAYMENT', 'PAID', 'IN_PRODUCTION', 'QUALITY_CONTROL', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  payment_gateway VARCHAR(30) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  tracking_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number VARCHAR(30) NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  custom_text VARCHAR(100),
  filament_type VARCHAR(50) NOT NULL,
  filament_grams DECIMAL(8,2) NOT NULL,
  print_time_mins INT NOT NULL,
  assigned_printer VARCHAR(50) DEFAULT 'Bambu Lab X1C #01',
  kanban_status VARCHAR(30) DEFAULT 'QUEUED' CHECK (kanban_status IN ('QUEUED', 'SLICING', 'PRINTING', 'QUALITY_CONTROL', 'READY_TO_SHIP')),
  progress_percent INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- MÓDULO 6: MATERIAS PRIMAS (BOM FILAMENTOS)
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_type VARCHAR(30) NOT NULL,
  color_name VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7) NOT NULL,
  stock_grams_available DECIMAL(10,2) NOT NULL,
  min_stock_alert_grams DECIMAL(10,2) DEFAULT 1000.00,
  cost_per_gram DECIMAL(8,4) NOT NULL DEFAULT 0.35,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================================
-- DATOS SEMILLA INICIALES (INITIAL SEED DATA)
-- ==========================================================================

-- Categorías
INSERT INTO public.categories (name, slug, route_type) VALUES
('Escritorio & Oficina', 'oficina', 'COLLECTIONS'),
('Hogar & Deco 3D', 'hogar', 'COLLECTIONS'),
('Eventos & Recuerdos', 'eventos', 'EVENTS'),
('Corporativo & B2B', 'empresas', 'ENTERPRISES')
ON CONFLICT (slug) DO NOTHING;

-- Materias Primas / Filamentos
INSERT INTO public.raw_materials (material_type, color_name, color_hex, stock_grams_available) VALUES
('PLA_SILK', 'Turquesa IdeaForm', '#00828A', 4200),
('PLA_SILK', 'Oro Imperial', '#D4AF37', 2800),
('PLA_SILK', 'Negro Obsidiana', '#1E293B', 6400),
('PLA_STANDARD', 'Turquesa Corporativo', '#00828A', 8500),
('PLA_STANDARD', 'Blanco Puro Marfil', '#F8FAFC', 9200),
('PLA_STANDARD', 'Negro Mate Carbón', '#0F172A', 11000),
('PETG', 'Cristal Translúcido', '#94A3B8', 3100),
('RESIN', 'Gris Modelador 8K', '#64748B', 2400);

-- Escalafones B2B
INSERT INTO public.b2b_price_tiers (min_quantity, max_quantity, discount_percent, setup_fee, lead_time_days) VALUES
(10, 24, 0.00, 350.00, '2 - 3 días'),
(25, 49, 10.00, 0.00, '3 - 5 días'),
(50, 99, 18.00, 0.00, '5 - 7 días'),
(100, 299, 25.00, 0.00, '7 - 10 días'),
(300, 999, 33.00, 0.00, '10 - 15 días'),
(1000, 9999, 40.00, 0.00, 'SLA Especial');

-- ==========================================================================
-- ROW LEVEL SECURITY (POLÍTICAS RLS)
-- ==========================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Lectura pública de productos y catálogo
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read raw_materials" ON public.raw_materials FOR SELECT USING (true);

-- Acceso a producción
CREATE POLICY "Public read production_queue" ON public.production_queue FOR SELECT USING (true);
CREATE POLICY "Public insert production_queue" ON public.production_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update production_queue" ON public.production_queue FOR UPDATE USING (true);
