import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import ProductPersonalizeForm from '@/components/store/ProductPersonalizeForm'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Imagem do produto */}
        <div>
          {product.image_url ? (
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
              <Image
                src={product.image_url}
                alt={product.title}
                width={600}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center rounded-2xl bg-gray-50">
              <span className="text-gray-400">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Informações e formulário */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">{product.title}</h1>
          {product.description && (
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">{product.description}</p>
          )}
          <p className="mt-8 text-4xl font-semibold text-gray-900">
            {formatCurrency(product.price_cents)}
          </p>

          <div className="mt-12">
            <ProductPersonalizeForm productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
