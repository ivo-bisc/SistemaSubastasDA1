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
    REGISTER_STEP3: '/auth/register/step3',
  },

  // ── Users ──────────────────────────────────────────────
  USERS: {
    PROFILE: '/usuarios/perfil',
    UPDATE_PROFILE: '/usuarios/perfil',
  },

  // ── Catalog ────────────────────────────────────────────
  CATALOG: {
    ITEMS: '/catalog/items',
    ITEM_DETAIL: (id: string) => `/items/${id}`,
    ITEM_IMAGES: (id: string) => `/items/${id}/imagenes`,
  },

  // ── Auctions ───────────────────────────────────────────
  AUCTIONS: {
    LIST: '/subastas',
    DETAIL: (id: string) => `/subastas/${id}`,
    CATALOG: (id: string) => `/subastas/${id}/catalogo`,
    CONNECT: (id: string) => `/subastas/${id}/conectar`,
    DISCONNECT: (id: string) => `/subastas/${id}/desconectar`,
  },

  // ── Bids ───────────────────────────────────────────────
  BIDS: {
    CURRENT: (auctionId: string) => `/subastas/${auctionId}/pujas/estado`,
    PLACE: (auctionId: string) => `/subastas/${auctionId}/pujas`,
    HISTORY: (auctionId: string) => `/subastas/${auctionId}/pujas/historial`,
  },

  // ── Purchases ──────────────────────────────────────────
  PURCHASES: {
    DETAIL: (id: string) => `/usuarios/compras/${id}`,
  },

  // ── Payment Methods ────────────────────────────────────
  PAYMENTS: {
    METHODS: '/usuarios/medios-pago',
    ADD_CARD: '/payment-methods/card',
    ADD_BANK_ACCOUNT: '/payment-methods/bank-account',
    ADD_CHECK: '/payment-methods/check',
    DELETE: (id: string) => `/usuarios/medios-pago/${id}`,
  },

  // ── Consignment ────────────────────────────────────────
  CONSIGNMENT: {
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
  },
} as const;
