'use client'

import { useState, useEffect } from 'react'

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let documentReady = false
    let splineReady = false
    let hasStartedChecking = false

    const finishLoading = () => {
      // Aguarda apenas um frame para garantir renderização
      requestAnimationFrame(() => {
        setIsLoading(false)
      })
    }

    const checkAllReady = () => {
      if (documentReady && splineReady) {
        finishLoading()
      }
    }

    // Verificar se documento está pronto
    const checkDocument = () => {
      if (document.readyState === 'complete') {
        documentReady = true
        checkAllReady()
      } else {
        const handleLoad = () => {
          documentReady = true
          checkAllReady()
        }
        window.addEventListener('load', handleLoad, { once: true })
      }
    }

    // Verificar se o Spline está renderizado e funcionando
    const checkSpline = () => {
      if (hasStartedChecking) return
      hasStartedChecking = true

      let attempts = 0
      const maxAttempts = 100 // 10 segundos máximo (100 * 100ms)
      let canvasFound = false

      const checkCanvas = () => {
        const canvas = document.querySelector('canvas')
        if (canvas) {
          // Verifica se o canvas tem conteúdo (largura e altura > 0)
          const rect = canvas.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            canvasFound = true
            // Aguarda mais tempo para garantir que o Spline está totalmente renderizado
            setTimeout(() => {
              splineReady = true
              checkAllReady()
            }, 800) // 800ms para garantir renderização completa
          } else {
            // Canvas existe mas ainda não tem dimensões - continua verificando
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(checkCanvas, 100)
            } else {
              // Timeout - considera pronto mesmo assim
              splineReady = true
              checkAllReady()
            }
          }
        } else {
          attempts++
          if (attempts < maxAttempts) {
            // Verifica a cada 100ms
            setTimeout(checkCanvas, 100)
          } else {
            // Timeout - considera Spline pronto mesmo sem canvas (pode estar carregando)
            splineReady = true
            checkAllReady()
          }
        }
      }

      // Começa a verificar após um pequeno delay para dar tempo do DOM renderizar
      setTimeout(checkCanvas, 200)
    }

    // Inicia verificações
    checkDocument()
    
    // Verifica Spline após um pequeno delay para dar tempo do DOM renderizar
    const splineCheckTimeout = setTimeout(checkSpline, 50)

    // Timeout de segurança - mostra o site mesmo se algo der errado
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 8000) // 8 segundos máximo

    return () => {
      clearTimeout(safetyTimeout)
      clearTimeout(splineCheckTimeout)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950">
      <div className="relative">
        {/* Bolinha de loading animada */}
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

