// ==========================================================================
// IDEAFORM - MOCK DATA & CONSTANTS (OFICIAL)
// ==========================================================================

export const SUBCOLLECTIONS = [
  { id: 'all', name: 'Todas las Colecciones', icon: 'Box', desc: 'Explora todo nuestro catálogo de manufactura 3D' },
  { id: 'escolar', name: 'Escolar & Estudiantes', icon: 'GraduationCap', desc: 'Llaveros para mochilas, portalápices y tags con nombre' },
  { id: 'oficina', name: 'Oficina & Escritorio', icon: 'Briefcase', desc: 'Organizadores de escritorio, docks y placas personalizadas' },
  { id: 'hogar', name: 'Hogar & Deco', icon: 'Home', desc: 'Lámparas litofanía, macetas y decoración moderna' },
  { id: 'personal', name: 'Personal & Accesorios', icon: 'User', desc: 'Llaveros con relieve, pines y artículos de bolsillo' },
  { id: 'kids', name: 'Kids & Juguetes', icon: 'Smile', desc: 'Letreros con luz suave para cuarto y juguetes articulados' }
];

export const CATEGORIES = [
  { id: 'all', name: 'Todos los Productos', slug: 'todos' },
  { id: 'escolar', name: 'Escolar & Estudiantes', slug: 'escolar' },
  { id: 'oficina', name: 'Oficina & Escritorio', slug: 'oficina' },
  { id: 'hogar', name: 'Hogar & Deco', slug: 'hogar' },
  { id: 'personal', name: 'Personal & Accesorios', slug: 'personal' },
  { id: 'kids', name: 'Kids & Juguetes', slug: 'kids' }
];

export const FILAMENT_COLORS = [
  {
    id: 'col-black',
    name: 'Carbón Mate',
    hex: '#1A1A1A',
    type: 'PLA_SILK',
    supplier: 'Polymaker',
    stockGrams: 3500,
    minAlertGrams: 500,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-white',
    name: 'Blanco Puro',
    hex: '#FAEEEB',
    type: 'PLA_SILK',
    supplier: 'Polymaker',
    stockGrams: 4200,
    minAlertGrams: 500,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-coral',
    name: 'Coral Terracota',
    hex: '#C9685B',
    type: 'PLA_SILK',
    supplier: 'IdeaForm Lab',
    stockGrams: 1850,
    minAlertGrams: 400,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-navy',
    name: 'Azul Océano',
    hex: '#21658A',
    type: 'PLA_SILK',
    supplier: 'Sunlu',
    stockGrams: 1200,
    minAlertGrams: 400,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-gold',
    name: 'Mostaza Cálido / Oro',
    hex: '#B77B21',
    type: 'PLA_SILK',
    supplier: 'eSUN',
    stockGrams: 900,
    minAlertGrams: 300,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.1
  },
  {
    id: 'col-teal',
    name: 'Teal IdeaForm',
    hex: '#00828A',
    type: 'PLA_SILK',
    supplier: 'IdeaForm Lab',
    stockGrams: 1400,
    minAlertGrams: 300,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-orange',
    name: 'Naranja Fuego',
    hex: '#EA580C',
    type: 'PLA_SILK',
    supplier: 'Polymaker',
    stockGrams: 850,
    minAlertGrams: 300,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-green',
    name: 'Verde Bosque',
    hex: '#059669',
    type: 'PLA_SILK',
    supplier: 'eSUN',
    stockGrams: 650,
    minAlertGrams: 300,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-red',
    name: 'Rojo Carmín',
    hex: '#DC2626',
    type: 'PLA_SILK',
    supplier: 'Sunlu',
    stockGrams: 0, // Out of stock to demonstrate automatic deactivation
    minAlertGrams: 400,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.0
  },
  {
    id: 'col-silver',
    name: 'Plata Titanio',
    hex: '#CBD5E1',
    type: 'PLA_SILK',
    supplier: 'Polymaker',
    stockGrams: 180, // Low stock to demonstrate low stock warning
    minAlertGrams: 300,
    isBlocked: false,
    isArchived: false,
    priceMultiplier: 1.1
  }
];

