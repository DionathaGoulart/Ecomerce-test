'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Logo from '@/components/store/Logo'
import { ShoppingCart, User } from 'lucide-react'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: '/#home', label: 'Home' },
    { href: '/beneficios', label: 'Benefícios' },
    { href: '/como-funciona', label: 'Como Funciona' },
    { href: '/store', label: 'Catálogo' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A]">
      {/* Header fixo */}
      <header className="fixed top-[45px] left-0 right-0 z-40 px-96">
        <div className="rounded-2xl border border-[#3D3D3D] bg-[#212121] px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo à esquerda */}
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>

            {/* Nav no meio */}
            <nav className="flex items-center gap-4">
              {navItems.map((item) => {
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (item.href === '/#home') {
                    e.preventDefault()
                    
                    // Aguarda um frame para garantir que o DOM está pronto
                    requestAnimationFrame(() => {
                      const homeSection = document.getElementById('home')
                      if (homeSection) {
                        // Calcula a posição considerando o header fixo
                        const headerOffset = 120
                        const elementPosition = homeSection.offsetTop
                        const offsetPosition = elementPosition - headerOffset

                        window.scrollTo({
                          top: Math.max(0, offsetPosition),
                          behavior: 'smooth'
                        })
                      }
                    })
                  }
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleClick}
                    className="group flex items-center gap-1.5 px-5 py-3.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
                  >
                    <span>{item.label}</span>
                    <Image
                      src="/icons/right.svg"
                      alt=""
                      width={10}
                      height={10}
                      className="h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-90"
                    />
                  </Link>
                )
              })}
            </nav>

            {/* Botões à direita */}
            <div className="flex items-center gap-3">
              {/* Botão Minha Conta */}
              <Link
                href="/minha-conta"
                className="flex items-center gap-2 rounded-lg border border-[#E9EF33] bg-transparent px-5 py-3.5 text-xs font-medium text-[#E9EF33] transition-opacity hover:opacity-80"
              >
                <User className="h-4 w-4" />
                <span>Minha Conta</span>
              </Link>
              
              {/* Botão Carrinho */}
              <Link
                href="/store/cart"
                className="flex items-center gap-2 rounded-lg bg-[#E9EF33] px-5 py-3.5 text-xs font-medium text-[#121212] transition-opacity hover:opacity-90"
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
