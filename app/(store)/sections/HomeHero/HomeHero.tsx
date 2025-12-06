import Link from 'next/link'
import Image from 'next/image'
import { smoothScrollTo } from '@/lib/utils/smoothScroll'
import { ClientCarousel } from '../ClientCarousel/ClientCarousel'

export function HomeHero() {
  const handleScrollToBenefits = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const element = document.getElementById('beneficios')
    if (element) {
      const rect = element.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const elementTop = rect.top + scrollTop
      const targetPosition = elementTop + 100
      
      smoothScrollTo(targetPosition, 1000).then(() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('scroll', { bubbles: true }))
        }, 50)
      })
    }
  }

  return (
    <section id="home" className="min-h-screen flex items-start relative z-10">
      <div className="w-full relative z-10 pt-24 sm:pt-28 md:pt-32 lg:pt-64">
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
            {/* Botão Ver Catálogo */}
            <a
              href="#catalogo"
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById('catalogo')
                if (element) {
                  const rect = element.getBoundingClientRect()
                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
                  const elementTop = rect.top + scrollTop
                  const isMobile = window.innerWidth < 768
                  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
                  const headerOffset = isMobile ? 80 : isTablet ? 100 : 120
                  const targetPosition = elementTop - headerOffset
                  smoothScrollTo(targetPosition, 1000)
                }
              }}
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
            </a>

            {/* Botão Orçar Projeto */}
            <a
              href="#beneficios"
              onClick={handleScrollToBenefits}
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
        <ClientCarousel />
      </div>
    </section>
  )
}

