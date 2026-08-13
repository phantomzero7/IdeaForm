// ==========================================================================
// IDEAFORM - MOCK DATA & CONSTANTS
// ==========================================================================

export const CATEGORIES = [
  { id: 'all', name: 'Todos los Productos', slug: 'todos', route: 'COLLECTIONS' },
  { id: 'escritorio', name: 'Escritorio & Oficina', slug: 'oficina', route: 'COLLECTIONS' },
  { id: 'decoracion', name: 'Hogar & Deco 3D', slug: 'hogar', route: 'COLLECTIONS' },
  { id: 'eventos', name: 'Eventos & Recuerdos', slug: 'eventos', route: 'EVENTS' },
  { id: 'empresas', name: 'Corporativo & B2B', slug: 'empresas', route: 'ENTERPRISES' }
];

export const FILAMENT_MATERIALS = [
  {
    id: 'PLA_SILK',
    name: 'PLA Seda (Brillo Premium)',
    description: 'Acabado satinado suave con reflejos elegantes, perfecto para detalles finos y regalos.',
    priceMultiplier: 1.15,
    leadTimeHours: 48,
    colors: [
      { id: 'silk-teal', name: 'Turquesa IdeaForm', hex: '#00828A', stockGrams: 4200, roughness: 0.25, metalness: 0.4 },
      { id: 'silk-gold', name: 'Oro Imperial', hex: '#D4AF37', stockGrams: 2800, roughness: 0.2, metalness: 0.6 },
      { id: 'silk-silver', name: 'Plata Titanio', hex: '#CBD5E1', stockGrams: 3500, roughness: 0.2, metalness: 0.5 },
      { id: 'silk-copper', name: 'Cobre Rosa', hex: '#B87333', stockGrams: 1900, roughness: 0.3, metalness: 0.5 },
      { id: 'silk-black', name: 'Negro Obsidiana', hex: '#1E293B', stockGrams: 6400, roughness: 0.2, metalness: 0.3 }
    ]
  },
  {
    id: 'PLA_STANDARD',
    name: 'PLA Estándar (Mate Elegante)',
    description: 'Material 100% biodegradable a base de almidón de maíz, gran rigidez y alta precisión dimensional.',
    priceMultiplier: 1.0,
    leadTimeHours: 24,
    colors: [
      { id: 'pla-teal', name: 'Turquesa Corporativo', hex: '#00828A', stockGrams: 8500, roughness: 0.65, metalness: 0.05 },
      { id: 'pla-white', name: 'Blanco Puro Marfil', hex: '#F8FAFC', stockGrams: 9200, roughness: 0.6, metalness: 0.0 },
      { id: 'pla-black', name: 'Negro Mate Carbón', hex: '#0F172A', stockGrams: 11000, roughness: 0.7, metalness: 0.0 },
      { id: 'pla-amber', name: 'Ámbar Cálido', hex: '#F59E0B', stockGrams: 2100, roughness: 0.6, metalness: 0.0 },
      { id: 'pla-emerald', name: 'Verde Esmeralda', hex: '#059669', stockGrams: 3400, roughness: 0.6, metalness: 0.0 },
      { id: 'pla-navy', name: 'Azul Marino Real', hex: '#1E3A8A', stockGrams: 4200, roughness: 0.65, metalness: 0.05 }
    ]
  },
  {
    id: 'PETG',
    name: 'PETG Técnico (Alta Resistencia)',
    description: 'Resistente a impactos mecánicos, rayos UV y temperaturas de hasta 75°C. Ideal para uso diario rudo.',
    priceMultiplier: 1.25,
    leadTimeHours: 48,
    colors: [
      { id: 'petg-trans', name: 'Cristal Translúcido', hex: '#94A3B8', stockGrams: 3100, roughness: 0.15, metalness: 0.1, transmission: 0.8 },
      { id: 'petg-black', name: 'Negro Industrial', hex: '#020617', stockGrams: 5200, roughness: 0.4, metalness: 0.1 },
      { id: 'petg-orange', name: 'Naranja Señalización', hex: '#EA580C', stockGrams: 1800, roughness: 0.4, metalness: 0.1 }
    ]
  },
  {
    id: 'RESIN',
    name: 'Resina HD SLA (Micro-Detalle 8K)',
    description: 'Polimerización óptica con resolución de capa de 0.05mm sin líneas de capa visibles.',
    priceMultiplier: 1.45,
    leadTimeHours: 72,
    colors: [
      { id: 'resin-grey', name: 'Gris Modelador 8K', hex: '#64748B', stockGrams: 2400, roughness: 0.15, metalness: 0.05 },
      { id: 'resin-clear', name: 'Transparente Óptico', hex: '#E2E8F0', stockGrams: 1500, roughness: 0.1, metalness: 0.1, transmission: 0.95 }
    ]
  }
];

