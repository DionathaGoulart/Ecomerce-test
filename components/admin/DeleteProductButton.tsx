'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { canDelete, type UserRole } from '@/lib/utils/permissions'
import { useAuth } from '@/hooks/useAuth'

export default function DeleteProductButton({ 
  productId,
  onDelete 
}: { 
  productId: string
  onDelete?: () => void
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  if (!canDelete(user?.role as UserRole)) {
    return null
  }

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
        let errorMessage = 'Erro ao deletar produto'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch (parseError) {
          // Se não conseguir parsear JSON, usar o status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar produto. Tente novamente.'
      alert(errorMessage)
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

