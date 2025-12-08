'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shippingSettingsSchema, type ShippingSettingsInput } from '@/lib/validations/shipping'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/atoms/Spinner'

export default function ShippingSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ShippingSettingsInput>({
    resolver: zodResolver(shippingSettingsSchema),
  })

  const fetchSettings = async () => {
    try {
      setFetching(true)
      const response = await fetch('/api/admin/shipping/settings')
      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      const data = await response.json()
      setValue('origin_cep', data.origin_cep || '01310100')
      setValue('origin_state', data.origin_state || 'SP')
      setValue('origin_city', data.origin_city || 'São Paulo')
      setValue('origin_street', data.origin_street || '')
      setValue('origin_number', data.origin_number || '')
      setValue('origin_complement', data.origin_complement || '')
      setValue('origin_neighborhood', data.origin_neighborhood || '')
      setValue('default_cost_cents', data.default_cost_cents || 2000)
      setValue('default_delivery_days', data.default_delivery_days || 5)
    } catch (err) {
      console.error('Erro ao buscar configurações:', err)
      alert('Erro ao carregar configurações. Tente novamente.')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: ShippingSettingsInput) => {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/shipping/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar configurações')
      }

      router.push('/admin/configuracoes/frete')
      router.refresh()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div>
        <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
          Configurações Gerais de Frete
        </h1>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
        Configurações Gerais de Frete
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="origin_cep" className="text-sm sm:text-base text-white">
              CEP de Origem *
            </Label>
            <Input
              id="origin_cep"
              {...register('origin_cep')}
              className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
              placeholder="01310100"
              maxLength={8}
            />
            {errors.origin_cep && (
              <p className="mt-1 text-xs sm:text-sm text-error-500">
                {errors.origin_cep.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="origin_state" className="text-sm sm:text-base text-white">
              Estado de Origem *
            </Label>
            <Input
              id="origin_state"
              {...register('origin_state')}
              className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
              placeholder="SP"
              maxLength={2}
            />
            {errors.origin_state && (
              <p className="mt-1 text-xs sm:text-sm text-error-500">
                {errors.origin_state.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="origin_city" className="text-sm sm:text-base text-white">
            Cidade de Origem *
          </Label>
          <Input
            id="origin_city"
            {...register('origin_city')}
            className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
            placeholder="São Paulo"
          />
          {errors.origin_city && (
            <p className="mt-1 text-xs sm:text-sm text-error-500">
              {errors.origin_city.message}
            </p>
          )}
        </div>

        <div className="border-t border-header-border pt-4 sm:pt-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Endereço Completo da Sede
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="origin_street" className="text-sm sm:text-base text-white">
                Rua
              </Label>
              <Input
                id="origin_street"
                {...register('origin_street')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="R. Manoel Fernandes Pinheiro"
              />
              {errors.origin_street && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.origin_street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="origin_number" className="text-sm sm:text-base text-white">
                  Número
                </Label>
                <Input
                  id="origin_number"
                  {...register('origin_number')}
                  className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                  placeholder="162"
                />
                {errors.origin_number && (
                  <p className="mt-1 text-xs sm:text-sm text-error-500">
                    {errors.origin_number.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="origin_neighborhood" className="text-sm sm:text-base text-white">
                  Bairro
                </Label>
                <Input
                  id="origin_neighborhood"
                  {...register('origin_neighborhood')}
                  className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                  placeholder="Restinga"
                />
                {errors.origin_neighborhood && (
                  <p className="mt-1 text-xs sm:text-sm text-error-500">
                    {errors.origin_neighborhood.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="origin_complement" className="text-sm sm:text-base text-white">
                Complemento
              </Label>
              <Input
                id="origin_complement"
                {...register('origin_complement')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="Opcional"
              />
              {errors.origin_complement && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.origin_complement.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <Label htmlFor="default_cost_cents" className="text-sm sm:text-base text-white">
              Custo Padrão (em centavos) *
            </Label>
            <Input
              id="default_cost_cents"
              type="number"
              {...register('default_cost_cents', { valueAsNumber: true })}
              className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
              placeholder="2000"
              min={0}
            />
            <p className="mt-1 text-xs text-white/70">
              Ex: 2000 = R$ 20,00
            </p>
            {errors.default_cost_cents && (
              <p className="mt-1 text-xs sm:text-sm text-error-500">
                {errors.default_cost_cents.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="default_delivery_days" className="text-sm sm:text-base text-white">
              Prazo Padrão (dias) *
            </Label>
            <Input
              id="default_delivery_days"
              type="number"
              {...register('default_delivery_days', { valueAsNumber: true })}
              className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
              placeholder="5"
              min={1}
            />
            {errors.default_delivery_days && (
              <p className="mt-1 text-xs sm:text-sm text-error-500">
                {errors.default_delivery_days.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90"
          >
            {loading ? 'Salvando...' : 'Salvar'}
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
    </div>
  )
}

