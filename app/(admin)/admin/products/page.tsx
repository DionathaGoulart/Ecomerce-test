import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import ProductFilters from '@/components/admin/ProductFilters'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const searchFilter = params.search?.trim() || ''

  // Construir query com filtro opcional
  let query = supabaseAdmin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchFilter) {
    query = query.ilike('title', `%${searchFilter}%`)
  }

  const { data: products, error } = await query

  if (error) {
    console.error('Erro ao buscar produtos:', error)
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erro ao carregar produtos</p>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
        <Link href="/admin/products/new">
          <Button>Novo Produto</Button>
        </Link>
      </div>

      <div className="mb-6">
        <ProductFilters currentSearch={searchFilter} />
      </div>

      {products && products.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Imagem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product) => (
                <tr key={product.id}>
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
                      <div className="h-12 w-12 rounded bg-gray-200" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {product.title}
                    </div>
                    {product.description && (
                      <div className="text-sm text-gray-500">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(product.price_cents)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {searchFilter
              ? `Nenhum produto encontrado com "${searchFilter}".`
              : 'Nenhum produto cadastrado.'}
          </p>
          {!searchFilter && (
            <Link href="/admin/products/new">
              <Button className="mt-4">Criar Primeiro Produto</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
