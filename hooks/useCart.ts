/**
 * useCart - Hook para gerenciar carrinho de compras
 * 
 * Centraliza toda a lógica de manipulação do carrinho no localStorage.
 */

import { useState, useEffect, useCallback } from 'react'
import { CART_STORAGE_KEY } from '@/lib/constants'
import type { CartItem } from '@/types/entities'

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar carrinho do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as CartItem[]
        setCartItems(items)
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Salvar no localStorage sempre que o carrinho mudar
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      } catch (error) {
        console.error('Erro ao salvar carrinho:', error)
      }
    }
  }, [cartItems, isLoading])

  const addItem = useCallback((item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId
      )
      
      if (existingIndex >= 0) {
        // Atualiza item existente
        const updated = [...prev]
        updated[existingIndex] = item
        return updated
      }
      
      // Adiciona novo item
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }, [removeItem])

  const clearCart = useCallback(() => {
    setCartItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  const getItemCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])

  const getTotalItems = useCallback(() => {
    return cartItems.length
  }, [cartItems])

  return {
    cartItems,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalItems,
  }
}

