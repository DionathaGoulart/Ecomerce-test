'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Logo from '@/components/store/Logo'
import { ShoppingCart, User, Menu, X } from 'lucide-react'

import { smoothScrollTo } from '@/lib/utils/smoothScroll'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/#home', label: 'Home' },
    { href: '/#beneficios', label: 'Benefícios' },
    { href: '/#comofunciona', label: 'Como Funciona' },
    { href: '/store', label: 'Catálogo' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#121212]">
      {/* Header fixo */}
      <header className="fixed top-2 sm:top-[45px] left-0 right-0 z-40 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
        <div className="rounded-xl sm:rounded-2xl border border-[#3D3D3D] bg-[#212121] px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo à esquerda */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Logo />
            </Link>

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Nav no meio */}
            <nav className="hidden md:flex items-center gap-2 lg:gap-4">
              {navItems.map((item) => {
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (item.href === '/#home' || item.href === '/#beneficios' || item.href === '/#comofunciona') {
                    e.preventDefault()
                    e.stopPropagation()
                    
                    const sectionId = item.href.replace('/#', '')
                    const section = document.getElementById(sectionId)
                    
                    if (section) {
                      if (sectionId === 'beneficios') {
                        // Para benefícios, a seção está dentro de um container sticky
                        // Pega a posição exata usando getBoundingClientRect
                        const rect = section.getBoundingClientRect()
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                        const elementTop = rect.top + scrollTop
                        
                        // Scroll até a seção, uma rolagem a mais para baixo
                        const targetPosition = elementTop + 100
                        
                        smoothScrollTo(targetPosition, 1000)
                      } else {
                        // Para home e comofunciona, usa o método padrão
                        const isMobile = window.innerWidth < 768
                        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                        const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                        const elementPosition = section.offsetTop
                        const targetPosition = elementPosition - headerOffset
                        
                        smoothScrollTo(targetPosition, 1000)
                      }
                    }
                  }
                }
                
                // Para âncoras, usa <a> ao invés de Link para garantir scroll suave
                if (item.href.startsWith('/#')) {
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={handleClick}
                      className="group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 lg:py-3.5 text-[10px] sm:text-xs font-medium text-white transition-opacity hover:opacity-80"
                    >
                      <span>{item.label}</span>
                      <Image
                        src="/icons/right.svg"
                        alt=""
                        width={10}
                        height={10}
                        className="h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-90"
                      />
                    </a>
                  )
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              {/* Botão Minha Conta */}
              <Link
                href="/minha-conta"
                className="flex items-center gap-1 sm:gap-2 rounded-lg border border-[#E9EF33] bg-transparent px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2.5 lg:py-3.5 text-[10px] sm:text-xs font-medium text-[#E9EF33] transition-opacity hover:opacity-80"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Minha Conta</span>
              </Link>
              
              {/* Botão Carrinho */}
              <Link
                href="/store/cart"
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-[#E9EF33] px-2 sm:px-3 lg:px-5 py-1.5 sm:py-2.5 lg:py-3.5 text-[10px] sm:text-xs font-medium text-[#121212] transition-opacity hover:opacity-90"
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Carrinho</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-[73px] left-0 right-0 z-30 md:hidden bg-[#212121] border-t border-[#3D3D3D]">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const handleMobileClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                setMobileMenuOpen(false)
                if (item.href === '/#home' || item.href === '/#beneficios' || item.href === '/#comofunciona') {
                  e.preventDefault()
                  const sectionId = item.href.replace('/#', '')
                  const section = document.getElementById(sectionId)
                  if (section) {
                    if (sectionId === 'beneficios') {
                      // Para benefícios, a seção está dentro de um container sticky
                      // Pega a posição exata usando getBoundingClientRect
                      const rect = section.getBoundingClientRect()
                      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                      const elementTop = rect.top + scrollTop
                      
                      // Scroll até a seção, descontando apenas um pequeno offset
                      const targetPosition = elementTop - 100
                      
                      smoothScrollTo(targetPosition, 1000)
                    } else {
                      // Para home e comofunciona, usa o método padrão
                      const isMobile = window.innerWidth < 768
                      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                      const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                      const elementPosition = section.offsetTop
                      const targetPosition = elementPosition - headerOffset
                      
                      smoothScrollTo(targetPosition, 1000)
                    }
                  }
                }
              }
              
              if (item.href.startsWith('/#')) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={handleMobileClick}
                    className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {item.label}
                  </a>
                )
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
      
      {/* Main com container padronizado */}
      <main className="flex-1 pt-16 sm:pt-24 md:pt-32 relative px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
        {children}
      </main>
    </div>
  )
}