export const DEFAULT_COLOR_PRESETS = [
  {
    id: 'preset-1',
    name: 'Opción 1: Naranja Neón, Negro & Blanco',
    description: 'Edición deportiva y de alto impacto visual',
    baseColor: { id: 'col-black', name: 'Carbón Mate', hex: '#1A1A1A' },
    accentColor: { id: 'col-orange', name: 'Naranja Fuego', hex: '#EA580C' },
    reliefColor: { id: 'col-white', name: 'Blanco Puro', hex: '#FAEEEB' }
  },
  {
    id: 'preset-2',
    name: 'Opción 2: Verde Esmeralda, Blanco & Rojo',
    description: 'Combinación tricolor vibrante (Desactivada si falta Rojo Carmín)',
    baseColor: { id: 'col-green', name: 'Verde Bosque', hex: '#059669' },
    accentColor: { id: 'col-white', name: 'Blanco Puro', hex: '#FAEEEB' },
    reliefColor: { id: 'col-red', name: 'Rojo Carmín', hex: '#DC2626' }
  },
  {
    id: 'preset-3',
    name: 'Opción 3: Azul Océano, Oro Imperial & Blanco',
    description: 'Edición ejecutiva de lujo y presencia',
    baseColor: { id: 'col-navy', name: 'Azul Océano', hex: '#21658A' },
    accentColor: { id: 'col-gold', name: 'Mostaza Cálido / Oro', hex: '#B77B21' },
    reliefColor: { id: 'col-white', name: 'Blanco Puro', hex: '#FAEEEB' }
  },
  {
    id: 'preset-4',
    name: 'Opción 4: Coral Terracota, Teal & Blanco',
    description: 'Identidad oficial exclusiva IdeaForm',
    baseColor: { id: 'col-coral', name: 'Coral Terracota', hex: '#C9685B' },
    accentColor: { id: 'col-teal', name: 'Teal IdeaForm', hex: '#00828A' },
    reliefColor: { id: 'col-white', name: 'Blanco Puro', hex: '#FAEEEB' }
  }
];

export const FILAMENT_MATERIALS = [
  {
    id: 'PLA_SILK',
    name: 'PLA Seda Premium (Biodegradable)',
    typeCode: 'PLA_SILK',
    description: 'Polímero ecológico a base de maíz con acabado satinado de alto brillo y resistencia.',
    priceMultiplier: 1.0,
    colors: FILAMENT_COLORS
  }
];

