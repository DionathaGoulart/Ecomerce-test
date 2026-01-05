import { useEffect, RefObject } from 'react'

export function useHowItWorksAnimationMobile(sectionRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let isInitialized = false
    let animationFrameId: number | null = null
    let isRunning = false

    const updateLines = () => {
      if (!section || !section.isConnected) {
        isRunning = false
        return
      }

      const windowHeight = window.innerHeight
      const windowCenter = windowHeight * 0.5
      
      const greenLines = section.querySelectorAll('.line-animated')
      const allCards = section.querySelectorAll('[data-step-index]')
      
      // Se elementos não existirem ainda, retornar (mas continuar tentando)
      if (greenLines.length === 0 || allCards.length === 0) {
        return
      }
      
      // Marcar como inicializado quando elementos são encontrados
      if (!isInitialized) {
        isInitialized = true
      }
      
      const lineProgress: number[] = []
      
      // Calcular progresso de cada linha
      greenLines.forEach((line, lineIndex) => {
        const lineEl = line as HTMLElement
        const lineContainer = lineEl.parentElement
        if (!lineContainer) return
        
        const cardContainer = lineContainer.closest('.relative')
        if (!cardContainer) return
        
        // Calcular altura real da linha dinamicamente
        const lineContainerRect = lineContainer.getBoundingClientRect()
        const lineHeight = lineContainerRect.height
        
        // A linha começa no final do card (top-full), então pegamos o bottom do card
        const cardRect = cardContainer.getBoundingClientRect()
        const lineStart = cardRect.bottom // Onde a linha começa (final do card)
        
        // Distância do início da linha até o centro da tela
        const distanceFromCenter = windowCenter - lineStart
        let progress = 0
        
        if (distanceFromCenter > 0 && lineHeight > 0) {
          progress = Math.min(distanceFromCenter / lineHeight, 1)
        }
        
        progress = Math.max(progress, 0)
        lineEl.style.height = `${progress * 100}%`
        lineProgress[lineIndex] = progress
      })
      
      // Atualizar background dos cards
      allCards.forEach((card) => {
        const cardEl = card as HTMLElement
        const stepIndex = parseInt(cardEl.getAttribute('data-step-index') || '0')
        const isNumberCard = cardEl.classList.contains('step-number-card')
        const isContentCard = cardEl.classList.contains('step-content-card')
        
        // Primeiro card sempre verde
        if (stepIndex === 0) {
          cardEl.classList.remove('step-card-gray')
          cardEl.classList.add('step-card-green')
          return
        }
        
        // Para outros cards: verificar se a linha verde está chegando/alcançando o card
        const previousLineProgress = lineProgress[stepIndex - 1] ?? 0
        
        const cardRect = cardEl.getBoundingClientRect()
        const cardTop = cardRect.top
        const cardCenter = cardTop + (cardRect.height / 2)
        const distanceFromCenter = windowCenter - cardCenter
        
        // Card fica verde quando:
        // 1. A linha anterior está completa (100%) OU
        // 2. O card já passou pelo centro da tela (distanceFromCenter >= 0) E a linha anterior começou a crescer
        const isCardReachedByLine = distanceFromCenter >= 0
        const shouldBeGreen = previousLineProgress >= 1 || (previousLineProgress > 0.1 && isCardReachedByLine)
        
        if (shouldBeGreen) {
          cardEl.classList.remove('step-card-gray')
          cardEl.classList.add('step-card-green')
        } else {
          cardEl.classList.remove('step-card-green')
          cardEl.classList.add('step-card-gray')
        }
      })
    }

    const handleScroll = () => {
      if (isInitialized) {
        updateLines()
      }
    }

    const handleResize = () => {
      if (isInitialized) {
        updateLines()
      }
    }

    // Função para iniciar a animação
    const startAnimation = () => {
      if (isRunning) return
      
      isRunning = true
      const animate = () => {
        if (isRunning && section && section.isConnected) {
          updateLines()
          animationFrameId = requestAnimationFrame(animate)
        } else {
          isRunning = false
        }
      }
      // Forçar uma atualização imediata antes de iniciar o loop
      updateLines()
      animationFrameId = requestAnimationFrame(animate)
    }

    // Adicionar listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    
    // Usar IntersectionObserver para detectar quando a seção está visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Seção está visível, tentar inicializar
            if (!isInitialized) {
              updateLines()
            }
            if (!isRunning && isInitialized) {
              startAnimation()
            }
          }
        })
      },
      {
        threshold: 0,
        rootMargin: '300px' // Iniciar 300px antes de entrar na tela
      }
    )

    // Observar a seção imediatamente
    observer.observe(section)
    
    // Tentar inicializar imediatamente
    const tryInit = () => {
      updateLines()
      if (!isRunning && isInitialized) {
        startAnimation()
      }
    }
    
    // Handler para o evento load
    const handleLoad = () => {
      tryInit()
    }
    
    // Aguardar renderização completa
    const initTimeout = setTimeout(() => {
      tryInit()
    }, 100) // Delay menor para iniciar mais rápido

    // Tentativas adicionais para garantir inicialização no mobile
    const additionalAttempts = [300, 600, 1000, 1500]
    const timeoutIds: NodeJS.Timeout[] = []
    additionalAttempts.forEach((delay) => {
      const timeoutId = setTimeout(() => {
        if (!isInitialized || !isRunning) {
          tryInit()
        }
      }, delay)
      timeoutIds.push(timeoutId)
    })
    
    // Tentar inicializar quando a página estiver carregada
    if (document.readyState === 'complete') {
      tryInit()
    } else {
      window.addEventListener('load', handleLoad, { once: true })
    }

    return () => {
      isRunning = false
      clearTimeout(initTimeout)
      timeoutIds.forEach(id => clearTimeout(id))
      observer.disconnect()
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('load', handleLoad)
    }
  }, [sectionRef])
}
