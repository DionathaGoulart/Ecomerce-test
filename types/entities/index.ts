/**
 * Entity Types - Tipos de entidades do domínio
 * 
 * Tipos que representam as entidades principais do sistema.
 */

export interface Product {
  id: string
  title: string
  description?: string | null
  price_cents: number
  image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface Customer {
  id?: string
  name: string
  email: string
  cpf: string
  whatsapp: string
  address: Address
  created_at?: string
}

export interface Address {
  street: string
  number: string
  city: string
  state: string
  zipcode: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  status: OrderStatus
  total_cents: number
  stripe_session_id?: string | null
  receipt_url?: string | null
  created_at: string
  updated_at: string
  customer?: Customer
  items?: OrderItem[]
}

export type OrderStatus = 'pending' | 'paid' | 'production' | 'shipped' | 'cancelled'

export interface OrderItem {
  id?: string
  order_id?: string
  product_id: string
  quantity: number
  unit_price_cents: number
  personalization?: Personalization
  product?: Product
}

export interface Personalization {
  imageUrl?: string
  description?: string
}

export interface CartItem {
  productId: string
  quantity: number
  personalizationImageUrl?: string
  personalizationDescription?: string
}

