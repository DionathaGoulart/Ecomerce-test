'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'paid', label: 'Pagos' },
  { value: 'production', label: 'Em Produção' },
  { value: 'shipped', label: 'Saiu para Entrega' },
  { value: 'delivered', label: 'Entregues' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function OrderFilters({ currentStatus }: { currentStatus: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`/admin/orders?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={currentStatus === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleStatusChange(option.value)}
          className={`text-xs sm:text-sm ${
            currentStatus === option.value
              ? 'bg-primary-500 text-neutral-950 hover:opacity-90'
              : 'border-header-border text-white hover:bg-white/10'
          }`}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
