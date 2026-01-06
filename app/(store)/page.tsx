'use client'

import { useRef, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { 
  HomeHero, 
  BenefitsSection, 
  HowItWorksSection
} from './sections'
import { useSplineLimit } from '@/hooks/useSplineLimit'
import Footer from '@/components/store/Footer'

// Carregar SplineBackground dinamicamente para evitar problemas com async/await
const SplineBackground = dynamic(() => import('./sections/SplineBackground/SplineBackground').then(mod => ({ default: mod.SplineBackground })), {
  ssr: false,
  loading: () => <div className="w-full h-full" />
})

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const splineContainerRef = useRef<HTMLDivElement>(null)
  const comofuncionaSectionRef = useRef<HTMLElement>(null)
  const homeSectionRef = useRef<HTMLElement>(null)

  useSplineLimit(containerRef, splineContainerRef, comofuncionaSectionRef, homeSectionRef)

  return (
    <>
      {/* Mobile e Desktop: Container com Spline de fundo - todas as seções */}
      <div>
        <div 
          className="relative -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32 3xl:-mx-40 2xl:-mx-96 overflow-x-clip overflow-y-visible" 
          ref={splineContainerRef}
        >
          {/* Spline de fundo - absolute para não empurrar conteúdo */}
          <div className="absolute inset-0 z-0-isolate">
            <Suspense fallback={<div className="w-full h-full" />}>
              <SplineBackground />
            </Suspense>
          </div>

          {/* Container principal - conteúdo começa no topo, sem espaço extra */}
          <div 
            ref={containerRef} 
            className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 3xl:px-40 2xl:px-96 m-0 p-0 overflow-visible"
          >
            {/* Espaço grande antes da seção Home - apenas no mobile */}
            <div className="md:hidden h-[120vh]"></div>
            
            {/* Seção Home */}
            <HomeHero sectionRef={homeSectionRef} />

            {/* Div separada para outras seções */}
            <div className="relative z-10">
              {/* Seção de Benefícios */}
              <BenefitsSection />

              {/* Seção Como Funciona */}
              <HowItWorksSection sectionRef={comofuncionaSectionRef} />
            </div>
          </div>

          {/* Footer - fora do container com padding para ocupar toda a largura */}
          <div className="relative z-10">
            <Footer />
          </div>
        </div>
      </div>
    </>
  )
}
