'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ImageModalProps {
  imageUrl: string | null
  onClose: () => void
  alt?: string
}

export default function ImageModal({ imageUrl, onClose, alt = 'Imagem' }: ImageModalProps) {
  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (imageUrl) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevenir scroll do body
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [imageUrl, onClose])

  if (!imageUrl) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `personalizacao-${Date.now()}.jpg` // Nome do arquivo
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erro ao baixar imagem:', error)
      alert('Erro ao baixar imagem. Tente novamente.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div
        className="relative max-h-full max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 text-white hover:text-gray-300 focus:outline-none transition-colors"
          aria-label="Fechar"
          type="button"
        >
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Imagem */}
        <img
          src={imageUrl}
          alt={alt}
          className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
          style={{ maxHeight: '85vh' }}
        />

        {/* Botão download */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              handleDownload()
            }} 
            variant="default" 
            size="lg"
            type="button"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
