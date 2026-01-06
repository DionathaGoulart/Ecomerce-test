/**
 * Cart Service - Lógica de negócio do carrinho
 * 
 * Separa a lógica de negócio dos componentes.
 */

import type { CartItem, Product } from '@/types/entities'
import { formatCurrency } from '@/lib/utils'

export class CartService {
  /**
   * Calcula o total do carrinho em centavos
   */
  static calculateTotal(
    items: CartItem[],
    products: Record<string, Product>
  ): number {
    return items.reduce((sum, item) => {
      const product = products[item.productId]
      return sum + (product ? product.price_cents * item.quantity : 0)
    }, 0)
  }

  /**
   * Formata o total para exibição
   */
  static formatTotal(
    items: CartItem[],
    products: Record<string, Product>
  ): string {
    const total = this.calculateTotal(items, products)
    return formatCurrency(total)
  }

  /**
   * Valida se o carrinho está válido
   */
  static validateCart(items: CartItem[]): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (items.length === 0) {
      errors.push('O carrinho está vazio')
    }

    items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantidade inválida`)
      }
      if (!item.productId) {
        errors.push(`Item ${index + 1}: ID do produto não informado`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Cria um mapa de produtos a partir de uma lista
   */
  static createProductMap(products: Product[]): Record<string, Product> {
    const map: Record<string, Product> = {}
    products.forEach((product) => {
      map[product.id] = product
    })
    return map
  }
}

