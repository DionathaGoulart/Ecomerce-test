'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { smoothScrollTo, setupSplineScrollSync } from '@/lib/utils/smoothScroll'

// Componente Spline otimizado que carrega apenas no cliente
function SplineBackground() {
  const [Spline, setSpline] = useState<any>(null)
  const splineRef = useRef<any>(null)

  useEffect(() => {
    // Carrega o Spline apenas no cliente usando o componente padrão (não /next)
    // O componente padrão tem melhor suporte para callbacks
    import('@splinetool/react-spline').then((mod) => {
      setSpline(() => mod.default)
    })
  }, [])

  // Atualiza Spline baseado na posição atual do scroll (altura da tela)
  // Não depende de eventos, apenas monitora continuamente a posição
  useEffect(() => {
    let rafId: number | null = null
    
    const updateSplineBasedOnPosition = () => {
      // Lê a posição atual do scroll (altura da tela)
      const currentScrollY = window.scrollY || document.documentElement.scrollTop
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      
      // Calcula o progresso (0 = topo, 1 = final)
      const scrollProgress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScrollY / maxScroll)) : 0
      
      // Atualiza o Spline diretamente baseado na posição atual
      if (splineRef.current && splineRef.current.application) {
        try {
          const app = splineRef.current.application
          
          // Método 1: Procura variável global de scroll
          if (app.findVariableByName) {
            const scrollVar = app.findVariableByName('scroll')
            if (scrollVar) {
              scrollVar.value = scrollProgress
            }
            
            // Tenta outros nomes comuns
            const scrollYVar = app.findVariableByName('scrollY')
            const scrollProgressVar = app.findVariableByName('scrollProgress')
            if (scrollYVar) {
              scrollYVar.value = currentScrollY
            }
            if (scrollProgressVar) {
              scrollProgressVar.value = scrollProgress
            }
          }
          
          // Método 2: Procura em todos os objetos da cena
          if (app.objects) {
            for (const obj of app.objects) {
              if (obj.variables) {
                // Procura qualquer variável relacionada a scroll
                const scrollVar = obj.variables.find((v: any) => 
                  v.name === 'scroll' || 
                  v.name === 'scrollY' || 
                  v.name === 'scrollProgress' ||
                  v.name?.toLowerCase().includes('scroll')
                )
                if (scrollVar) {
                  // Atualiza com o progresso (0 a 1)
                  scrollVar.value = scrollProgress
                }
              }
            }
          }
        } catch (e) {
          // Ignora erros silenciosamente
        }
      }
      
      // Continua monitorando em cada frame
      rafId = requestAnimationFrame(updateSplineBasedOnPosition)
    }
    
    // Inicia o loop contínuo de atualização
    // Isso garante que o Spline sempre reflete a posição atual, independente de como o scroll aconteceu
    rafId = requestAnimationFrame(updateSplineBasedOnPosition)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  if (!Spline) {
    return null
  }

  return (
    <Spline
      scene="https://prod.spline.design/lzqdiUivvSwKYvU9/scene.splinecode"
      className="w-full h-full"
      onLoad={(spline: any) => {
        // Armazena a instância do Spline para acesso direto
        splineRef.current = spline
        // Expõe globalmente para acesso em smoothScroll
        ;(window as any).__splineInstance = spline
        
        console.log('✅ Spline carregado!', spline)
        
        // DEBUG: Lista todas as variáveis disponíveis
        try {
          if (spline.application) {
            const app = spline.application
            console.log('📋 Application:', app)
            
            // Lista todas as variáveis globais
            if (app.variables) {
              console.log('📊 Variáveis globais:', Object.keys(app.variables))
            }
            
            // Lista objetos e suas variáveis
            if (app.objects) {
              console.log('🎯 Total de objetos:', app.objects.length)
              app.objects.forEach((obj: any, index: number) => {
                if (obj.variables && obj.variables.length > 0) {
                  console.log(`📦 Objeto ${index} (${obj.name || 'sem nome'}):`, 
                    obj.variables.map((v: any) => v.name))
                }
              })
            }
            
            // Tenta encontrar variável de scroll
            if (app.findVariableByName) {
              const scrollVar = app.findVariableByName('scroll')
              const scrollYVar = app.findVariableByName('scrollY')
              const scrollProgressVar = app.findVariableByName('scrollProgress')
              console.log('🔍 Variáveis de scroll encontradas:', {
                scroll: scrollVar ? 'SIM' : 'NÃO',
                scrollY: scrollYVar ? 'SIM' : 'NÃO',
                scrollProgress: scrollProgressVar ? 'SIM' : 'NÃO'
              })
            }
          }
        } catch (e) {
          console.error('❌ Erro ao inspecionar Spline:', e)
        }
        
        // Força uma atualização inicial
        setTimeout(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight
          const scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0
          
          try {
            if (spline.application) {
              const app = spline.application
              if (app.findVariableByName) {
                const scrollVar = app.findVariableByName('scroll')
                if (scrollVar) {
                  scrollVar.value = scrollProgress
                  console.log('✅ Atualização inicial:', scrollProgress)
                }
              }
            }
          } catch (e) {
            console.error('❌ Erro na atualização inicial:', e)
          }
        }, 100)
      }}
    />
  )
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsSectionRef = useRef<HTMLElement>(null)

  // Pré-carrega o recurso do Spline assim que a página carrega
  useEffect(() => {
    // Pré-conecta ao domínio do Spline
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = 'https://prod.spline.design'
    document.head.appendChild(link)

    // Pré-conecta ao domínio do Spline
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = 'https://prod.spline.design'
    preconnect.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect)

    // Pré-baixa o arquivo do Spline
    const prefetch = document.createElement('link')
    prefetch.rel = 'prefetch'
    prefetch.href = 'https://prod.spline.design/lzqdiUivvSwKYvU9/scene.splinecode'
    document.head.appendChild(prefetch)

    // Configura sincronização de scroll com Spline
    const cleanup = setupSplineScrollSync()

    return () => {
      cleanup()
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
        <div className="w-full h-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-48">
          <div className="w-full h-full translate-y-8 sm:translate-y-16 md:translate-y-24 scale-110 sm:scale-125">
            <div className="w-full h-full rounded-2xl overflow-hidden">
              <SplineBackground />
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
                  onClick={async (e) => {
                    e.preventDefault()
                    const element = document.getElementById('beneficios')
                    if (element) {
                      const isMobile = window.innerWidth < 768
                      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                      const extraOffset = isMobile ? 200 : isTablet ? 400 : 580
                      const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                      const elementPosition = element.offsetTop
                      const targetPosition = elementPosition - headerOffset + extraOffset
                      
                      // Usa a função otimizada para scroll suave que garante sincronização com Spline
                      await smoothScrollTo(targetPosition, 1000)
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

        {/* Nova Seção de Cards */}
        <section id="beneficios" ref={cardsSectionRef} className="w-full py-16 sm:py-24 md:py-48 lg:py-96 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start w-full py-8 sm:py-12 md:py-16 lg:py-32 gap-8 lg:gap-0">
            {/* Coluna Esquerda - 3 cards */}
            <div className="flex flex-col gap-8 sm:gap-12 md:gap-16 items-start w-full lg:w-auto">
              {/* Card 1 */}
              <div className="relative w-full lg:w-auto">
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
            <div className="flex flex-col gap-8 sm:gap-12 md:gap-16 items-start lg:items-end w-full lg:w-auto">
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

        {/* Espaço para scroll */}
        <div className="h-[200vh]" />
      </div>
    </>
  )
}

