import { z } from 'zod'

export const seoSettingsSchema = z.object({
  site_title: z.string().min(1, 'Título do site é obrigatório').max(60, 'Título deve ter no máximo 60 caracteres'),
  site_description: z.string().min(1, 'Descrição é obrigatória').max(160, 'Descrição deve ter no máximo 160 caracteres'),
  site_keywords: z.string().optional().nullable(),
  og_title: z.string().max(60, 'OG Title deve ter no máximo 60 caracteres').optional().nullable(),
  og_description: z.string().max(160, 'OG Description deve ter no máximo 160 caracteres').optional().nullable(),
  og_image_url: z.string().url('URL da imagem inválida').optional().nullable().or(z.literal('')),
  twitter_card: z.enum(['summary', 'summary_large_image']).optional().default('summary_large_image'),
  twitter_title: z.string().max(60, 'Twitter Title deve ter no máximo 60 caracteres').optional().nullable(),
  twitter_description: z.string().max(160, 'Twitter Description deve ter no máximo 160 caracteres').optional().nullable(),
  twitter_image_url: z.string().url('URL da imagem inválida').optional().nullable().or(z.literal('')),
  canonical_url: z.string().url('URL canônica inválida').optional().nullable().or(z.literal('')),
  robots_txt: z.string().optional().nullable(),
  google_analytics_id: z.string().optional().nullable(),
  google_tag_manager_id: z.string().optional().nullable(),
  facebook_pixel_id: z.string().optional().nullable(),
})

export type SEOSettingsInput = z.infer<typeof seoSettingsSchema>

