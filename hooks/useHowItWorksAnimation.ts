import { useEffect, RefObject } from 'react'

export function useHowItWorksAnimation(sectionRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const updateLines = () => {
      const windowHeight = window.innerHeight
      const windowCenter = windowHeight * 0.5
      
      const greenLines = section.querySelectorAll('.line-animated')
      
      greenLines.forEach((line) => {
        const lineEl = line as HTMLElement
        const lineContainer = lineEl.parentElement
        if (!lineContainer) return
        
        const cardContainer = lineContainer.closest('.relative')
        if (!cardContainer) return
        
        const cardRect = cardContainer.getBoundingClientRect()
        const cardTop = cardRect.top
        
        const distanceFromCenter = windowCenter - cardTop
        const lineHeight = 600
        let progress = 0
        
        if (distanceFromCenter > 0) {
          progress = Math.min(distanceFromCenter / lineHeight, 1)
        }
        
        progress = Math.max(progress, 0)
        lineEl.style.height = `${progress * 100}%`
      })
    }

    const handleScroll = () => {
      updateLines()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateLines)
    updateLines()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateLines)
    }
  }, [sectionRef])
}

