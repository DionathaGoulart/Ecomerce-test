'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

interface ProductPersonalizeFormProps {
  productId: string
}

export default function ProductPersonalizeForm({
  productId,
}: ProductPersonalizeFormProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [personalizationDescription, setPersonalizationDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione uma imagem')
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 5MB')
      return
    }

    setImageFile(file)
    setUploading(true)
    setUploadError(null)

    try {
      // Fazer upload via API route (usa service role, mais seguro)
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

      if (result.url) {
        setImageUrl(result.url)
      } else {
        throw new Error('URL da imagem não foi retornada')
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro ao fazer upload da imagem'
      setUploadError(errorMessage)
      setImageFile(null)
      setImageUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleAddToCart = () => {
    if (quantity < 1) {
      alert('Quantidade deve ser pelo menos 1')
      return
    }

    // Salvar no localStorage com descrição
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const newItem = {
      productId,
      quantity,
      personalizationImageUrl: imageUrl || undefined,
      personalizationDescription: personalizationDescription.trim() || undefined,
    }

    // Verificar se o produto já está no carrinho
    const existingIndex = cart.findIndex(
      (item: { productId: string }) => item.productId === productId
    )

    if (existingIndex >= 0) {
      cart[existingIndex] = newItem
    } else {
      cart.push(newItem)
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    router.push('/store/cart')
  }

  return (
    <div className="space-y-8">
      <div>
        <Label htmlFor="quantity" className="block text-sm font-medium text-gray-900 mb-3">
          Quantidade
        </Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            size="sm"
          >
            -
          </Button>
          <span className="text-lg font-medium text-gray-900 w-12 text-center">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuantity(quantity + 1)}
            size="sm"
          >
            +
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="personalization-image" className="block text-sm font-medium text-gray-900 mb-3">
          Imagem para personalização <span className="text-gray-400 font-normal">(opcional)</span>
        </Label>
        <div>
          <input
            id="personalization-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 transition-colors cursor-pointer"
            disabled={uploading}
          />
          {uploading && (
            <p className="mt-3 text-sm text-gray-500">Enviando...</p>
          )}
          {uploadError && (
            <div className="mt-3 rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}
          {imageUrl && !uploadError && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">Preview da imagem:</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="h-32 w-32 rounded-xl object-cover border border-gray-200 shadow-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="personalization-description" className="block text-sm font-medium text-gray-900 mb-3">
          Descrição da personalização <span className="text-gray-400 font-normal">(opcional)</span>
        </Label>
        <p className="text-sm text-gray-500 mb-3 leading-relaxed">
          Descreva como você quer que a imagem seja aplicada no produto. Ex: "Colocar no centro da caneca", "Fundo branco, imagem no topo", etc.
        </p>
        <Input
          id="personalization-description"
          type="text"
          placeholder="Ex: Colocar no centro da caneca"
          value={personalizationDescription}
          onChange={(e) => setPersonalizationDescription(e.target.value)}
          maxLength={500}
        />
        <p className="mt-2 text-xs text-gray-400">
          {personalizationDescription.length}/500 caracteres
        </p>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={loading || uploading}
        className="w-full"
        size="lg"
      >
        Adicionar ao Carrinho
      </Button>
    </div>
  )
}
