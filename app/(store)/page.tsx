'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current

    if (!video || !container) return

    // Pausa o vídeo inicialmente
    video.pause()

    const handleScroll = () => {
      const scrollTop = window.scrollY
      const containerHeight = container.offsetHeight
      const videoDuration = video.duration || 0
      
      if (videoDuration > 0) {
        // Calcula o frame baseado no scroll
        const scrollProgress = scrollTop / containerHeight
        const currentTime = scrollProgress * videoDuration
        
        // Atualiza o tempo do vídeo para o frame correspondente
        video.currentTime = Math.min(currentTime, videoDuration)
      }
    }

    // Carrega os metadados do vídeo para obter a duração
    const handleLoadedMetadata = () => {
      video.currentTime = 0
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    window.addEventListener('scroll', handleScroll)

    // Executa uma vez no início
    handleScroll()

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <div className="w-full h-full px-48">
          <video
            ref={videoRef}
            className="w-full h-full object-contain rounded-2xl"
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

      {/* Container principal para scroll */}
      <div ref={containerRef} className="relative min-h-screen z-10">
        {/* Conteúdo alinhado com container */}
        <div className="min-h-screen flex">
          <div className="w-full mt-48">
            <div className="max-w-2xl">
              {/* Título */}
              <h1 className="text-[96px] font-semibold text-white mb-12 leading-none inline-block">
                Soluções<br />em Madeira
              </h1>

              {/* Texto */}
              <p className="text-base text-white mb-16 leading-relaxed">
                Materializamos a sua marca em peças exclusivas de MDF e Pinus desde embalagens premium até projetos complexos. Sem pedido mínimo.
              </p>

              {/* Botões */}
              <div className="flex items-center gap-4">
                {/* Botão Ver Catálogo (estilo carrinho) */}
                <Link
                  href="/store"
                  className="flex items-center gap-2 rounded-lg bg-[#E9EF33] px-6 py-3 text-base font-medium text-[#121212] transition-opacity hover:opacity-90"
                >
                  <span>Ver catálogo</span>
                </Link>

                {/* Botão Ver Catálogo (estilo minha conta) */}
                <Link
                  href="/store"
                  className="flex items-center gap-2 rounded-lg border border-[#E9EF33] bg-transparent px-6 py-3 text-base font-medium text-[#E9EF33] transition-opacity hover:opacity-80"
                >
                  <span>Ver catálogo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Espaço para scroll */}
        <div className="h-[200vh]" />
      </div>
    </>
  )
}

