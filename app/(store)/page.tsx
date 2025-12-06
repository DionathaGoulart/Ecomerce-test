'use client'

import { useRef } from 'react'
import { 
  SplineBackground, 
  HomeHero, 
  BenefitsSection, 
  HowItWorksSection,
  CatalogSection
} from './sections'
import { useSplineLimit } from '@/hooks/useSplineLimit'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const splineContainerRef = useRef<HTMLDivElement>(null)
  const comofuncionaSectionRef = useRef<HTMLElement>(null)

  useSplineLimit(containerRef, splineContainerRef, comofuncionaSectionRef)

  return (
    <>
      {/* Container das 3 primeiras seções com Spline de fundo */}
      <div 
        className="relative -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-48 2xl:-mx-96" 
        ref={splineContainerRef}
        style={{ overflowX: 'clip' }}
      >
        {/* Spline de fundo - absolute para não empurrar conteúdo */}
        <div className="absolute inset-0 z-0 hidden md:block">
          <SplineBackground />
        </div>

        {/* Container principal - conteúdo começa no topo, sem espaço extra */}
        <div 
          ref={containerRef} 
          className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96 m-0 p-0"
        >
          {/* Seção Home - deve aparecer logo abaixo do header */}
          <HomeHero />

          {/* Seção de Benefícios */}
          <BenefitsSection />

        {/* Seção Como Funciona */}
          <HowItWorksSection sectionRef={comofuncionaSectionRef} />
      </div>
      </div>

      {/* Seção Catálogo - Separada, sem Spline de fundo */}
      <div className="relative z-30 bg-transparent overflow-x-hidden">
        <CatalogSection />
      </div>
    </>
  )
}