export const PRODUCTS = [
  // 1. ESCOLAR
  {
    id: 'prod-esc-01',
    name: 'Tag 3D Personalizado para Mochila',
    subcollection: 'escolar',
    categoryName: 'Escolar & Estudiantes',
    modelType: 'keychain',
    has3d: true,
    isCustomizable: true,
    basePrice: 85.00,
    maxCharacters: 14,
    description: 'Tag resistente de alta definición con tu nombre en relieve 3D y argolla de acero reforzada.',
    dimensions: '65 x 24 x 6 mm',
    weightGrams: 18,
    printTimeMins: 35,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Top Escolar',
    inStock: true,
    tags: ['escolar', 'llavero', 'mochila', 'estudiantes']
  },
  {
    id: 'prod-esc-02',
    name: 'Portalápices Hexagonal HexaDesk Mini',
    subcollection: 'escolar',
    categoryName: 'Escolar & Estudiantes',
    modelType: 'organizer',
    has3d: true,
    isCustomizable: true,
    basePrice: 195.00,
    maxCharacters: 16,
    description: 'Organizador compacto para colores, plumas y tijeras con placa frontal con tu nombre.',
    dimensions: '90 x 90 x 95 mm',
    weightGrams: 110,
    printTimeMins: 160,
    rating: 5.0,
    reviewsCount: 88,
    badge: 'Popular',
    inStock: true,
    tags: ['escolar', 'lapicero', 'estudiantes']
  },
  {
    id: 'prod-esc-03',
    name: 'Regla Geométrica Articulada 20cm',
    subcollection: 'escolar',
    categoryName: 'Escolar & Estudiantes',
    modelType: null,
    has3d: false,
    isCustomizable: false,
    basePrice: 65.00,
    description: 'Regla milimétrica plegable con bisagra 3D print-in-place que cabe en cualquier lapicera.',
    dimensions: '200 x 25 x 4 mm',
    weightGrams: 25,
    printTimeMins: 40,
    rating: 4.8,
    reviewsCount: 34,
    badge: 'Stock Inmediato',
    inStock: true,
    tags: ['escolar', 'utiles']
  },

  // 2. OFICINA
  {
    id: 'prod-ofi-01',
    name: 'Estación HexaStation Pro de Escritorio',
    subcollection: 'oficina',
    categoryName: 'Oficina & Escritorio',
    modelType: 'organizer',
    has3d: true,
    isCustomizable: true,
    basePrice: 280.00,
    maxCharacters: 18,
    description: 'Estación modular con dock para smartphone, ranuras para plumas y placa de grabado.',
    dimensions: '140 x 120 x 85 mm',
    weightGrams: 165,
    printTimeMins: 240,
    rating: 5.0,
    reviewsCount: 98,
    badge: 'Best Seller',
    inStock: true,
    tags: ['oficina', 'escritorio', 'organizador']
  },
  {
    id: 'prod-ofi-02',
    name: 'Soporte Ergonómico para Laptop HexaFold',
    subcollection: 'oficina',
    categoryName: 'Oficina & Escritorio',
    modelType: null,
    has3d: false,
    isCustomizable: false,
    basePrice: 220.00,
    description: 'Elevador plegable portátil para laptops de 13 a 16 pulgadas con ángulo ergonómico de 18°.',
    dimensions: '220 x 45 x 25 mm',
    weightGrams: 95,
    printTimeMins: 140,
    rating: 4.9,
    reviewsCount: 89,
    badge: 'Ergonómico',
    inStock: true,
    tags: ['oficina', 'laptop', 'setup']
  },
  {
    id: 'prod-ofi-03',
    name: 'Placa Ejecutiva con Cargo y Nombre',
    subcollection: 'oficina',
    categoryName: 'Oficina & Escritorio',
    modelType: 'keychain',
    has3d: true,
    isCustomizable: true,
    basePrice: 140.00,
    maxCharacters: 20,
    description: 'Placa de escritorio con tipografía en alto relieve y base angular.',
    dimensions: '120 x 35 x 30 mm',
    weightGrams: 45,
    printTimeMins: 75,
    rating: 4.9,
    reviewsCount: 61,
    badge: 'Ejecutivo',
    inStock: true,
    tags: ['oficina', 'placa', 'nombre']
  },

  // 3. HOGAR
  {
    id: 'prod-hog-01',
    name: 'Lámpara Litofanía DecoGlow',
    subcollection: 'hogar',
    categoryName: 'Hogar & Deco',
    modelType: 'lamp',
    has3d: true,
    isCustomizable: true,
    basePrice: 380.00,
    maxCharacters: 24,
    description: 'Lámpara cilíndrica con tecnología de litofanía 3D. El grabado se revela al encender la luz.',
    dimensions: '110 x 110 x 135 mm',
    weightGrams: 210,
    printTimeMins: 380,
    rating: 4.9,
    reviewsCount: 67,
    badge: 'Luz Cálida',
    inStock: true,
    tags: ['hogar', 'lampara', 'litofania', 'deco']
  },
  {
    id: 'prod-hog-02',
    name: 'Maceta Geométrica Voronoi M',
    subcollection: 'hogar',
    categoryName: 'Hogar & Deco',
    modelType: null,
    has3d: false,
    isCustomizable: false,
    basePrice: 195.00,
    description: 'Maceta moderna con diseño celular de Voronoi y plato de drenaje oculto integrado.',
    dimensions: '120 x 120 x 110 mm',
    weightGrams: 140,
    printTimeMins: 190,
    rating: 4.7,
    reviewsCount: 84,
    badge: 'Deco',
    inStock: true,
    tags: ['hogar', 'maceta', 'plantas']
  },
  {
    id: 'prod-hog-03',
    name: 'Pack x4 Portavasos Topográficos',
    subcollection: 'hogar',
    categoryName: 'Hogar & Deco',
    modelType: null,
    has3d: false,
    isCustomizable: false,
    basePrice: 180.00,
    description: 'Juego de 4 portavasos con curvas de nivel en relieve 3D y base contenedora cilíndrica.',
    dimensions: '95 x 95 x 6 mm',
    weightGrams: 120,
    printTimeMins: 150,
    rating: 4.8,
    reviewsCount: 53,
    badge: 'Pack x4',
    inStock: true,
    tags: ['hogar', 'portavasos', 'cocina']
  },

  // 4. PERSONAL
  {
    id: 'prod-per-01',
    name: 'Llavero Hexagonal Minimalista 3D',
    subcollection: 'personal',
    categoryName: 'Personal & Accesorios',
    modelType: 'keychain',
    has3d: true,
    isCustomizable: true,
    basePrice: 85.00,
    maxCharacters: 14,
    description: 'Llavero de bolsillo facetado con relieve tipográfico por ambas caras y argolla metálica.',
    dimensions: '65 x 24 x 6 mm',
    weightGrams: 18,
    printTimeMins: 35,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Más Vendido',
    inStock: true,
    tags: ['personal', 'llavero', 'accesorios']
  },
  {
    id: 'prod-per-02',
    name: 'Soporte de Audífonos Arc Station',
    subcollection: 'personal',
    categoryName: 'Personal & Accesorios',
    modelType: null,
    has3d: false,
    isCustomizable: false,
    basePrice: 245.00,
    description: 'Soporte con curvatura ergonómica para audífonos de diadema y base con organizador de cable.',
    dimensions: '130 x 110 x 240 mm',
    weightGrams: 230,
    printTimeMins: 310,
    rating: 4.9,
    reviewsCount: 112,
    badge: 'Gamer',
    inStock: true,
    tags: ['personal', 'audifonos', 'setup']
  },

  // 5. KIDS
  {
    id: 'prod-kid-01',
    name: 'Letrero de Noche con Luz LED para Cuarto',
    subcollection: 'kids',
    categoryName: 'Kids & Juguetes',
    modelType: 'lamp',
    has3d: true,
    isCustomizable: true,
    basePrice: 320.00,
    maxCharacters: 12,
    description: 'Lámpara nocturna con nombre infantil que proyecta un brillo suave y reconfortante.',
    dimensions: '100 x 100 x 120 mm',
    weightGrams: 180,
    printTimeMins: 290,
    rating: 5.0,
    reviewsCount: 47,
    badge: 'Luz Infantil',
    inStock: true,
    tags: ['kids', 'noche', 'bebe', 'lampara']
  },
  {
    id: 'prod-kid-02',
    name: 'Dragón Articulado Flexible 3D',
    subcollection: 'kids',
    categoryName: 'Kids & Juguetes',
    modelType: null,
    has3d: false,
    isCustomizable: false,
    basePrice: 160.00,
    description: 'Figura articulada de una sola pieza sin ensambles, flexible y antiestrés en PLA seda.',
    dimensions: '180 x 35 x 25 mm',
    weightGrams: 55,
    printTimeMins: 90,
    rating: 4.9,
    reviewsCount: 76,
    badge: 'Flexible',
    inStock: true,
    tags: ['kids', 'juguete', 'dragon']
  },

  // 6. PRODUCTOS CORPORATIVOS B2B
  {
    id: 'prod-b2b-01',
    name: 'Trofeo Prisma Award B2B',
    subcollection: 'empresas',
    categoryName: 'Corporativo & B2B',
    modelType: 'trophy',
    has3d: true,
    isCustomizable: true,
    basePrice: 340.00,
    maxCharacters: 28,
    description: 'Galardón corporativo geométrico con base pesada e inserción de logo empresarial.',
    dimensions: '80 x 80 x 190 mm',
    weightGrams: 290,
    printTimeMins: 420,
    rating: 5.0,
    reviewsCount: 43,
    badge: 'Corporativo',
    inStock: true,
    tags: ['empresas', 'trofeo', 'b2b', 'reconocimiento']
  },
  {
    id: 'prod-b2b-02',
    name: 'Tags Corporativos por Volumen (Pack x50)',
    subcollection: 'empresas',
    categoryName: 'Corporativo & B2B',
    modelType: 'keychain',
    has3d: true,
    isCustomizable: true,
    basePrice: 45.00,
    maxCharacters: 16,
    description: 'Llaveros corporativos con logo vectorial de tu empresa en relieve 3D a doble cara.',
    dimensions: '65 x 24 x 6 mm',
    weightGrams: 18,
    printTimeMins: 35,
    rating: 4.9,
    reviewsCount: 95,
    badge: 'Mayoreo',
    inStock: true,
    tags: ['empresas', 'llaveros', 'merch', 'b2b']
  },
  {
    id: 'prod-b2b-03',
    name: 'Organizador Ejecutivo con Logo Corporativo',
    subcollection: 'empresas',
    categoryName: 'Corporativo & B2B',
    modelType: 'organizer',
    has3d: true,
    isCustomizable: true,
    basePrice: 260.00,
    maxCharacters: 20,
    description: 'Estación de bienvenida para colaboradores con dock de celular y logo en placa metálica.',
    dimensions: '140 x 120 x 85 mm',
    weightGrams: 165,
    printTimeMins: 240,
    rating: 5.0,
    reviewsCount: 31,
    badge: 'Onboarding',
    inStock: true,
    tags: ['empresas', 'oficina', 'kit']
  },

  // 7. PRODUCTOS PARA EVENTOS
  {
    id: 'prod-evt-01',
    name: 'Lámpara Litofanía Conmemorativa',
    subcollection: 'eventos',
    categoryName: 'Eventos & Recuerdos',
    modelType: 'lamp',
    has3d: true,
    isCustomizable: true,
    basePrice: 380.00,
    maxCharacters: 24,
    description: 'Lámpara con relieve 3D que revela los nombres de los novios o festejada y fecha al encenderse.',
    dimensions: '110 x 110 x 135 mm',
    weightGrams: 210,
    printTimeMins: 380,
    rating: 5.0,
    reviewsCount: 54,
    badge: 'Bodas & XV',
    inStock: true,
    tags: ['eventos', 'boda', 'recuerdos', 'xv']
  },
  {
    id: 'prod-evt-02',
    name: 'Recuerdos de Mesa Grabados (Pack x20)',
    subcollection: 'eventos',
    categoryName: 'Eventos & Recuerdos',
    modelType: 'keychain',
    has3d: true,
    isCustomizable: true,
    basePrice: 42.00,
    maxCharacters: 18,
    description: 'Souvenirs con fecha conmemorativa, nombres en relieve y argolla dorada o plateada.',
    dimensions: '60 x 22 x 5 mm',
    weightGrams: 16,
    printTimeMins: 30,
    rating: 4.9,
    reviewsCount: 78,
    badge: 'Souvenir',
    inStock: true,
    tags: ['eventos', 'bautizo', 'recuerdos', 'graduacion']
  }
];

