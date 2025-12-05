import { z } from 'zod'

export const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipcode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
})

export const addressSchemaWithComplement = addressSchema.extend({
  complement: z.string().optional(),
})

export const customerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  address: addressSchemaWithComplement,
})

export const cartItemSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().positive('Quantidade deve ser positiva'),
  personalizationImageUrl: z.string().url('URL da imagem inválida').optional(),
  personalizationDescription: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
})

export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(cartItemSchema).min(1, 'Carrinho não pode estar vazio'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CustomerInput = z.infer<typeof customerSchema>
export type AddressInput = z.infer<typeof addressSchemaWithComplement>
export type CartItemInput = z.infer<typeof cartItemSchema>
