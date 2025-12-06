'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { Home, Menu, X } from 'lucide-react'
import { canManageRoles, type UserRole } from '@/lib/utils/permissions'

export default function AdminNav({
  user,
}: {
  user: { email?: string | null; role?: UserRole }
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/products', label: 'Produtos' },
    { href: '/admin/orders', label: 'Pedidos' },
    { href: '/admin/categories', label: 'Categorias' },
    ...(canManageRoles(user.role) ? [{ href: '/admin/users', label: 'Cargos' }] : []),
  ]

  return (
    <>
      <header className="fixed top-2 sm:top-header-top left-0 right-0 z-40 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
        <div className="rounded-xl sm:rounded-2xl border border-header-border bg-header-bg px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo/Título à esquerda */}
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
              <h1 className="text-xs sm:text-sm md:text-base lg:text-xl font-bold text-white">
                Painel Admin
              </h1>
              
              {/* Nav no meio - Desktop */}
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

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Botões à direita - Desktop */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3 lg:gap-4">
              <span className="hidden lg:inline text-[10px] sm:text-xs text-white/70">
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

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-[73px] left-0 right-0 z-30 md:hidden bg-header-bg border-t border-header-border">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname?.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            
            {/* Botões de ação no mobile */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="px-4 py-2 text-xs text-white/70">
                {user.email}
              </div>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Voltar ao Site</span>
              </Link>
              <div className="px-4">
                <LogoutButton />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
