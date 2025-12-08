/**
 * useCart - Hook para gerenciar carrinho de compras
 * 
 * Centraliza toda a lógica de manipulação do carrinho no localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { CART_STORAGE_KEY } from '@/lib/constants'
import type { CartItem } from '@/types/entities'

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isUpdatingRef = useRef(false)

  // Função para carregar carrinho do localStorage
  const loadCart = useCallback(() => {
    // Não recarregar se estiver atualizando
    if (isUpdatingRef.current) {
      return
    }
    
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as CartItem[]
        setCartItems(items)
      } else {
        setCartItems([])
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Escutar mudanças no localStorage (de outras abas apenas)
  // Não escutamos 'cart-updated' aqui porque isso causaria recarregamento desnecessário
  // O estado React já é atualizado automaticamente quando usamos setCartItems
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue !== e.oldValue) {
        // Só recarrega se veio de outra aba (storage event só dispara em outras abas)
        loadCart()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [loadCart])

  // Salvar no localStorage sempre que o carrinho mudar (mas não durante atualizações manuais)
  useEffect(() => {
    if (!isLoading && !isUpdatingRef.current) {
      try {
        const jsonString = JSON.stringify(cartItems)
        localStorage.setItem(CART_STORAGE_KEY, jsonString)
        
        // Disparar evento customizado para notificar outros componentes
        window.dispatchEvent(new Event('cart-updated'))
      } catch (error) {
        console.error('Erro ao salvar carrinho:', error)
      }
    }
  }, [cartItems, isLoading])

  const addItem = useCallback((item: CartItem) => {
    isUpdatingRef.current = true
    
    // Ler estado atual diretamente do localStorage para garantir que temos a versão mais recente
    let currentItems: CartItem[] = []
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        currentItems = JSON.parse(stored) as CartItem[]
      }
    } catch (error) {
      console.error('Erro ao ler localStorage:', error)
    }
    
    // Encontrar índice do item existente
    const existingIndex = currentItems.findIndex(
      (i) => i.productId === item.productId
    )
    
    let newItems: CartItem[]
    
    if (existingIndex >= 0) {
      // Atualiza item existente
      newItems = currentItems.map((existingItem, index) => {
        if (index === existingIndex) {
          // Criar novo objeto com todas as propriedades do item
          const updatedItem: CartItem = {
            productId: item.productId,
            quantity: item.quantity,
            personalizationImageUrl: item.personalizationImageUrl,
            personalizationImagePath: item.personalizationImagePath,
            personalizationImageFile: item.personalizationImageFile,
            personalizationDescription: item.personalizationDescription,
          }
          return updatedItem
        }
        return existingItem
      })
    } else {
      // Adiciona novo item
      newItems = [...currentItems, item]
    }
    
    // Salvar no localStorage PRIMEIRO
    try {
      const jsonString = JSON.stringify(newItems)
      localStorage.setItem(CART_STORAGE_KEY, jsonString)
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error)
      isUpdatingRef.current = false
      return
    }
    
    // Depois atualizar o estado React - criar cópia profunda para garantir nova referência
    // Criar cópia profunda usando JSON para garantir nova referência
    const newItemsCopy = JSON.parse(JSON.stringify(newItems)) as CartItem[]
    
    // Atualizar estado React
    setCartItems(newItemsCopy)
    
    // Disparar evento customizado imediatamente
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('cart-updated'))
    })
    
    // Disparar novamente após um pequeno delay para garantir
    setTimeout(() => {
      window.dispatchEvent(new Event('cart-updated'))
    }, 100)
    
    isUpdatingRef.current = false
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