export const PRODUCTS = [
  {
    id: 'prod-01',
    name: 'Llavero Geométrico Corporativo 3D',
    slug: 'llavero-geometrico-3d',
    category: 'escritorio',
    categoryName: 'Escritorio & B2B',
    route: 'COLLECTIONS',
    productType: 'CUSTOM_B2C',
    model3dType: 'keychain',
    basePrice: 85.00,
    isCustomizable: true,
    maxCharacters: 14,
    description: 'Llavero de alta resistencia con diseño facetado y relieve tipográfico tridimensional. Incluye argolla de acero inoxidable.',
    features: ['Material biodegradable', 'Argolla de acero incluida', 'Grabado 3D en relieve por ambas caras', 'Ideal para regalos y eventos'],
    dimensions: '65 x 24 x 6 mm',
    weightGrams: 18,
    printTimeMins: 35,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Más Vendido',
    inStock: true,
    stockQty: 80,
    tags: ['Llaveros', 'Personalizable', 'B2B', 'Regalos']
  },
  {
    id: 'prod-02',
    name: 'Organizador HexaStation Pro',
    slug: 'organizador-hexastation-pro',
    category: 'escritorio',
    categoryName: 'Escritorio & Oficina',
    route: 'COLLECTIONS',
    productType: 'CUSTOM_B2C',
    model3dType: 'organizer',
    basePrice: 280.00,
    isCustomizable: true,
    maxCharacters: 18,
    description: 'Estación modular hexagonal para escritorio con ranura para smartphone, soporte de plumas, compartimento para clips y placa con grabado personalizado.',
    features: ['Base con almohadillas antiderrapantes', 'Ranura universal para celular con pase de cable', 'Placa frontal grabada en 3D'],
    dimensions: '140 x 120 x 85 mm',
    weightGrams: 165,
    printTimeMins: 240,
    rating: 5.0,
    reviewsCount: 98,
    badge: 'Diseño Exclusivo',
    inStock: true,
    stockQty: 35,
    tags: ['Oficina', 'Escritorio', 'Personalizable']
  },
  {
    id: 'prod-03',
    name: 'Litofanía Escultural DecoGlow',
    slug: 'litofania-escultural-decoglow',
    category: 'eventos',
    categoryName: 'Hogar & Eventos',
    route: 'EVENTS',
    productType: 'CUSTOM_B2C',
    model3dType: 'lamp',
    basePrice: 390.00,
    isCustomizable: true,
    maxCharacters: 24,
    description: 'Lámpara ambiental con tecnología de litofanía 3D. El texto y silueta personalizados se revelan mágicamente cuando se enciende la luz interna.',
    features: ['Luz LED cálida USB recargable incluida', 'Material translúcido ultra fino', 'Ideal para bodas, aniversarios y recuerdos'],
    dimensions: '110 x 110 x 135 mm',
    weightGrams: 210,
    printTimeMins: 380,
    rating: 4.8,
    reviewsCount: 67,
    badge: 'Especial Eventos',
    inStock: true,
    stockQty: 20,
    tags: ['Bodas', 'Lámparas', 'Recuerdos', 'Personalizable']
  },
  {
    id: 'prod-04',
    name: 'Trofeo Prisma Award B2B',
    slug: 'trofeo-prisma-award-b2b',
    category: 'empresas',
    categoryName: 'Corporativo & B2B',
    route: 'ENTERPRISES',
    productType: 'B2B_CORPORATE',
    model3dType: 'trophy',
    basePrice: 340.00,
    isCustomizable: true,
    maxCharacters: 30,
    description: 'Galardón corporativo geométrico con base pesada e inserción de logo empresarial en relieve y categoría de premiación.',
    features: ['Acabado bicapa Seda + Mate', 'Personalización de logo y nombre de empleado', 'Descuentos progresivos desde 10 unidades'],
    dimensions: '80 x 80 x 190 mm',
    weightGrams: 290,
    printTimeMins: 420,
    rating: 5.0,
    reviewsCount: 43,
    badge: 'Corporativo',
    inStock: true,
    stockQty: 50,
    tags: ['Empresas', 'Trofeos', 'Premiaciones', 'B2B']
  },
  {
    id: 'prod-05',
    name: 'Maceta Voronoi Facetada M',
    slug: 'maceta-voronoi-facetada',
    category: 'decoracion',
    categoryName: 'Hogar & Deco 3D',
    route: 'COLLECTIONS',
    productType: 'STOCK_RETAIL',
    model3dType: null,
    basePrice: 195.00,
    isCustomizable: false,
    maxCharacters: 0,
    description: 'Maceta geométrica con orificio de drenaje oculto y plato recolector integrado. Diseño orgánico inspirado en diagramas de Voronoi.',
    features: ['100% impermeable', 'Plato de drenaje integrado', 'Textura mate texturizada'],
    dimensions: '120 x 120 x 110 mm',
    weightGrams: 140,
    printTimeMins: 190,
    rating: 4.7,
    reviewsCount: 84,
    badge: 'Stock Inmediato',
    inStock: true,
    stockQty: 45,
    tags: ['Hogar', 'Plantas', 'Deco']
  },
  {
    id: 'prod-06',
    name: 'Soporte de Audífonos Arc Station',
    slug: 'soporte-audifonos-arc-station',
    category: 'escritorio',
    categoryName: 'Escritorio & Oficina',
    route: 'COLLECTIONS',
    productType: 'STOCK_RETAIL',
    model3dType: null,
    basePrice: 245.00,
    isCustomizable: false,
    maxCharacters: 0,
    description: 'Soporte minimalista para audífonos over-ear con curvatura ergonómica que preserva la diadema y base con organizador de cables.',
    features: ['Curva de apoyo amplia para evitar deformaciones', 'Base estable con peso balanceado', 'Pase de cable posterior'],
    dimensions: '130 x 110 x 240 mm',
    weightGrams: 230,
    printTimeMins: 310,
    rating: 4.9,
    reviewsCount: 112,
    badge: 'Best Seller',
    inStock: true,
    stockQty: 30,
    tags: ['Setup', 'Gaming', 'Oficina']
  },
  {
    id: 'prod-07',
    name: 'Set de Portavasos Topográficos (Pack x4)',
    slug: 'set-portavasos-topograficos',
    category: 'decoracion',
    categoryName: 'Hogar & Deco 3D',
    route: 'COLLECTIONS',
    productType: 'STOCK_RETAIL',
    model3dType: null,
    basePrice: 180.00,
    isCustomizable: false,
    maxCharacters: 0,
    description: 'Juego de 4 portavasos con curvas de nivel topográficas en relieve 3D. Incluye soporte organizador cilíndrico a juego.',
    features: ['Base de corcho antiderrapante', 'Incluye base contenedora', 'Resistente a condensación y calor'],
    dimensions: '95 x 95 x 6 mm c/u',
    weightGrams: 120,
    printTimeMins: 150,
    rating: 4.8,
    reviewsCount: 53,
    badge: 'Pack x4',
    inStock: true,
    stockQty: 60,
    tags: ['Hogar', 'Regalo', 'Cocina']
  },
  {
    id: 'prod-08',
    name: 'Stand Ergonómico para Laptop HexaFold',
    slug: 'stand-ergonomico-laptop-hexafold',
    category: 'escritorio',
    categoryName: 'Escritorio & Oficina',
    route: 'COLLECTIONS',
    productType: 'STOCK_RETAIL',
    model3dType: null,
    basePrice: 220.00,
    isCustomizable: false,
    maxCharacters: 0,
    description: 'Elevador plegable portátil para laptops de 13 a 16 pulgadas. Mejora la postura y optimiza la ventilación del equipo.',
    features: ['Diseño plegable ultra liviano', 'Ángulo óptimo de 18°', 'Soporta hasta 8 kg'],
    dimensions: '220 x 45 x 25 mm (Plegado)',
    weightGrams: 95,
    printTimeMins: 140,
    rating: 4.9,
    reviewsCount: 89,
    badge: 'Portátil',
    inStock: true,
    stockQty: 40,
    tags: ['Productividad', 'Setup', 'Laptop']
  }
];

