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
      <div className="min-h-screen bg-gray-50">
        <main>{children}</main>
      </div>
    )
  }

  // Se tem usuário, renderizar com AdminNav (páginas protegidas)
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
