'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import Logo from '@/components/store/Logo'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { Spinner } from '@/components/atoms/Spinner'

import { smoothScrollTo } from '@/lib/utils/smoothScroll'
import { CART_STORAGE_KEY } from '@/lib/constants'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, loading, refresh } = useAuth()
  const { cartItems } = useCart()
  const [cartItemCount, setCartItemCount] = useState(0)
  
  // Função para atualizar contador do carrinho (quantidade de produtos únicos)
  const updateCartCount = useCallback(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored)
        // Contar produtos únicos, não a soma das quantidades
        setCartItemCount(items.length)
      } else {
        setCartItemCount(0)
      }
    } catch (error) {
      console.error('Erro ao atualizar contador do carrinho:', error)
    }
  }, [])

  // Atualizar quando cartItems mudar (do hook useCart)
  // Contar produtos únicos, não a soma das quantidades
  useEffect(() => {
    setCartItemCount(cartItems.length)
  }, [cartItems])

  // Escutar mudanças no carrinho de outros componentes
  useEffect(() => {
    window.addEventListener('cart-updated', updateCartCount)
    window.addEventListener('storage', updateCartCount)

    // Atualizar imediatamente ao montar
    updateCartCount()

    return () => {
      window.removeEventListener('cart-updated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [updateCartCount])

  // Escutar eventos customizados de mudança de auth
  useEffect(() => {
    const handleAuthChange = () => {
      refresh()
    }
    
    window.addEventListener('auth-state-changed', handleAuthChange)
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange)
    }
  }, [refresh])

  const navItems = [
    { href: '/#home', label: 'Home' },
    { href: '/#beneficios', label: 'Benefícios' },
    { href: '/#comofunciona', label: 'Como Funciona' },
    { href: '/#catalogo', label: 'Catálogo' },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#060606]">
      {/* Header fixo */}
      <header className="fixed top-2 sm:top-header-top left-0 right-0 z-40 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
        <div className="rounded-xl sm:rounded-2xl border border-header-border bg-header-bg px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
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
                  if (item.href === '/#home' || item.href === '/#beneficios' || item.href === '/#comofunciona' || item.href === '/#catalogo') {
                    e.preventDefault()
                    e.stopPropagation()
                    
                    const sectionId = item.href.replace('/#', '')
                    
                    const scrollToSection = () => {
                      // Aguardar um pouco para garantir que o DOM está pronto
                      setTimeout(() => {
                        const section = document.getElementById(sectionId)
                        if (section) {
                          if (sectionId === 'beneficios') {
                            const rect = section.getBoundingClientRect()
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                            const elementTop = rect.top + scrollTop
                            const targetPosition = elementTop + 100
                            smoothScrollTo(targetPosition, 1000)
                          } else if (sectionId === 'catalogo') {
                            // Para catálogo, usar getBoundingClientRect porque está em container separado
                            const rect = section.getBoundingClientRect()
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                            const elementTop = rect.top + scrollTop
                            const isMobile = window.innerWidth < 768
                            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                            const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                            const targetPosition = elementTop - headerOffset
                            smoothScrollTo(targetPosition, 1000)
                          } else {
                            const isMobile = window.innerWidth < 768
                            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                            const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                            const elementPosition = section.offsetTop
                            const targetPosition = elementPosition - headerOffset
                            smoothScrollTo(targetPosition, 1000)
                          }
                        } else {
                          // Se não encontrou a seção, tentar novamente após mais tempo
                          setTimeout(() => {
                            const retrySection = document.getElementById(sectionId)
                            if (retrySection) {
                              if (sectionId === 'catalogo') {
                                // Para catálogo, usar getBoundingClientRect
                                const rect = retrySection.getBoundingClientRect()
                                const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                                const elementTop = rect.top + scrollTop
                                const isMobile = window.innerWidth < 768
                                const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                                const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                                const targetPosition = elementTop - headerOffset
                                smoothScrollTo(targetPosition, 1000)
                              } else {
                                const isMobile = window.innerWidth < 768
                                const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                                const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                                const elementPosition = retrySection.offsetTop
                                const targetPosition = elementPosition - headerOffset
                                smoothScrollTo(targetPosition, 1000)
                              }
                            }
                          }, 300)
                        }
                      }, pathname !== '/' ? 500 : 200)
                    }
                    
                    // Se não estiver na página home, navegar primeiro
                    if (pathname !== '/') {
                      router.push('/')
                      scrollToSection()
                    } else {
                      // Já está na home, fazer scroll direto
                      scrollToSection()
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
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {mobileMenuOpen && (
        <div className="fixed top-[73px] left-0 right-0 z-30 md:hidden bg-header-bg border-t border-header-border">
          <nav className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const handleMobileClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                setMobileMenuOpen(false)
                if (item.href === '/#home' || item.href === '/#beneficios' || item.href === '/#comofunciona' || item.href === '/#catalogo') {
                  e.preventDefault()
                  const sectionId = item.href.replace('/#', '')
                  
                  // Se não estiver na página home, navegar primeiro
                  if (pathname !== '/') {
                    router.push('/')
                    // Aguardar a navegação e depois fazer scroll
                    setTimeout(() => {
                      const section = document.getElementById(sectionId)
                      if (section) {
                        if (sectionId === 'beneficios') {
                          const rect = section.getBoundingClientRect()
                          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                          const elementTop = rect.top + scrollTop
                          const targetPosition = elementTop - 100
                          smoothScrollTo(targetPosition, 1000)
                        } else if (sectionId === 'catalogo') {
                          // Para catálogo, usar getBoundingClientRect porque está em container separado
                          const rect = section.getBoundingClientRect()
                          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                          const elementTop = rect.top + scrollTop
                          const isMobile = window.innerWidth < 768
                          const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                          const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                          const targetPosition = elementTop - headerOffset
                          smoothScrollTo(targetPosition, 1000)
                        } else {
                          const isMobile = window.innerWidth < 768
                          const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                          const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                          const elementPosition = section.offsetTop
                          const targetPosition = elementPosition - headerOffset
                          smoothScrollTo(targetPosition, 1000)
                        }
                      }
                    }, pathname !== '/' ? 500 : 200)
                  } else {
                    // Já está na home, fazer scroll direto
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
                      } else if (sectionId === 'catalogo') {
                        // Para catálogo, usar getBoundingClientRect porque está em container separado
                        const rect = section.getBoundingClientRect()
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                        const elementTop = rect.top + scrollTop
                        const isMobile = window.innerWidth < 768
                        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                        const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                        const targetPosition = elementTop - headerOffset
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
            
            {/* Botões de Ação no Mobile */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <Link
                href={user ? "/minha-conta" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <User className="h-4 w-4" />
                <span>{user ? "Minha Conta" : "Login"}</span>
              </Link>
              
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Carrinho</span>
                {cartItemCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-error-500 text-xs font-bold text-white">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>
        </div>
      )}
      
      {/* Main com container padronizado */}
      <main className="flex-1 relative px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
        {children}
      </main>
    </div>
  )
}
