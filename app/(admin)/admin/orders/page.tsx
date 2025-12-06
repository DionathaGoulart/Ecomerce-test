'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import OrderFilters from '@/components/admin/OrderFilters'
import { Spinner } from '@/components/atoms/Spinner'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  production: 'Em Produção',
  shipped: 'Saiu para Entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning-500/20 text-warning-500 border border-warning-500/30',
  paid: 'bg-success-500/20 text-success-500 border border-success-500/30',
  production: 'bg-info-500/20 text-info-500 border border-info-500/30',
  shipped: 'bg-primary-500/20 text-primary-500 border border-primary-500/30',
  delivered: 'bg-success-500/20 text-success-500 border border-success-500/30',
  cancelled: 'bg-error-500/20 text-error-500 border border-error-500/30',
}

interface Order {
  id: string
  order_number: string
  user_id: string
  total_cents: number
  status: string
  created_at: string
  profile?: {
    email: string
    full_name: string | null
  } | null
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'all'
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = statusFilter && statusFilter !== 'all'
        ? `/api/admin/orders?status=${encodeURIComponent(statusFilter)}`
        : '/api/admin/orders'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pedidos')
      }

      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Pedidos</h1>
        <OrderFilters currentStatus={statusFilter} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-error-500">{error}</p>
          <button
            onClick={fetchOrders}
            className="mt-4 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
          >
            Tentar novamente
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-header-border bg-header-bg">
          <table className="min-w-full divide-y divide-header-border">
            <thead className="bg-header-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-header-border bg-header-bg">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                    #{order.order_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {order.profile?.full_name || '-'}
                    </div>
                    <div className="text-sm text-white/70">
                      {order.profile?.email || '-'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                    {formatCurrency(order.total_cents)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        statusColors[order.status] || statusColors.pending
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-white/70">
                    {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/70">
            {statusFilter && statusFilter !== 'all'
              ? `Nenhum pedido encontrado com status "${statusLabels[statusFilter] || statusFilter}".`
              : 'Nenhum pedido encontrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