export const B2B_PRICE_TIERS = [
  { minUnits: 10, maxUnits: 24, discountPercent: 0, leadTimeDays: '2 - 3 días', benefit: 'Empaque estándar B2B' },
  { minUnits: 25, maxUnits: 49, discountPercent: 10, leadTimeDays: '3 - 5 días', benefit: 'Muestra digital en render 3D gratis' },
  { minUnits: 50, maxUnits: 99, discountPercent: 18, leadTimeDays: '5 - 7 días', benefit: '1 Muestra física previa de prueba' },
  { minUnits: 100, maxUnits: 299, discountPercent: 25, leadTimeDays: '7 - 10 días', benefit: 'Envío prioritario nacional GRATIS' },
  { minUnits: 300, maxUnits: 999, discountPercent: 33, leadTimeDays: '10 - 15 días', benefit: 'Empaque individual con logo corporativo' },
  { minUnits: 1000, maxUnits: 9999, discountPercent: 40, leadTimeDays: 'Consultar', benefit: 'Asesor técnico comercial & SLA garantizado' }
];

export const MOCK_ORDERS_KANBAN = [
  {
    id: 'ord-10021',
    orderNumber: 'IDF-84920',
    customerName: 'Carlos Villalobos',
    productName: 'Llavero Tag 3D (x2)',
    customText: 'Carlos & Ana',
    filament: 'Coral Terracota (#C9685B)',
    filamentGrams: 36,
    printTimeMins: 70,
    status: 'PRINTING',
    priority: 'URGENT',
    channel: 'WHATSAPP',
    paymentMethod: 'SPEI',
    paymentStatus: 'PAID',
    assignedPrinter: 'Bambu Lab X1C #01',
    progressPercent: 65,
    packagingCost: 15.00,
    shippingCostReal: 135.00,
    total: 170.00,
    date: '2026-08-13'
  },
  {
    id: 'ord-10022',
    orderNumber: 'IDF-84921',
    customerName: 'Dra. Mariana López',
    productName: 'Estación HexaStation Pro',
    customText: 'Dra. Mariana L.',
    filament: 'Azul Océano (#21658A)',
    filamentGrams: 165,
    printTimeMins: 240,
    status: 'QUEUED',
    priority: 'MEDIUM',
    channel: 'WEB_AUTO',
    paymentMethod: 'STRIPE',
    paymentStatus: 'PAID',
    assignedPrinter: 'Creality K1 Max #01',
    progressPercent: 0,
    packagingCost: 28.00,
    shippingCostReal: 145.00,
    total: 280.00,
    date: '2026-08-13'
  },
  {
    id: 'ord-10023',
    orderNumber: 'IDF-84922',
    customerName: 'Lic. Fernando Soto',
    productName: 'Lámpara Litofanía DecoGlow',
    customText: 'NUESTRA BODA 2026',
    filament: 'Mostaza Cálido (#B77B21)',
    filamentGrams: 210,
    printTimeMins: 380,
    status: 'READY_TO_SHIP',
    priority: 'LOW',
    channel: 'INSTAGRAM',
    paymentMethod: 'MERCADOPAGO',
    paymentStatus: 'PAID',
    assignedPrinter: 'Bambu Lab P1S #02',
    progressPercent: 100,
    packagingCost: 35.00,
    shippingCostReal: 140.00,
    total: 380.00,
    date: '2026-08-12'
  },
  {
    id: 'ord-10024',
    orderNumber: 'IDF-84923',
    customerName: 'Corporativo TechVanguard',
    productName: 'Trofeo Prisma Award B2B (x25)',
    customText: 'TECH VANGUARD EXCELLENCE',
    filament: 'Carbón Mate (#1A1A1A)',
    filamentGrams: 950,
    printTimeMins: 1200,
    status: 'POST_PROCESSING',
    priority: 'URGENT',
    channel: 'B2B',
    paymentMethod: 'TRANSFERENCIA_EMPRESARIAL',
    paymentStatus: 'PAID',
    assignedPrinter: 'Bambu Lab X1C #01',
    progressPercent: 90,
    packagingCost: 180.00,
    shippingCostReal: 280.00,
    total: 8250.00,
    date: '2026-08-11'
  }
];

