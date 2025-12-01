/**
 * Função otimizada para scroll suave que garante sincronização com animações do Spline
 * 
 * O Spline detecta scroll através de eventos nativos e leitura direta de scrollY/scrollTop.
 * Esta implementação garante que ambos os métodos funcionem durante scroll programático.
 * 
 * SOLUÇÃO AGRESSIVA: Força atualização do Spline através de múltiplos métodos simultâneos.
 */

// Variável global para rastrear se estamos em uma animação de scroll
let isScrolling = false

// Função para forçar atualização do Spline baseado na posição atual
// Não precisa mais - o componente atualiza continuamente via requestAnimationFrame
function forceSplineUpdate() {
  // Esta função não é mais necessária porque o componente
  // monitora continuamente a posição do scroll
  // Mantida apenas para compatibilidade
}

export function smoothScrollTo(
  targetPosition: number,
  duration: number = 1000,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    const startPosition = window.pageYOffset || document.documentElement.scrollTop
    const distance = targetPosition - startPosition
    
    if (Math.abs(distance) < 1) {
      resolve()
      return
    }

    isScrolling = true
    let start: number | null = null
    let animationFrameId: number | null = null
    let isCancelled = false
    let lastUpdateScrollY = startPosition

    // Função de easing suave (ease-in-out cubic)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const animateScroll = (currentTime: number) => {
      if (isCancelled) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
        }
        isScrolling = false
        return
      }

      if (start === null) start = currentTime
      const timeElapsed = currentTime - start
      const progress = Math.min(timeElapsed / duration, 1)
      
      // Aplica easing suave
      const ease = easeInOutCubic(progress)
      const newScrollPosition = startPosition + distance * ease
      
      // Atualiza scroll
      document.documentElement.scrollTop = newScrollPosition
      document.body.scrollTop = newScrollPosition
      window.scrollTo(0, newScrollPosition)
      
      // O Spline será atualizado automaticamente pelo componente
      // que monitora continuamente a posição do scroll via requestAnimationFrame
      // Não precisa forçar atualização aqui
      
      // Chama callback de progresso se fornecido
      if (onProgress) {
        onProgress(progress)
      }
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateScroll)
      } else {
        // Garante que chegamos exatamente na posição final
        document.documentElement.scrollTop = targetPosition
        document.body.scrollTop = targetPosition
        window.scrollTo(0, targetPosition)
        
        // O Spline será atualizado automaticamente
        isScrolling = false
        resolve()
      }
    }

    animationFrameId = requestAnimationFrame(animateScroll)
  })
}

/**
 * Hook para forçar atualização do Spline durante scroll programático
 * Cria um listener que monitora mudanças de scroll e dispara eventos adicionais
 * 
 * SOLUÇÃO AGRESSIVA: Monitora scroll continuamente e força atualização do Spline
 */
export function setupSplineScrollSync() {
  if (typeof window === 'undefined') return () => {}

  let lastScrollY = window.scrollY || document.documentElement.scrollTop
  let rafId: number | null = null
  let isActive = false
  let updateInterval: NodeJS.Timeout | null = null

  const checkScroll = () => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop
    
    // Se o scroll mudou significativamente, força atualização do Spline
    if (Math.abs(currentScrollY - lastScrollY) > 1) {
      lastScrollY = currentScrollY
      forceSplineUpdate()
    }
    
    if (isActive) {
      rafId = requestAnimationFrame(checkScroll)
    }
  }

  const start = () => {
    if (!isActive) {
      isActive = true
      lastScrollY = window.scrollY || document.documentElement.scrollTop
      rafId = requestAnimationFrame(checkScroll)
    }
  }

  const stop = () => {
    isActive = false
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  // Inicia automaticamente
  start()

  // Retorna função de cleanup
  return stop
}

