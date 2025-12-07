'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Search, Plus, Minus, ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks'
import { useProducts } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card } from '@/components/molecules/Card'
import { LoadingDots } from '@/components/atoms/LoadingDots'
import type { Product, CartItem } from '@/types'

interface Category {
  id: string
  name: string
  description?: string
}

interface CatalogCardProps {
  product: Product
  onAddToCart: (productId: string, quantity: number) => void
  cartQuantity: number
  priority?: boolean
}

function CatalogCard({ product, onAddToCart, cartQuantity, priority = false }: CatalogCardProps) {
  const quantity = cartQuantity || 0
  const isAdding = quantity > 0

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleAddClick = () => {
    onAddToCart(product.id, 1)
  }

  const handleIncrease = () => {
    onAddToCart(product.id, quantity + 1)
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      onAddToCart(product.id, quantity - 1)
    } else {
      onAddToCart(product.id, 0) // Remove do carrinho
    }
  }

  return (
    <Card variant="default" padding="none" className="overflow-hidden group flex flex-col h-full bg-secondary-800 border border-secondary-600">
      {product.image_url && (
        <div className="overflow-hidden bg-transparent flex-shrink-0 p-4 sm:p-6 pb-0">
          <div className="aspect-square w-full relative">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover rounded-lg"
              loading={priority ? "eager" : "lazy"}
              priority={priority}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col flex-grow p-4 sm:p-6 pt-0">
        <h3 className="font-semibold mb-2 flex-shrink-0 text-base sm:text-lg md:text-product-title text-white/80 mt-4 sm:mt-6">
          {truncateText(product.title, 39)}
        </h3>
        <p className="mb-3 sm:mb-4 flex-shrink-0 text-sm sm:text-base md:text-product-price text-white/80">
          A partir de<br />
          <span className="text-white opacity-100">{formatCurrency(product.price_cents)}</span> / 1 unid.
        </p>
        
        <div className="mt-auto">
          {!isAdding && quantity === 0 ? (
            <Button
              onClick={handleAddClick}
              variant="primary"
              size="sm"
              className="w-full text-sm sm:text-base"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Adicionar
            </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleIncrease}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-black border-none rounded-xl sm:rounded-2xl p-2 sm:p-2.5"
              style={{ backgroundColor: '#9AF032' }}
            >
              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 0
                onAddToCart(product.id, newQuantity)
              }}
              className="flex-1 text-center text-sm sm:text-base no-spinner bg-transparent border border-secondary-600 text-white"
              min={1}
            />
            <Button
              onClick={handleDecrease}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-white border-none rounded-xl sm:rounded-2xl p-2 sm:p-2.5"
              style={{ backgroundColor: '#F03932' }}
            >
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
        </div>
      </div>
    </Card>
  )
}

