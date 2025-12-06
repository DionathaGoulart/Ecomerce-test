import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { password } = validation.data
    const supabase = await createClient()

    // Verificar se há uma sessão válida (necessária para reset de senha)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Link inválido ou expirado. Por favor, solicite um novo link de recuperação de senha.' },
        { status: 401 }
      )
    }

    // Atualizar senha
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      // Traduzir mensagens de erro comuns
      let errorMessage = 'Erro ao redefinir senha'
      
      if (error.message.includes('Auth session missing') || error.message.includes('session')) {
        errorMessage = 'Link inválido ou expirado. Por favor, solicite um novo link de recuperação de senha.'
      } else if (error.message.includes('expired')) {
        errorMessage = 'Este link expirou. Por favor, solicite um novo link de recuperação de senha.'
      } else if (error.message.includes('invalid')) {
        errorMessage = 'Link inválido. Por favor, verifique o link ou solicite um novo.'
      } else {
        errorMessage = error.message
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Senha redefinida com sucesso',
    })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

