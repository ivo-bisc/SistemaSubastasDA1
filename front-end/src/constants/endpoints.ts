/**
 * BidUp — Endpoints de la API REST
 *
 * Solo paths relativos; la baseURL se configura en apiClient.ts
 * Basado en subastas-api.yaml
 */
export const Endpoints = {
  // ── Auth ───────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER_STEP1: '/auth/registro/paso1',
    REGISTER_STEP2: '/auth/registro/paso2',
  },

  // ── Users ──────────────────────────────────────────────
  USERS: {
    PROFILE: '/usuarios/perfil',
    UPDATE_PROFILE: '/usuarios/perfil',
  },

  // ── Auctions ───────────────────────────────────────────
  AUCTIONS: {
    LIST: '/subastas',
    DETAIL: (id: string) => `/subastas/${id}`,
    CATALOG: (id: string) => `/subastas/${id}/catalogo`,
    CONNECT: (id: string) => `/subastas/${id}/conectar`,
    DISCONNECT: (id: string) => `/subastas/${id}/desconectar`,
  },

  // ── Purchases ──────────────────────────────────────────
  PURCHASES: {
    LIST: '/usuarios/compras',
    DETAIL: (id: string) => `/usuarios/compras/${id}`,
    // PENDIENTE: sin pantalla ni servicio implementado
    CHAT: (id: string) => `/compras/${id}/chat`,
    // PENDIENTE: sin pantalla ni servicio implementado
    DELIVERY: (id: string) => `/compras/${id}/entrega`,
  },

  // ── Payment Methods ────────────────────────────────────
  PAYMENTS: {
    METHODS: '/usuarios/medios-pago',
    DELETE: (id: string) => `/usuarios/medios-pago/${id}`,
  },

  // ── Consignment ────────────────────────────────────────
  CONSIGNMENT: {
    LIST: '/consignaciones',
    SUBMIT_ITEM: '/consignaciones',
    ACCEPT_CONDITIONS: (id: string) => `/consignaciones/${id}/aceptar-condiciones`,
    REJECT_CONDITIONS: (id: string) => `/consignaciones/${id}/rechazar-condiciones`,
    ITEM_LOCATION: (id: string) => `/consignaciones/${id}/ubicacion`,
    INSURANCE_POLICY: (id: string) => `/consignaciones/${id}/poliza`,
  },

  // ── Metrics ────────────────────────────────────────────
  METRICS: {
    STATS: '/usuarios/metricas',
    PARTICIPATION_HISTORY: '/usuarios/participaciones',
    FINES: '/usuarios/multas',
    PAY_FINE: (id: string) => `/usuarios/multas/${id}/pagar`,
    MY_BIDS: '/usuarios/mis-pujas',
  },
} as const;
