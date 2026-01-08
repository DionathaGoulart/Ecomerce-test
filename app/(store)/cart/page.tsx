'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ChevronUp, ChevronDown, Trash2, Image as ImageIcon, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import Footer from '@/components/store/Footer'

interface Product {
  id: string
  title: string
  price_cents: number
  image_url?: string
}

export default function CartPage() {
  const router = useRouter()
  const { cartItems, updateQuantity, removeItem, addItem } = useCart()
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
  const [tempImageUrls, setTempImageUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    if (cartItems.length > 0) {
      const supabase = createClient()
      const productIds = cartItems.map((item) => item.productId)

      supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .then(({ data, error }) => {
          if (data) {
            const productMap: Record<string, Product> = {}
            data.forEach((product) => {
              productMap[product.id] = product
            })
            setProducts(productMap)
          }
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [cartItems])

  const handleIncrease = (productId: string) => {
    const item = cartItems.find((item) => item.productId === productId)
    if (item) {
      updateQuantity(productId, item.quantity + 1)
    }
  }

  const handleDecrease = (productId: string) => {
    const item = cartItems.find((item) => item.productId === productId)
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(productId, item.quantity - 1)
      } else {
        removeItem(productId)
      }
    }
  }

  const handleRemove = (productId: string) => {
    removeItem(productId)
  }

  const handleImageUpload = async (productId: string, file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setUploadErrors(prev => ({ ...prev, [productId]: 'Por favor, selecione uma imagem' }))
      return
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(prev => ({ ...prev, [productId]: 'A imagem deve ter no máximo 5MB' }))
      return
    }

    setUploadingImages(prev => ({ ...prev, [productId]: true }))
    setUploadErrors(prev => ({ ...prev, [productId]: '' }))

    try {
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

      // Atualizar item do carrinho automaticamente quando a imagem for carregada
      const currentItem = cartItems.find(item => item.productId === productId)
      if (currentItem) {
        addItem({
          productId,
          quantity: currentItem.quantity,
          personalizationImageUrl: data.url,
          personalizationImagePath: data.path,
          personalizationDescription: currentItem.personalizationDescription,
        })

        setUploadErrors(prev => {
          const updated = { ...prev }
          delete updated[productId]
          return updated
        })
      } else {
        setTempImageUrls(prev => ({ ...prev, [productId]: data.url }))
      }
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setUploadErrors(prev => ({
        ...prev,
        [productId]: err instanceof Error ? err.message : 'Erro ao fazer upload da imagem'
      }))
    } finally {
      setUploadingImages(prev => ({ ...prev, [productId]: false }))
    }
  }

  // Calcular totais
  const subtotalCents = cartItems.reduce((sum, item) => {
    const product = products[item.productId]
    return sum + (product ? product.price_cents * item.quantity : 0)
  }, 0)

  const shippingCents = 0 // Frete será calculado depois
  const voucherCents = 0 // Voucher será implementado depois
  const totalCents = subtotalCents + shippingCents - voucherCents

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-32 md:pt-60">
        <div className="text-center py-12">
          <p className="text-white/70">Carregando...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="w-full max-w-7xl mx-auto pt-32 md:pt-60 flex-1">
          <h1 className="text-[96px] font-bold text-white">Carrinho</h1>
          <div className="flex flex-col items-start justify-start py-12">
            <p className="text-white/70 text-[16px] font-normal">Seu carrinho ainda está vazio.</p>
            <p className="text-white/70 text-[16px] font-normal mb-16">Que tal conhecer nossos produtos?</p>

            <Link
              href="/catalogo"
              className="group relative flex items-center justify-center rounded-xl sm:rounded-[16px] bg-primary-500 px-5 sm:px-6 md:px-5 py-3 sm:py-3.5 md:py-[18px] text-[14px] sm:text-base font-medium text-neutral-950 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] md:hover:pl-[50px] w-full sm:w-auto overflow-hidden"
            >
              <Image
                src="/icons/eye.svg"
                alt=""
                width={20}
                height={20}
                className="absolute left-[18px] sm:left-[20px] md:left-[18px] top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 opacity-0 -translate-x-[15px] md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              />
              <span className="whitespace-nowrap inline-block">Ver catálogo</span>
            </Link>
          </div>
        </div>
        <div className="-mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32 3xl:-mx-40 2xl:-mx-96 mt-auto -mb-20 md:mb-0">
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="hidden md:block h-60"></div>
      <div className="w-full max-w-[1400px] mx-auto pb-20 md:pb-32 pt-32 md:pt-0 flex-1">
        <h1 className="text-[96px] font-bold text-white mb-12">Carrinho</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Lista de itens */}
          <div className="flex-1 lg:flex-[2] space-y-6">
            {cartItems.map((item) => {
              const product = products[item.productId]
              if (!product) return null

              return (
                <div
                  key={item.productId}
                  className="relative bg-[#212121] border border-[#3D3D3D] rounded-2xl p-8"
                >
                  {/* Ícone de lixeira no canto superior direito */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="flex gap-8 items-start">
                    {/* Imagem à esquerda */}
                    {product.image_url && (
                      <div className="flex-shrink-0">
                        <div className="w-[160px] aspect-square">
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            width={160}
                            height={160}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Informações à direita */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Nome do produto */}
                      <h3 className="text-[24px] font-bold text-white mb-4">
                        {product.title}
                      </h3>

                      {/* Controles de quantidade */}
                      <div className="flex items-center gap-2 h-[40px] sm:h-[44px] mb-6">
                        <Button
                          onClick={() => handleIncrease(item.productId)}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 text-black border-none rounded-xl sm:rounded-2xl p-2 sm:p-2.5 h-full bg-green-light"
                        >
                          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1
                            if (newQuantity >= 1) {
                              updateQuantity(item.productId, newQuantity)
                            }
                          }}
                          onBlur={(e) => {
                            const value = parseInt(e.target.value)
                            if (!value || value < 1) {
                              updateQuantity(item.productId, 1)
                            }
                          }}
                          className="w-24 text-center text-sm sm:text-base no-spinner bg-transparent border border-secondary-600 text-white h-full"
                          min={1}
                        />
                        <Button
                          onClick={() => handleDecrease(item.productId)}
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 text-white border-none rounded-xl sm:rounded-2xl p-2 sm:p-2.5 h-full bg-red-error"
                        >
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      {/* Valor */}
                      <p className="text-[24px] font-normal text-white mb-6">
                        {formatCurrency(product.price_cents * item.quantity)}
                      </p>

                      {/* Card para adicionar arte */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id={`image-upload-${item.productId}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(item.productId, file)
                            }
                          }}
                          disabled={uploadingImages[item.productId]}
                        />
                        <label
                          htmlFor={`image-upload-${item.productId}`}
                          className="border border-[#3D3D3D] rounded-2xl p-5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors block"
                        >
                          {uploadingImages[item.productId] ? (
                            <>
                              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                              <span className="text-white text-base">Fazendo upload...</span>
                            </>
                          ) : (tempImageUrls[item.productId] || item.personalizationImageUrl) ? (
                            <>
                              <Image
                                src={tempImageUrls[item.productId] || item.personalizationImageUrl || ''}
                                alt="Preview"
                                width={24}
                                height={24}
                                className="h-6 w-6 rounded object-cover flex-shrink-0"
                                unoptimized
                              />
                              <span className="text-white text-base">Imagem adicionada (clique para trocar)</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-6 w-6 text-white flex-shrink-0" />
                              <span className="text-white text-base">Clique para adicionar a arte</span>
                            </>
                          )}
                        </label>
                        {uploadErrors[item.productId] && (
                          <p className="mt-2 text-sm text-red-400">{uploadErrors[item.productId]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Card de resumo à direita */}
          <div className="lg:w-[320px]">
            <div className="bg-[#212121] border border-[#3D3D3D] rounded-2xl p-6 space-y-5 sticky top-24">
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Produtos</span>
                <span className="text-white text-lg font-medium">
                  {formatCurrency(subtotalCents)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Frete</span>
                <span className="text-white text-lg font-medium">
                  {formatCurrency(shippingCents)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Voucher</span>
                <span className="text-white text-lg font-medium">
                  {formatCurrency(voucherCents)}
                </span>
              </div>

              <div className="border-t border-[#3D3D3D] pt-6 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-white text-xl font-bold">Total</span>
                  <span className="text-white text-xl font-bold">
                    {formatCurrency(totalCents)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-[#121212] font-medium py-5 px-6 rounded-2xl transition-colors flex items-center justify-center gap-3 mt-6"
              >
                <ShoppingCart className="h-5 w-5" />
                Continuar a Compra
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="-mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32 3xl:-mx-40 2xl:-mx-96 mt-auto -mb-20 md:mb-0">
        <Footer />
      </div>
    </div>
  )
}