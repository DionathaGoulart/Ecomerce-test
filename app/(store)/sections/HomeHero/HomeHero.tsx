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
    <section id="home" className="min-h-0 md:min-h-screen flex items-start relative z-10">
      <div className="w-full relative z-10 pt-24 sm:pt-28 md:pt-32 lg:pt-64 xl:pt-32 3xl:pt-40 2xl:pt-56 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
        <div className="max-w-2xl mx-auto md:mx-0">
          {/* Título */}
          <h1 className="text-[64px] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[96px] font-semibold text-white mb-3 sm:mb-6 md:mb-8 lg:mb-12 leading-tight sm:leading-none text-center md:text-left">
            Cortes & Gravações
          </h1>

          {/* Texto */}
          <p className="text-[14px] sm:text-base md:text-base lg:text-base text-white mb-4 sm:mb-8 md:mb-12 lg:mb-16 leading-relaxed max-w-full sm:max-w-[35rem] text-center md:text-left" style={{ opacity: 0.8 }}>
            Materializamos a sua marca em peças exclusivas de MDF e Pinus desde embalagens premium até projetos complexos. Sem pedido mínimo.
          </p>

              {/* Botões */}
              <div className="flex flex-row items-center justify-center md:justify-start gap-3 sm:gap-4">
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
                  className="group relative flex items-center justify-center rounded-xl sm:rounded-[16px] bg-primary-500 px-5 sm:px-6 md:px-5 py-3 sm:py-3.5 md:py-[18px] text-[14px] sm:text-base font-medium text-neutral-950 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:pl-[50px] sm:hover:pl-[55px] md:hover:pl-[50px] w-full sm:w-auto overflow-hidden"
                >
                  <Image
                    src="/icons/eye.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="absolute left-[18px] sm:left-[20px] md:left-[18px] top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 opacity-0 -translate-x-[15px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                  />
                  <span className="whitespace-nowrap inline-block">Ver catálogo</span>
                </a>

                {/* Botão Orçar Projeto */}
                <a
                  href={`https://wa.me/5554999851285?text=${encodeURIComponent('Olá! Gostaria de solicitar um orçamento para um projeto personalizado.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center rounded-xl sm:rounded-[16px] border border-primary-500 bg-transparent px-5 sm:px-6 md:px-5 py-3 sm:py-3.5 md:py-[18px] text-[14px] sm:text-base font-medium text-primary-500 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:pl-[50px] sm:hover:pl-[55px] md:hover:pl-[50px] w-full sm:w-auto overflow-hidden"
                >
                  <Image
                    src="/icons/project.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="absolute left-[18px] sm:left-[20px] md:left-[18px] top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 opacity-0 -translate-x-[15px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                  />
                  <span className="whitespace-nowrap inline-block">Orçar projeto</span>
                </a>
              </div>
        </div>

        {/* Seção Clientes */}
        <div className="mt-4 sm:mt-6 md:mt-8 lg:mt-12">
          <ClientCarousel />
        </div>
      </div>
    </section>
  )
}

