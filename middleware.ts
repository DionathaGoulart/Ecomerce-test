import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Atualizar sessão do usuário
  await supabase.auth.getUser()

  // Proteger rotas admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acesso à página de login e APIs sem autenticação
    if (
      request.nextUrl.pathname === '/admin/login' ||
      request.nextUrl.pathname.startsWith('/admin/api')
    ) {
      return response
    }

    // Tentar obter a sessão primeiro para ver se conseguimos ler os cookies
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // Verificar autenticação para rotas protegidas
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Log para debug
    console.log('🔒 Middleware - Rota:', request.nextUrl.pathname)
    const authCookie = request.cookies.get('sb-buqfssxanuvsxxhfpteg-auth-token')
    if (authCookie) {
      console.log('🔒 Middleware - Cookie auth encontrado')
      console.log('🔒 Middleware - Cookie value length:', authCookie.value?.length || 0)
      console.log('🔒 Middleware - Session data:', sessionData?.session ? 'OK' : 'Não encontrada')
      if (sessionError) {
        console.log('🔒 Middleware - Session error:', sessionError.message)
      }
      // Tentar ver o início do cookie para debug (primeiros 50 caracteres)
      const cookiePreview = authCookie.value?.substring(0, 50) || ''
      console.log('🔒 Middleware - Cookie preview:', cookiePreview)
    } else {
      console.log('🔒 Middleware - Cookie auth NÃO encontrado')
    }
    console.log('🔒 Middleware - Usuário:', user ? user.email : 'Não encontrado')
    console.log('🔒 Middleware - Erro:', authError ? authError.message : 'Nenhum')

    // Se não estiver autenticado, redirecionar para login
    if (!user || authError) {
      console.log('🔒 Middleware: Redirecionando para /admin/login')
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    console.log('✅ Middleware: Acesso permitido para', user.email)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
