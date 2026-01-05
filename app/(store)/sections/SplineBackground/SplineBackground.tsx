'use client'

import { useState, useEffect, useRef, startTransition, useMemo } from 'react'

// Componente isolado para renderizar o Spline
// Nota: O componente Spline usa async/await internamente, o que causa avisos do React
// Isso é uma limitação conhecida da biblioteca @splinetool/react-spline
// Os avisos não afetam a funcionalidade e podem ser ignorados
function SplineRenderer({ 
  scene, 
  isMobile 
}: { 
  scene: string
  isMobile: boolean 
}) {
  const [SplineComponent, setSplineComponent] = useState<React.ComponentType<any> | null>(null)
  const [shouldRender, setShouldRender] = useState(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true

    // Carrega o módulo Spline de forma assíncrona apenas no cliente
    const loadSpline = async () => {
      try {
        // Usa o alias configurado no webpack para resolver o módulo corretamente
        const splineModule = await import('@splinetool/react-spline/next')
        const Spline = splineModule.default || splineModule
        
        if (mountedRef.current && Spline) {
          startTransition(() => {
            setSplineComponent(() => Spline)
            setShouldRender(true)
          })
        }
      } catch (error) {
        console.error('Failed to load Spline:', error)
      }
    }

    // Delay para garantir que o componente está estável antes de renderizar
    const timeoutId = setTimeout(() => {
      loadSpline()
    }, 300)

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutId)
    }
  }, [])

  if (!shouldRender || !SplineComponent) {
    return null
  }

  return (
    <SplineComponent 
      scene={scene}
      style={{ background: 'transparent' }}
    />
  )
}

export function SplineBackground() {
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [hasDimensions, setHasDimensions] = useState(false)
  const [shouldRenderSpline, setShouldRenderSpline] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const desktopScene = useMemo(() => "https://prod.spline.design/lzqdiUivvSwKYvU9/scene.splinecode", [])
  const mobileScene = useMemo(() => "https://prod.spline.design/iyua4ucz5tErbXhZ/scene.splinecode", [])

  useEffect(() => {
    // Garante que o componente está montado no cliente
    setIsMounted(true)
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint do Tailwind
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMounted || !containerRef.current) return

    const container = containerRef.current

    // Verifica se o container tem dimensões válidas antes de renderizar o Spline
    const checkDimensions = () => {
      if (container) {
        const rect = container.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          setHasDimensions(true)
          // Aguarda múltiplos frames antes de renderizar o Spline para garantir estabilidade
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // Usa startTransition para marcar como transição não urgente
              startTransition(() => {
                setShouldRenderSpline(true)
              })
            })
          })
        }
      }
    }

    // Verifica imediatamente
    checkDimensions()

    // Usa ResizeObserver para verificar quando as dimensões estão disponíveis
    const resizeObserver = new ResizeObserver(() => {
      checkDimensions()
    })

    resizeObserver.observe(container as Element)

    // Fallback: verifica após um pequeno delay
    const timeout = setTimeout(checkDimensions, 100)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeout)
    }
  }, [isMounted])

  return (
    <div 
      ref={containerRef}
      className="spline-background sticky top-0 w-full z-0 pointer-events-none m-0 p-0 h-[calc(100vh-50px)] md:h-[calc(100vh-50px)] xl:h-[calc(100vh-20px)] 3xl:h-[calc(100vh-20px)] spline-clip-path" 
      style={{ zIndex: 0 }}
    >
      <div className="w-full h-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 3xl:px-40">
        <div className="w-full h-full translate-y-8 sm:translate-y-16 md:translate-y-24 xl:translate-y-12 3xl:translate-y-14 2xl:translate-y-24 scale-[1.15] sm:scale-[1.3] md:scale-[1.5] lg:scale-[1.5] xl:scale-[1.5] 2xl:scale-[1.5] spline-scale-custom">
          <div className="w-full h-full rounded-2xl overflow-hidden [&_canvas]:bg-transparent">
            {shouldRenderSpline && isMounted && hasDimensions && (
              <SplineRenderer 
                scene={isMobile ? mobileScene : desktopScene}
                isMobile={isMobile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

