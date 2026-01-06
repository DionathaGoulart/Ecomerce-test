'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { seoSettingsSchema, type SEOSettingsInput } from '@/lib/validations/seo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/atoms/Spinner'
import { Textarea } from '@/components/ui/textarea'

export default function SEOSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SEOSettingsInput>({
    resolver: zodResolver(seoSettingsSchema),
  })

  const fetchSettings = async () => {
    try {
      setFetching(true)
      const response = await fetch('/api/admin/seo')
      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      const data = await response.json()
      setValue('site_title', data.site_title || 'E-commerce Personalizados')
      setValue('site_description', data.site_description || 'Produtos personalizados com qualidade')
      setValue('site_keywords', data.site_keywords || '')
      setValue('og_title', data.og_title || '')
      setValue('og_description', data.og_description || '')
      setValue('og_image_url', data.og_image_url || '')
      setValue('twitter_card', data.twitter_card || 'summary_large_image')
      setValue('twitter_title', data.twitter_title || '')
      setValue('twitter_description', data.twitter_description || '')
      setValue('twitter_image_url', data.twitter_image_url || '')
      setValue('canonical_url', data.canonical_url || '')
      setValue('robots_txt', data.robots_txt || '')
      setValue('google_analytics_id', data.google_analytics_id || '')
      setValue('google_tag_manager_id', data.google_tag_manager_id || '')
      setValue('facebook_pixel_id', data.facebook_pixel_id || '')
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

  const onSubmit = async (data: SEOSettingsInput) => {
    setLoading(true)

    try {
      const response = await fetch('/api/admin/seo', {
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

      alert('Configurações de SEO salvas com sucesso!')
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
          Configurações de SEO
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
        Configurações de SEO
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-6">
        {/* Informações Básicas */}
        <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Informações Básicas
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="site_title" className="text-sm sm:text-base text-white">
                Título do Site * (máx. 60 caracteres)
              </Label>
              <Input
                id="site_title"
                {...register('site_title')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="E-commerce Personalizados"
                maxLength={60}
              />
              {errors.site_title && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.site_title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="site_description" className="text-sm sm:text-base text-white">
                Descrição do Site * (máx. 160 caracteres)
              </Label>
              <Textarea
                id="site_description"
                {...register('site_description')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="Produtos personalizados com qualidade"
                maxLength={160}
                rows={3}
              />
              {errors.site_description && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.site_description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="site_keywords" className="text-sm sm:text-base text-white">
                Palavras-chave (separadas por vírgula)
              </Label>
              <Input
                id="site_keywords"
                {...register('site_keywords')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="produtos personalizados, madeira, customização"
              />
              {errors.site_keywords && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.site_keywords.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="canonical_url" className="text-sm sm:text-base text-white">
                URL Canônica
              </Label>
              <Input
                id="canonical_url"
                type="url"
                {...register('canonical_url')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="https://seusite.com.br"
              />
              {errors.canonical_url && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.canonical_url.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Open Graph (Facebook) */}
        <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Open Graph (Facebook)
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="og_title" className="text-sm sm:text-base text-white">
                OG Title (máx. 60 caracteres)
              </Label>
              <Input
                id="og_title"
                {...register('og_title')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="Deixe vazio para usar o título do site"
                maxLength={60}
              />
              {errors.og_title && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.og_title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="og_description" className="text-sm sm:text-base text-white">
                OG Description (máx. 160 caracteres)
              </Label>
              <Textarea
                id="og_description"
                {...register('og_description')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="Deixe vazio para usar a descrição do site"
                maxLength={160}
                rows={3}
              />
              {errors.og_description && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.og_description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="og_image_url" className="text-sm sm:text-base text-white">
                OG Image URL
              </Label>
              <Input
                id="og_image_url"
                type="url"
                {...register('og_image_url')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="https://seusite.com.br/og-image.jpg"
              />
              {errors.og_image_url && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.og_image_url.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Twitter */}
        <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Twitter Cards
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="twitter_card" className="text-sm sm:text-base text-white">
                Tipo de Card
              </Label>
              <select
                id="twitter_card"
                {...register('twitter_card')}
                className="mt-1 flex h-10 w-full rounded-md border border-header-border bg-header-bg px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
              {errors.twitter_card && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.twitter_card.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="twitter_title" className="text-sm sm:text-base text-white">
                Twitter Title (máx. 60 caracteres)
              </Label>
              <Input
                id="twitter_title"
                {...register('twitter_title')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="Deixe vazio para usar o título do site"
                maxLength={60}
              />
              {errors.twitter_title && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.twitter_title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="twitter_description" className="text-sm sm:text-base text-white">
                Twitter Description (máx. 160 caracteres)
              </Label>
              <Textarea
                id="twitter_description"
                {...register('twitter_description')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="Deixe vazio para usar a descrição do site"
                maxLength={160}
                rows={3}
              />
              {errors.twitter_description && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.twitter_description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="twitter_image_url" className="text-sm sm:text-base text-white">
                Twitter Image URL
              </Label>
              <Input
                id="twitter_image_url"
                type="url"
                {...register('twitter_image_url')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="https://seusite.com.br/twitter-image.jpg"
              />
              {errors.twitter_image_url && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.twitter_image_url.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Analytics e Tracking */}
        <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Analytics e Tracking
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="google_analytics_id" className="text-sm sm:text-base text-white">
                Google Analytics ID (G-XXXXXXXXXX)
              </Label>
              <Input
                id="google_analytics_id"
                {...register('google_analytics_id')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="G-XXXXXXXXXX"
              />
              {errors.google_analytics_id && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.google_analytics_id.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="google_tag_manager_id" className="text-sm sm:text-base text-white">
                Google Tag Manager ID (GTM-XXXXXXX)
              </Label>
              <Input
                id="google_tag_manager_id"
                {...register('google_tag_manager_id')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="GTM-XXXXXXX"
              />
              {errors.google_tag_manager_id && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.google_tag_manager_id.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="facebook_pixel_id" className="text-sm sm:text-base text-white">
                Facebook Pixel ID
              </Label>
              <Input
                id="facebook_pixel_id"
                {...register('facebook_pixel_id')}
                className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="123456789012345"
              />
              {errors.facebook_pixel_id && (
                <p className="mt-1 text-xs sm:text-sm text-error-500">
                  {errors.facebook_pixel_id.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Robots.txt */}
        <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            Robots.txt
          </h2>
          <div>
            <Label htmlFor="robots_txt" className="text-sm sm:text-base text-white">
              Conteúdo do robots.txt
            </Label>
            <Textarea
              id="robots_txt"
              {...register('robots_txt')}
              className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50 font-mono"
              placeholder="User-agent: *&#10;Allow: /"
              rows={6}
            />
            {errors.robots_txt && (
              <p className="mt-1 text-xs sm:text-sm text-error-500">
                {errors.robots_txt.message}
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
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin')}
            className="w-full sm:w-auto text-sm sm:text-base border-header-border text-white hover:bg-white/10"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

