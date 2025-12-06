'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({ 
  productId,
  onDelete 
}: { 
  productId: string
  onDelete?: () => void
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao deletar produto')
      }

      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert(error instanceof Error ? error.message : 'Erro ao deletar produto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-error-500 hover:text-error-400 disabled:opacity-50 transition-colors"
    >
      {loading ? 'Deletando...' : 'Deletar'}
    </button>
  )
}