export default function CatalogSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [displayedCount, setDisplayedCount] = useState(6)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { products, isLoading } = useProducts()
  const { cartItems, addItem, removeItem, updateQuantity } = useCart()

  // Buscar categorias do banco de dados
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
          // Sempre definir a primeira categoria como ativa por padrão
          if (data.length > 0) {
            setSelectedCategory(data[0].name)
          }
        } else {
          console.error('Erro ao buscar categorias')
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleAddToCart = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeItem(productId)
    } else {
      const existingItem = cartItems.find((item) => item.productId === productId)
      if (existingItem) {
        updateQuantity(productId, quantity)
      } else {
        addItem({
          productId,
          quantity,
        })
      }
    }
  }

  const handleIncreaseQuantity = (productId: string) => {
    const existingItem = cartItems.find((item) => item.productId === productId)
    if (existingItem) {
      // Se já tem imagem de personalização, apenas aumenta a quantidade
      // Caso contrário, adiciona ao carrinho e o usuário pode personalizar no carrinho
      updateQuantity(productId, existingItem.quantity + 1)
    } else {
      // Adiciona ao carrinho - personalização será feita no carrinho
      addItem({
        productId,
        quantity: 1,
      })
    }
  }

  const getCartQuantity = (productId: string): number => {
    const item = cartItems.find((item) => item.productId === productId)
    return item?.quantity || 0
  }

  const getCartItem = (productId: string): CartItem | undefined => {
    return cartItems.find((item) => item.productId === productId)
  }

  // Filtrar produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtrar por categoria se uma estiver selecionada
    const matchesCategory = selectedCategory ? product.category_name === selectedCategory : true
    
    return matchesSearch && matchesCategory
  })

  // Produtos exibidos (paginação infinita)
  const displayedProducts = filteredProducts.slice(0, displayedCount)
  const hasMore = displayedCount < filteredProducts.length

  // Resetar contador quando categoria ou busca mudar
  useEffect(() => {
    setDisplayedCount(6)
  }, [selectedCategory, searchQuery])

  // Observer para carregar mais produtos quando chegar ao final
  useEffect(() => {
    if (!hasMore || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayedCount((prev) => Math.min(prev + 6, filteredProducts.length))
        }
      },
      {
        threshold: 1.0, // Só dispara quando 100% visível
        rootMargin: '0px',
      }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef as Element)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef as Element)
      }
    }
  }, [hasMore, isLoading, filteredProducts.length, displayedCount])

  return (
    <section id="catalogo" className="relative z-20 w-full py-8 sm:py-12 md:py-16 bg-transparent w-screen -mx-[calc(50vw-50%)]">
      <div className="w-full max-w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
        {/* Título */}
        <h2 className="font-semibold mb-4 sm:mb-6 md:mb-8 text-2xl sm:text-3xl md:text-4xl lg:text-catalog-title text-white break-words">
          Catálogo
        </h2>

        {/* Barra de Pesquisa */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-primary-500 left-4 sm:left-8" />
            <Input
              type="text"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-[76px] pr-4 sm:pr-8 py-4 sm:py-6 text-sm sm:text-base text-white bg-secondary-800 border border-secondary-600 placeholder:text-white/60 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-secondary-600 focus-visible:border-secondary-600"
            />
          </div>
        </div>

        {/* Layout: Sidebar + Catálogo */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar de Categorias */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-transparent rounded-xl p-4 sm:p-6 lg:pl-0">
              {loadingCategories ? (
                <div className="py-4">
                  <LoadingDots size="sm" />
                </div>
              ) : (
                <ul className="flex flex-row lg:flex-col gap-2 sm:gap-0 sm:space-y-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                  {categories.map((category) => {
                    const isSelected = selectedCategory === category.name
                    const isHovered = hoveredCategory === category.name
                    const hasAnyHover = hoveredCategory !== null
                    
                    // Se há hover em qualquer item, os selecionados ficam como não selecionados
                    // Se o item está com hover, fica amarelo e 20px
                    // Caso contrário, usa o estado normal (selecionado ou não)
                    const getColorClass = () => {
                      if (isHovered) return 'text-primary-500'
                      if (hasAnyHover && isSelected) return 'text-white' // Selecionado mas há hover em outro, fica normal
                      if (isSelected) return 'text-primary-500'
                      return 'text-white'
                    }
                    
                    const getFontSizeClass = () => {
                      if (isHovered) return 'text-lg sm:text-xl'
                      if (hasAnyHover && isSelected) return 'text-sm sm:text-base' // Selecionado mas há hover em outro, fica normal
                      if (isSelected) return 'text-lg sm:text-xl'
                      return 'text-sm sm:text-base'
                    }
                    
                    return (
                      <li key={category.id} className="flex-shrink-0 lg:flex-shrink">
                        <button
                          onClick={() => setSelectedCategory(category.name)}
                          className={`w-full text-left py-2 px-3 lg:px-0 lg:pr-3 rounded-lg transition-all ${getColorClass()} ${getFontSizeClass()}`}
                          onMouseEnter={() => setHoveredCategory(category.name)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {category.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Catálogo de Produtos */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <LoadingDots size="lg" />
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm sm:text-base text-neutral-500">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  {displayedProducts.map((product, index) => (
                    <CatalogCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      cartQuantity={getCartQuantity(product.id)}
                      priority={index < 6} // Preload das primeiras 6 imagens
                    />
                  ))}
                </div>
                {/* Elemento para detectar quando carregar mais */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    <LoadingDots size="lg" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

