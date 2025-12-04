import { useRef } from 'react'
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

  useBenefitsAnimation(cardsSectionRef, cardRefs)

  return (
    <div className="relative h-[220vh]">
      <section id="beneficios" ref={cardsSectionRef} className="w-full py-52 sticky top-0">
        <div className="flex flex-col lg:flex-row justify-between items-start w-full gap-8 lg:gap-0">
          {/* Coluna Esquerda - 3 cards */}
          <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 items-start w-full lg:w-auto">
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
          <div className="flex flex-col gap-6 sm:gap-10 md:gap-12 items-start lg:items-end w-full lg:w-auto">
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

