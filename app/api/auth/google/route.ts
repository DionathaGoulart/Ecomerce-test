import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Função auxiliar para obter a URL base do app
function getAppUrl(request: NextRequest): string {
  // Prioridade: variável de ambiente > header do request > fallback
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Tentar obter do header (útil em produção)
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'

  if (host) {
    // Se for localhost, usar http, senão https
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')
    return isLocalhost ? `http://${host}` : `${protocol}://${host}`
  }

  // Fallback
  return process.env.NODE_ENV === 'production'
    ? 'https://ecomerce-alpha-ten.vercel.app'
    : 'http://localhost:3000'
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const redirectPath = searchParams.get('redirect')
    const appUrl = getAppUrl(request)

    if (code) {
      // Trocar código por sessão
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        return NextResponse.redirect(
          `${appUrl}/login?error=${encodeURIComponent(error.message)}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ''}`
        )
      }

      if (data.user) {
        // Redirecionar para o caminho solicitado ou para minha conta
        const finalRedirect = redirectPath
          ? (redirectPath.startsWith('http') ? redirectPath : `${appUrl}${redirectPath.startsWith('/') ? '' : '/'}${redirectPath}`)
          : `${appUrl}/minha-conta`

        return NextResponse.redirect(finalRedirect)
      }
    }

    // Iniciar OAuth com Google
    // Preservar o parâmetro redirect na URL de retorno
    const redirectTo = `${appUrl}/api/auth/google${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
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