export const B2B_PRICE_TIERS = [
  { minQty: 10, maxQty: 24, discountPercent: 0, setupFee: 350, leadTimeDays: '2 - 3 días', benefit: 'Empaque estándar B2B' },
  { minQty: 25, maxQty: 49, discountPercent: 10, setupFee: 0, leadTimeDays: '3 - 5 días', benefit: 'Muestra digital en render 3D gratis' },
  { minQty: 50, maxQty: 99, discountPercent: 18, setupFee: 0, leadTimeDays: '5 - 7 días', benefit: '1 Muestra física previa de prueba' },
  { minQty: 100, maxQty: 299, discountPercent: 25, setupFee: 0, leadTimeDays: '7 - 10 días', benefit: 'Envío prioritario nacional GRATIS' },
  { minQty: 300, maxQty: 999, discountPercent: 33, setupFee: 0, leadTimeDays: '10 - 15 días', benefit: 'Etiqueta y empaque individual con logo de tu empresa' },
  { minQty: 1000, maxQty: 9999, discountPercent: 40, setupFee: 0, leadTimeDays: 'Consultar', benefit: 'Asesor técnico comercial & SLA garantizado' }
];

export const MOCK_ORDERS_KANBAN = [
  {
    id: 'ord-10021',
    orderNumber: 'IDF-10021',
    customerName: 'Carlos Villalobos',
    productName: 'Llavero Geométrico 3D (x2)',
    customText: 'Carlos & Ana',
    filament: 'PLA Seda Turquesa',
    filamentGrams: 36,
    printTimeMins: 70,
    status: 'PRINTING',
    assignedPrinter: 'Bambu Lab X1C #01',
    progressPercent: 68,
    total: 215.00,
    date: '2026-08-13'
  },
  {
    id: 'ord-10022',
    orderNumber: 'IDF-10022',
    customerName: 'Grupo Innova Tech',
    productName: 'Llaveros Corporativos B2B (x150)',
    customText: 'INNOVA 2026',
    filament: 'PLA Negro Carbón',
    filamentGrams: 2700,
    printTimeMins: 1800,
    status: 'SLICING',
    assignedPrinter: 'Creality K1 Max #02',
    progressPercent: 15,
    total: 9562.50,
    date: '2026-08-13'
  },
  {
    id: 'ord-10023',
    orderNumber: 'IDF-10023',
    customerName: 'Dra. Sofía Mendoza',
    productName: 'Litofanía Escultural DecoGlow',
    customText: 'Boda Sofía & Mateo 2026',
    filament: 'PLA Blanco Puro',
    filamentGrams: 210,
    printTimeMins: 380,
    status: 'QUEUED',
    assignedPrinter: 'Prusa MK4 #03',
    progressPercent: 0,
    total: 445.00,
    date: '2026-08-13'
  },
  {
    id: 'ord-10019',
    orderNumber: 'IDF-10019',
    customerName: 'Roberto Alarcón',
    productName: 'Organizador HexaStation Pro',
    customText: 'ARQUITECTURA',
    filament: 'PLA Seda Oro Imperial',
    filamentGrams: 165,
    printTimeMins: 240,
    status: 'QUALITY_CONTROL',
    assignedPrinter: 'Bambu Lab X1C #02',
    progressPercent: 100,
    total: 322.00,
    date: '2026-08-12'
  },
  {
    id: 'ord-10018',
    orderNumber: 'IDF-10018',
    customerName: 'Mariana Gallegos',
    productName: 'Maceta Voronoi Facetada M (x2)',
    customText: null,
    filament: 'PLA Verde Esmeralda',
    filamentGrams: 280,
    printTimeMins: 380,
    status: 'READY_TO_SHIP',
    assignedPrinter: 'Creality K1 Max #01',
    progressPercent: 100,
    total: 390.00,
    date: '2026-08-12'
  }
];

