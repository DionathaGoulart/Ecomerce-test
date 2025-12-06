import { createClient } from '@/lib/supabase/server'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar usuário, mas não redirecionar aqui
  // O middleware já cuida da proteção das rotas
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Se não tem usuário (página de login), renderizar sem AdminNav
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#060606]">
        <main className="flex-1 relative px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
          {children}
        </main>
      </div>
    )
  }

  // Buscar perfil para obter o role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Se tem usuário, renderizar com AdminNav (páginas protegidas)
  return (
    <div className="flex min-h-screen flex-col bg-[#060606]">
      <AdminNav user={{ email: user.email, role: profile?.role || 'user' }} />
      <main className="flex-1 relative px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96 pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-36 pb-8 sm:pb-12">
        {children}
      </main>
    </div>
  )
}
