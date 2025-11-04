import { z } from 'zod'

export const adminLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>
