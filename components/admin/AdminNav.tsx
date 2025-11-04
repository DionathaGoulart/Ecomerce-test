import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import LogoutButton from './LogoutButton'

export default async function AdminNav({
  user,
}: {
  user: { email?: string | null }
}) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-gray-900">
              Painel Administrativo
            </h1>
            <div className="flex gap-4">
              <a
                href="/admin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/admin/products"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Produtos
              </a>
              <a
                href="/admin/orders"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Pedidos
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
