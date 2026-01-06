import { useEffect, useRef } from 'react'

export function useCarouselAnimation() {
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const initAnimation = () => {
      // Aguardar um frame para garantir que o DOM está renderizado
      requestAnimationFrame(() => {
        const carouselWidth = carousel.scrollWidth
        const sequenceWidth = carouselWidth / 3
        const duration = 30000 // 30 segundos para completar uma sequência
        const speed = sequenceWidth / duration

        let startTime: number | null = null
        let lastPosition = 0
        let animationFrameId: number

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp
          const elapsed = timestamp - startTime
          const totalDistance = elapsed * speed
          
          // Calcular posição atual usando módulo
          let currentPosition = -(totalDistance % sequenceWidth)
          
          // Quando chegar muito perto do final da primeira sequência (dentro de 2px),
          // resetar para 0 de forma imperceptível
          // Como temos 3 sequências idênticas, quando a primeira sair, a segunda estará
          // na mesma posição visual, tornando o reset imperceptível
          if (Math.abs(currentPosition + sequenceWidth) < 2 || currentPosition > 0) {
            currentPosition = 0
            // Ajustar o startTime para manter a continuidade da animação
            const cycles = Math.floor(totalDistance / sequenceWidth)
            const remainder = totalDistance - (cycles * sequenceWidth)
            startTime = timestamp - (remainder / speed)
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
  }, [])

  return carouselRef
}

