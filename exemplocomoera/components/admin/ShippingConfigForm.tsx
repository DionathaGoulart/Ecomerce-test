'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  shippingConfigSchema,
  type ShippingConfigInput,
} from '@/lib/validations/shipping'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface ShippingConfigFormProps {
  config?: {
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
}

const regionTypeOptions = [
  { value: 'same_cep', label: 'Mesmo CEP' },
  { value: 'metro_sp', label: 'SP Região Metropolitana' },
  { value: 'sp_state', label: 'SP Interior' },
  { value: 'other_states', label: 'Outros Estados' },
  { value: 'custom', label: 'Personalizado' },
]

export default function ShippingConfigForm({ config }: ShippingConfigFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ShippingConfigInput>({
    resolver: zodResolver(shippingConfigSchema),
    defaultValues: config
      ? {
          name: config.name,
          region_type: config.region_type,
          state_code: config.state_code || '',
          cep_prefix: config.cep_prefix || '',
          base_cost_cents: config.base_cost_cents,
          delivery_days: config.delivery_days,
          weight_multiplier: config.weight_multiplier,
          min_weight_kg: config.min_weight_kg,
          is_active: config.is_active,
          priority: config.priority,
        }
      : {
          region_type: 'custom',
          base_cost_cents: 2000,
          delivery_days: 5,
          weight_multiplier: 0.1,
          min_weight_kg: 1.0,
          is_active: true,
          priority: 0,
        },
  })

  const regionType = watch('region_type')

  const onSubmit = async (data: ShippingConfigInput) => {
    setLoading(true)

    try {
      // Limpar campos vazios
      const cleanedData = {
        ...data,
        state_code: data.state_code || null,
        cep_prefix: data.cep_prefix || null,
      }

      const url = config ? `/api/admin/shipping/${config.id}` : '/api/admin/shipping'
      const method = config ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar configuração')
      }

      router.push('/admin/configuracoes/frete')
      router.refresh()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar configuração. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4 sm:space-y-6">
      <div>
        <Label htmlFor="name" className="text-sm sm:text-base text-white">
          Nome da Configuração *
        </Label>
        <Input
          id="name"
          {...register('name')}
          className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
          placeholder="Ex: SP Região Metropolitana"
        />
        {errors.name && (
          <p className="mt-1 text-xs sm:text-sm text-error-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="region_type" className="text-sm sm:text-base text-white">
          Tipo de Região *
        </Label>
        <select
          id="region_type"
          {...register('region_type')}
          className="mt-1 flex h-10 w-full rounded-md border border-header-border bg-header-bg px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {regionTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.region_type && (
          <p className="mt-1 text-xs sm:text-sm text-error-500">
            {errors.region_type.message}
          </p>
        )}
      </div>

      {(regionType === 'custom' || regionType === 'sp_state' || regionType === 'metro_sp') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="state_code" className="text-sm sm:text-base text-white">
              Código do Estado
            </Label>
            <Input
              id="state_code"
              {...register('state_code')}
              className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
              placeholder="SP"
              maxLength={2}
            />
            <p className="mt-1 text-xs text-white/70">Ex: SP, RJ, MG</p>
          </div>

          {regionType === 'metro_sp' && (
            <div>
              <Label htmlFor="cep_prefix" className="text-sm sm:text-base text-white">
                Prefixo do CEP
              </Label>
              <Input
                id="cep_prefix"
                {...register('cep_prefix')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="0"
                maxLength={1}
              />
              <p className="mt-1 text-xs text-white/70">Ex: 0 para região metropolitana</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="base_cost_cents" className="text-sm sm:text-base text-white">
            Custo Base (em centavos) *
          </Label>
          <Input
            id="base_cost_cents"
            type="number"
            {...register('base_cost_cents', { valueAsNumber: true })}
            className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
            placeholder="2000"
            min={0}
          />
          <p className="mt-1 text-xs text-white/70">Ex: 2000 = R$ 20,00</p>
          {errors.base_cost_cents && (
            <p className="mt-1 text-xs sm:text-sm text-error-500">
              {errors.base_cost_cents.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="delivery_days" className="text-sm sm:text-base text-white">
            Prazo de Entrega (dias) *
          </Label>
          <Input
            id="delivery_days"
            type="number"
            {...register('delivery_days', { valueAsNumber: true })}
            className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
            placeholder="5"
            min={1}
          />
          {errors.delivery_days && (
            <p className="mt-1 text-xs sm:text-sm text-error-500">
              {errors.delivery_days.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="weight_multiplier" className="text-sm sm:text-base text-white">
            Multiplicador de Peso (0-1) *
          </Label>
          <Input
            id="weight_multiplier"
            type="number"
            step="0.01"
            {...register('weight_multiplier', { valueAsNumber: true })}
            className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
            placeholder="0.1"
            min={0}
            max={1}
          />
          <p className="mt-1 text-xs text-white/70">
            Ex: 0.1 = 10% por kg extra acima do peso mínimo
          </p>
          {errors.weight_multiplier && (
            <p className="mt-1 text-xs sm:text-sm text-error-500">
              {errors.weight_multiplier.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="min_weight_kg" className="text-sm sm:text-base text-white">
            Peso Mínimo (kg) *
          </Label>
          <Input
            id="min_weight_kg"
            type="number"
            step="0.1"
            {...register('min_weight_kg', { valueAsNumber: true })}
            className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
            placeholder="1.0"
            min={0}
          />
          <p className="mt-1 text-xs text-white/70">
            Peso mínimo para aplicar o multiplicador
          </p>
          {errors.min_weight_kg && (
            <p className="mt-1 text-xs sm:text-sm text-error-500">
              {errors.min_weight_kg.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <Label htmlFor="priority" className="text-sm sm:text-base text-white">
            Prioridade *
          </Label>
          <Input
            id="priority"
            type="number"
            {...register('priority', { valueAsNumber: true })}
            className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-white/70">
            Maior número = maior prioridade na aplicação
          </p>
          {errors.priority && (
            <p className="mt-1 text-xs sm:text-sm text-error-500">
              {errors.priority.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            id="is_active"
            {...register('is_active')}
            className="h-4 w-4 rounded border-header-border bg-header-bg text-primary-500 focus:ring-primary-500"
          />
          <Label htmlFor="is_active" className="text-sm sm:text-base text-white cursor-pointer">
            Configuração ativa
          </Label>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90"
        >
          {loading ? 'Salvando...' : config ? 'Atualizar' : 'Criar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/configuracoes/frete')}
          className="w-full sm:w-auto text-sm sm:text-base border-header-border text-white hover:bg-white/10"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}