export const MOCK_3D_PRINTERS = [
  {
    id: 'prt-01',
    name: 'Bambu Lab X1-Carbon #01',
    model: 'Bambu Lab X1-Carbon',
    status: 'PRINTING',
    nozzleSize: '0.4 mm Hardened Steel',
    bedType: 'PEI Texturizado Dual-Side',
    bedDimensions: '256 x 256 x 256 mm',
    printHours: 428,
    currentJobId: 'ord-10021',
    currentJobProgress: 65,
    amsSlots: [
      { slot: 1, colorName: 'Carbón Mate', hex: '#1A1A1A', material: 'PLA Silk' },
      { slot: 2, colorName: 'Blanco Puro', hex: '#FAEEEB', material: 'PLA Silk' },
      { slot: 3, colorName: 'Coral Terracota', hex: '#C9685B', material: 'PLA Silk' },
      { slot: 4, colorName: 'Oro Seda', hex: '#D4AF37', material: 'PLA Silk' }
    ],
    lastMaintenance: '2026-08-01 (Limpieza de varillas de carbono y calibración de cama)'
  },
  {
    id: 'prt-02',
    name: 'Bambu Lab P1S #02',
    model: 'Bambu Lab P1S',
    status: 'AVAILABLE',
    nozzleSize: '0.4 mm Stainless',
    bedType: 'PEI Texturizado',
    bedDimensions: '256 x 256 x 256 mm',
    printHours: 312,
    currentJobId: null,
    currentJobProgress: 0,
    amsSlots: [
      { slot: 1, colorName: 'Azul Océano', hex: '#21658A', material: 'PLA Silk' },
      { slot: 2, colorName: 'Verde Salvia', hex: '#638C6D', material: 'PLA Mate' },
      { slot: 3, colorName: 'Mostaza Cálido', hex: '#B77B21', material: 'PLA Silk' },
      { slot: 4, colorName: 'Blanco Puro', hex: '#FAEEEB', material: 'PLA Silk' }
    ],
    lastMaintenance: '2026-08-05 (Lubricación de husillos Z)'
  },
  {
    id: 'prt-03',
    name: 'Creality K1 Max #01',
    model: 'Creality K1 Max (Gran Formato)',
    status: 'PRINTING',
    nozzleSize: '0.6 mm High Flow',
    bedType: 'PEI Liso',
    bedDimensions: '300 x 300 x 300 mm',
    printHours: 580,
    currentJobId: 'ord-10022',
    currentJobProgress: 35,
    amsSlots: [
      { slot: 1, colorName: 'Azul Océano', hex: '#21658A', material: 'PLA Silk' }
    ],
    lastMaintenance: '2026-07-28 (Cambio de boquilla a 0.6mm)'
  },
  {
    id: 'prt-04',
    name: 'Prusa MK4 #01',
    model: 'Original Prusa MK4 Nextruder',
    status: 'MAINTENANCE',
    nozzleSize: '0.4 mm Brass',
    bedType: 'Lámina Satinada',
    bedDimensions: '250 x 210 x 220 mm',
    printHours: 890,
    currentJobId: null,
    currentJobProgress: 0,
    amsSlots: [
      { slot: 1, colorName: 'Carbón Mate', hex: '#1A1A1A', material: 'PETG' }
    ],
    lastMaintenance: '2026-08-14 (En mantenimiento preventivo: cambio de thermistor)'
  }
];

