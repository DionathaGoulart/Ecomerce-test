'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current

    if (!video || !container) return

    // Pausa o vídeo inicialmente
    video.pause()

    let rafId: number | null = null
    let isRunning = true
    let lastScrollTop = window.scrollY

    const updateVideoFrame = () => {
      if (!isRunning) return
      
      // Pausa o loop durante animação programática (controlada pelo layout.tsx)
      if ((video as any).__isProgrammaticScroll) {
        rafId = requestAnimationFrame(updateVideoFrame)
        return
      }
      
      const scrollTop = window.scrollY
      const containerHeight = container.offsetHeight
      const videoDuration = video.duration || 0
      
      // Só atualiza se o scroll mudou ou se o vídeo está pronto
      if (videoDuration > 0 && containerHeight > 0 && video.readyState >= 2) {
        // Calcula o progresso do scroll (0 a 1)
        const scrollProgress = Math.max(0, Math.min(1, scrollTop / containerHeight))
        
        // Calcula o tempo do vídeo baseado no progresso do scroll
        const targetTime = scrollProgress * videoDuration
        
        // Atualiza o vídeo diretamente - sem debounce para capturar todos os frames
        if (Math.abs(video.currentTime - targetTime) > 0.001) {
          video.currentTime = Math.min(targetTime, videoDuration)
        }
      }
      
      // Continua o loop para garantir que todos os frames sejam capturados
      if (isRunning) {
        rafId = requestAnimationFrame(updateVideoFrame)
      } else {
        rafId = null
      }
    }

    // Carrega os metadados do vídeo para obter a duração
    const handleLoadedMetadata = () => {
      video.currentTime = 0
      // Inicia o loop contínuo
      if (!rafId) {
        rafId = requestAnimationFrame(updateVideoFrame)
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    
    // Inicia o loop imediatamente se o vídeo já estiver carregado
    if (video.readyState >= 2) {
      rafId = requestAnimationFrame(updateVideoFrame)
    }

    return () => {
      isRunning = false
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [])

  // Inicializa as linhas como invisíveis
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    const initializeLines = () => {
      const lines = cardsSection.querySelectorAll('line')
      const circles = cardsSection.querySelectorAll('circle')
      
      lines.forEach((line) => {
        const length = line.getTotalLength()
        line.style.strokeDasharray = `${length}`
        line.style.strokeDashoffset = `${length}`
      })
      
      circles.forEach((circle) => {
        circle.style.opacity = '0'
      })
    }

    // Aguarda um pouco para garantir que o DOM está renderizado
    setTimeout(initializeLines, 100)
  }, [])

  // Verifica se todos os cards estão 100% visíveis e controla a visibilidade das linhas
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    // Pega os containers dos cards (divs com className="relative" dentro da seção)
    // Assumindo que os primeiros 6 divs.relative são os containers dos cards
    const allRelativeDivs = Array.from(cardsSection.querySelectorAll('div.relative'))
    const finalContainers = allRelativeDivs.slice(0, 6)

    const lines = cardsSection.querySelectorAll('line')
    const circles = cardsSection.querySelectorAll('circle')

    if (finalContainers.length !== 6) return

    let visibleCards = new Set<number>()

    const updateLinesVisibility = () => {
      const allVisible = visibleCards.size === 6
      
      if (allVisible) {
        // Agrupa linhas por SVG (cada card tem um SVG)
        const svgs = cardsSection.querySelectorAll('svg')
        
        svgs.forEach((svg) => {
          const svgLines = svg.querySelectorAll('line')
          const svgCircle = svg.querySelector('circle')
          
          if (svgLines.length === 0) return
          
          // Identifica linha horizontal (y1 === y2) e vertical (x1 === x2)
          let horizontalLine: SVGLineElement | null = null
          let verticalLine: SVGLineElement | null = null
          
          svgLines.forEach((line) => {
            const lineEl = line as SVGLineElement
            const x1 = parseFloat(lineEl.getAttribute('x1') || '0')
            const y1 = parseFloat(lineEl.getAttribute('y1') || '0')
            const x2 = parseFloat(lineEl.getAttribute('x2') || '0')
            const y2 = parseFloat(lineEl.getAttribute('y2') || '0')
            
            if (Math.abs(y1 - y2) < 0.1) {
              // Linha horizontal
              horizontalLine = lineEl
            } else if (Math.abs(x1 - x2) < 0.1) {
              // Linha vertical
              verticalLine = lineEl
            }
          })
          
          // Anima primeiro a linha horizontal
          if (horizontalLine) {
            const hLine = horizontalLine as SVGLineElement
            const hLength = hLine.getTotalLength()
            hLine.style.strokeDasharray = `${hLength}`
            hLine.style.strokeDashoffset = `${hLength}`
            hLine.style.transition = 'stroke-dashoffset 1.5s ease-in-out'
            
            setTimeout(() => {
              hLine.style.strokeDashoffset = '0'
            }, 50)
          }
          
          // Depois anima a linha vertical (após a horizontal terminar)
          if (verticalLine) {
            const vLine = verticalLine as SVGLineElement
            const vLength = vLine.getTotalLength()
            vLine.style.strokeDasharray = `${vLength}`
            vLine.style.strokeDashoffset = `${vLength}`
            vLine.style.transition = 'stroke-dashoffset 1.5s ease-in-out'
            
            setTimeout(() => {
              vLine.style.strokeDashoffset = '0'
            }, 1550) // Começa após a horizontal terminar (1.5s + 50ms)
          }
          
          // Por fim mostra a bolinha
          if (svgCircle) {
            const circleEl = svgCircle as SVGCircleElement
            circleEl.style.opacity = '0'
            circleEl.style.transition = 'opacity 0.5s ease-in-out'
            
            setTimeout(() => {
              if (circleEl) {
                circleEl.style.opacity = '0.5'
              }
            }, 3050) // Após ambas as linhas terminarem (1.5s + 1.5s + 50ms)
          }
        })
      } else {
        // Esconde as linhas
        lines.forEach((line) => {
          const length = line.getTotalLength()
          line.style.transition = 'stroke-dashoffset 0.3s ease-in-out'
          line.style.strokeDashoffset = `${length}`
        })
        
        circles.forEach((circle) => {
          circle.style.transition = 'opacity 0.3s ease-in-out'
          circle.style.opacity = '0'
        })
      }
    }

    const observers: IntersectionObserver[] = []

    finalContainers.forEach((card, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
              visibleCards.add(index)
            } else {
              visibleCards.delete(index)
            }
            updateLinesVisibility()
          })
        },
        { threshold: 1.0 } // 100% visível
      )

      observer.observe(card)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
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
                <a
                  href="#beneficios"
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.getElementById('beneficios')
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
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
                </a>
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

        {/* Nova Seção de Cards */}
        <section id="beneficios" ref={cardsSectionRef} className="w-full  py-96 relative">
          <div className="flex justify-between items-start w-full py-32">
            {/* Coluna Esquerda - 3 cards */}
            <div className="flex flex-col gap-16 items-start">
              {/* Card 1 */}
              <div className="relative">
                <div className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 w-[273px]">
                  <div className="flex flex-col gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Image
                        src="/icons/project.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <h3 className="text-[32px] font-semibold text-white leading-tight">Produtos<br />Validados</h3>
                    <p className="text-[12px] text-white/80 leading-tight">
                      Itens testados para garantir durabilidade e funcionalidade.
                    </p>
                  </div>
                </div>
                {/* Linha decorativa - começa na borda direita do card */}
                <svg 
                  className="absolute top-1/2 left-full pointer-events-none"
                  width="300" 
                  height="200" 
                  viewBox="0 0 300 200"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para direita - começa do meio */}
                  <line 
                    x1="0" 
                    y1="100" 
                    x2="200" 
                    y2="100" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Linha vertical para baixo */}
                  <line 
                    x1="200" 
                    y1="100" 
                    x2="200" 
                    y2="190" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="200" 
                    cy="190" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Card 2 */}
              <div className="relative">
                <div className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 w-[273px]">
                  <div className="flex flex-col gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Image
                        src="/icons/eye.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <h3 className="text-[32px] font-semibold text-white leading-tight">Sem pedido<br />Mínimo</h3>
                    <p className="text-[12px] text-white/80 leading-tight">
                      Viabilizamos desde uma peça exclusiva até grandes lotes.
                    </p>
                  </div>
                </div>
                {/* Linha decorativa horizontal */}
                <svg 
                  className="absolute top-1/2 left-full pointer-events-none"
                  width="310" 
                  height="200" 
                  viewBox="0 0 310 200"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para direita - começa do meio */}
                  <line 
                    x1="0" 
                    y1="100" 
                    x2="260" 
                    y2="100" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="260" 
                    cy="100" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Card 3 */}
              <div className="relative">
                <div className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 w-[273px]">
                  <div className="flex flex-col gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Image
                        src="/icons/project.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <h3 className="text-[32px] font-semibold text-white leading-tight">Processo<br />Simplificado</h3>
                    <p className="text-[12px] text-white/80 leading-tight">
                      Você escolhe o produto, nós colocamos sua marca ou arte.
                    </p>
                  </div>
                </div>
                {/* Linha decorativa - começa na borda direita do card */}
                <svg 
                  className="absolute top-1/2 left-full pointer-events-none"
                  width="300" 
                  height="200" 
                  viewBox="0 0 300 200"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para direita - começa do meio */}
                  <line 
                    x1="0" 
                    y1="100" 
                    x2="240" 
                    y2="100" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Linha vertical para cima */}
                  <line 
                    x1="240" 
                    y1="100" 
                    x2="240" 
                    y2="35" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="240" 
                    cy="35" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>
            </div>

            {/* Coluna Direita - 3 cards */}
            <div className="flex flex-col gap-16 items-end">
              {/* Card 4 */}
              <div className="relative">
                <div className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 w-[273px]">
                  <div className="flex flex-col gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Image
                        src="/icons/eye.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <h3 className="text-[32px] font-semibold text-white leading-tight">Material<br />Incluso</h3>
                    <p className="text-[12px] text-white/80 leading-tight">
                      O preço do catálogo já contempla a peça, o corte e a gravação.
                    </p>
                  </div>
                </div>
                {/* Linha decorativa - começa na borda esquerda do card */}
                <svg 
                  className="absolute top-1/2 right-full pointer-events-none"
                  width="330" 
                  height="420" 
                  viewBox="0 0 330 420"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para esquerda - começa do meio */}
                  <line 
                    x1="330" 
                    y1="210" 
                    x2="50" 
                    y2="210" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Linha vertical para baixo */}
                  <line 
                    x1="50" 
                    y1="210" 
                    x2="50" 
                    y2="410" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="50" 
                    cy="410" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Card 5 */}
              <div className="relative">
                <div className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 w-[273px]">
                  <div className="flex flex-col gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Image
                        src="/icons/project.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <h3 className="text-[32px] font-semibold text-white leading-tight">Revisão<br />Profissional</h3>
                    <p className="text-[12px] text-white/80 leading-tight">
                      Verificamos sua arte antes da produção para garantir o resultado.
                    </p>
                  </div>
                </div>
                {/* Linha decorativa - começa na borda esquerda do card */}
                <svg 
                  className="absolute top-1/2 right-full pointer-events-none"
                  width="220" 
                  height="200" 
                  viewBox="0 0 220 200"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para esquerda - começa do meio */}
                  <line 
                    x1="220" 
                    y1="100" 
                    x2="130" 
                    y2="100" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Linha vertical para cima */}
                  <line 
                    x1="130" 
                    y1="100" 
                    x2="130" 
                    y2="30" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="130" 
                    cy="30" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Card 6 */}
              <div className="relative">
                <div className="p-8 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 w-[273px]">
                  <div className="flex flex-col gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <Image
                        src="/icons/eye.svg"
                        alt=""
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                    <h3 className="text-[32px] font-semibold text-white leading-tight">Acabamento<br />Premium</h3>
                    <p className="text-[12px] text-white/80 leading-tight">
                      Cortes limpos e gravações nítidas em Pinus ou MDF.
                    </p>
                  </div>
                </div>
                {/* Linha decorativa horizontal - começa na esquerda do card */}
                <svg 
                  className="absolute top-1/2 right-full pointer-events-none"
                  width="300" 
                  height="200" 
                  viewBox="0 0 300 200"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para esquerda - começa do meio */}
                  <line 
                    x1="300" 
                    y1="100" 
                    x2="60" 
                    y2="100" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="60" 
                    cy="100" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
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

