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
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        disabled={loading}
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <Button onClick={handleUpdate} disabled={loading || status === currentStatus}>
        {loading ? 'Salvando...' : 'Atualizar'}
      </Button>
    </div>
  )
}
