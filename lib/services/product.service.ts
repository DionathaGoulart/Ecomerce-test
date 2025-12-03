/**
 * Product Service - Lógica de negócio de produtos
 */

import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types/entities'

export class ProductService {
  /**
   * Busca todos os produtos
   */
  static async getAll(): Promise<Product[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Busca um produto por ID
   */
  static async getById(id: string): Promise<Product | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Busca múltiplos produtos por IDs
   */
  static async getByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return []

    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids)

    if (error) throw error
    return data || []
  }
}