export const MOCK_OPERATING_EXPENSES = [
  {
    id: 'exp-01',
    category: 'PACKAGING',
    description: 'Cajas de cartón microcorrugado Kraft (Pack 100u) + viruta protectora',
    amount: 680.00,
    date: '2026-08-10',
    supplier: 'Empaques de México S.A.',
    recurring: 'Mensual'
  },
  {
    id: 'exp-02',
    category: 'PACKAGING',
    description: 'Bolsas compostables sellables con desecante + Stickers con logo (Pack 500u)',
    amount: 420.00,
    date: '2026-08-08',
    supplier: 'PrintStickers MX',
    recurring: 'Bimestral'
  },
  {
    id: 'exp-03',
    category: 'SHIPPING',
    description: 'Recarga de saldo guías prepagadas Estafeta & DHL Express (15 guías)',
    amount: 2250.00,
    date: '2026-08-12',
    supplier: 'EnviaYa / Skydropx',
    recurring: 'Semanal'
  },
  {
    id: 'exp-04',
    category: 'ELECTRICITY',
    description: 'Consumo eléctrico del Taller de Impresión 3D (CFE Bimestre)',
    amount: 1450.00,
    date: '2026-08-01',
    supplier: 'CFE Suministrador de Servicios Básicos',
    recurring: 'Bimestral'
  },
  {
    id: 'exp-05',
    category: 'SUPPLIES',
    description: 'Alcohol isopropílico 99% (4 Litros) + Adhesivo 3Dlac + 2 Boquillas 0.4mm',
    amount: 890.00,
    date: '2026-08-05',
    supplier: '3D Market MX',
    recurring: 'Mensual'
  }
];

export const MOCK_B2B_QUOTES = [
  {
    quoteNumber: 'COT-B2B-108',
    companyName: 'Innovación Tecnológica S.A. de C.V.',
    contactName: 'Lic. Sofía Mendoza',
    email: 'compras@innovacion.mx',
    rfc: 'ITE180425ABC',
    productName: 'Trofeo Prisma Award B2B',
    units: 50,
    quantity: 50,
    unitPrice: 340.00,
    discountPercent: 18,
    subtotal: 13940.00,
    iva: 2230.40,
    finalTotal: 16170.40,
    totalAmount: 16170.40,
    status: 'VIGENTE (15 DÍAS)',
    date: '2026-08-13'
  }
];

