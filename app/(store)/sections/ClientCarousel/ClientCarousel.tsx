import Image from 'next/image'
import { useCarouselAnimation } from '@/hooks/useCarouselAnimation'

const CLIENT_IMAGES = ['aguaviva.png', 'brahma.png', 'casamadeira.png', 'consertec.png', 'laz.png', 'peterlongo.png', 'super7.png']

export function ClientCarousel() {
  const carouselRef = useCarouselAnimation()

  return (
    <div className="mt-4 sm:mt-8 md:mt-12 lg:mt-16 w-full">
      <div className="max-w-2xl mb-4 sm:mb-3 md:mb-4 mx-auto md:mx-0">
        <p className="text-[14px] sm:text-sm md:text-base text-white text-center md:text-left opacity-80">Conheça nossos clientes:</p>
      </div>

      {/* Carousel */}
      <div className="carousel-fade relative max-w-xl overflow-hidden bg-transparent">
        {/* Container do carousel */}
        <div ref={carouselRef} className="flex w-max transform-3d">
          {/* Primeira sequência */}
          {CLIENT_IMAGES.map((img, idx) => (
            <Image
              key={`first-${idx}`}
              src={`/carousel/${img}`}
              alt=""
              width={80}
              height={60}
              className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] object-contain mr-5 sm:mr-10 transform-3d-backface"
              unoptimized
            />
          ))}
          {/* Segunda sequência (duplicada para loop) */}
          {CLIENT_IMAGES.map((img, idx) => (
            <Image
              key={`second-${idx}`}
              src={`/carousel/${img}`}
              alt=""
              width={80}
              height={60}
              className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] object-contain mr-5 sm:mr-10 transform-3d-backface"
              unoptimized
            />
          ))}
          {/* Terceira sequência (para loop infinito fluido) */}
          {CLIENT_IMAGES.map((img, idx) => (
            <Image
              key={`third-${idx}`}
              src={`/carousel/${img}`}
              alt=""
              width={80}
              height={60}
              className="flex-shrink-0 max-w-[60px] sm:max-w-[80px] max-h-[45px] sm:max-h-[60px] object-contain mr-5 sm:mr-10 transform-3d-backface"
              unoptimized
            />
          ))}
        </div>
      </div>
    </div>
  )
}

