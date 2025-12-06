'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteCategoryButton({ 
  categoryId,
  onDelete 
}: { 
  categoryId: string
  onDelete?: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar esta categoria?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar categoria')
      }

      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert(error instanceof Error ? error.message : 'Erro ao deletar categoria')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs sm:text-sm text-error-500 hover:text-error-400 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Deletando...' : 'Deletar'}
    </button>
  )
}

