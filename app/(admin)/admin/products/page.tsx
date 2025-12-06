'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import ProductFilters from '@/components/admin/ProductFilters'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import { Spinner } from '@/components/atoms/Spinner'

interface Product {
  id: string
  title: string
  description?: string | null
  price_cents: number
  image_url?: string | null
  category?: { name: string; slug: string } | null
}

export default function AdminProductsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const searchFilter = params.get('search')?.trim() || ''
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [searchFilter])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = searchFilter
        ? `/api/admin/products?search=${encodeURIComponent(searchFilter)}`
        : '/api/admin/products'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }

      const data = await response.json()
      setProducts(data)
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    // Recarregar produtos após deletar
    fetchProducts()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Produtos</h1>
        <Link href="/admin/products/new">
          <Button className="bg-primary-500 text-neutral-950 hover:opacity-90">
            Novo Produto
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <ProductFilters currentSearch={searchFilter} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-error-500">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
          >
            Tentar novamente
          </button>
        </div>
      ) : products.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-header-border bg-header-bg">
          <table className="min-w-full divide-y divide-header-border">
            <thead className="bg-header-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Imagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-header-border bg-header-bg">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        width={50}
                        height={50}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-white/10" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {product.title}
                    </div>
                    {product.description && (
                      <div className="text-sm text-white/70">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    {product.category?.name || 'Sem categoria'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                    {formatCurrency(product.price_cents)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-primary-500 hover:text-primary-400 mr-4 transition-colors"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton productId={product.id} onDelete={handleDelete} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/70">
            {searchFilter
              ? `Nenhum produto encontrado com "${searchFilter}".`
              : 'Nenhum produto cadastrado.'}
          </p>
          {!searchFilter && (
            <Link href="/admin/products/new">
              <Button className="mt-4 bg-primary-500 text-neutral-950 hover:opacity-90">
                Criar Primeiro Produto
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