export const FAQS = [
  {
    q: '¿Cómo funciona la personalización 3D en vivo?',
    a: 'Escribe tu nombre, marca o texto y selecciona el color deseado. Nuestro motor WebGL renderiza tu pieza tridimensional en tiempo real tal como saldrá de la impresora 3D.'
  },
  {
    q: '¿Qué materiales utilizan para la fabricación?',
    a: 'Utilizamos polímeros biodegradables PLA de grado premium derivados del almidón de maíz, libres de toxinas y con acabado de alta definición.'
  },
  {
    q: '¿Hacen envíos a todo México y emiten factura?',
    a: 'Sí, realizamos envíos a toda la República Mexicana por DHL Express, FedEx y Estafeta. En el checkout puedes ingresar tus datos fiscales para recibir tu factura CFDI 4.0 timbrada por el SAT.'
  }
];

export const DEFAULT_BOT_PROFILES = [
  {
    id: 'profile-default',
    name: '⚙️ Taller Estándar (Recomendado)',
    description: 'Configuración equilibrada para atención a clientes particulares y cotizaciones diarias.',
    botName: 'IdeaForm Bot AI',
    welcomeGreeting: '¡Hola! 👋 Soy tu **Asistente IdeaForm 3D**. Estoy conectado con el taller en vivo. ¿En qué proyecto o duda te puedo apoyar hoy?',
    whatsappNumber: '526121403409',
    fallbackMessage: 'No logré entender por completo tu mensaje, pero con gusto puedo ayudarte. ¿Te refieres a alguna de estas opciones o prefieres comunicarte directamente con nuestro taller por WhatsApp?',
    enableFuzzyMatching: true,
    autoTransferOnUnknown: true,
    isSystemDefault: true,
    createdAt: '2026-08-01T00:00:00.000Z'
  },
  {
    id: 'profile-b2b',
    name: '🏢 Modo Corporativo & Empresas B2B',
    description: 'Enfocado en pedidos de mayoreo, souvenirs de marca, eventos masivos y facturación SAT.',
    botName: 'IdeaForm B2B Concierge',
    welcomeGreeting: '¡Hola! Bienvenido a la división corporativa de **IdeaForm México**. ¿Deseas cotizar producción por volumen, merchandising o solicitar una muestra?',
    whatsappNumber: '526121403409',
    fallbackMessage: 'Para brindarte atención personalizada con un ejecutivo de cuentas corporativas, por favor indícanos el volumen estimado o escríbenos a WhatsApp.',
    enableFuzzyMatching: true,
    autoTransferOnUnknown: true,
    isSystemDefault: false,
    createdAt: '2026-08-05T00:00:00.000Z'
  },
  {
    id: 'profile-promo',
    name: '🎉 Modo Campaña & Promociones Especiales',
    description: 'Saludo con promociones activas, descuentos de temporada y envíos gratis.',
    botName: 'IdeaForm Bot Especial',
    welcomeGreeting: '¡Hola! 🎁 ¡Aprovecha hoy nuestras promociones especiales con **Envío Gratis** en compras mayores a $899 MXN! ¿En qué diseño 3D te podemos ayudar?',
    whatsappNumber: '526121403409',
    fallbackMessage: '¿Buscas alguna pieza o personalizar un producto? Puedes explorar nuestro catálogo o mandarnos mensaje directo por WhatsApp.',
    enableFuzzyMatching: true,
    autoTransferOnUnknown: true,
    isSystemDefault: false,
    createdAt: '2026-08-10T00:00:00.000Z'
  }
];

export const DEFAULT_BOT_SETTINGS = DEFAULT_BOT_PROFILES[0];

