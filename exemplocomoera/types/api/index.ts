/**
 * API Types - Tipos para comunicação com APIs
 */

import type { Customer, OrderItem } from '../entities'

export interface CreateOrderRequest {
  customer: Customer
  items: Omit<OrderItem, 'id' | 'order_id' | 'unit_price_cents' | 'product'>[]
}

export interface CreateOrderResponse {
  orderId: string
  orderNumber: string
  checkoutUrl: string
}

export interface ApiError {
  error: string
  details?: unknown
}

export interface UploadImageResponse {
  url: string
  path: string
}

