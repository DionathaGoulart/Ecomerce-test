'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Spline from '@splinetool/react-spline/next'
import { smoothScrollTo } from '@/lib/utils/smoothScroll'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsSectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

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

  // Mantém os cards sempre visíveis e anima linhas quando todos estão visíveis
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    // Garante que todos os cards estão sempre visíveis
    cardRefs.current.forEach((card) => {
      if (card) {
        card.style.opacity = '1'
        card.style.transform = 'translateY(0)'
      }
    })

    // Verifica se todos os 6 cards estão visíveis na tela
    const allRelativeDivs = Array.from(cardsSection.querySelectorAll('div.relative'))
    const finalContainers = allRelativeDivs.slice(0, 6)

    if (finalContainers.length !== 6) return

    let visibleCards = new Set<number>()
    let linesAnimated = false

    const animateLines = () => {
      if (linesAnimated) return
      
      const svgs = cardsSection.querySelectorAll('svg')
      
      svgs.forEach((svg, svgIndex) => {
        const svgLines = svg.querySelectorAll('line')
        const svgCircle = svg.querySelector('circle')
        
        if (svgLines.length === 0) return
        
        // Identifica linha horizontal e vertical
        let horizontalLine: SVGLineElement | null = null
        let verticalLine: SVGLineElement | null = null
        
        svgLines.forEach((line) => {
          const lineEl = line as SVGLineElement
          const x1 = parseFloat(lineEl.getAttribute('x1') || '0')
          const y1 = parseFloat(lineEl.getAttribute('y1') || '0')
          const x2 = parseFloat(lineEl.getAttribute('x2') || '0')
          const y2 = parseFloat(lineEl.getAttribute('y2') || '0')
          
          if (Math.abs(y1 - y2) < 0.1) {
            horizontalLine = lineEl
          } else if (Math.abs(x1 - x2) < 0.1) {
            verticalLine = lineEl
          }
        })
        
        // Anima linha horizontal primeiro
        if (horizontalLine) {
          const hLine = horizontalLine as SVGLineElement
          const hLength = hLine.getTotalLength()
          hLine.style.strokeDasharray = `${hLength}`
          hLine.style.strokeDashoffset = `${hLength}`
          hLine.style.transition = 'stroke-dashoffset 0.8s ease-in-out'
          
          setTimeout(() => {
            hLine.style.strokeDashoffset = '0'
          }, 50 + (svgIndex * 100)) // Delay escalonado por SVG (mais rápido)
        }
        
        // Anima linha vertical depois
        if (verticalLine) {
          const vLine = verticalLine as SVGLineElement
          const vLength = vLine.getTotalLength()
          vLine.style.strokeDasharray = `${vLength}`
          vLine.style.strokeDashoffset = `${vLength}`
          vLine.style.transition = 'stroke-dashoffset 0.8s ease-in-out'
          
          setTimeout(() => {
            vLine.style.strokeDashoffset = '0'
          }, 900 + (svgIndex * 100)) // Após a horizontal terminar (mais rápido)
        }
        
        // Mostra a bolinha por último
        if (svgCircle) {
          const circleEl = svgCircle as SVGCircleElement
          circleEl.style.opacity = '0'
          circleEl.style.transition = 'opacity 0.3s ease-in-out'
          
          setTimeout(() => {
            circleEl.style.opacity = '0.5'
          }, 1800 + (svgIndex * 100)) // Após ambas as linhas terminarem (mais rápido)
        }
      })
      
      linesAnimated = true
    }

    const observers: IntersectionObserver[] = []

    finalContainers.forEach((card, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
              visibleCards.add(index)
            } else {
              visibleCards.delete(index)
            }
            
            // Se todos os 6 cards estão visíveis, anima as linhas
            if (visibleCards.size === 6) {
              animateLines()
            }
          })
        },
        { threshold: 0.8 } // 80% visível
      )

      observer.observe(card)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
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
        <div className="w-full h-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-48">
          <div className="w-full h-full translate-y-8 sm:translate-y-16 md:translate-y-24 scale-150 sm:scale-175 md:scale-200">
            <div className="w-full h-full rounded-2xl overflow-hidden">
              <Spline scene="https://prod.spline.design/lzqdiUivvSwKYvU9/scene.splinecode" />
            </div>
            {/* Overlay escuro para melhorar legibilidade */}
            <div className="absolute inset-0 bg-black/40 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* Container principal para scroll */}
      <div ref={containerRef} className="relative min-h-screen z-10">
        {/* Seção Home */}
        <section id="home" className="min-h-screen flex">
          <div className="w-full mt-16 sm:mt-24 md:mt-32 lg:mt-48">
            <div className="max-w-2xl">
              {/* Título */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[96px] font-semibold text-white mb-6 sm:mb-8 md:mb-12 leading-none inline-block">
                Soluções<br />em Madeira
              </h1>

              {/* Texto */}
              <p className="text-sm sm:text-base text-white mb-8 sm:mb-12 md:mb-16 leading-relaxed max-w-[35rem]">
                Materializamos a sua marca em peças exclusivas de MDF e Pinus desde embalagens premium até projetos complexos. Sem pedido mínimo.
              </p>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Botão Ver Catálogo (estilo carrinho) */}
                <Link
                  href="/store"
                  className="flex items-center justify-center gap-2 sm:gap-[10px] rounded-xl sm:rounded-[16px] bg-[#E9EF33] px-4 sm:px-5 py-3 sm:py-[18px] text-sm sm:text-base font-medium text-[#121212] transition-opacity hover:opacity-90"
                >
                  <Image
                    src="/icons/eye.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="h-4 w-4 sm:h-5 sm:w-5"
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
                      const isMobile = window.innerWidth < 768
                      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                      const extraOffset = isMobile ? 200 : isTablet ? 400 : 580
                      const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                      const elementPosition = element.offsetTop
                      const targetPosition = elementPosition - headerOffset + extraOffset
                      
                      // Usa smoothScrollTo que dispara eventos de scroll
                      // O Spline detecta automaticamente via seu Event configurado (0 a 2500px)
                      smoothScrollTo(targetPosition, 1000).then(() => {
                        // Garante que eventos de scroll sejam disparados para o Spline detectar
                        setTimeout(() => {
                          window.dispatchEvent(new Event('scroll', { bubbles: true }))
                        }, 50)
                      })
                    }
                  }}
                  className="flex items-center justify-center gap-2 sm:gap-[10px] rounded-xl sm:rounded-[16px] border border-[#E9EF33] bg-transparent px-4 sm:px-5 py-3 sm:py-[18px] text-sm sm:text-base font-medium text-[#E9EF33] transition-opacity hover:opacity-80"
                >
                  <Image
                    src="/icons/project.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span>Orçar projeto</span>
                </a>
              </div>
            </div>

            {/* Seção Clientes */}
            <div className="mt-8 sm:mt-12 md:mt-16 w-full">
              <div className="max-w-2xl mb-3 sm:mb-4">
                <p className="text-sm sm:text-base text-white">Conheça nossos clientes:</p>
              </div>
              
              {/* Carousel */}
              <div className="relative max-w-xl overflow-hidden bg-transparent">
                
                {/* Container do carousel */}
                <div className="flex animate-scroll" style={{ width: 'max-content' }}>
                  {/* Primeira sequência */}
                  {['brahma.png', 'casamadeira.png', 'laz.png', 'peterlongo.png', 'super7.png'].map((img, idx) => (
                    <Image
                      key={`first-${idx}`}
                      src={`/carousel/${img}`}
                      alt=""
                      width={80}
                      height={60}
                      className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] w-auto h-auto object-contain mr-5 sm:mr-10"
                      unoptimized
                    />
                  ))}
                  {/* Segunda sequência (duplicada para loop) */}
                  {['brahma.png', 'casamadeira.png', 'laz.png', 'peterlongo.png', 'super7.png'].map((img, idx) => (
                    <Image
                      key={`second-${idx}`}
                      src={`/carousel/${img}`}
                      alt=""
                      width={80}
                      height={60}
                      className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] w-auto h-auto object-contain mr-5 sm:mr-10"
                      unoptimized
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Container para manter a seção fixa durante 9 rolagens */}
        <div className="relative" style={{ height: '900vh' }}>
          {/* Nova Seção de Cards - fica sticky durante 9 rolagens */}
          <section id="beneficios" ref={cardsSectionRef} className="w-full py-52 sticky top-0">
          <div className="flex flex-col lg:flex-row justify-between items-start w-full gap-8 lg:gap-0">
            {/* Coluna Esquerda - 3 cards */}
            <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 items-start w-full lg:w-auto">
              {/* Card 1 */}
              <div ref={(el) => { cardRefs.current[0] = el }} className="relative w-full lg:w-auto">
                <div className="p-4 sm:p-6 md:p-8 bg-white/5 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/10 w-full sm:w-[273px]">
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
                    <h3 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-white leading-tight">Produtos<br />Validados</h3>
                    <p className="text-[10px] sm:text-[11px] md:text-[12px] text-white/80 leading-tight">
                      Itens testados para garantir durabilidade e funcionalidade.
                    </p>
                  </div>
                </div>
                {/* Linha decorativa - começa na borda direita do card */}
                <svg 
                  className="hidden lg:block absolute top-1/2 left-full pointer-events-none"
                  width="300" 
                  height="200" 
                  viewBox="0 0 300 200"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para direita - começa do meio */}
                  <line 
                    x1="0" 
                    y1="100" 
                    x2="160" 
                    y2="100" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Linha vertical para baixo */}
                  <line 
                    x1="160" 
                    y1="100" 
                    x2="160" 
                    y2="190" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="160" 
                    cy="190" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Card 2 */}
              <div ref={(el) => { cardRefs.current[1] = el }} className="relative">
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
                  className="hidden lg:block absolute top-1/2 left-full pointer-events-none"
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
              <div ref={(el) => { cardRefs.current[2] = el }} className="relative">
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
                  className="hidden lg:block absolute top-1/2 left-full pointer-events-none"
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
            <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 items-start lg:items-end w-full lg:w-auto">
              {/* Card 4 */}
              <div ref={(el) => { cardRefs.current[3] = el }} className="relative">
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
                  className="hidden lg:block absolute top-1/2 right-full pointer-events-none"
                  width="330" 
                  height="420" 
                  viewBox="0 0 330 420"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para esquerda - começa do meio */}
                  <line 
                    x1="330" 
                    y1="210" 
                    x2="30" 
                    y2="210" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Linha vertical para baixo */}
                  <line 
                    x1="30" 
                    y1="210" 
                    x2="30" 
                    y2="370" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="30" 
                    cy="370" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Card 5 */}
              <div ref={(el) => { cardRefs.current[4] = el }} className="relative">
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
                  className="hidden lg:block absolute top-1/2 right-full pointer-events-none"
                  width="220" 
                  height="200" 
                  viewBox="0 0 220 200"
                  style={{ transform: 'translateY(-50%)' }}
                >
                  {/* Linha horizontal para esquerda - começa do meio */}
                  <line 
                    x1="220" 
                    y1="100" 
                    x2="110" 
                    y2="100" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Linha vertical para cima */}
                  <line 
                    x1="110" 
                    y1="100" 
                    x2="110" 
                    y2="30" 
                    stroke="white" 
                    strokeWidth="1" 
                    opacity="0.3"
                  />
                  {/* Bolinha no final */}
                  <circle 
                    cx="110" 
                    cy="30" 
                    r="4" 
                    fill="white" 
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Card 6 */}
              <div ref={(el) => { cardRefs.current[5] = el }} className="relative">
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
                  className="hidden lg:block absolute top-1/2 right-full pointer-events-none"
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
        </div>

        {/* Espaço para scroll */}
        <div className="h-[200vh]" />
      </div>
    </>
  )
}

