import { useEffect, RefObject } from 'react'

export function useBenefitsAnimation(
  cardsSectionRef: RefObject<HTMLElement>,
  cardRefs: RefObject<(HTMLDivElement | null)[]>
) {
  // Inicializa as linhas como invisíveis para animação
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    const initializeLines = () => {
      if (window.innerWidth < 1024) return
      
      setTimeout(() => {
        const svgs = cardsSection.querySelectorAll('svg[data-benefit-line]')
        
        svgs.forEach((svg) => {
          const lines = svg.querySelectorAll('line')
          const circles = svg.querySelectorAll('circle')
          
          lines.forEach((line) => {
            const lineEl = line as SVGLineElement
            const length = lineEl.getTotalLength()
            if (length > 0) {
              // Inicializa como invisível para animação
              lineEl.style.strokeDasharray = `${length}`
              lineEl.style.strokeDashoffset = `${length}`
              lineEl.style.opacity = '0'
            }
          })
          
          circles.forEach((circle) => {
            circle.style.opacity = '0'
          })
        })
      }, 1000)
    }

    initializeLines()
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setTimeout(initializeLines, 500)
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [cardsSectionRef])

  // Anima linhas quando a seção estiver visível na tela
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    if (window.innerWidth < 1024) return

    let isAnimated = false
    let hasAnimated = false
    let scrollTimeout: NodeJS.Timeout | null = null

    const animateLines = () => {
      if (hasAnimated) return
      hasAnimated = true

      const svgs = cardsSection.querySelectorAll('svg[data-benefit-line]')
      
      if (svgs.length === 0) {
        hasAnimated = false
        return
      }
      
      svgs.forEach((svg, svgIndex) => {
        const svgLines = svg.querySelectorAll('line')
        const svgCircle = svg.querySelector('circle')
        
        if (svgLines.length === 0) return
        
        let horizontalLine: SVGLineElement | null = null
        let verticalLine: SVGLineElement | null = null
        
        svgLines.forEach((line) => {
          const lineEl = line as SVGLineElement
          const x1 = parseFloat(lineEl.getAttribute('x1') || '0')
          const y1 = parseFloat(lineEl.getAttribute('y1') || '0')
          const x2 = parseFloat(lineEl.getAttribute('x2') || '0')
          const y2 = parseFloat(lineEl.getAttribute('y2') || '0')
          
          if (Math.abs(y1 - y2) < 0.1) {
            horizontalLine = lineEl
          } else if (Math.abs(x1 - x2) < 0.1) {
            verticalLine = lineEl
          }
        })
        
        // Fade in das linhas
        if (horizontalLine) {
          const hLine = horizontalLine as SVGLineElement
          const hLength = hLine.getTotalLength()
          if (hLength > 0) {
            hLine.style.strokeDasharray = `${hLength}`
            hLine.style.strokeDashoffset = `${hLength}`
            hLine.style.opacity = '0'
            hLine.style.transition = 'opacity 0.6s ease-in-out, stroke-dashoffset 0.6s ease-in-out'
            
            setTimeout(() => {
              hLine.style.opacity = '0.3'
              hLine.style.strokeDashoffset = '0'
            }, 50 + (svgIndex * 100))
          }
        }
        
        if (verticalLine) {
          const vLine = verticalLine as SVGLineElement
          const vLength = vLine.getTotalLength()
          if (vLength > 0) {
            vLine.style.strokeDasharray = `${vLength}`
            vLine.style.strokeDashoffset = `${vLength}`
            vLine.style.opacity = '0'
            vLine.style.transition = 'opacity 0.6s ease-in-out, stroke-dashoffset 0.6s ease-in-out'
            
            setTimeout(() => {
              vLine.style.opacity = '0.3'
              vLine.style.strokeDashoffset = '0'
            }, 700 + (svgIndex * 100))
          }
        }
        
        if (svgCircle) {
          const circleEl = svgCircle as SVGCircleElement
          circleEl.style.transition = 'opacity 0.6s ease-in-out'
          
          setTimeout(() => {
            circleEl.style.opacity = '0.5'
          }, 1400 + (svgIndex * 100))
        }
      })
    }

    const hideLines = () => {
      if (!isAnimated) return
      isAnimated = false
      hasAnimated = false

      const svgs = cardsSection.querySelectorAll('svg[data-benefit-line]')
      
      svgs.forEach((svg) => {
        const lines = svg.querySelectorAll('line')
        const circles = svg.querySelectorAll('circle')
        
        lines.forEach((line) => {
          const lineEl = line as SVGLineElement
          lineEl.style.transition = 'opacity 0.4s ease-in-out'
          lineEl.style.opacity = '0'
        })
        
        circles.forEach((circle) => {
          circle.style.transition = 'opacity 0.4s ease-in-out'
          circle.style.opacity = '0'
        })
      })
    }

    const checkVisibility = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset
        
        // Verifica se o scroll está entre 800px e 2000px
        const isVisible = scrollY >= 800 && scrollY <= 2000
        
        if (isVisible && !isAnimated) {
          isAnimated = true
          setTimeout(() => {
            animateLines()
          }, 300)
        } else if (!isVisible && isAnimated) {
          hideLines()
        }
      }, 50)
    }

    // Aguardar renderização completa
    const initTimeout = setTimeout(() => {
      window.addEventListener('scroll', checkVisibility, { passive: true })
      window.addEventListener('resize', checkVisibility, { passive: true })
      checkVisibility() // Verifica na inicialização
    }, 2000)

    return () => {
      clearTimeout(initTimeout)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
    }
  }, [cardsSectionRef])
}
