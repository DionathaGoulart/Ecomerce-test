'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/store/Logo'
import { Home, Sparkles, HelpCircle, Package, ShoppingCart, User } from 'lucide-react'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/beneficios', label: 'Benefícios', icon: Sparkles },
    { href: '/como-funciona', label: 'Como Funciona', icon: HelpCircle },
    { href: '/store', label: 'Catálogo', icon: Package },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#121212]">
      {/* Header fixo */}
      <header className="fixed top-[45px] left-0 right-0 z-40 px-96">
        <div className="rounded-2xl border border-[#3D3D3D] bg-[#212121] p-4">
          <div className="flex items-center justify-between">
            {/* Logo à esquerda */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Nav no meio */}
            <nav className="flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                  >
                    <span>{item.label}</span>
                    <Icon className="h-4 w-4" />
                  </Link>
                )
              })}
            </nav>

            {/* Botões à direita */}
            <div className="flex items-center gap-3">
              {/* Botão Minha Conta */}
              <Link
                href="/minha-conta"
                className="flex items-center gap-2 rounded-lg border border-[#E9EF33] bg-transparent px-4 py-2 text-xs font-medium text-[#E9EF33] transition-opacity hover:opacity-80"
              >
                <User className="h-4 w-4" />
                <span>Minha Conta</span>
              </Link>
              
              {/* Botão Carrinho */}
              <Link
                href="/store/cart"
                className="flex items-center gap-2 rounded-lg bg-[#E9EF33] px-4 py-2 text-xs font-medium text-[#121212] transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Carrinho</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main com container padronizado */}
      <main className="flex-1 pt-32 relative px-96">
        {children}
      </main>
    </div>
  )
}
