'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton'
import { Spinner } from '@/components/atoms/Spinner'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/categories')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias')
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Erro ao buscar categorias:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    fetchCategories()
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Categorias</h1>
        <Link href="/admin/categories/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90">
            Nova Categoria
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-error-500">{error}</p>
          <button
            onClick={fetchCategories}
            className="mt-4 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
          >
            Tentar novamente
          </button>
        </div>
      ) : categories.length > 0 ? (
        <>
          {/* Desktop: Tabela */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-header-border bg-header-bg">
            <table className="min-w-full divide-y divide-header-border">
              <thead className="bg-header-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-header-border bg-header-bg">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {category.description || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-primary-500 hover:text-primary-400 mr-4 transition-colors"
                      >
                        Editar
                      </Link>
                      <DeleteCategoryButton categoryId={category.id} onDelete={handleDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-xl border border-header-border bg-header-bg p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-white">
                    {category.name}
                  </h3>
                  <div className="text-xs text-white/70 mt-1">
                    Slug: {category.slug}
                  </div>
                  {category.description && (
                    <div className="text-xs text-white/70 mt-2">
                      {category.description}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="text-xs text-primary-500 hover:text-primary-400 transition-colors"
                  >
                    Editar
                  </Link>
                  <DeleteCategoryButton categoryId={category.id} onDelete={handleDelete} />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/70">Nenhuma categoria cadastrada.</p>
          <Link href="/admin/categories/new">
            <Button className="mt-4 bg-primary-500 text-neutral-950 hover:opacity-90">
              Criar Primeira Categoria
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