export const DEFAULT_BOT_INTENTS = [
  {
    id: 'intent-cotizacion',
    key: 'cotizacion',
    title: '🎨 Cotizar Diseño o Producto 3D',
    chipLabel: '🎨 Cotizar 3D',
    keywords: ['cotizar', 'cotizacion', 'precio', 'costo', 'presio', 'cuanto', 'cuanto cuesta', 'stl', 'diseño', 'imprimir', 'presupuesto', 'tarifa', 'hacer'],
    response: '¡Con gusto te ayudamos a materializar tu idea! 🚀\n\nNuestros precios se calculan según los gramos de filamento y tiempo de impresión:\n• **Llaveros y Tags 3D:** desde $45 a $90 MXN\n• **Estaciones de Escritorio / Docks:** desde $180 a $290 MXN\n• **Lámparas Litofanía y Deco:** desde $280 a $450 MXN\n• **Proyectos Especiales / STL:** Cotización a la medida.\n\n¿Deseas enviar tus requerimientos o archivo a nuestro taller por WhatsApp?',
    actionLabel: 'Continuar por WhatsApp con Asesor',
    actionRoute: '',
    actionType: 'WHATSAPP',
    intent: 'COTIZACION',
    isActive: true
  },
  {
    id: 'intent-rastreo',
    key: 'rastreo',
    title: '🚚 Rastrear Pedido de Taller',
    chipLabel: '🚚 Rastrear Folio',
    keywords: ['rastrear', 'rastreo', 'donde esta', 'mi pedido', 'folio', 'estatus', 'status', 'guia', 'envio', 'seguimiento', 'cuando llega', 'idf-'],
    response: 'Para consultar el avance de tu pieza en el taller (En Cola, En Impresora 3D o Listo para Envío), puedes ingresar tu número de folio en nuestra sección de **Rastrear** o proporcionarnos tu folio aquí (ej. IDF-84920).',
    actionLabel: 'Ver Sección de Rastreo',
    actionRoute: 'tracking',
    actionType: 'NAVIGATE',
    intent: 'RASTREO',
    isActive: true
  },
  {
    id: 'intent-empresas',
    key: 'empresas',
    title: '🏢 Cotizaciones B2B & Mayoreo',
    chipLabel: '🏢 Mayoreo B2B',
    keywords: ['empresa', 'empresas', 'mayoreo', 'b2b', 'factura', 'facturacion', 'cfdi', 'descuento', 'volumen', 'eventos', 'recuerdos', 'corporativo', 'lote'],
    response: '¡Manejamos paquetes mayoristas con descuentos escalonados y facturación CFDI 4.0!\n\n• **25 a 49 unidades:** 10% de descuento\n• **50 a 99 unidades:** 18% de descuento + 1 muestra física\n• **100 a 299 unidades:** 25% de descuento + Envío nacional GRATIS\n• **300+ unidades:** 33% de descuento con empaque corporativo.',
    actionLabel: 'Ir a Cotizador B2B',
    actionRoute: 'empresas',
    actionType: 'NAVIGATE',
    intent: 'B2B',
    isActive: true
  },
  {
    id: 'intent-materiales',
    key: 'materiales',
    title: '🧵 Materiales & Filamentos',
    chipLabel: '🧵 Materiales',
    keywords: ['material', 'materiales', 'filamento', 'filamentos', 'pla', 'petg', 'abs', 'tpu', 'resina', 'silk', 'seda', 'colores', 'biodegradable', 'toxico', 'calor'],
    response: 'Utilizamos polímeros termoplásticos de grado premium:\n• **PLA Silk (Seda):** Brillo metálico espectacular, ideal para llaveros y trofeos.\n• **PLA Mate:** Textura suave y colores sobrios para decoración.\n• **PETG Técnico:** Resistente al agua y rayos UV para uso rudo.\n\nTodos nuestros materiales son 100% biodegradables derivados del maíz y libres de toxinas.',
    actionLabel: 'Hablar con Ingeniero de Materiales',
    actionRoute: '',
    actionType: 'WHATSAPP',
    intent: 'MATERIALES',
    isActive: true
  },
  {
    id: 'intent-envios',
    key: 'envios',
    title: '📦 Tiempos de Entrega & Paqueterías',
    chipLabel: '📦 Envíos',
    keywords: ['envio', 'envios', 'paqueteria', 'dhl', 'estafeta', 'fedex', 'cuanto tarda', 'tiempo', 'dias', 'costo envio', 'envio gratis', 'republica', 'mexico'],
    response: '🚚 **Envíos a todo México:**\n• **Tiempo de fabricación:** 24 a 48 horas hábiles.\n• **Paquetería Express:** DHL / FedEx / Estafeta (1 a 3 días hábiles).\n• **Costo estándar:** $135 MXN a cualquier código postal.\n• **Envío GRATIS:** En compras mayores a $899 MXN o pedidos B2B de +100 piezas.',
    actionLabel: 'Consultar Cobertura por WhatsApp',
    actionRoute: '',
    actionType: 'WHATSAPP',
    intent: 'ENVIOS',
    isActive: true
  },
  {
    id: 'intent-garantia',
    key: 'garantia',
    title: '🛡️ Garantía de Calidad & Reemplazos',
    chipLabel: '🛡️ Garantía',
    keywords: ['garantia', 'garantias', 'roto', 'defecto', 'devolucion', 'cambio', 'reembolso', 'queja', 'seguro'],
    response: '🛡️ **Compromiso de Calidad IdeaForm:**\nCada pieza es inspeccionada en nuestro Control de Calidad de taller. Si tu producto llega con algún defecto de fabricación o daño de paquetería, lo **reimprimimos y enviamos sin ningún costo adicional** para ti.',
    actionLabel: 'Reportar Incidencia con Asesor',
    actionRoute: '',
    actionType: 'WHATSAPP',
    intent: 'GARANTIA',
    isActive: true
  }
];
