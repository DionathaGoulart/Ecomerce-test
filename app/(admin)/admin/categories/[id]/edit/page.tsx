import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryForm from '@/components/admin/CategoryForm'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !category) {
    notFound()
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Editar Categoria</h1>
      <CategoryForm category={category} />
    </div>
  )
}

