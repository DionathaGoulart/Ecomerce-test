'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { useHowItWorksAnimationMobile } from '@/hooks/useHowItWorksAnimation.mobile'

interface Step {
  step: number
  icon: string
  title: string
  titleMobile?: string
  description: string
  descriptionMobile?: string
}

const STEPS: Step[] = [
  {
    step: 1,
    icon: '/icons/step1.svg',
    title: 'Escolha no Catálogo',
    titleMobile: 'Escolha o Produto',
    description: 'Navegue por nossas categorias e selecione o produto base que atende sua necessidade.',
    descriptionMobile: 'Navegue por nossas categorias e selecione o produto que deseja.'
  },
  {
    step: 2,
    icon: '/icons/step2.svg',
    title: 'Defina os Detalhes',
    titleMobile: 'Defina os Detalhes',
    description: 'Selecione quantas unidades precisa e faça o upload do arquivo (logo ou desenho) que será gravado na peça.',
    descriptionMobile: 'Escolha a quantidade que precisa e faça o upload do arquivo que será gravado.'
  },
  {
    step: 3,
    icon: '/icons/step3.svg',
    title: 'Realize o Pagamento',
    titleMobile: 'Realize o Pagamento',
    description: 'Finalize seu pedido de forma segura diretamente pelo site para garantir sua reserva de produção.',
    descriptionMobile: 'Finalize seu pedido de forma segura diretamente pelo site para garantir sua produção.'
  },
  {
    step: 4,
    icon: '/icons/step4.svg',
    title: 'Pronto!',
    titleMobile: 'Pronto!',
    description: 'Aguarde nossa equipe entrar em contato. Vamos confirmar os detalhes da arte e garantir que tudo esteja perfeito antes de ligar as máquinas.',
    descriptionMobile: 'Nossa equipe entrará em contato para confirmar os detalhes antes da produção.'
  }
]

interface HowItWorksSectionMobileProps {
  sectionRef?: React.RefObject<HTMLElement>
}

export function HowItWorksSectionMobile({ sectionRef: externalRef }: HowItWorksSectionMobileProps = {}) {
  const internalRef = useRef<HTMLElement>(null)
  const sectionRef = (externalRef || internalRef) as React.RefObject<HTMLElement>
  useHowItWorksAnimationMobile(sectionRef)

  return (
    <section id="comofunciona" ref={sectionRef as React.RefObject<HTMLElement>} className="w-full py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-0 sm:px-4">
        {/* Título Mobile */}
        <div className="mb-6">
          <h2 className="text-[48px] font-semibold text-left">
            <span className="text-white">Como</span>{' '}
            <span className="text-[#E9EF33]">Funciona?</span>
          </h2>
        </div>
        
        {/* Cards - Layout mobile otimizado */}
        <div className="flex flex-col items-start">
          {STEPS.map((etapa, index, array) => {
            return (
              <div key={etapa.step} className="relative w-full">
                <div className="flex items-stretch gap-2 sm:gap-3">
                  {/* Card do Número */}
                  <div className="flex-shrink-0 relative z-10 flex">
                    <div 
                      className="step-number-card step-card-gray rounded-lg sm:rounded-xl flex items-center justify-center transition-colors duration-300 w-full px-8 py-[90px] self-stretch min-h-full"
                      data-step-index={index}
                    >
                      <span className="text-[32px] sm:text-2xl md:text-3xl font-semibold text-white">
                        {etapa.step}
                      </span>
                    </div>
                    
                    {/* Linha vertical conectando etapas */}
                    {index < array.length - 1 && (
                      <div className="absolute left-1/2 top-full w-0.5 -translate-x-1/2 overflow-hidden h-[80px] sm:h-[180px] md:h-[250px]">
                        {/* Linha cinza de fundo */}
                        <div className="absolute inset-0 bg-header-border" />
                        {/* Linha verde que vai crescendo */}
                        <div 
                          className="line-animated absolute left-0 top-0 w-full bg-primary-500 h-0"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Card de Conteúdo */}
                  <div 
                    className="step-content-card step-card-gray flex-1 rounded-lg sm:rounded-xl transition-colors duration-300 flex p-8 self-stretch min-h-full"
                    data-step-index={index}
                  >
                    <div className="flex flex-col gap-2 sm:gap-2 md:gap-3 w-full">
                      <div className="flex-shrink-0">
                        <Image
                          src={etapa.icon}
                          alt=""
                          width={32}
                          height={32}
                          className="step-icon w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-all duration-300"
                        />
                      </div>
                      <h3 className="text-[24px] sm:text-xl md:text-2xl font-semibold text-white transition-colors duration-300">
                        {etapa.titleMobile || etapa.title}
                      </h3>
                      <p className="text-[12px] sm:text-sm md:text-base text-white/80 leading-relaxed transition-colors duration-300 max-w-[85%]">
                        {etapa.descriptionMobile || etapa.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Espaço entre etapas */}
                {index < array.length - 1 && (
                  <div className="h-[80px] sm:h-[180px] md:h-[250px]" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

