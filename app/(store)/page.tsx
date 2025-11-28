'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current

    if (!video || !container) return

    // Pausa o vídeo inicialmente
    video.pause()

    let rafId: number | null = null

    const updateVideoFrame = () => {
      const scrollTop = window.scrollY
      const containerHeight = container.offsetHeight
      const videoDuration = video.duration || 0
      
      if (videoDuration > 0 && containerHeight > 0) {
        // Calcula o progresso do scroll (0 a 1)
        const scrollProgress = Math.max(0, Math.min(1, scrollTop / containerHeight))
        
        // Calcula o tempo do vídeo baseado no progresso do scroll
        const targetTime = scrollProgress * videoDuration
        video.currentTime = Math.min(targetTime, videoDuration)
      }
      
      rafId = null
    }

    const handleScroll = () => {
      // Usa requestAnimationFrame para atualizações suaves
      if (!rafId) {
        rafId = requestAnimationFrame(updateVideoFrame)
      }
    }

    // Carrega os metadados do vídeo para obter a duração
    const handleLoadedMetadata = () => {
      video.currentTime = 0
      // Executa uma vez no início para sincronizar
      updateVideoFrame()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <div className="w-full h-full px-48">
          <div className="w-full h-full translate-y-24 scale-90">
            <video
              ref={videoRef}
              className="w-full h-full object-cover rounded-2xl"
              playsInline
              muted
              preload="metadata"
            >
              <source src="/bg.mp4" type="video/mp4" />
            </video>
            {/* Overlay escuro para melhorar legibilidade */}
            <div className="absolute inset-0 bg-black/40 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Container principal para scroll */}
      <div ref={containerRef} className="relative min-h-screen z-10">
        {/* Seção Home */}
        <section id="home" className="min-h-screen flex">
          <div className="w-full mt-48">
            <div className="max-w-2xl">
              {/* Título */}
              <h1 className="text-[96px] font-semibold text-white mb-12 leading-none inline-block">
                Soluções<br />em Madeira
              </h1>

              {/* Texto */}
              <p className="text-base text-white mb-16 leading-relaxed max-w-[35rem]">
                Materializamos a sua marca em peças exclusivas de MDF e Pinus desde embalagens premium até projetos complexos. Sem pedido mínimo.
              </p>

              {/* Botões */}
              <div className="flex items-center gap-4">
                {/* Botão Ver Catálogo (estilo carrinho) */}
                <Link
                  href="/store"
                  className="flex items-center gap-[10px] rounded-[16px] bg-[#E9EF33] px-5 py-[18px] text-base font-medium text-[#121212] transition-opacity hover:opacity-90"
                >
                  <Image
                    src="/icons/eye.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  <span>Ver catálogo</span>
                </Link>

                {/* Botão Orçar Projeto (estilo minha conta) */}
                <Link
                  href="/store"
                  className="flex items-center gap-[10px] rounded-[16px] border border-[#E9EF33] bg-transparent px-5 py-[18px] text-base font-medium text-[#E9EF33] transition-opacity hover:opacity-80"
                >
                  <Image
                    src="/icons/project.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  <span>Orçar projeto</span>
                </Link>
              </div>
            </div>

            {/* Seção Clientes */}
            <div className="mt-16 w-full">
              <div className="max-w-2xl mb-4">
                <p className="text-base text-white">Conheça nossos clientes:</p>
              </div>
              
              {/* Carousel */}
              <div className="relative max-w-xl overflow-hidden bg-transparent">
                
                {/* Container do carousel */}
                <div className="flex animate-scroll" style={{ width: 'max-content' }}>
                  {/* Primeira sequência */}
                  {['brahma.png', 'casamadeira.png', 'laz.png', 'peterlongo.png', 'super7.png'].map((img, idx) => (
                    <img
                      key={`first-${idx}`}
                      src={`/carousel/${img}`}
                      alt=""
                      className="flex-shrink-0"
                      style={{ 
                        maxWidth: '80px', 
                        maxHeight: '60px', 
                        width: 'auto', 
                        height: 'auto', 
                        objectFit: 'contain',
                        marginRight: '40px' 
                      }}
                    />
                  ))}
                  {/* Segunda sequência (duplicada para loop) */}
                  {['brahma.png', 'casamadeira.png', 'laz.png', 'peterlongo.png', 'super7.png'].map((img, idx) => (
                    <img
                      key={`second-${idx}`}
                      src={`/carousel/${img}`}
                      alt=""
                      className="flex-shrink-0"
                      style={{ 
                        maxWidth: '80px', 
                        maxHeight: '60px', 
                        width: 'auto', 
                        height: 'auto', 
                        objectFit: 'contain',
                        marginRight: '40px' 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Espaço para scroll */}
        <div className="h-[200vh]" />
      </div>
    </>
  )
}

