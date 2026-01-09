import { useRef, useEffect } from 'react'
import { BenefitCard, LineConfig } from './BenefitCard'
import { useBenefitsAnimation } from '@/hooks/useBenefitsAnimation'

// Hook customizado baseado no useCarouselAnimation, mas com duração e posição inicial customizáveis
function useBenefitsCarousel(duration: number = 30000, startPosition: number = 0, direction: 'left' | 'right' = 'left') {
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const isMobile = window.innerWidth < 768
    if (!isMobile) return

    const initAnimation = () => {
      requestAnimationFrame(() => {
        const carouselWidth = carousel.scrollWidth
        const sequenceWidth = carouselWidth / 3
        const speed = sequenceWidth / duration

        let startTime: number | null = null
        let lastPosition = 0
        let animationFrameId: number

        const animate = (timestamp: number) => {
          if (!startTime) {
            // Inicializar startTime considerando a posição inicial
            startTime = timestamp - (startPosition / speed)
          }

          const elapsed = timestamp - startTime
          const totalDistance = elapsed * speed

          // Calcular posição atual
          let currentPosition

          if (direction === 'left') {
            // Movimento para esquerda: 0 -> -sequenceWidth
            currentPosition = -(totalDistance % sequenceWidth)

            // Reset quando completa o ciclo
            if (Math.abs(currentPosition + sequenceWidth) < 2 || currentPosition > 0) {
              currentPosition = 0
              // Ajustar o startTime para manter a continuidade
              const cycles = Math.floor(totalDistance / sequenceWidth)
              const remainder = totalDistance - (cycles * sequenceWidth)
              startTime = timestamp - (remainder / speed)
            }
          } else {
            // Movimento para direita: -sequenceWidth -> 0
            const remainder = totalDistance % sequenceWidth
            currentPosition = -sequenceWidth + remainder

            // Reset quando completa o ciclo (chega em 0)
            if (currentPosition > -2) {
              currentPosition = -sequenceWidth
              // Ajustar o startTime para manter a continuidade
              const cycles = Math.floor(totalDistance / sequenceWidth)
              const newRemainder = totalDistance - (cycles * sequenceWidth)
              startTime = timestamp - (newRemainder / speed)
            }
          }

          // Atualizar transform apenas se houver mudança significativa
          if (Math.abs(currentPosition - lastPosition) > 0.01) {
            carousel.style.transform = `translate3d(${currentPosition}px, 0, 0)`
            lastPosition = currentPosition
          }

          animationFrameId = requestAnimationFrame(animate)
        }

        animationFrameId = requestAnimationFrame(animate)

        // Cleanup
        return () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId)
          }
        }
      })
    }

    const timeoutId = setTimeout(initAnimation, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [duration, startPosition, direction])

  return carouselRef
}

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
      horizontalLine: { x1: 0, y1: 100, x2: 280, y2: 100 },
      circle: { cx: 280, cy: 100 }
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
      horizontalLine: { x1: 0, y1: 100, x2: 260, y2: 100 },
      verticalLine: { x1: 260, y1: 100, x2: 260, y2: 35 },
      circle: { cx: 260, cy: 35 }
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
      horizontalLine: { x1: 220, y1: 100, x2: 90, y2: 100 },
      verticalLine: { x1: 90, y1: 100, x2: 90, y2: 30 },
      circle: { cx: 90, cy: 30 }
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
      horizontalLine: { x1: 300, y1: 100, x2: 40, y2: 100 },
      circle: { cx: 40, cy: 100 }
    }
  }
]

export function BenefitsSection() {
  const cardsSectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useBenefitsAnimation(cardsSectionRef, cardRefs)

  // Calcular posição inicial do carrossel 2 para dessincronização
  const cardWidth = 242
  const gap = 12
  const totalWidth = (3 * cardWidth) + (2 * gap)
  const startPosition2 = totalWidth * 0.7

  // Usar hooks baseados no useCarouselAnimation que funciona perfeitamente
  const carousel1Ref = useBenefitsCarousel(40000, 0, 'left') // 40 segundos, começa do início, esquerda
  const carousel2Ref = useBenefitsCarousel(30000, startPosition2, 'right') // 30 segundos, começa offset, direita

  return (
    <div className="relative h-auto md:h-[220vh] xl:h-[320vh] 3xl:h-[300vh] 2xl:h-[220vh] overflow-visible">
      <section id="beneficios" ref={cardsSectionRef} className="w-full pt-8 sm:pt-12 md:pt-16 lg:pt-24 xl:pt-8 3xl:pt-12 2xl:pt-40 pb-12 sm:pb-12 md:pb-16 lg:py-52 xl:py-28 3xl:py-32 2xl:py-52 md:sticky md:top-0 overflow-visible">
        {/* Mobile: 2 Carrosséis horizontais automáticos com 3 itens cada */}
        <div className="lg:hidden space-y-4 -mx-4 sm:-mx-6">
          {/* Título Mobile */}
          <div className="px-4 sm:px-6 pb-4">
            <h2 className="text-[48px] font-semibold text-left">
              <span className="text-white-custom">Inúmeros</span>{' '}
              <span className="text-primary-yellow">Benefícios</span>
            </h2>
          </div>

          {/* Carrossel 1 - Primeiros 3 cards */}
          <div className="overflow-hidden px-4 sm:px-6">
            <div
              ref={carousel1Ref}
              className="flex items-stretch gap-12-custom w-max-content"
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
                  cardRef={() => { }}
                  className=""
                />
              ))}
              {/* Terceira sequência (para loop infinito fluido) */}
              {CARDS_DATA.slice(0, 3).map((card, index) => (
                <BenefitCard
                  key={`carousel1-third-${index}`}
                  index={index}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  lineConfig={card.lineConfig}
                  cardRef={() => { }}
                  className=""
                />
              ))}
            </div>
          </div>

          {/* Carrossel 2 - Últimos 3 cards */}
          <div className="overflow-hidden">
            <div
              ref={carousel2Ref}
              className="flex items-stretch gap-12-custom w-max-content"
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
                  cardRef={() => { }}
                  className=""
                />
              ))}
              {/* Terceira sequência (para loop infinito fluido) */}
              {CARDS_DATA.slice(3, 6).map((card, index) => (
                <BenefitCard
                  key={`carousel2-third-${index}`}
                  index={index + 3}
                  icon={card.icon}
                  title={card.title}
                  description={card.description}
                  lineConfig={card.lineConfig}
                  cardRef={() => { }}
                  className=""
                />
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Layout original com duas colunas */}
        <div className="hidden lg:flex lg:flex-row lg:justify-between lg:items-start w-full gap-0 overflow-visible relative z-50-isolate">
          {/* Coluna Esquerda - 3 cards */}
          <div className="flex flex-col gap-10 xl:gap-6 3xl:gap-8 2xl:gap-12 items-start w-auto overflow-visible relative z-50">
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
          <div className="flex flex-col gap-10 xl:gap-6 3xl:gap-8 2xl:gap-12 items-end w-auto overflow-visible relative z-50">
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