export const MOCK_B2B_QUOTES = [
  {
    quoteNumber: 'COT-2026-B2B-0941',
    companyName: 'Innovación Tecnológica S.A. de C.V.',
    rfc: 'ITE180425ABC',
    contactEmail: 'compras@innovacion.mx',
    productName: 'Llavero Corporativo con Logo en Relieve',
    units: 150,
    totalAmount: 11701.50,
    status: 'APPROVED',
    date: '2026-08-13',
    expiresAt: '2026-08-28'
  },
  {
    quoteNumber: 'COT-2026-B2B-0942',
    companyName: 'Baja Logistics Group',
    rfc: 'BLG210915XYZ',
    contactEmail: 'logistica@bajagroup.mx',
    productName: 'Trofeo Prisma Award B2B',
    units: 35,
    totalAmount: 11900.00,
    status: 'SENT',
    date: '2026-08-12',
    expiresAt: '2026-08-27'
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Valeria Cárdenas',
    role: 'Event Planner en Bodas del Pacífico',
    comment: 'Mandamos a hacer 180 recuerdos personalizados para una boda en Los Cabos. La precisión de los nombres y el acabado en PLA Seda Oro superaron cualquier expectativa. ¡Los invitados quedaron fascinados!',
    stars: 5,
    location: 'La Paz, BCS'
  },
  {
    id: 2,
    name: 'Ing. Alejandro Silva',
    role: 'Dir. Marketing en Nexo Tech',
    comment: 'La cotización automática B2B nos resolvió todo en 2 minutos. Generamos el PDF con nuestro RFC, aprobamos la orden y en 6 días teníamos 300 llaveros con nuestro logo listos para el congreso.',
    stars: 5,
    location: 'Guadalajara, JAL'
  },
  {
    id: 3,
    name: 'Esteban Morales',
    role: 'Arquitecto & Diseñador',
    comment: 'El HexaStation personalizado con mi nombre en relieve es la pieza central de mi escritorio. La calidad de impresión no tiene ninguna línea visible ni imperfecciones.',
    stars: 5,
    location: 'Ciudad de México'
  }
];

