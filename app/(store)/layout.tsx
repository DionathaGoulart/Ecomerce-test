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
    { href: '/#beneficios', label: 'Benefícios' },
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
                  if (item.href === '/#home' || item.href === '/#beneficios') {
                    e.preventDefault()
                    e.stopPropagation()
                    
                    const sectionId = item.href.replace('/#', '')
                    const section = document.getElementById(sectionId)
                    
                    if (section) {
                      // Para benefícios, precisa rolar mais para baixo
                      const extraOffset = sectionId === 'beneficios' ? 580 : 0
                      const headerOffset = 120
                      
                      // Calcula a posição usando offsetTop
                      const elementPosition = section.offsetTop
                      const targetPosition = elementPosition - headerOffset + extraOffset
                      
                      // Animação manual de scroll suave
                      const startPosition = window.pageYOffset
                      const distance = targetPosition - startPosition
                      const duration = 800 // 800ms - scroll mais rápido para maior fluidez
                      let start: number | null = null
                      
                      // Busca o vídeo e container para atualizar diretamente
                      const video = document.querySelector('video') as HTMLVideoElement | null
                      const container = document.querySelector('div.relative.min-h-screen') as HTMLElement | null
                      
                      // Sinaliza que estamos em animação programática (para o loop do vídeo)
                      if (video) {
                        (video as any).__isProgrammaticScroll = true
                      }
                      
                      // Easing linear puro para movimento constante e fluido
                      const linearEase = (t: number): number => t
                      
                      // Calcula valores iniciais do vídeo
                      let videoStartTime = 0
                      let videoEndTime = 0
                      if (video && container && video.readyState >= 2) {
                        const containerHeight = container.offsetHeight
                        const videoDuration = video.duration || 0
                        if (videoDuration > 0 && containerHeight > 0) {
                          const startProgress = Math.max(0, Math.min(1, startPosition / containerHeight))
                          const endProgress = Math.max(0, Math.min(1, targetPosition / containerHeight))
                          videoStartTime = startProgress * videoDuration
                          videoEndTime = endProgress * videoDuration
                        }
                      }
                      
                      const animateScroll = (currentTime: number) => {
                        if (start === null) start = currentTime
                        const timeElapsed = currentTime - start
                        const progress = Math.min(timeElapsed / duration, 1)
                        
                        // Easing linear para movimento constante
                        const ease = linearEase(progress)
                        const newScrollPosition = startPosition + distance * ease
                        
                        // Atualiza scroll
                        window.scrollTo(0, newScrollPosition)
                        
                        // Atualiza vídeo de forma linear e sincronizada
                        if (video && container && video.readyState >= 2) {
                          const videoDuration = video.duration || 0
                          if (videoDuration > 0) {
                            // Interpola linearmente entre o tempo inicial e final do vídeo
                            const videoTime = videoStartTime + (videoEndTime - videoStartTime) * ease
                            video.currentTime = Math.max(0, Math.min(videoTime, videoDuration))
                          }
                        }
                        
                        if (progress < 1) {
                          requestAnimationFrame(animateScroll)
                        } else {
                          // Reabilita o loop do vídeo ao finalizar
                          if (video) {
                            (video as any).__isProgrammaticScroll = false
                          }
                        }
                      }
                      
                      requestAnimationFrame(animateScroll)
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
