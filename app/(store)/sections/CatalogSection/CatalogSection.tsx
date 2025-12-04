'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Plus, Minus, ShoppingCart } from 'lucide-react'
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
    <Card variant="default" padding="none" className="overflow-hidden group">
      {product.image_url && (
        <div className="aspect-square overflow-hidden bg-neutral-50">
          <Image
            src={product.image_url}
            alt={product.title}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {product.title}
        </h3>
        <p className="text-sm text-neutral-600 mb-4">
          {formatCurrency(product.price_cents)} / 1 unid.
        </p>
        
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
              onClick={handleDecrease}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              readOnly
              className="flex-1 text-center"
              min={1}
            />
            <Button
              onClick={handleIncrease}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function CatalogSection() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
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
    <section id="catalogo" className="relative z-20 w-full py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <h2 className="font-semibold mb-8" style={{ fontSize: '96px', color: '#FFFFFF' }}>
          Catálogo
        </h2>

        {/* Barra de Pesquisa */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="o que vc esta procurando?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Layout: Sidebar + Catálogo */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Categorias */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Categorias
              </h3>
              <ul className="space-y-2">
                {CATEGORIES.map((category) => (
                  <li key={category}>
                    <button
                      onClick={() => setSelectedCategory(
                        selectedCategory === category ? null : category
                      )}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary-500 text-neutral-950 font-medium'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
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

