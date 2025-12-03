import { useEffect, useRef } from 'react'

export function useCarouselAnimation() {
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const initAnimation = () => {
      const carouselWidth = carousel.scrollWidth
      const sequenceWidth = carouselWidth / 3
      const duration = 30000 // 30 segundos para completar uma sequência
      const speed = sequenceWidth / duration

      let startTime: number | null = null
      let lastPosition = 0

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const totalDistance = elapsed * speed
        const currentPosition = -(totalDistance % sequenceWidth)

        if (Math.abs(currentPosition - lastPosition) > 0.1) {
          carousel.style.transform = `translate3d(${currentPosition}px, 0, 0)`
          lastPosition = currentPosition
        }

        requestAnimationFrame(animate)
      }

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(() => {
      setTimeout(initAnimation, 100)
    })
  }, [])

  return carouselRef
}

