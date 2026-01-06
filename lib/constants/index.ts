/**
 * Constants - Constantes do sistema
 */

// Storage
export const STORAGE_BUCKETS = {
  PRODUCTS: 'products',
  PERSONALIZATIONS: 'personalizations',
} as const

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Cart
export const CART_STORAGE_KEY = 'cart'

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PRODUCTION: 'production',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
} as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Pendente',
  [ORDER_STATUS.PAID]: 'Pago',
  [ORDER_STATUS.PRODUCTION]: 'Em Produção',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.CANCELLED]: 'Cancelado',
}

// Routes
export const ROUTES = {
  HOME: '/',
  STORE: '/', // Removido /store, agora usa a página inicial
  CART: '/cart',
  PRODUCT: (id: string) => `/store/products/${id}`,
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER: (id: string) => `/admin/orders/${id}`,
} as const

// Validation
export const VALIDATION = {
  CPF_LENGTH: 11,
  CEP_LENGTH: 8,
  WHATSAPP_MIN_LENGTH: 10,
  WHATSAPP_MAX_LENGTH: 13,
  DESCRIPTION_MAX_LENGTH: 500,
} as const

// Steps (Como Funciona)
export { STEPS } from './steps'
export type { Step } from './steps'

