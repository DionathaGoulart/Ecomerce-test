'use client'

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/hooks'
import { Spinner } from '@/components/atoms/Spinner'

interface ProductPersonalizeModalProps {
  productId: string
  productTitle: string
  isOpen: boolean
  onClose: () => void
  onAdd: () => void
  initialQuantity?: number
  initialImageUrl?: string
  initialDescription?: string
}

export default function ProductPersonalizeModal({
  productId,
  productTitle,
  isOpen,
  onClose,
  onAdd,
  initialQuantity = 1,
  initialImageUrl,
  initialDescription = '',
}: ProductPersonalizeModalProps) {
  const { addItem, cartItems } = useCart()
  const router = useRouter()
  
  const [quantity, setQuantity] = useState(initialQuantity)
  const [personalizationDescription, setPersonalizationDescription] = useState(initialDescription)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Estado local para armazenar a imagem temporária (upload imediato)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(initialImageUrl || null)
  const [tempImagePath, setTempImagePath] = useState<string | null>(null)
  const [localImageFile, setLocalImageFile] = useState<File | null>(null)

  // Atualizar estado quando props mudarem (quando modal abrir com dados existentes)
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity)
      setPersonalizationDescription(initialDescription)
      setTempImageUrl(initialImageUrl || null)
      setTempImagePath(null)
      setLocalImageFile(null)
    }
  }, [isOpen, initialQuantity, initialImageUrl, initialDescription])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setError(null)
      setIsProcessing(true)
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem')
        setIsProcessing(false)
        return
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB')
        setIsProcessing(false)
        return
      }

      try {
        // Fazer upload imediato para armazenamento temporário
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/storage/upload-temp', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erro ao fazer upload da imagem')
        }

        const data = await response.json()
        setTempImageUrl(data.url)
        setTempImagePath(data.path)
        setLocalImageFile(file)
        setIsProcessing(false)
      } catch (err) {
        console.error('Erro ao fazer upload:', err)
        setError(err instanceof Error ? err.message : 'Erro ao fazer upload da imagem')
        setIsProcessing(false)
      }
    }
  }

  const handleAddToCart = () => {
    if (!tempImageUrl || !tempImagePath) {
      setError('É obrigatório fazer upload de uma imagem para personalização')
      return
    }

    if (quantity < 1) {
      setError('Quantidade deve ser pelo menos 1')
      return
    }

    // Criar objeto do item com URL temporária e path para copiar depois
    const cartItem = {
      productId,
      quantity,
      personalizationImageUrl: tempImageUrl, // URL temporária
      personalizationImagePath: tempImagePath, // Path para copiar quando criar pedido
      personalizationImageFile: localImageFile ? {
        name: localImageFile.name,
        type: localImageFile.type,
        size: localImageFile.size,
      } : undefined,
      personalizationDescription: personalizationDescription.trim() || undefined,
    }

    // Adicionar ao carrinho
    addItem(cartItem)

    // Resetar formulário
    setQuantity(1)
    setPersonalizationDescription('')
    setTempImageUrl(null)
    setTempImagePath(null)
    setLocalImageFile(null)
    setError(null)
    
    // Chamar callback primeiro
    onAdd()
    
    // Fechar modal
    onClose()
    
    // Recarregar a página para garantir que a imagem apareça
    router.refresh()
  }

  const handleClose = () => {
    setQuantity(1)
    setPersonalizationDescription('')
    setTempImageUrl(null)
    setTempImagePath(null)
    setLocalImageFile(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-header-border bg-header-bg p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            Personalizar Produto
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-400 mb-6">
          {productTitle}
        </p>

        {/* Quantidade */}
        <div className="mb-6">
          <Label htmlFor="quantity" className="block text-sm font-medium text-white mb-3">
            Quantidade *
          </Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="border-header-border text-white hover:bg-white/10"
            >
              -
            </Button>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1
                setQuantity(Math.max(1, val))
              }}
              min={1}
              className="w-20 text-center bg-secondary-800 border-secondary-600 text-white"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuantity(quantity + 1)}
              className="border-header-border text-white hover:bg-white/10"
            >
              +
            </Button>
          </div>
        </div>

        {/* Upload de Imagem - OBRIGATÓRIO */}
        <div className="mb-6">
          <Label htmlFor="personalization-image" className="block text-sm font-medium text-white mb-3">
            Imagem para personalização <span className="text-error-500">*</span>
          </Label>
          
          {!tempImageUrl ? (
            <>
              <p className="text-xs text-neutral-400 mb-3">
                Faça upload da imagem que será aplicada no produto. Este campo é obrigatório.
              </p>
              <div>
                <input
                  id="personalization-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-500 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-neutral-950 hover:file:opacity-90 transition-opacity cursor-pointer"
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <div className="mt-3 flex items-center gap-2">
                    <Spinner size="sm" variant="default" />
                    <p className="text-sm text-neutral-400">Fazendo upload da imagem...</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-secondary-600 bg-secondary-800/50 p-4">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <Image
                    src={tempImageUrl}
                    alt="Preview da personalização"
                    width={120}
                    height={120}
                    className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl object-cover border border-neutral-600"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-300 mb-2">
                    Imagem selecionada
                  </p>
                  {localImageFile && (
                    <p className="text-xs text-neutral-400 mb-3 truncate">
                      {localImageFile.name}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTempImageUrl(null)
                      setTempImagePath(null)
                      setLocalImageFile(null)
                      // Resetar o input de arquivo
                      const fileInput = document.getElementById('personalization-image') as HTMLInputElement
                      if (fileInput) {
                        fileInput.value = ''
                      }
                    }}
                    className="text-xs border-error-500 text-error-400 hover:bg-error-500/10"
                  >
                    Remover e escolher outra
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Descrição - Opcional */}
        <div className="mb-6">
          <Label htmlFor="personalization-description" className="block text-sm font-medium text-white mb-3">
            Descrição da personalização <span className="text-neutral-400 font-normal">(opcional)</span>
          </Label>
          <p className="text-xs text-neutral-400 mb-3">
            Descreva como você quer que a imagem seja aplicada no produto. Ex: &ldquo;Colocar no centro da caneca&rdquo;, &ldquo;Fundo branco, imagem no topo&rdquo;, etc.
          </p>
          <Input
            id="personalization-description"
            type="text"
            placeholder="Ex: Colocar no centro da caneca"
            value={personalizationDescription}
            onChange={(e) => setPersonalizationDescription(e.target.value)}
            maxLength={500}
            className="bg-secondary-800 border-secondary-600 text-white placeholder:text-neutral-500"
          />
          <p className="mt-2 text-xs text-neutral-500">
            {personalizationDescription.length}/500 caracteres
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 rounded-xl border border-error-500/50 bg-error-950/50 p-4 text-error-400">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1 border-header-border text-white hover:bg-white/10"
          >
            Cancelar
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart()
            }}
            disabled={isProcessing || !tempImageUrl}
            className="flex-1 bg-primary-500 text-neutral-950 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" variant="default" />
                <span className="ml-2">Processando...</span>
              </>
            ) : (
              'Adicionar ao Carrinho'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

