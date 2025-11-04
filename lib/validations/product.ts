import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  price_cents: z.number().int().positive('Preço deve ser positivo'),
  image_url: z.string().url('URL da imagem inválida').optional(),
})

export const updateProductSchema = productSchema.partial().required({
  title: true,
  price_cents: true,
})

export type ProductInput = z.infer<typeof productSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
