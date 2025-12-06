import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
      // Trocar código por sessão
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?error=${encodeURIComponent(error.message)}`
        )
      }

      if (data.user) {
        // Redirecionar para página inicial ou minha conta
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/minha-conta`
        )
      }
    }

    // Iniciar OAuth com Google
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Erro ao iniciar login com Google' },
        { status: 400 }
      )
    }

    if (data.url) {
      return NextResponse.redirect(data.url)
    }

    return NextResponse.json(
      { error: 'Erro ao iniciar login com Google' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Erro no login Google:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

