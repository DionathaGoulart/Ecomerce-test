import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({
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
    <div>
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">Editar Produto</h1>
      <ProductForm product={product} />
    </div>
  )
}
