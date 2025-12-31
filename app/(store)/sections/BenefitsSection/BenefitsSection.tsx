import { useRef, useEffect } from 'react'
import { BenefitCard, LineConfig } from './BenefitCard'
import { useBenefitsAnimation } from '@/hooks/useBenefitsAnimation'

export interface BenefitCardData {
  icon: string
  title: string
  description: string
  lineConfig: LineConfig
  className?: string
}

const CARDS_DATA: BenefitCardData[] = [
  {
    icon: '/icons/card1.svg',
    title: 'Produtos\nValidados',
    description: 'Itens testados para garantir durabilidade e funcionalidade.',
    lineConfig: {
      svgWidth: 300,
      svgHeight: 200,
      viewBox: '0 0 300 200',
      position: 'left',
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
      position: 'left',
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
      position: 'left',
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
      position: 'right',
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
      position: 'right',
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
      position: 'right',
      horizontalLine: { x1: 300, y1: 100, x2: 60, y2: 100 },
      circle: { cx: 60, cy: 100 }
    }
  }
]

export function BenefitsSection() {
  const cardsSectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const carousel1Ref = useRef<HTMLDivElement>(null)
  const carousel2Ref = useRef<HTMLDivElement>(null)

  useBenefitsAnimation(cardsSectionRef, cardRefs)

  // Função para animar carrossel
  const animateCarousel = (carousel: HTMLDivElement, cardWidth: number, gap: number, startPosition: number = 0, speed: number = 0.3) => {
    let animationId: number
    let position = startPosition
    const totalWidth = (3 * cardWidth) + (2 * gap) // 3 cards + 2 gaps

    const animate = () => {
      position += speed
      
      // Quando chega ao final, volta ao início (loop infinito)
      if (position >= totalWidth) {
        position = 0
      }
      
      carousel.style.transform = `translateX(-${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }

  // Carrosséis automáticos no mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (!isMobile) return

    const carousel1 = carousel1Ref.current
    const carousel2 = carousel2Ref.current
    if (!carousel1 || !carousel2) return

    const cardWidth = 242 // Largura máxima do card no mobile
    const gap = 12
    const totalWidth = (3 * cardWidth) + (2 * gap)

    // Dessincronizar completamente: velocidades diferentes e posições iniciais diferentes
    // Carrossel 1: velocidade normal, começa do início
    // Carrossel 2: velocidade mais rápida, começa em posição aleatória para criar caos
    const speed1 = 0.3
    const speed2 = 0.5 // Mais rápido
    const startPosition2 = (totalWidth * 0.7) // Começa em 70% do caminho

    const cleanup1 = animateCarousel(carousel1, cardWidth, gap, 0, speed1)
    const cleanup2 = animateCarousel(carousel2, cardWidth, gap, startPosition2, speed2)

    return () => {
      cleanup1()
      cleanup2()
    }
  }, [])

  return (
    <div className="relative h-auto md:h-[220vh] xl:h-[320vh] 3xl:h-[300vh] 2xl:h-[220vh] overflow-visible">
      <section id="beneficios" ref={cardsSectionRef} className="w-full pt-8 sm:pt-12 md:pt-16 lg:pt-24 xl:pt-8 3xl:pt-12 2xl:pt-40 pb-8 sm:pb-12 md:pb-16 lg:py-52 xl:py-28 3xl:py-32 2xl:py-52 md:sticky md:top-0 overflow-visible">
        {/* Mobile: 2 Carrosséis horizontais automáticos com 3 itens cada */}
        <div className="lg:hidden space-y-4">
          {/* Carrossel 1 - Primeiros 3 cards */}
          <div className="overflow-hidden">
            <div 
              ref={carousel1Ref}
              className="flex items-stretch"
              style={{ 
                gap: '12px',
                width: 'max-content'
              }}
            >
              {/* Primeira sequência (3 cards) */}
              {CARDS_DATA.slice(0, 3).map((card, index) => (
                <BenefitCard
                  key={`carousel1-first-${index}`}
                  index={index}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  lineConfig={card.lineConfig}
                  cardRef={(el) => { cardRefs.current[index] = el }}
                  className=""
                />
              ))}
              {/* Segunda sequência (duplicada para loop infinito) */}
              {CARDS_DATA.slice(0, 3).map((card, index) => (
                <BenefitCard
                  key={`carousel1-second-${index}`}
                  index={index}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  lineConfig={card.lineConfig}
                  cardRef={() => {}}
                  className=""
                />
              ))}
            </div>
          </div>

          {/* Carrossel 2 - Últimos 3 cards */}
          <div className="overflow-hidden">
            <div 
              ref={carousel2Ref}
              className="flex items-stretch"
              style={{ 
                gap: '12px',
                width: 'max-content'
              }}
            >
              {/* Primeira sequência (3 cards) */}
              {CARDS_DATA.slice(3, 6).map((card, index) => (
                <BenefitCard
                  key={`carousel2-first-${index}`}
                  index={index + 3}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  lineConfig={card.lineConfig}
                  cardRef={(el) => { cardRefs.current[index + 3] = el }}
                  className=""
                />
              ))}
              {/* Segunda sequência (duplicada para loop infinito) */}
              {CARDS_DATA.slice(3, 6).map((card, index) => (
                <BenefitCard
                  key={`carousel2-second-${index}`}
                  index={index + 3}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  lineConfig={card.lineConfig}
                  cardRef={() => {}}
                  className=""
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Layout original com duas colunas */}
        <div className="hidden lg:flex lg:flex-row lg:justify-between lg:items-start w-full gap-0 overflow-visible relative" style={{ zIndex: 50, isolation: 'isolate' }}>
          {/* Coluna Esquerda - 3 cards */}
          <div className="flex flex-col gap-10 xl:gap-6 3xl:gap-8 2xl:gap-12 items-start w-auto overflow-visible relative" style={{ zIndex: 50 }}>
            {CARDS_DATA.slice(0, 3).map((card, index) => (
              <BenefitCard
                key={index}
                index={index}
                icon={card.icon}
                title={card.title}
                description={card.description}
                lineConfig={card.lineConfig}
                cardRef={(el) => { cardRefs.current[index] = el }}
                className={card.className}
              />
            ))}
          </div>

          {/* Coluna Direita - 3 cards */}
          <div className="flex flex-col gap-10 xl:gap-6 3xl:gap-8 2xl:gap-12 items-end w-auto overflow-visible relative" style={{ zIndex: 50 }}>
            {CARDS_DATA.slice(3, 6).map((card, index) => (
              <BenefitCard
                key={index + 3}
                index={index + 3}
                icon={card.icon}
                title={card.title}
                description={card.description}
                lineConfig={card.lineConfig}
                cardRef={(el) => { cardRefs.current[index + 3] = el }}
                className={card.className}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

