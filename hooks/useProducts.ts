/**
 * useProducts - Hook para buscar produtos
 */

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/entities'

interface UseProductsOptions {
  productIds?: string[]
  enabled?: boolean
}

export function useProducts(options: UseProductsOptions = {}) {
  const { productIds, enabled = true } = options
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return

    const fetchProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supabase = createClient()
        let query = supabase.from('products').select('*')

        if (productIds && productIds.length > 0) {
          query = query.in('id', productIds)
        }

        const { data, error: fetchError } = await query.order('created_at', {
          ascending: false,
        })

        if (fetchError) throw fetchError

        setProducts(data || [])
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro desconhecido')
        setError(error)
        console.error('Erro ao buscar produtos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [productIds, enabled])

  return { products, isLoading, error }
}

