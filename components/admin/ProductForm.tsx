'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '@/lib/validations/product'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface ProductFormProps {
  product?: {
    id: string
    title: string
    description?: string | null
    price_cents: number
    image_url?: string | null
  }
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.image_url || null
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          title: product.title,
          description: product.description || '',
          price_cents: product.price_cents,
          image_url: product.image_url || '',
        }
      : undefined,
  })

  useEffect(() => {
    if (imageUrl) {
      setValue('image_url', imageUrl)
    }
  }, [imageUrl, setValue])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('products').getPublicUrl(filePath)

      setImageUrl(publicUrl)
      setValue('image_url', publicUrl)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const onSubmit = async (data: ProductInput) => {
    setLoading(true)

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const method = product ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar produto')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar produto. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          {...register('title')}
          className="mt-1"
          placeholder="Caneca Personalizada"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          {...register('description')}
          className="mt-1 flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          placeholder="Descrição do produto..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-error-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="price_cents">Preço (em centavos) *</Label>
        <Input
          id="price_cents"
          type="number"
          {...register('price_cents', { valueAsNumber: true })}
          className="mt-1"
          placeholder="2990"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Exemplo: 2990 = R$ 29,90
        </p>
        {errors.price_cents && (
          <p className="mt-1 text-sm text-error-600">
            {errors.price_cents.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="image">Imagem</Label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1 block w-full text-sm text-neutral-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          disabled={uploadingImage}
        />
        {uploadingImage && (
          <p className="mt-2 text-sm text-neutral-500">Enviando...</p>
        )}
        {imageUrl && (
          <div className="mt-4">
            <Image
              src={imageUrl}
              alt="Preview"
              width={128}
              height={128}
              className="h-32 w-32 rounded-md object-cover"
              unoptimized
            />
          </div>
        )}
        <input type="hidden" {...register('image_url')} />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
