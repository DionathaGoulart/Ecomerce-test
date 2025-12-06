'use client'

import { useState, useEffect } from 'react'
import { Spinner } from '@/components/atoms/Spinner'

interface Stats {
  products: number
  orders: number
  pendingOrders: number
  paidOrders: number
  cancelledOrders: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/stats')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas')
      }

      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-center py-12">
          <p className="text-error-500">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-header-border bg-header-bg p-6">
          <h3 className="text-sm font-medium text-white/70">Total de Produtos</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {stats?.products || 0}
          </p>
        </div>

        <div className="rounded-xl border border-header-border bg-header-bg p-6">
          <h3 className="text-sm font-medium text-white/70">Total de Pedidos</h3>
          <p className="mt-2 text-3xl font-bold text-white">
            {stats?.orders || 0}
          </p>
        </div>

        <div className="rounded-xl border border-header-border bg-header-bg p-6">
          <h3 className="text-sm font-medium text-white/70">Pedidos Pendentes</h3>
          <p className="mt-2 text-3xl font-bold text-warning-500">
            {stats?.pendingOrders || 0}
          </p>
        </div>

        <div className="rounded-xl border border-header-border bg-header-bg p-6">
          <h3 className="text-sm font-medium text-white/70">Pedidos Pagos</h3>
          <p className="mt-2 text-3xl font-bold text-success-500">
            {stats?.paidOrders || 0}
          </p>
        </div>

        <div className="rounded-xl border border-header-border bg-header-bg p-6">
          <h3 className="text-sm font-medium text-white/70">Pedidos Cancelados</h3>
          <p className="mt-2 text-3xl font-bold text-error-500">
            {stats?.cancelledOrders || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
