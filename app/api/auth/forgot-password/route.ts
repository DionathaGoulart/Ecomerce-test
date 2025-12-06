import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = forgotPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    const { email } = validation.data
    const supabase = await createClient()

    // Enviar email de recuperação de senha
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      // Não expor se o email existe ou não por segurança
      return NextResponse.json(
        { message: 'Se o email existir, você receberá um link para redefinir sua senha' },
        { status: 200 }
      )
    }

    return NextResponse.json({
      message: 'Se o email existir, você receberá um link para redefinir sua senha',
    })
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

