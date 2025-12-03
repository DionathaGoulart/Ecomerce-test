import { useEffect, RefObject } from 'react'

export function useSplineLimit(
  containerRef: RefObject<HTMLDivElement>,
  splineWrapperRef: RefObject<HTMLDivElement>,
  comofuncionaSectionRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    const container = containerRef.current
    const splineWrapper = splineWrapperRef.current
    const comofuncionaSection = comofuncionaSectionRef.current
    if (!container || !splineWrapper || !comofuncionaSection) return

    let hasSetHeight = false

    const updateSplineLimit = () => {
      if (!container || !splineWrapper || !comofuncionaSection) return
      
      requestAnimationFrame(() => {
        if (!container || !splineWrapper || !comofuncionaSection) return
        
        // Verifica se o conteúdo está visível na tela (renderizado)
        const containerRect = container.getBoundingClientRect()
        const containerHeight = container.offsetHeight
        
        // Só calcula altura se:
        // 1. O container está visível na viewport OU já tem altura significativa
        // 2. Ainda não definimos altura OU o conteúdo mudou
        const isVisible = containerRect.top < window.innerHeight && containerRect.bottom > 0
        
        if (!isVisible && containerHeight < 500 && !hasSetHeight) {
          // Conteúdo ainda não está visível, não define altura
          return
        }
        
        const comofuncionaRect = comofuncionaSection.getBoundingClientRect()
        
        // Verifica se a seção "Como Funciona" está renderizada
        if (comofuncionaRect.height === 0) {
          return
        }
        
        const scrollY = window.scrollY
        const comofuncionaBottom = comofuncionaRect.bottom + scrollY
        const wrapperTop = splineWrapper.offsetTop
        const wrapperHeight = comofuncionaBottom - wrapperTop
        
        // Validação rigorosa: altura deve ser razoável
        // A altura do wrapper deve ser aproximadamente igual à altura do container (conteúdo)
        // Não deve ser muito maior para evitar empurrar o conteúdo
        const heightDifference = Math.abs(wrapperHeight - containerHeight)
        
        if (
          wrapperHeight > 0 && 
          wrapperHeight < 50000 && 
          wrapperHeight >= containerHeight &&
          heightDifference < 5000 // Diferença máxima de 5000px
        ) {
          // Define altura igual ou ligeiramente maior que o container
          splineWrapper.style.height = `${wrapperHeight}px`
          hasSetHeight = true
        }
        
        splineWrapper.style.position = 'relative'
        splineWrapper.style.zIndex = '0'
      })
    }

    const resizeObserver = new ResizeObserver(() => {
      // Só atualiza se já tiver definido altura antes
      if (hasSetHeight) {
        requestAnimationFrame(updateSplineLimit)
      }
    })
    resizeObserver.observe(container as Element)
    resizeObserver.observe(comofuncionaSection as Element)

    const handleResize = () => {
      if (hasSetHeight) {
        requestAnimationFrame(updateSplineLimit)
      }
    }
    
    let hasScrolled = false
    
    const handleScroll = () => {
      hasScrolled = true
      // Só atualiza após o primeiro scroll ou se já tiver altura definida
      if (hasSetHeight || window.scrollY > 10) {
        requestAnimationFrame(updateSplineLimit)
      }
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Só tenta definir altura quando o usuário rolar OU após um delay muito longo
    // Isso garante que o conteúdo está totalmente renderizado
    const checkAndSetHeight = () => {
      if (hasSetHeight) return
      
      const containerRect = container.getBoundingClientRect()
      const containerHeight = container.offsetHeight
      const comofuncionaRect = comofuncionaSection.getBoundingClientRect()
      
      // Só define altura se:
      // 1. O usuário já rolou (indicando que a página está carregada) OU
      // 2. Container tem altura muito significativa (> 2000px) E seção está renderizada
      const shouldSetHeight = 
        hasScrolled || 
        (containerHeight > 2000 && comofuncionaRect.height > 0 && containerRect.top < window.innerHeight * 2)
      
      if (shouldSetHeight) {
        updateSplineLimit()
      } else if (!hasSetHeight && !hasScrolled) {
        // Tenta novamente depois, mas só se o usuário não rolou ainda
        setTimeout(checkAndSetHeight, 1000)
      }
    }
    
    // NÃO define altura inicialmente - só depois de scroll ou delay muito longo
    const initialTimeout = setTimeout(() => {
      checkAndSetHeight()
    }, 3000)

    return () => {
      clearTimeout(initialTimeout)
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [containerRef, splineWrapperRef, comofuncionaSectionRef])
}

