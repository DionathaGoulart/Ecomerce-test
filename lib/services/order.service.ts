/**
 * Order Service - Lógica de negócio de pedidos
 */

import type { CreateOrderRequest, CreateOrderResponse } from '@/types/api'
import type { CartItem } from '@/types/entities'

export class OrderService {
  /**
   * Cria um novo pedido
   */
  static async create(
    customer: CreateOrderRequest['customer'],
    items: CartItem[]
  ): Promise<CreateOrderResponse> {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer, items }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao criar pedido')
    }

    return result
  }

  /**
   * Valida dados do pedido antes de enviar
   */
  static validateOrderData(
    customer: CreateOrderRequest['customer'],
    items: CartItem[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!customer.name?.trim()) {
      errors.push('Nome é obrigatório')
    }

    if (!customer.email?.trim()) {
      errors.push('Email é obrigatório')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      errors.push('Email inválido')
    }

    if (!customer.cpf?.trim()) {
      errors.push('CPF é obrigatório')
    }

    if (!customer.whatsapp?.trim()) {
      errors.push('WhatsApp é obrigatório')
    }

    if (!customer.address.street?.trim()) {
      errors.push('Rua é obrigatória')
    }

    if (!customer.address.number?.trim()) {
      errors.push('Número é obrigatório')
    }

    if (!customer.address.city?.trim()) {
      errors.push('Cidade é obrigatória')
    }

    if (!customer.address.state?.trim()) {
      errors.push('Estado é obrigatório')
    }

    if (!customer.address.zipcode?.trim()) {
      errors.push('CEP é obrigatório')
    }

    if (items.length === 0) {
      errors.push('O carrinho está vazio')
    }

    items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade inválida`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

