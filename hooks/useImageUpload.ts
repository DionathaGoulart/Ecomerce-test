/**
 * useImageUpload - Hook para upload de imagens
 */

import { useState, useCallback } from 'react'
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants'

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void
  onError?: (error: string) => void
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { onSuccess, onError } = options
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const uploadImage = useCallback(
    async (file: File) => {
      // Validações
      if (!file.type.startsWith('image/')) {
        const error = 'Por favor, selecione uma imagem'
        setUploadError(error)
        onError?.(error)
        return
      }

      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        const error = 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF'
        setUploadError(error)
        onError?.(error)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        const error = 'A imagem deve ter no máximo 5MB'
        setUploadError(error)
        onError?.(error)
        return
      }

      setIsUploading(true)
      setUploadError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao fazer upload da imagem')
        }

        if (!result.url) {
          throw new Error('URL da imagem não foi retornada')
        }

        setImageUrl(result.url)
        onSuccess?.(result.url)
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Erro ao fazer upload da imagem'
        setUploadError(errorMessage)
        onError?.(errorMessage)
        console.error('Erro ao fazer upload:', error)
      } finally {
        setIsUploading(false)
      }
    },
    [onSuccess, onError]
  )

  const reset = useCallback(() => {
    setImageUrl(null)
    setUploadError(null)
    setIsUploading(false)
  }, [])

  return {
    uploadImage,
    isUploading,
    uploadError,
    imageUrl,
    reset,
  }
}

