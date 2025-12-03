'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Spline from '@splinetool/react-spline/next'
import { smoothScrollTo } from '@/lib/utils/smoothScroll'

interface LineConfig {
  svgWidth: number
  svgHeight: number
  viewBox: string
  position: 'left' | 'right' // left-full ou right-full
  horizontalLine?: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  verticalLine?: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
  circle?: {
    cx: number
    cy: number
  }
}

interface BenefitCardProps {
  index: number
  icon: string
  title: string
  description: string
  lineConfig: LineConfig
  cardRef: (el: HTMLDivElement | null) => void
  className?: string
}

function BenefitCard({ index, icon, title, description, lineConfig, cardRef, className = '' }: BenefitCardProps) {
  return (
    <div ref={cardRef} className={`relative ${className}`}>
      <div className="p-4 sm:p-6 md:p-8 bg-white/5 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/10 w-full sm:w-[273px]">
        <div className="flex flex-col gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <Image
              src={icon}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4"
            />
          </div>
          <h3 className="text-xl sm:text-2xl md:text-[32px] font-semibold text-white leading-tight">
            {title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h3>
          <p className="text-[10px] sm:text-[11px] md:text-[12px] text-white/80 leading-tight">
            {description}
          </p>
        </div>
      </div>
      {/* Linha decorativa */}
      <svg 
        className={`hidden lg:block absolute top-1/2 ${lineConfig.position === 'left' ? 'left-full' : 'right-full'} pointer-events-none`}
        width={lineConfig.svgWidth}
        height={lineConfig.svgHeight}
        viewBox={lineConfig.viewBox}
        style={{ transform: 'translateY(-50%)' }}
      >
        {lineConfig.horizontalLine && (
          <line 
            x1={lineConfig.horizontalLine.x1}
            y1={lineConfig.horizontalLine.y1}
            x2={lineConfig.horizontalLine.x2}
            y2={lineConfig.horizontalLine.y2}
            stroke="white"
            strokeWidth="1"
            opacity="0.3"
          />
        )}
        {lineConfig.verticalLine && (
          <line 
            x1={lineConfig.verticalLine.x1}
            y1={lineConfig.verticalLine.y1}
            x2={lineConfig.verticalLine.x2}
            y2={lineConfig.verticalLine.y2}
            stroke="white"
            strokeWidth="1"
            opacity="0.3"
          />
        )}
        {lineConfig.circle && (
          <circle 
            cx={lineConfig.circle.cx}
            cy={lineConfig.circle.cy}
            r="4"
            fill="white"
            opacity="0.5"
          />
        )}
      </svg>
    </div>
  )
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsSectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const comofuncionaSectionRef = useRef<HTMLElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

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
          hLine.style.transition = 'stroke-dashoffset 0.4s ease-in-out'
          
          setTimeout(() => {
            hLine.style.strokeDashoffset = '0'
          }, 30 + (svgIndex * 50)) // Delay escalonado por SVG (mais rápido)
        }
        
        // Anima linha vertical depois
        if (verticalLine) {
          const vLine = verticalLine as SVGLineElement
          const vLength = vLine.getTotalLength()
          vLine.style.strokeDasharray = `${vLength}`
          vLine.style.strokeDashoffset = `${vLength}`
          vLine.style.transition = 'stroke-dashoffset 0.4s ease-in-out'
          
          setTimeout(() => {
            vLine.style.strokeDashoffset = '0'
          }, 450 + (svgIndex * 50)) // Após a horizontal terminar (mais rápido)
        }
        
        // Mostra a bolinha por último
        if (svgCircle) {
          const circleEl = svgCircle as SVGCircleElement
          circleEl.style.opacity = '0'
          circleEl.style.transition = 'opacity 0.2s ease-in-out'
          
          setTimeout(() => {
            circleEl.style.opacity = '0.5'
          }, 900 + (svgIndex * 50)) // Após ambas as linhas terminarem (mais rápido)
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
            hLine.style.transition = 'stroke-dashoffset 0.6s ease-in-out'
            
            setTimeout(() => {
              hLine.style.strokeDashoffset = '0'
            }, 30)
          }
          
          // Depois anima a linha vertical (após a horizontal terminar)
          if (verticalLine) {
            const vLine = verticalLine as SVGLineElement
            const vLength = vLine.getTotalLength()
            vLine.style.strokeDasharray = `${vLength}`
            vLine.style.strokeDashoffset = `${vLength}`
            vLine.style.transition = 'stroke-dashoffset 0.6s ease-in-out'
            
            setTimeout(() => {
              vLine.style.strokeDashoffset = '0'
            }, 650) // Começa após a horizontal terminar (0.6s + 50ms)
          }
          
          // Por fim mostra a bolinha
          if (svgCircle) {
            const circleEl = svgCircle as SVGCircleElement
            circleEl.style.opacity = '0'
            circleEl.style.transition = 'opacity 0.3s ease-in-out'
            
            setTimeout(() => {
              if (circleEl) {
                circleEl.style.opacity = '0.5'
              }
            }, 1300) // Após ambas as linhas terminarem (0.6s + 0.6s + 100ms)
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

  // Anima as linhas da seção Como Funciona seguindo o scroll
  useEffect(() => {
    const section = comofuncionaSectionRef.current
    if (!section) return

    const updateLines = () => {
      const windowHeight = window.innerHeight
      const windowCenter = windowHeight * 0.5
      const sectionRect = section.getBoundingClientRect()
      const sectionTop = sectionRect.top
      
      const greenLines = section.querySelectorAll('.line-animated')
      
      greenLines.forEach((line, index) => {
        const lineEl = line as HTMLElement
        const lineContainer = lineEl.parentElement
        if (!lineContainer) return
        
        // Pega a posição do card que contém esta linha
        const cardContainer = lineContainer.closest('.relative')
        if (!cardContainer) return
        
        const cardRect = cardContainer.getBoundingClientRect()
        const cardTop = cardRect.top
        
        // Calcula o progresso baseado na posição do centro da tela
        // A linha começa a crescer quando o topo do card passa pelo centro da tela
        // E completa quando o topo do próximo card passa pelo centro
        
        // Distância do centro da tela até o topo do card atual
        const distanceFromCenter = windowCenter - cardTop
        
        // Altura da linha (600px)
        const lineHeight = 600
        
        // Progresso: quando o centro da tela está no topo do card = 0%
        // Quando o centro da tela está 600px abaixo do topo do card = 100%
        let progress = 0
        
        if (distanceFromCenter > 0) {
          // Se o centro já passou do topo do card, calcula o progresso
          progress = Math.min(distanceFromCenter / lineHeight, 1)
        }
        
        // Garante que o progresso não seja negativo
        progress = Math.max(progress, 0)
        
        lineEl.style.height = `${progress * 100}%`
      })
    }

    // Atualiza no scroll
    const handleScroll = () => {
      updateLines()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateLines)
    updateLines()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateLines)
    }
  }, [])

  // Anima o carousel com loop perfeito
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    // Aguarda o carregamento completo para calcular dimensões corretas
    const initAnimation = () => {
      const carouselWidth = carousel.scrollWidth
      const sequenceWidth = carouselWidth / 3
      const duration = 30000 // 30 segundos para completar uma sequência
      const speed = sequenceWidth / duration // pixels por milissegundo

      let startTime: number | null = null
      let lastPosition = 0

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime

        // Calcula a posição baseada no tempo decorrido
        const totalDistance = elapsed * speed
        const currentPosition = -(totalDistance % sequenceWidth)

        // Só atualiza se a posição mudou (evita repaints desnecessários)
        if (Math.abs(currentPosition - lastPosition) > 0.1) {
          carousel.style.transform = `translate3d(${currentPosition}px, 0, 0)`
          lastPosition = currentPosition
        }

        requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }

    // Aguarda um frame para garantir que o DOM está renderizado
    requestAnimationFrame(() => {
      // Aguarda mais um pouco para garantir que as imagens carregaram
      setTimeout(initAnimation, 100)
    })
  }, [])

  // Dados dos cards
  const cardsData = [
    {
      icon: '/icons/card1.svg',
      title: 'Produtos\nValidados',
      description: 'Itens testados para garantir durabilidade e funcionalidade.',
      lineConfig: {
        svgWidth: 300,
        svgHeight: 200,
        viewBox: '0 0 300 200',
        position: 'left' as const,
        horizontalLine: { x1: 0, y1: 100, x2: 160, y2: 100 },
        verticalLine: { x1: 160, y1: 100, x2: 160, y2: 190 },
        circle: { cx: 160, cy: 190 }
      },
      className: 'w-full lg:w-auto'
    },
    {
      icon: '/icons/card2.svg',
      title: 'Sem pedido\nMínimo',
      description: 'Viabilizamos desde uma peça exclusiva até grandes lotes.',
      lineConfig: {
        svgWidth: 310,
        svgHeight: 200,
        viewBox: '0 0 310 200',
        position: 'left' as const,
        horizontalLine: { x1: 0, y1: 100, x2: 260, y2: 100 },
        circle: { cx: 260, cy: 100 }
      }
    },
    {
      icon: '/icons/card3.svg',
      title: 'Processo\nSimplificado',
      description: 'Você escolhe o produto, nós colocamos sua marca ou arte.',
      lineConfig: {
        svgWidth: 300,
        svgHeight: 200,
        viewBox: '0 0 300 200',
        position: 'left' as const,
        horizontalLine: { x1: 0, y1: 100, x2: 240, y2: 100 },
        verticalLine: { x1: 240, y1: 100, x2: 240, y2: 35 },
        circle: { cx: 240, cy: 35 }
      }
    },
    {
      icon: '/icons/card4.svg',
      title: 'Material\nIncluso',
      description: 'O preço do catálogo já contempla a peça, o corte e a gravação.',
      lineConfig: {
        svgWidth: 330,
        svgHeight: 420,
        viewBox: '0 0 330 420',
        position: 'right' as const,
        horizontalLine: { x1: 330, y1: 210, x2: 30, y2: 210 },
        verticalLine: { x1: 30, y1: 210, x2: 30, y2: 370 },
        circle: { cx: 30, cy: 370 }
      }
    },
    {
      icon: '/icons/card5.svg',
      title: 'Revisão\nProfissional',
      description: 'Verificamos sua arte antes da produção para garantir o resultado.',
      lineConfig: {
        svgWidth: 220,
        svgHeight: 200,
        viewBox: '0 0 220 200',
        position: 'right' as const,
        horizontalLine: { x1: 220, y1: 100, x2: 110, y2: 100 },
        verticalLine: { x1: 110, y1: 100, x2: 110, y2: 30 },
        circle: { cx: 110, cy: 30 }
      }
    },
    {
      icon: '/icons/card6.svg',
      title: 'Acabamento\nPremium',
      description: 'Cortes limpos e gravações nítidas em Pinus ou MDF.',
      lineConfig: {
        svgWidth: 300,
        svgHeight: 200,
        viewBox: '0 0 300 200',
        position: 'right' as const,
        horizontalLine: { x1: 300, y1: 100, x2: 60, y2: 100 },
        circle: { cx: 60, cy: 100 }
      }
    }
  ]

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
                  className="flex items-center justify-center gap-2 sm:gap-[10px] rounded-xl sm:rounded-[16px] bg-primary-500 px-4 sm:px-5 py-3 sm:py-[18px] text-sm sm:text-base font-medium text-neutral-950 transition-opacity hover:opacity-90"
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
                      // Pega a posição exata da seção usando getBoundingClientRect
                      const rect = element.getBoundingClientRect()
                      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                      const elementTop = rect.top + scrollTop
                      
                      // Scroll até a seção, uma rolagem a mais para baixo
                      const targetPosition = elementTop + 100
                      
                      // Usa smoothScrollTo que dispara eventos de scroll
                      smoothScrollTo(targetPosition, 1000).then(() => {
                      // Garante que eventos de scroll sejam disparados para o Spline detectar
                      setTimeout(() => {
                        window.dispatchEvent(new Event('scroll', { bubbles: true }))
                      }, 50)
                      })
                    }
                  }}
                  className="flex items-center justify-center gap-2 sm:gap-[10px] rounded-xl sm:rounded-[16px] border border-primary-500 bg-transparent px-4 sm:px-5 py-3 sm:py-[18px] text-sm sm:text-base font-medium text-primary-500 transition-opacity hover:opacity-80"
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
              <div className="carousel-fade relative max-w-xl overflow-hidden bg-transparent">
                {/* Container do carousel */}
                <div ref={carouselRef} className="flex" style={{ width: 'max-content', transform: 'translateZ(0)' }}>
                  {/* Primeira sequência */}
                  {['aguaviva.png', 'brahma.png', 'casamadeira.png', 'consertec.png', 'laz.png', 'peterlongo.png', 'super7.png'].map((img, idx) => (
                    <Image
                      key={`first-${idx}`}
                      src={`/carousel/${img}`}
                      alt=""
                      width={80}
                      height={60}
                      className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] w-auto h-auto object-contain mr-5 sm:mr-10"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      unoptimized
                    />
                  ))}
                  {/* Segunda sequência (duplicada para loop) */}
                  {['aguaviva.png', 'brahma.png', 'casamadeira.png', 'consertec.png', 'laz.png', 'peterlongo.png', 'super7.png'].map((img, idx) => (
                    <Image
                      key={`second-${idx}`}
                      src={`/carousel/${img}`}
                      alt=""
                      width={80}
                      height={60}
                      className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] w-auto h-auto object-contain mr-5 sm:mr-10"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      unoptimized
                    />
                  ))}
                  {/* Terceira sequência (para loop infinito fluido) */}
                  {['aguaviva.png', 'brahma.png', 'casamadeira.png', 'consertec.png', 'laz.png', 'peterlongo.png', 'super7.png'].map((img, idx) => (
                    <Image
                      key={`third-${idx}`}
                      src={`/carousel/${img}`}
                      alt=""
                      width={80}
                      height={60}
                      className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] w-auto h-auto object-contain mr-5 sm:mr-10"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      unoptimized
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Container para manter a seção fixa durante 2 rolagens */}
        <div className="relative" style={{ height: '220vh' }}>
          {/* Nova Seção de Cards - fica sticky durante 2 rolagens */}
          <section id="beneficios" ref={cardsSectionRef} className="w-full py-52 sticky top-0">
          <div className="flex flex-col lg:flex-row justify-between items-start w-full gap-8 lg:gap-0">
            {/* Coluna Esquerda - 3 cards */}
            <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 items-start w-full lg:w-auto">
              <BenefitCard
                index={0}
                icon={cardsData[0].icon}
                title={cardsData[0].title}
                description={cardsData[0].description}
                lineConfig={cardsData[0].lineConfig}
                cardRef={(el) => { cardRefs.current[0] = el }}
                className={cardsData[0].className}
              />
              <BenefitCard
                index={1}
                icon={cardsData[1].icon}
                title={cardsData[1].title}
                description={cardsData[1].description}
                lineConfig={cardsData[1].lineConfig}
                cardRef={(el) => { cardRefs.current[1] = el }}
              />
              <BenefitCard
                index={2}
                icon={cardsData[2].icon}
                title={cardsData[2].title}
                description={cardsData[2].description}
                lineConfig={cardsData[2].lineConfig}
                cardRef={(el) => { cardRefs.current[2] = el }}
              />
            </div>

            {/* Coluna Direita - 3 cards */}
            <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 items-start lg:items-end w-full lg:w-auto">
              <BenefitCard
                index={3}
                icon={cardsData[3].icon}
                title={cardsData[3].title}
                description={cardsData[3].description}
                lineConfig={cardsData[3].lineConfig}
                cardRef={(el) => { cardRefs.current[3] = el }}
              />
              <BenefitCard
                index={4}
                icon={cardsData[4].icon}
                title={cardsData[4].title}
                description={cardsData[4].description}
                lineConfig={cardsData[4].lineConfig}
                cardRef={(el) => { cardRefs.current[4] = el }}
              />
              <BenefitCard
                index={5}
                icon={cardsData[5].icon}
                title={cardsData[5].title}
                description={cardsData[5].description}
                lineConfig={cardsData[5].lineConfig}
                cardRef={(el) => { cardRefs.current[5] = el }}
              />
            </div>
          </div>
        </section>
        </div>

        {/* Seção Como Funciona */}
        <section id="comofunciona" ref={comofuncionaSectionRef} className="w-full py-24 sm:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna Esquerda - Vazia */}
              <div className="hidden lg:block"></div>
              
              {/* Coluna Direita - Cards */}
              <div className="flex flex-col items-start">
              {[
                {
                  step: 1,
                  icon: '/icons/step1.svg',
                  title: 'Escolha no Catálogo',
                  description: 'Navegue por nossas categorias e selecione o produto base que atende sua necessidade.'
                },
                {
                  step: 2,
                  icon: '/icons/step2.svg',
                  title: 'Defina Quantidade e Arte',
                  description: 'Selecione quantas unidades precisa e faça o upload do arquivo (logo ou desenho) que será gravado na peça.'
                },
                {
                  step: 3,
                  icon: '/icons/step3.svg',
                  title: 'Realize o Pagamento',
                  description: 'Finalize seu pedido de forma segura diretamente pelo site para garantir sua reserva de produção.'
                },
                {
                  step: 4,
                  icon: '/icons/step4.svg',
                  title: 'Pronto!',
                  description: 'Aguarde nossa equipe entrar em contato. Vamos confirmar os detalhes da arte e garantir que tudo esteja perfeito antes de ligar as máquinas.'
                }
              ].map((etapa, index, array) => {
                // Calcula a cor da linha baseado no progresso
                const progress = index / (array.length - 1)
                const lineColor = progress < 0.5 
                  ? `linear-gradient(to bottom, #3D3D3D ${progress * 200}%, #E9EF33 ${progress * 200}%)`
                  : '#E9EF33'
                
                return (
                  <div key={etapa.step} className="relative w-full">
                    <div className="flex items-stretch gap-4">
                      {/* Card do Número */}
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-16 sm:w-20 md:w-24 h-full rounded-[16px] bg-primary-500 flex items-center justify-center">
                          <span className="text-[32px] font-semibold text-neutral-950">
                            {etapa.step}
                          </span>
                        </div>
                        
                        {/* Linha vertical conectando etapas */}
                        {index < array.length - 1 && (
                          <div className="absolute left-1/2 top-full w-0.5 -translate-x-1/2 overflow-hidden" style={{ height: '600px' }}>
                            {/* Linha cinza de fundo */}
                            <div className="absolute inset-0 bg-header-border" />
                            {/* Linha verde que vai crescendo */}
                            <div 
                              className="line-animated absolute left-0 top-0 w-full bg-primary-500"
                              style={{ height: '0%' }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Card de Conteúdo */}
                      <div className="flex-1 rounded-[16px] bg-primary-500 p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex-shrink-0">
                            <Image
                              src={etapa.icon}
                              alt=""
                              width={24}
                              height={24}
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              style={{ filter: 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' }}
                            />
                          </div>
                          <h3 className="text-[32px] font-semibold text-neutral-950">
                            {etapa.title}
                          </h3>
                          <p className="text-[16px] text-neutral-950/80 leading-relaxed">
                            {etapa.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Espaço entre etapas */}
                    {index < array.length - 1 && (
                      <div className="h-[600px]" />
                    )}
                  </div>
                )
              })}
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

