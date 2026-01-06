'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const statuses = [
  { value: 'pending', label: 'Pendente' },
  { value: 'paid', label: 'Pago' },
  { value: 'production', label: 'Em Produção' },
  { value: 'shipped', label: 'Saiu para Entrega' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

interface UpdateOrderStatusProps {
  orderId: string
  currentStatus: string
}

export default function UpdateOrderStatus({
  orderId,
  currentStatus,
}: UpdateOrderStatusProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      router.refresh()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar status do pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="flex-1 sm:flex-none rounded-md border border-header-border bg-header-bg px-3 py-2 text-xs sm:text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        disabled={loading}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <Button 
        onClick={handleUpdate} 
        disabled={loading || status === currentStatus}
        className="w-full sm:w-auto text-xs sm:text-sm"
      >
        {loading ? 'Salvando...' : 'Atualizar'}
      </Button>
    </div>
  )
}
