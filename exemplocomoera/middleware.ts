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
      request.nextUrl.pathname.startsWith('/api')
    ) {
      return response
    }

    // Verificar autenticação para rotas protegidas
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Se não estiver autenticado, redirecionar para login
    if (!user || authError) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    // Verificar se tem acesso ao admin (admin, superadmin ou moderador)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'superadmin', 'moderador'].includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('error', 'Acesso negado. Apenas administradores podem acessar esta área.')
      return NextResponse.redirect(url)
    }
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
