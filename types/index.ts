/**
 * Types - Exportações centralizadas de tipos
 * 
 * Ponto único de entrada para todos os tipos do projeto.
 */

// Entities
export type {
  Product,
  Customer,
  Address,
  Order,
  OrderStatus,
  OrderItem,
  Personalization,
  CartItem,
} from './entities'

// API
export type {
  CreateOrderRequest,
  CreateOrderResponse,
  ApiError,
  UploadImageResponse,
} from './api'

