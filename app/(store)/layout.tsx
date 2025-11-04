'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex h-20 items-center justify-between">
            <Link 
              href="/store" 
              className="text-2xl font-semibold tracking-tight text-gray-900 transition-opacity hover:opacity-80"
            >
              Minha Loja
            </Link>
            <nav className="flex gap-8">
              <Link
                href="/store"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/store'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Produtos
              </Link>
              <Link
                href="/store/cart"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/store/cart'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Carrinho
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
