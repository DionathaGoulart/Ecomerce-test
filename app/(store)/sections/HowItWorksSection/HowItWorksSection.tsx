import Image from 'next/image'
import { useRef } from 'react'
import { useHowItWorksAnimation } from '@/hooks/useHowItWorksAnimation'
import { STEPS } from '@/lib/constants/steps'

interface HowItWorksSectionProps {
  sectionRef?: React.RefObject<HTMLElement>
}

export function HowItWorksSection({ sectionRef: externalRef }: HowItWorksSectionProps = {}) {
  const internalRef = useRef<HTMLElement>(null)
  const sectionRef = (externalRef || internalRef) as React.RefObject<HTMLElement>
  useHowItWorksAnimation(sectionRef)

  return (
    <section id="comofunciona" ref={sectionRef as React.RefObject<HTMLElement>} className="w-full py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32">
      <div className="max-w-7xl mx-auto px-0 sm:px-4 md:px-6">
        {/* Título Mobile */}
        <div className="lg:hidden mb-6">
          <h2 className="text-[48px] font-semibold text-left">
            <span className="text-white-custom">Como</span>{' '}
            <span className="text-primary-yellow">Funciona?</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Coluna Esquerda - Vazia no Desktop */}
          <div className="hidden lg:block"></div>
          
          {/* Coluna Direita - Cards */}
          <div className="flex flex-col items-start">
            {STEPS.map((etapa, index, array) => {
              return (
                <div key={etapa.step} className="relative w-full">
                  <div className="flex items-stretch gap-2 sm:gap-3 md:gap-4">
                    {/* Card do Número */}
                    <div className="flex-shrink-0 relative z-10 flex">
                      <div 
                        className="step-number-card rounded-lg sm:rounded-xl md:rounded-[16px] flex items-center justify-center transition-colors duration-300 w-full"
                        style={{ 
                          backgroundColor: '#212121',
                          paddingLeft: '32px',
                          paddingRight: '32px',
                          paddingTop: '90px',
                          paddingBottom: '90px',
                          alignSelf: 'stretch',
                          minHeight: '100%'
                        }}
                        data-step-index={index}
                      >
                        <span className="text-[32px] sm:text-2xl md:text-3xl lg:text-[32px] font-semibold text-white lg:text-neutral-950">
                          {etapa.step}
                        </span>
                      </div>
                      
                      {/* Linha vertical conectando etapas */}
                      {index < array.length - 1 && (
                        <div className="absolute left-1/2 top-full w-0.5 -translate-x-1/2 overflow-hidden h-[80px] sm:h-[180px] md:h-[250px] lg:h-[400px] xl:h-[600px]">
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
                    <div 
                      className="step-content-card flex-1 rounded-lg sm:rounded-xl md:rounded-[16px] transition-colors duration-300 flex"
                      data-step-index={index}
                      style={{ 
                        backgroundColor: '#212121',
                        padding: '32px',
                        alignSelf: 'stretch',
                        minHeight: '100%'
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:gap-2 md:gap-3 lg:gap-4 w-full">
                        <div className="flex-shrink-0">
                          <Image
                            src={etapa.icon}
                            alt=""
                            width={32}
                            height={32}
                            className="step-icon w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 transition-all duration-300"
                            style={{ filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)' }}
                          />
                        </div>
                        <h3 className="text-[24px] sm:text-xl md:text-2xl lg:text-3xl xl:text-[32px] font-semibold text-white transition-colors duration-300">
                          <span className="lg:hidden">{etapa.titleMobile || etapa.title}</span>
                          <span className="hidden lg:inline">{etapa.title}</span>
                        </h3>
                        <p className="text-[12px] sm:text-sm md:text-base lg:text-[16px] text-white/80 leading-relaxed transition-colors duration-300 max-w-[85%] lg:max-w-full">
                          <span className="lg:hidden">{etapa.descriptionMobile || etapa.description}</span>
                          <span className="hidden lg:inline">{etapa.description}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Espaço entre etapas */}
                  {index < array.length - 1 && (
                    <div className="h-[80px] sm:h-[180px] md:h-[250px] lg:h-[400px] xl:h-[600px]" />
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

