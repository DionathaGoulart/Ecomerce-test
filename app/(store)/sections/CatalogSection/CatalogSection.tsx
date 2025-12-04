'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Plus, Minus, ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks'
import { useProducts } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Card } from '@/components/molecules/Card'
import type { Product, CartItem } from '@/types'

const CATEGORIES = [
  'Bastidores',
  'Cake Boards',
  'Cuia',
  'Plaquinhas',
  'Tags',
  'Talheres de Madeira',
  'Tábuas de Frios',
] as const

interface CatalogCardProps {
  product: Product
  onAddToCart: (productId: string, quantity: number) => void
  cartQuantity: number
}

function CatalogCard({ product, onAddToCart, cartQuantity }: CatalogCardProps) {
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
        <div className="overflow-hidden bg-transparent flex-shrink-0 p-6 pb-0">
          <div className="aspect-square w-full relative">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>
      )}
      <div className="flex flex-col flex-grow p-6 pt-0">
        <h3 className="font-semibold mb-2 flex-shrink-0 text-product-title text-white/80 mt-6">
          {truncateText(product.title, 39)}
        </h3>
        <p className="mb-4 flex-shrink-0 text-product-price text-white/80">
          A partir de<br />
          <span className="text-white opacity-100">{formatCurrency(product.price_cents)}</span> / 1 unid.
        </p>
        
        <div className="mt-auto">
          {!isAdding && quantity === 0 ? (
            <Button
              onClick={handleAddClick}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleIncrease}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-black border-none rounded-2xl"
              style={{ backgroundColor: '#9AF032' }}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value) || 0
                onAddToCart(product.id, newQuantity)
              }}
              className="flex-1 text-center no-spinner bg-transparent border border-secondary-600 text-white"
              min={1}
            />
            <Button
              onClick={handleDecrease}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-white border-none rounded-2xl"
              style={{ backgroundColor: '#F03932' }}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        </div>
      </div>
    </Card>
  )
}

export default function CatalogSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const { products, isLoading } = useProducts()
  const { cartItems, addItem, removeItem, updateQuantity } = useCart()

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

  const getCartQuantity = (productId: string): number => {
    const item = cartItems.find((item) => item.productId === productId)
    return item?.quantity || 0
  }

  // Filtrar produtos
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Por enquanto não temos categoria no produto, então retornamos todos se não houver categoria selecionada
    // Quando tiver categoria no banco, adicionar filtro aqui
    return matchesSearch
  })

  // Limitar a 6 produtos
  const displayedProducts = filteredProducts.slice(0, 6)

  return (
    <section id="catalogo" className="relative z-20 w-full py-16 bg-transparent w-screen -mx-[calc(50vw-50%)]">
      <div className="w-full max-w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-48 2xl:px-96">
        {/* Título */}
        <h2 className="font-semibold mb-8 text-catalog-title text-white">
          Catálogo
        </h2>

        {/* Barra de Pesquisa */}
        <div className="mb-8">
          <div className="relative w-full">
            <Search className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-primary-500 left-8" />
            <Input
              type="text"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[76px] pr-8 py-6 text-white bg-secondary-800 border border-secondary-600 placeholder:text-white/60"
            />
          </div>
        </div>

        {/* Layout: Sidebar + Catálogo */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Sidebar de Categorias */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-transparent rounded-xl p-6 pl-0">
              <ul className="space-y-2">
                {CATEGORIES.map((category) => {
                  const isSelected = selectedCategory === category
                  const isHovered = hoveredCategory === category
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
                    if (isHovered) return 'text-xl'
                    if (hasAnyHover && isSelected) return 'text-base' // Selecionado mas há hover em outro, fica normal
                    if (isSelected) return 'text-xl'
                    return 'text-base'
                  }
                  
                  return (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(
                          selectedCategory === category ? null : category
                        )}
                        className={`w-full text-left py-2 pr-3 rounded-lg transition-all pl-0 ${getColorClass()} ${getFontSizeClass()}`}
                        onMouseEnter={() => setHoveredCategory(category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                      >
                        {category}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>

          {/* Catálogo de Produtos */}
          <div className="flex-1">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-neutral-500">Carregando produtos...</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((product) => (
                  <CatalogCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    cartQuantity={getCartQuantity(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

