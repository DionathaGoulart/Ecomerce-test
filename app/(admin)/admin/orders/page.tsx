'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import OrderFilters from '@/components/admin/OrderFilters'
import { Spinner } from '@/components/atoms/Spinner'

const statusLabels: Record<string, string> = {
  checkout: 'Em Checkout',
  pending: 'Pendente',
  paid: 'Pago',
  production: 'Em Produção',
  shipped: 'Saiu para Entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

const statusColors: Record<string, string> = {
  checkout: 'bg-neutral-500/20 text-neutral-500 border border-neutral-500/30',
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

  const fetchOrders = useCallback(async () => {
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
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Pedidos</h1>
        <div className="w-full sm:w-auto">
          <OrderFilters currentStatus={statusFilter} />
        </div>
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
        <>
          {/* Desktop: Tabela */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-header-border bg-header-bg">
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
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.status] || statusColors.pending
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

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-header-border bg-header-bg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      #{order.order_number}
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm")}
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.status] || statusColors.pending
                      }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-white/70">Cliente</div>
                    <div className="text-sm font-medium text-white">
                      {order.profile?.full_name || '-'}
                    </div>
                    <div className="text-xs text-white/70">
                      {order.profile?.email || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/70">Total</div>
                    <div className="text-base font-semibold text-white">
                      {formatCurrency(order.total_cents)}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
                    >
                      Ver Detalhes →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
