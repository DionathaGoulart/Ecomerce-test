'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, type CategoryInput } from '@/lib/validations/category'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface CategoryFormProps {
  category?: {
    id: string
    name: string
    slug: string
    description?: string | null
  }
}

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          slug: category.slug,
          description: category.description || '',
        }
      : undefined,
  })

  // Gerar slug automaticamente a partir do nome
  const nameValue = watch('name')
  const slugValue = watch('slug')

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const onSubmit = async (data: CategoryInput) => {
    setLoading(true)

    try {
      // Gerar slug se não foi fornecido
      if (!data.slug && data.name) {
        data.slug = generateSlug(data.name)
      }

      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories'

      const method = category ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar categoria')
      }

      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar categoria. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="name" className="text-white">Nome *</Label>
        <Input
          id="name"
          {...register('name')}
          className="mt-1 bg-header-bg border-header-border text-white placeholder:text-white/50"
          placeholder="Canecas"
          onChange={(e) => {
            // Auto-gerar slug quando nome mudar (se slug estiver vazio ou for novo)
            if ((!slugValue || !category) && e.target.value) {
              const slug = generateSlug(e.target.value)
              setValue('slug', slug)
            }
          }}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="slug" className="text-white">Slug *</Label>
        <Input
          id="slug"
          {...register('slug')}
          className="mt-1 bg-header-bg border-header-border text-white placeholder:text-white/50"
          placeholder="canecas"
        />
        <p className="mt-1 text-xs text-white/70">
          URL amigável (gerado automaticamente se deixar vazio)
        </p>
        {errors.slug && (
          <p className="mt-1 text-sm text-error-500">{errors.slug.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-white">Descrição</Label>
        <textarea
          id="description"
          {...register('description')}
          className="mt-1 flex min-h-[100px] w-full rounded-md border border-header-border bg-header-bg px-3 py-2 text-sm text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          placeholder="Descrição da categoria..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-error-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-primary-500 text-neutral-950 hover:opacity-90"
        >
          {loading ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/categories')}
          className="border-header-border text-white hover:bg-white/10"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

