import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default async function StorePage() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-center sm:px-8 lg:px-12">
        <p className="text-red-600">Erro ao carregar produtos</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          Nossos Produtos
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Escolha um produto e personalize do seu jeito
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
            >
              {product.image_url && (
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                )}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(product.price_cents)}
                  </span>
                  <Link href={`/store/products/${product.id}`}>
                    <Button size="sm">
                      Personalizar
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Nenhum produto disponível no momento.</p>
        </div>
      )}
    </div>
  )
}
