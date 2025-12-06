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
    category_id?: string | null
  }
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.image_url || null
  )

  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [priceDisplay, setPriceDisplay] = useState(
    product ? (product.price_cents / 100).toFixed(2).replace('.', ',') : ''
  )

  // Função para formatar valor em reais
  const formatCurrencyInput = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    if (!numbers) return ''
    
    // Converte para número e divide por 100 para ter centavos
    const cents = parseInt(numbers, 10)
    const reais = cents / 100
    
    // Formata com 2 casas decimais
    return reais.toFixed(2).replace('.', ',')
  }

  // Função para converter valor formatado para centavos
  const parseCurrencyToCents = (value: string): number => {
    const numbers = value.replace(/\D/g, '')
    if (!numbers) return 0
    return parseInt(numbers, 10)
  }

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
          category_id: product.category_id || null,
        }
      : undefined,
  })

  useEffect(() => {
    // Buscar categorias
    const fetchCategories = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (data) {
        setCategories(data)
      }
    }
    fetchCategories()
  }, [])

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
      // Usar API route para fazer upload (bypassa RLS usando supabaseAdmin)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/storage/upload-product', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao fazer upload da imagem')
      }

      const data = await response.json()
      
      setImageUrl(data.url)
      setValue('image_url', data.url)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert(error instanceof Error ? error.message : 'Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Por favor, informe o nome da categoria')
      return
    }

    setCreatingCategory(true)

    try {
      // Gerar slug automaticamente
      const slug = newCategoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          slug,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar categoria')
      }

      const newCategory = await response.json()

      // Atualizar lista de categorias
      setCategories([...categories, { id: newCategory.id, name: newCategory.name }])

      // Selecionar a nova categoria automaticamente
      setValue('category_id', newCategory.id)

      // Fechar modal e limpar
      setShowCategoryModal(false)
      setNewCategoryName('')
    } catch (error) {
      console.error('Erro:', error)
      alert(error instanceof Error ? error.message : 'Erro ao criar categoria')
    } finally {
      setCreatingCategory(false)
    }
  }

  const onSubmit = async (data: ProductInput) => {
    setLoading(true)

    try {
      // Converter o valor formatado para centavos
      const priceInCents = parseCurrencyToCents(priceDisplay)
      
      if (!priceDisplay || priceInCents <= 0) {
        alert('Por favor, informe um preço válido maior que zero')
        setLoading(false)
        return
      }

      const url = product
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'

      const method = product ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          price_cents: priceInCents,
        }),
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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4 sm:space-y-6">
      <div>
        <Label htmlFor="title" className="text-sm sm:text-base text-white">Título *</Label>
        <Input
          id="title"
          {...register('title')}
          className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
          placeholder="Caneca Personalizada"
        />
        {errors.title && (
          <p className="mt-1 text-xs sm:text-sm text-error-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-sm sm:text-base text-white">Descrição</Label>
        <textarea
          id="description"
          {...register('description')}
          className="mt-1 flex min-h-[100px] w-full rounded-md border border-header-border bg-header-bg px-3 py-2 text-sm sm:text-base text-white placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          placeholder="Descrição do produto..."
        />
        {errors.description && (
          <p className="mt-1 text-xs sm:text-sm text-error-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="category_id" className="text-sm sm:text-base text-white">Categoria</Label>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="text-xs text-primary-500 hover:text-primary-400 transition-colors"
          >
            + Nova Categoria
          </button>
        </div>
        <select
          id="category_id"
          {...register('category_id')}
          className="mt-1 flex h-10 sm:h-11 w-full rounded-md border border-header-border bg-header-bg px-3 py-2 text-sm sm:text-base text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category_id && (
          <p className="mt-1 text-xs sm:text-sm text-error-500">
            {errors.category_id.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="price" className="text-sm sm:text-base text-white">Preço *</Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 text-xs sm:text-sm">
            R$
          </span>
          <Input
            id="price"
            type="text"
            value={priceDisplay}
            onChange={(e) => {
              const formatted = formatCurrencyInput(e.target.value)
              setPriceDisplay(formatted)
              // Atualizar o valor em centavos no form
              const cents = parseCurrencyToCents(formatted)
              setValue('price_cents', cents, { shouldValidate: true })
            }}
            onBlur={() => {
              // Garantir que sempre tenha pelo menos 0,00
              if (!priceDisplay || priceDisplay === '') {
                setPriceDisplay('0,00')
                setValue('price_cents', 0, { shouldValidate: true })
              }
            }}
            className="pl-9 sm:pl-10 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
            placeholder="0,00"
          />
        </div>
        <p className="mt-1 text-xs text-white/70">
          Digite o valor em reais (ex: 29,90)
        </p>
        {errors.price_cents && (
          <p className="mt-1 text-xs sm:text-sm text-error-500">
            {errors.price_cents.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="image" className="text-sm sm:text-base text-white">Imagem</Label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1 block w-full text-xs sm:text-sm text-white/70 file:mr-2 sm:file:mr-4 file:rounded-md file:border-0 file:bg-primary-500 file:px-3 sm:file:px-4 file:py-1.5 sm:file:py-2 file:text-xs sm:file:text-sm file:font-semibold file:text-neutral-950 hover:file:opacity-90"
          disabled={uploadingImage}
        />
        {uploadingImage && (
          <p className="mt-2 text-xs sm:text-sm text-white/70">Enviando...</p>
        )}
        {imageUrl && (
          <div className="mt-4">
            <Image
              src={imageUrl}
              alt="Preview"
              width={128}
              height={128}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded-md object-cover"
              unoptimized
            />
          </div>
        )}
        <input type="hidden" {...register('image_url')} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button 
          type="submit" 
          disabled={loading}
          className="w-full sm:w-auto text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90"
        >
          {loading ? 'Salvando...' : product ? 'Atualizar' : 'Criar'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
          className="w-full sm:w-auto text-sm sm:text-base border-header-border text-white hover:bg-white/10"
        >
          Cancelar
        </Button>
      </div>

      {/* Modal de Criar Categoria */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-header-border bg-header-bg p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg sm:text-xl font-bold text-white">Nova Categoria</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new_category_name" className="text-sm sm:text-base text-white">
                  Nome da Categoria *
                </Label>
                <Input
                  id="new_category_name"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="mt-1 text-sm sm:text-base bg-header-bg border-header-border text-white placeholder:text-white/50"
                  placeholder="Ex: Canecas"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateCategory()
                    }
                  }}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  className="flex-1 text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90"
                >
                  {creatingCategory ? 'Criando...' : 'Criar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCategoryModal(false)
                    setNewCategoryName('')
                  }}
                  className="text-sm sm:text-base border-header-border text-white hover:bg-white/10"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
