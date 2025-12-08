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
    let animationTimeouts: NodeJS.Timeout[] = []
    let scrollTimeout: NodeJS.Timeout | null = null

    const clearAllTimeouts = () => {
      animationTimeouts.forEach(timeout => clearTimeout(timeout))
      animationTimeouts = []
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
        scrollTimeout = null
      }
    }

    const animateLines = () => {
      if (isAnimated) return
      isAnimated = true
      clearAllTimeouts()

      const svgs = cardsSection.querySelectorAll('svg[data-benefit-line]')
      
      if (svgs.length === 0) {
        isAnimated = false
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
            
            const timeout1 = setTimeout(() => {
              if (isAnimated) {
                hLine.style.opacity = '0.3'
                hLine.style.strokeDashoffset = '0'
              }
            }, 50 + (svgIndex * 100))
            animationTimeouts.push(timeout1)
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
            
            const timeout2 = setTimeout(() => {
              if (isAnimated) {
                vLine.style.opacity = '0.3'
                vLine.style.strokeDashoffset = '0'
              }
            }, 700 + (svgIndex * 100))
            animationTimeouts.push(timeout2)
          }
        }
        
        if (svgCircle) {
          const circleEl = svgCircle as SVGCircleElement
          circleEl.style.transition = 'opacity 0.6s ease-in-out'
          
          const timeout3 = setTimeout(() => {
            if (isAnimated) {
              circleEl.style.opacity = '0.5'
            }
          }, 1400 + (svgIndex * 100))
          animationTimeouts.push(timeout3)
        }
      })
    }

    const hideLines = () => {
      if (!isAnimated) return
      isAnimated = false
      clearAllTimeouts()

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
        const rect = cardsSection.getBoundingClientRect()
        const windowHeight = window.innerHeight
        
        // Verifica se a seção está sticky (fixa no topo)
        // Quando sticky, a seção fica com top próximo a 0
        const isSticky = rect.top <= 20 && rect.top >= -20
        
        // Se estiver sticky, mantém as linhas visíveis
        if (isSticky) {
          if (!isAnimated) {
            animateLines()
          }
        } else {
          // Se não estiver sticky, esconde as linhas imediatamente
          if (isAnimated) {
            hideLines()
          }
        }
      }, 50)
    }

    // Usar IntersectionObserver para melhor performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const rect = cardsSection.getBoundingClientRect()
          const isSticky = rect.top <= 20 && rect.top >= -20
          
          // Se estiver sticky, sempre mantém as linhas visíveis
          if (isSticky) {
            if (!isAnimated) {
              animateLines()
            }
          } else {
            // Se não estiver sticky, esconde as linhas imediatamente
            if (isAnimated) {
              hideLines()
            }
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: '0px'
      }
    )

    // Verificar continuamente se está sticky durante o scroll
    const scrollHandler = () => {
      checkVisibility()
    }
    
    window.addEventListener('scroll', scrollHandler, { passive: true })

    // Aguardar renderização completa
    const initTimeout = setTimeout(() => {
      observer.observe(cardsSection)
      checkVisibility() // Verifica na inicialização
    }, 1000)

    return () => {
      clearTimeout(initTimeout)
      clearAllTimeouts()
      observer.disconnect()
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [cardsSectionRef])
}
