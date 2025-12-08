'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/atoms/Spinner'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface ShippingConfig {
  id: string
  name: string
  region_type: 'same_cep' | 'metro_sp' | 'sp_state' | 'other_states' | 'custom'
  state_code?: string | null
  cep_prefix?: string | null
  base_cost_cents: number
  delivery_days: number
  weight_multiplier: number
  min_weight_kg: number
  is_active: boolean
  priority: number
}

interface ShippingSettings {
  origin_cep: string
  origin_state: string
  origin_city: string
  default_cost_cents: number
  default_delivery_days: number
}

const regionTypeLabels: Record<string, string> = {
  same_cep: 'Mesmo CEP',
  metro_sp: 'SP Região Metropolitana',
  sp_state: 'SP Interior',
  other_states: 'Outros Estados',
  custom: 'Personalizado',
}

export default function AdminShippingPage() {
  const router = useRouter()
  const [configs, setConfigs] = useState<ShippingConfig[]>([])
  const [settings, setSettings] = useState<ShippingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [configsResponse, settingsResponse] = await Promise.all([
        fetch('/api/admin/shipping'),
        fetch('/api/admin/shipping/settings'),
      ])

      if (!configsResponse.ok || !settingsResponse.ok) {
        throw new Error('Erro ao carregar configurações de frete')
      }

      const configsData = await configsResponse.json()
      const settingsData = await settingsResponse.json()

      setConfigs(configsData)
      setSettings(settingsData)
    } catch (err) {
      console.error('Erro ao buscar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/shipping/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar status')
      }

      fetchData()
    } catch (err) {
      console.error('Erro:', err)
      alert('Erro ao atualizar status. Tente novamente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta configuração?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/shipping/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar configuração')
      }

      fetchData()
    } catch (err) {
      console.error('Erro:', err)
      alert('Erro ao deletar configuração. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
          Configurações de Frete
        </h1>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
          Configurações de Frete
        </h1>
        <div className="text-center py-12">
          <p className="text-error-500">{error}</p>
          <button
            onClick={fetchData}
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
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Configurações de Frete
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full sm:w-auto text-sm sm:text-base border-header-border text-white hover:bg-white/10"
          >
            {showSettings ? 'Ocultar' : 'Mostrar'} Configurações Gerais
          </Button>
          <Link href="/admin/configuracoes/frete/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90">
              Nova Configuração
            </Button>
          </Link>
        </div>
      </div>

      {showSettings && settings && (
        <div className="mb-6 rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Configurações Gerais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-white/70 mb-1">CEP de Origem</p>
              <p className="text-sm font-medium text-white">{settings.origin_cep}</p>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">Cidade/Estado</p>
              <p className="text-sm font-medium text-white">
                {settings.origin_city} - {settings.origin_state}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">Custo Padrão</p>
              <p className="text-sm font-medium text-white">
                {formatCurrency(settings.default_cost_cents)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/70 mb-1">Prazo Padrão</p>
              <p className="text-sm font-medium text-white">
                {settings.default_delivery_days} dias
              </p>
            </div>
            <div>
              <Link href="/admin/configuracoes/frete/settings">
                <Button className="w-full text-sm bg-primary-500 text-neutral-950 hover:opacity-90">
                  Editar Configurações
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {configs.length > 0 ? (
        <>
          {/* Desktop: Tabela */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-header-border bg-header-bg">
            <table className="min-w-full divide-y divide-header-border">
              <thead className="bg-header-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Nome / Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Custo Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Prazo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Multiplicador Peso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-header-border bg-header-bg">
                {configs.map((config) => (
                  <tr key={config.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{config.name}</div>
                      <div className="text-xs text-white/70">
                        {regionTypeLabels[config.region_type] || config.region_type}
                        {config.state_code && ` - ${config.state_code}`}
                        {config.cep_prefix && ` (CEP: ${config.cep_prefix}*)`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {formatCurrency(config.base_cost_cents)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {config.delivery_days} dias
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {config.weight_multiplier > 0
                        ? `${(config.weight_multiplier * 100).toFixed(0)}% por kg extra`
                        : 'Não aplica'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(config.id, config.is_active)}
                        className={`text-xs px-2 py-1 rounded ${
                          config.is_active
                            ? 'bg-success-500/20 text-success-500'
                            : 'bg-error-500/20 text-error-500'
                        }`}
                      >
                        {config.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <Link
                        href={`/admin/configuracoes/frete/${config.id}/edit`}
                        className="text-primary-500 hover:text-primary-400 mr-4 transition-colors"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="text-error-500 hover:text-error-400 transition-colors"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className="rounded-xl border border-header-border bg-header-bg p-4"
              >
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white">{config.name}</h3>
                    <button
                      onClick={() => handleToggleActive(config.id, config.is_active)}
                      className={`text-xs px-2 py-1 rounded ${
                        config.is_active
                          ? 'bg-success-500/20 text-success-500'
                          : 'bg-error-500/20 text-error-500'
                      }`}
                    >
                      {config.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                  <div className="text-xs text-white/70 mb-2">
                    {regionTypeLabels[config.region_type] || config.region_type}
                    {config.state_code && ` - ${config.state_code}`}
                    {config.cep_prefix && ` (CEP: ${config.cep_prefix}*)`}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-white/70">Custo: </span>
                      <span className="text-white font-medium">
                        {formatCurrency(config.base_cost_cents)}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/70">Prazo: </span>
                      <span className="text-white font-medium">{config.delivery_days} dias</span>
                    </div>
                    {config.weight_multiplier > 0 && (
                      <div className="col-span-2">
                        <span className="text-white/70">Peso: </span>
                        <span className="text-white font-medium">
                          {(config.weight_multiplier * 100).toFixed(0)}% por kg extra
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/configuracoes/frete/${config.id}/edit`}
                    className="text-xs text-primary-500 hover:text-primary-400 transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="text-xs text-error-500 hover:text-error-400 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/70">Nenhuma configuração cadastrada.</p>
          <Link href="/admin/configuracoes/frete/new">
            <Button className="mt-4 bg-primary-500 text-neutral-950 hover:opacity-90">
              Criar Primeira Configuração
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}

