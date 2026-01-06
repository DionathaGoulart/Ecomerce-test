import { useEffect, RefObject } from 'react'

export function useSplineLimit(
  containerRef: RefObject<HTMLDivElement>,
  splineWrapperRef: RefObject<HTMLDivElement>,
  comofuncionaSectionRef: RefObject<HTMLElement>,
  homeSectionRef?: RefObject<HTMLElement>
) {
  useEffect(() => {
    const container = containerRef.current
    const splineWrapper = splineWrapperRef.current
    const comofuncionaSection = comofuncionaSectionRef.current
    const homeSection = homeSectionRef?.current
    const isMobile = window.innerWidth < 768
    
    // No mobile, só precisa do container, wrapper e homeSection
    // No desktop, precisa também da comofuncionaSection
    if (!container || !splineWrapper) return
    if (!isMobile && !comofuncionaSection) return
    if (isMobile && !homeSection) return

    let hasSetHeight = false

    const updateSplineLimit = () => {
      const currentIsMobile = window.innerWidth < 768
      if (!container || !splineWrapper) return
      if (!currentIsMobile && !comofuncionaSection) return
      if (currentIsMobile && !homeSection) return
      
      requestAnimationFrame(() => {
        const checkIsMobile = window.innerWidth < 768
        if (!container || !splineWrapper) return
        if (!checkIsMobile && !comofuncionaSection) return
        if (checkIsMobile && !homeSection) return
        
        // Verifica se o conteúdo está visível na tela (renderizado)
        const containerRect = container.getBoundingClientRect()
        const containerHeight = container.offsetHeight
        
        // Só calcula altura se:
        // 1. O container está visível na viewport OU já tem altura significativa
        // 2. Ainda não definimos altura OU o conteúdo mudou
        const isVisible = containerRect.top < window.innerHeight && containerRect.bottom > 0
        
        const isMobile = window.innerWidth < 768
        const minHeight = isMobile ? 100 : 500
        
        if (!isVisible && containerHeight < minHeight && !hasSetHeight) {
          // Conteúdo ainda não está visível, não define altura
          return
        }
        
        // No mobile, usa a seção home; no desktop, usa a seção "Como Funciona"
        const targetSection = isMobile && homeSection ? homeSection : (comofuncionaSection || homeSection)
        if (!targetSection) return
        
        const targetSectionRect = targetSection.getBoundingClientRect()
        
        // Verifica se a seção alvo está renderizada
        // No mobile, aceita altura mínima menor devido ao espaço vazio inicial
        if (targetSectionRect.height === 0 || (!isMobile && targetSectionRect.height < 100)) {
          return
        }
        
        const scrollY = window.scrollY
        const targetSectionBottom = targetSectionRect.bottom + scrollY
        const wrapperTop = splineWrapper.offsetTop
        let wrapperHeight = targetSectionBottom - wrapperTop
        
        // No mobile, a altura deve ser apenas até o final da seção Home
        // No desktop, a altura vai até o final da seção "Como Funciona"
        if (isMobile && homeSection) {
          // No mobile, limita a altura apenas até o final da Home
          // No mobile, o container só tem a Home (outras seções estão fora)
          if (wrapperHeight > 0 && wrapperHeight < 50000) {
            // Limita o wrapper para o Spline sticky parar na Home
            splineWrapper.style.height = `${wrapperHeight}px`
            splineWrapper.style.overflow = 'visible'
            splineWrapper.style.position = 'relative'
            // No mobile, o container só precisa ter altura da Home
            if (container) {
              container.style.height = 'auto'
              container.style.minHeight = 'auto'
              container.style.maxHeight = 'none'
              container.style.position = 'relative'
              container.style.overflow = 'visible'
              container.style.display = 'block'
            }
            hasSetHeight = true
          }
        } else {
          // Desktop: validação rigorosa contra containerHeight
          const heightDifference = Math.abs(wrapperHeight - containerHeight)
          const maxDifference = 5000
          
          if (
            wrapperHeight > 0 && 
            wrapperHeight < 50000 && 
            wrapperHeight >= containerHeight &&
            heightDifference < maxDifference
          ) {
            splineWrapper.style.height = `${wrapperHeight}px`
            hasSetHeight = true
          }
        }
        
        splineWrapper.style.position = 'relative'
        splineWrapper.style.zIndex = '0'
      })
    }

    const resizeObserver = new ResizeObserver(() => {
      // No mobile, sempre atualiza para garantir altura correta do container
      const isMobile = window.innerWidth < 768
      if (hasSetHeight || isMobile) {
        // No mobile, força atualização imediata para garantir altura correta
        if (isMobile) {
          requestAnimationFrame(() => {
            requestAnimationFrame(updateSplineLimit)
          })
        } else {
          requestAnimationFrame(updateSplineLimit)
        }
      }
    })
    resizeObserver.observe(container as Element)
    if (!isMobile && comofuncionaSection) {
      resizeObserver.observe(comofuncionaSection as Element)
    }
    if (homeSection) {
      resizeObserver.observe(homeSection as Element)
    }

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
      
      const isMobile = window.innerWidth < 768
      const targetSection = isMobile && homeSection ? homeSection : comofuncionaSection
      if (!targetSection) return
      const targetSectionRect = targetSection.getBoundingClientRect()
      
      // No mobile, só precisa que a seção Home esteja renderizada
      // No desktop, precisa que o container tenha altura significativa
      let shouldSetHeight = false
      if (isMobile && homeSection) {
        // Mobile: só precisa que a Home esteja renderizada
        shouldSetHeight = hasScrolled || (targetSectionRect.height > 0 && containerRect.top < window.innerHeight * 2)
      } else {
        // Desktop: precisa altura significativa do container
        const minContainerHeight = 2000
        shouldSetHeight = 
          hasScrolled || 
          (containerHeight > minContainerHeight && targetSectionRect.height > 0 && containerRect.top < window.innerHeight * 2)
      }
      
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
  }, [containerRef, splineWrapperRef, comofuncionaSectionRef, homeSectionRef])
}

