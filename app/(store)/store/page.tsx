import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/organisms/ProductCard'
import { Alert, AlertDescription } from '@/components/molecules/Alert'

export default async function StorePage() {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <Alert variant="destructive">
          <AlertDescription>Erro ao carregar produtos. Tente novamente mais tarde.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-900">
          Nossos Produtos
        </h1>
        <p className="mt-3 text-lg text-neutral-500">
          Escolha um produto e personalize do seu jeito
        </p>
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              href={`/store/products/${product.id}`}
              showDescription
              imagePriority={index < 3} // Prioriza as primeiras 3 imagens
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-neutral-500 text-lg">Nenhum produto disponível no momento.</p>
        </div>
      )}
    </div>
  )
}
