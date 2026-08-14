// ==========================================================================
// LISTA DE CORREOS AUTORIZADOS & ROLES DE USUARIO (IDEA FORM)
// ==========================================================================
// Coloca aquí los correos electrónicos reales que tendrán acceso
// como Administrador, Operador del Taller 3D o Cuenta Corporativa B2B.
// Los demás correos accederán automáticamente con rol de CLIENTE (CUSTOMER).

export const AUTHORIZED_USERS = {
  // 👑 ADMINISTRADORES: Acceso total al ERP, finanzas, métricas y órdenes
  ADMINS: [
    'admin@ideaform.mx',
    'gerencia@ideaform.com',
    'fregoso@gmail.com',
    'carlos.fregoso@gmail.com',
    'sr.fregoso@gmail.com'
  ],

  // 🛠️ OPERADORES DEL TALLER 3D: Tablero Kanban, asignación de impresoras y slicing
  OPERATORS_3D: [
    'taller@ideaform.mx',
    'operador@ideaform.mx',
    'produccion@ideaform.mx'
  ],

  // 🏢 CLIENTES CORPORATIVOS B2B: Precios especiales de mayoreo y facturación CFDI
  B2B_CLIENTS: [
    'compras@empresa.com',
    'contacto@corporativo.mx'
  ]
};

/**
 * Determina el rol del usuario en base a su correo electrónico autenticado
 * @param {string} email - Correo del usuario autenticado
 * @returns {'ADMIN' | 'OPERATOR_3D' | 'B2B_CLIENT' | 'CUSTOMER'}
 */
export const getRoleForEmail = (email) => {
  if (!email) return 'CUSTOMER';
  const cleanEmail = email.toLowerCase().trim();

  if (AUTHORIZED_USERS.ADMINS.some((adminEmail) => cleanEmail === adminEmail.toLowerCase())) {
    return 'ADMIN';
  }

  if (AUTHORIZED_USERS.OPERATORS_3D.some((opEmail) => cleanEmail === opEmail.toLowerCase())) {
    return 'OPERATOR_3D';
  }

  if (AUTHORIZED_USERS.B2B_CLIENTS.some((b2bEmail) => cleanEmail === b2bEmail.toLowerCase())) {
    return 'B2B_CLIENT';
  }

  // Si tiene dominio de la empresa
  if (cleanEmail.endsWith('@ideaform.mx') || cleanEmail.endsWith('@ideaform.com')) {
    return 'ADMIN';
  }

  return 'CUSTOMER';
};
