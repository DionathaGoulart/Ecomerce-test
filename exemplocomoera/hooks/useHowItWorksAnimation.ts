import { useEffect, RefObject } from 'react'

export function useHowItWorksAnimation(sectionRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const updateLines = () => {
      const windowHeight = window.innerHeight
      const windowCenter = windowHeight * 0.5
      
      const greenLines = section.querySelectorAll('.line-animated')
      const allCards = section.querySelectorAll('[data-step-index]')
      const lineProgress: number[] = []
      
      // Calcular progresso de cada linha e armazenar
      greenLines.forEach((line, lineIndex) => {
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
        lineProgress[lineIndex] = progress
      })
      
      // Atualizar background dos cards baseado no progresso das linhas
      allCards.forEach((card) => {
        const cardEl = card as HTMLElement
        const stepIndex = parseInt(cardEl.getAttribute('data-step-index') || '0')
        const isNumberCard = cardEl.classList.contains('step-number-card')
        const isContentCard = cardEl.classList.contains('step-content-card')
        
        // Primeiro card sempre verde
        if (stepIndex === 0) {
          cardEl.style.backgroundColor = '#E9EF33'
          if (isContentCard) {
            // Atualizar texto e ícone do card de conteúdo para preto quando verde
            const textElements = cardEl.querySelectorAll('h3, p')
            textElements.forEach((el) => {
              const htmlEl = el as HTMLElement
              if (el.tagName === 'P') {
                htmlEl.style.color = 'rgba(10, 10, 10, 0.7)'
              } else {
                htmlEl.style.color = '#0a0a0a'
              }
            })
            const icon = cardEl.querySelector('.step-icon')
            if (icon) {
              ;(icon as HTMLElement).style.filter = 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
            }
          }
          if (isNumberCard) {
            // Número fica preto quando verde
            const numberSpan = cardEl.querySelector('span')
            if (numberSpan) {
              ;(numberSpan as HTMLElement).style.color = '#0a0a0a'
            }
          }
          return
        }
        
        // Para outros cards: verificar se a linha verde está chegando/alcançando o card
        // A linha anterior é a que conecta o card anterior a este card
        const previousLineProgress = lineProgress[stepIndex - 1] ?? 0
        
        // Verificar posição do card em relação ao centro da tela (onde a linha verde cresce)
        const cardRect = cardEl.getBoundingClientRect()
        const cardTop = cardRect.top
        const distanceFromCenter = windowCenter - cardTop
        
        // Card fica verde quando a linha verde o alcança:
        // Quando o card está no centro da tela ou acima (já passou), e a linha anterior está crescendo
        // Isso significa que a linha verde está chegando/alcançando o card
        const isCardReachedByLine = distanceFromCenter >= 0 // Card está no centro ou acima (foi alcançado)
        const shouldBeGreen = previousLineProgress >= 1 || (previousLineProgress > 0 && isCardReachedByLine)
        
        if (shouldBeGreen) {
          cardEl.style.backgroundColor = '#E9EF33'
          if (isContentCard) {
            // Atualizar texto e ícone para preto quando verde
            const textElements = cardEl.querySelectorAll('h3, p')
            textElements.forEach((el) => {
              ;(el as HTMLElement).style.color = '#0a0a0a'
            })
            const icon = cardEl.querySelector('.step-icon')
            if (icon) {
              ;(icon as HTMLElement).style.filter = 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)'
            }
          }
          if (isNumberCard) {
            // Número fica preto quando verde
            const numberSpan = cardEl.querySelector('span')
            if (numberSpan) {
              ;(numberSpan as HTMLElement).style.color = '#0a0a0a'
            }
          }
        } else {
          cardEl.style.backgroundColor = '#212121'
          if (isContentCard) {
            // Atualizar texto e ícone para branco quando cinza
            const textElements = cardEl.querySelectorAll('h3, p')
            textElements.forEach((el) => {
              const htmlEl = el as HTMLElement
              if (el.tagName === 'H3') {
                htmlEl.style.color = '#ffffff'
              } else {
                htmlEl.style.color = 'rgba(255, 255, 255, 0.8)'
              }
            })
            const icon = cardEl.querySelector('.step-icon')
            if (icon) {
              ;(icon as HTMLElement).style.filter = 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
            }
          }
          if (isNumberCard) {
            // Número fica branco quando cinza
            const numberSpan = cardEl.querySelector('span')
            if (numberSpan) {
              ;(numberSpan as HTMLElement).style.color = '#ffffff'
            }
          }
        }
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

