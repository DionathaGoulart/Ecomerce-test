import { z } from 'zod'

export const shippingConfigSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  region_type: z.enum(['same_cep', 'metro_sp', 'sp_state', 'other_states', 'custom'], {
    errorMap: () => ({ message: 'Tipo de região inválido' }),
  }),
  state_code: z.string().optional().nullable(),
  cep_prefix: z.string().optional().nullable(),
  base_cost_cents: z.number().int().min(0, 'Custo base deve ser maior ou igual a zero'),
  delivery_days: z.number().int().min(1, 'Prazo de entrega deve ser pelo menos 1 dia'),
  weight_multiplier: z.number().min(0).max(1, 'Multiplicador de peso deve estar entre 0 e 1').default(0.1),
  min_weight_kg: z.number().min(0).default(1.0),
  is_active: z.boolean().default(true),
  priority: z.number().int().default(0),
})

export type ShippingConfigInput = z.infer<typeof shippingConfigSchema>

export const shippingSettingsSchema = z.object({
  origin_cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  origin_state: z.string().length(2, 'Estado deve conter 2 caracteres'),
  origin_city: z.string().min(1, 'Cidade é obrigatória'),
  origin_street: z.string().min(1, 'Rua é obrigatória').optional(),
  origin_number: z.string().min(1, 'Número é obrigatório').optional(),
  origin_complement: z.string().optional().nullable(),
  origin_neighborhood: z.string().optional().nullable(),
  default_cost_cents: z.number().int().min(0, 'Custo padrão deve ser maior ou igual a zero'),
  default_delivery_days: z.number().int().min(1, 'Prazo padrão deve ser pelo menos 1 dia'),
})

export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>

