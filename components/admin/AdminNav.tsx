'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { Home } from 'lucide-react'

export default function AdminNav({
  user,
}: {
  user: { email?: string | null }
}) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Produtos' },
    { href: '/admin/orders', label: 'Pedidos' },
    { href: '/admin/categories', label: 'Categorias' },
  ]

  return (
    <header className="fixed top-2 sm:top-header-top left-0 right-0 z-40 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
      <div className="rounded-xl sm:rounded-2xl border border-header-border bg-header-bg px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Título à esquerda */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
            <h1 className="text-sm sm:text-base lg:text-xl font-bold text-white">
              Painel Admin
            </h1>
            
            {/* Nav no meio */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname?.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3.5 text-[10px] sm:text-xs font-medium transition-opacity hover:opacity-80 ${
                      isActive 
                        ? 'text-primary-500' 
                        : 'text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Botões à direita */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <span className="hidden sm:inline text-[10px] sm:text-xs text-white/70">
              {user.email}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-neutral-600 bg-transparent px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white transition-opacity hover:opacity-80"
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Voltar ao Site</span>
              <span className="sm:hidden">Site</span>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
