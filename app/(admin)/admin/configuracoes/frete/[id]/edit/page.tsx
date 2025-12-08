'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ShippingConfigForm from '@/components/admin/ShippingConfigForm'
import { Spinner } from '@/components/atoms/Spinner'

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

export default function EditShippingConfigPage() {
  const params = useParams()
  const id = params.id as string
  const [config, setConfig] = useState<ShippingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/shipping')
      if (!response.ok) {
        throw new Error('Erro ao carregar configuração')
      }

      const configs = await response.json()
      const foundConfig = configs.find((c: ShippingConfig) => c.id === id)

      if (!foundConfig) {
        throw new Error('Configuração não encontrada')
      }

      setConfig(foundConfig)
    } catch (err) {
      console.error('Erro ao buscar configuração:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
          Editar Configuração de Frete
        </h1>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
          Editar Configuração de Frete
        </h1>
        <div className="text-center py-12">
          <p className="text-error-500">{error || 'Configuração não encontrada'}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
        Editar Configuração de Frete
      </h1>
      <ShippingConfigForm config={config} />
    </div>
  )
}

