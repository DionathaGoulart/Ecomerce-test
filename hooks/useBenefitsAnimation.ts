import { useEffect, RefObject } from 'react'

export function useBenefitsAnimation(
  cardsSectionRef: RefObject<HTMLElement>,
  cardRefs: RefObject<(HTMLDivElement | null)[]>
) {
  // Inicializa as linhas como invisíveis
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    const initializeLines = () => {
      const lines = cardsSection.querySelectorAll('line')
      const circles = cardsSection.querySelectorAll('circle')
      
      lines.forEach((line) => {
        const length = line.getTotalLength()
        line.style.strokeDasharray = `${length}`
        line.style.strokeDashoffset = `${length}`
      })
      
      circles.forEach((circle) => {
        circle.style.opacity = '0'
      })
    }

    setTimeout(initializeLines, 100)
  }, [cardsSectionRef])

  // Mantém os cards sempre visíveis e anima linhas quando todos estão visíveis
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    cardRefs.current?.forEach((card) => {
      if (card) {
        card.style.opacity = '1'
        card.style.transform = 'translateY(0)'
      }
    })

    const allRelativeDivs = Array.from(cardsSection.querySelectorAll('div.relative'))
    const finalContainers = allRelativeDivs.slice(0, 6)

    if (finalContainers.length !== 6) return

    let visibleCards = new Set<number>()
    let linesAnimated = false

    const animateLines = () => {
      if (linesAnimated) return
      
      const svgs = cardsSection.querySelectorAll('svg')
      
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
        
        if (horizontalLine) {
          const hLine = horizontalLine as SVGLineElement
          const hLength = hLine.getTotalLength()
          hLine.style.strokeDasharray = `${hLength}`
          hLine.style.strokeDashoffset = `${hLength}`
          hLine.style.transition = 'stroke-dashoffset 0.4s ease-in-out'
          
          setTimeout(() => {
            hLine.style.strokeDashoffset = '0'
          }, 30 + (svgIndex * 50))
        }
        
        if (verticalLine) {
          const vLine = verticalLine as SVGLineElement
          const vLength = vLine.getTotalLength()
          vLine.style.strokeDasharray = `${vLength}`
          vLine.style.strokeDashoffset = `${vLength}`
          vLine.style.transition = 'stroke-dashoffset 0.4s ease-in-out'
          
          setTimeout(() => {
            vLine.style.strokeDashoffset = '0'
          }, 450 + (svgIndex * 50))
        }
        
        if (svgCircle) {
          const circleEl = svgCircle as SVGCircleElement
          circleEl.style.opacity = '0'
          circleEl.style.transition = 'opacity 0.2s ease-in-out'
          
          setTimeout(() => {
            circleEl.style.opacity = '0.5'
          }, 900 + (svgIndex * 50))
        }
      })
      
      linesAnimated = true
    }

    const observers: IntersectionObserver[] = []

    finalContainers.forEach((card, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.8) {
              visibleCards.add(index)
            } else {
              visibleCards.delete(index)
            }
            
            if (visibleCards.size === 6) {
              animateLines()
            }
          })
        },
        { threshold: 0.8 }
      )

      observer.observe(card)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [cardsSectionRef, cardRefs])

  // Verifica se todos os cards estão 100% visíveis e controla a visibilidade das linhas
  useEffect(() => {
    const cardsSection = cardsSectionRef.current
    if (!cardsSection) return

    const allRelativeDivs = Array.from(cardsSection.querySelectorAll('div.relative'))
    const finalContainers = allRelativeDivs.slice(0, 6)

    const lines = cardsSection.querySelectorAll('line')
    const circles = cardsSection.querySelectorAll('circle')

    if (finalContainers.length !== 6) return

    let visibleCards = new Set<number>()

    const updateLinesVisibility = () => {
      const allVisible = visibleCards.size === 6
      
      if (allVisible) {
        const svgs = cardsSection.querySelectorAll('svg')
        
        svgs.forEach((svg) => {
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
          
          if (horizontalLine) {
            const hLine = horizontalLine as SVGLineElement
            const hLength = hLine.getTotalLength()
            hLine.style.strokeDasharray = `${hLength}`
            hLine.style.strokeDashoffset = `${hLength}`
            hLine.style.transition = 'stroke-dashoffset 0.6s ease-in-out'
            
            setTimeout(() => {
              hLine.style.strokeDashoffset = '0'
            }, 30)
          }
          
          if (verticalLine) {
            const vLine = verticalLine as SVGLineElement
            const vLength = vLine.getTotalLength()
            vLine.style.strokeDasharray = `${vLength}`
            vLine.style.strokeDashoffset = `${vLength}`
            vLine.style.transition = 'stroke-dashoffset 0.6s ease-in-out'
            
            setTimeout(() => {
              vLine.style.strokeDashoffset = '0'
            }, 650)
          }
          
          if (svgCircle) {
            const circleEl = svgCircle as SVGCircleElement
            circleEl.style.opacity = '0'
            circleEl.style.transition = 'opacity 0.3s ease-in-out'
            
            setTimeout(() => {
              if (circleEl) {
                circleEl.style.opacity = '0.5'
              }
            }, 1300)
          }
        })
      } else {
        lines.forEach((line) => {
          const length = line.getTotalLength()
          line.style.transition = 'stroke-dashoffset 0.3s ease-in-out'
          line.style.strokeDashoffset = `${length}`
        })
        
        circles.forEach((circle) => {
          circle.style.transition = 'opacity 0.3s ease-in-out'
          circle.style.opacity = '0'
        })
      }
    }

    const observers: IntersectionObserver[] = []

    finalContainers.forEach((card, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
              visibleCards.add(index)
            } else {
              visibleCards.delete(index)
            }
            updateLinesVisibility()
          })
        },
        { threshold: 1.0 }
      )

      observer.observe(card)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [cardsSectionRef])
}