export const FAQS = [
  {
    q: '¿Qué materiales utilizan para imprimir y son resistentes?',
    a: 'Utilizamos filamentos de grado industrial: PLA biodegradable de alta pureza a base de maíz (ideal para hogar y oficina), PETG ultra resistente a golpes y calor (hasta 75°C), y Resinas 8K para micro-detalle. Todos nuestros polímeros son no tóxicos.'
  },
  {
    q: '¿Cuánto tiempo tarda en fabricarse un pedido personalizado?',
    a: 'Los artículos en stock se despachan en 24 horas. Los productos personalizados en 3D se imprimen y pasan control de calidad en 24 a 48 horas hábiles antes de entregarse a la paquetería (DHL o FedEx).'
  },
  {
    q: '¿Cómo funciona la cotización y descuento por mayoreo para empresas?',
    a: 'En nuestro Cotizador B2B puedes elegir cantidades desde 10 hasta 1,000+ piezas. El sistema calcula automáticamente el descuento escalonado (hasta 35% de descuento), genera un presupuesto formal en PDF con desglose de IVA (16%) y folio fiscal válido por 15 días.'
  },
  {
    q: '¿Puedo facturar mi compra (CFDI 4.0)?',
    a: 'Sí. Al momento de hacer el checkout puedes ingresar tu RFC, Razón Social, Régimen Fiscal y Código Postal SAT para recibir tu factura electrónica (PDF y XML) automáticamente en tu correo.'
  }
];
