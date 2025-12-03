'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useImageUpload, useCart } from '@/hooks'
import { ROUTES } from '@/lib/constants'
import { Alert, AlertDescription } from '@/components/molecules/Alert'

interface ProductPersonalizeFormProps {
  productId: string
}

export default function ProductPersonalizeForm({
  productId,
}: ProductPersonalizeFormProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [personalizationDescription, setPersonalizationDescription] = useState('')

  const {
    uploadImage,
    isUploading,
    uploadError,
    imageUrl,
  } = useImageUpload()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadImage(file)
    }
  }

  const handleAddToCart = () => {
    if (quantity < 1) {
      alert('Quantidade deve ser pelo menos 1')
      return
    }

    addItem({
      productId,
      quantity,
      personalizationImageUrl: imageUrl || undefined,
      personalizationDescription: personalizationDescription.trim() || undefined,
    })

    router.push(ROUTES.CART)
  }

  return (
    <div className="space-y-8">
      <div>
        <Label htmlFor="quantity" className="block text-sm font-medium text-neutral-900 mb-3">
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
          <span className="text-lg font-medium text-neutral-900 w-12 text-center">
            {quantity}
          </span>
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
        <Label htmlFor="personalization-image" className="block text-sm font-medium text-neutral-900 mb-3">
          Imagem para personalização <span className="text-neutral-400 font-normal">(opcional)</span>
        </Label>
        <div>
          <input
            id="personalization-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-500 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200 transition-colors cursor-pointer"
            disabled={isUploading}
          />
          {isUploading && (
            <p className="mt-3 text-sm text-neutral-500">Enviando...</p>
          )}
          {uploadError && (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
          {imageUrl && !uploadError && (
            <div className="mt-4">
              <p className="text-sm text-neutral-500 mb-3">Preview da imagem:</p>
              <Image
                src={imageUrl}
                alt="Preview"
                width={128}
                height={128}
                className="h-32 w-32 rounded-xl object-cover border border-neutral-200 shadow-sm"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="personalization-description" className="block text-sm font-medium text-neutral-900 mb-3">
          Descrição da personalização <span className="text-neutral-400 font-normal">(opcional)</span>
        </Label>
        <p className="text-sm text-neutral-500 mb-3 leading-relaxed">
          Descreva como você quer que a imagem seja aplicada no produto. Ex: &ldquo;Colocar no centro da caneca&rdquo;, &ldquo;Fundo branco, imagem no topo&rdquo;, etc.
        </p>
        <Input
          id="personalization-description"
          type="text"
          placeholder="Ex: Colocar no centro da caneca"
          value={personalizationDescription}
          onChange={(e) => setPersonalizationDescription(e.target.value)}
          maxLength={500}
        />
        <p className="mt-2 text-xs text-neutral-400">
          {personalizationDescription.length}/500 caracteres
        </p>
      </div>

      <Button
        onClick={handleAddToCart}
        disabled={isUploading}
        className="w-full"
        size="lg"
      >
        Adicionar ao Carrinho
      </Button>
    </div>
  )
}
