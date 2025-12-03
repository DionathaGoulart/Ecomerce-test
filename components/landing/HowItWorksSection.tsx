import Image from 'next/image'
import { useRef } from 'react'
import { useHowItWorksAnimation } from '@/hooks/useHowItWorksAnimation'

interface Step {
  step: number
  icon: string
  title: string
  description: string
}

const STEPS: Step[] = [
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
]

interface HowItWorksSectionProps {
  sectionRef?: React.RefObject<HTMLElement>
}

export function HowItWorksSection({ sectionRef: externalRef }: HowItWorksSectionProps = {}) {
  const internalRef = useRef<HTMLElement>(null)
  const sectionRef = (externalRef || internalRef) as React.RefObject<HTMLElement>
  useHowItWorksAnimation(sectionRef)

  return (
    <section id="comofunciona" ref={sectionRef as React.RefObject<HTMLElement>} className="w-full py-24 sm:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Vazia */}
          <div className="hidden lg:block"></div>
          
          {/* Coluna Direita - Cards */}
          <div className="flex flex-col items-start">
            {STEPS.map((etapa, index, array) => {
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
  )
}

