'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOrderSchema, type CreateOrderInput } from '@/lib/validations/order'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  formatCPF,
  formatWhatsApp,
  formatCEP,
  formatWhatsAppForAPI,
  unformatCPF,
  unformatCEP,
  capitalizeWords,
} from '@/lib/utils/formatting'
import Image from 'next/image'

interface CartItem {
  productId: string
  quantity: number
  personalizationImageUrl?: string
  personalizationDescription?: string
}

interface Product {
  id: string
  title: string
  description?: string
  price_cents: number
  image_url?: string
}

export default function CartCheckoutForm() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderInput['customer']>({
    resolver: zodResolver(createOrderSchema.shape.customer),
    mode: 'onChange',
  })

  // Handler para quando o formulário tem erros de validação
  const onError = (errors: any) => {
    console.log('Erros de validação:', errors)
    // Scroll para o primeiro erro
    const firstError = Object.keys(errors)[0]
    if (firstError) {
      const element = document.querySelector(`[name="${firstError}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  useEffect(() => {
    // Carregar carrinho do localStorage
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      const items: CartItem[] = JSON.parse(storedCart)
      setCartItems(items)

      // Buscar produtos
      const supabase = createClient()
      const productIds = items.map((item) => item.productId)

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
          setLoadingProducts(false)
        })
    } else {
      setLoadingProducts(false)
    }
  }, [])

  const removeFromCart = (productId: string) => {
    const updated = cartItems.filter((item) => item.productId !== productId)
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
  }

  const totalCents = cartItems.reduce((sum, item) => {
    const product = products[item.productId]
    return sum + (product ? product.price_cents * item.quantity : 0)
  }, 0)

  const onSubmit = async (customerData: CreateOrderInput['customer']) => {
    console.log('Submetendo formulário com dados:', customerData)
    
    // Validar se há itens no carrinho
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio. Adicione produtos antes de finalizar o pedido.')
      return
    }

    setLoading(true)

    try {
      // Formatar dados antes de enviar
      const formattedData = {
        customer: {
          ...customerData,
          cpf: unformatCPF(customerData.cpf), // Remove formatação do CPF
          whatsapp: formatWhatsAppForAPI(customerData.whatsapp), // Converte para formato API
          address: {
            ...customerData.address,
            zipcode: unformatCEP(customerData.address.zipcode), // Remove formatação do CEP
          },
        },
        items: cartItems,
      }

      // Validar o objeto completo antes de enviar
      const validation = createOrderSchema.safeParse(formattedData)
      if (!validation.success) {
        console.error('Erro de validação:', validation.error)
        alert('Erro de validação. Verifique os campos e tente novamente.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Erro na API:', result)
        // Mostrar erros de validação da API se houver
        if (result.details) {
          alert(`Erro ao criar pedido: ${result.error}\nDetalhes: ${JSON.stringify(result.details, null, 2)}`)
        } else {
          alert(`Erro ao criar pedido: ${result.error || 'Erro desconhecido'}`)
        }
        setLoading(false)
        return
      }

      console.log('Pedido criado com sucesso, redirecionando para Stripe...')
      
      // Limpar carrinho
      localStorage.removeItem('cart')

      // Redirecionar para Stripe Checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        throw new Error('URL de checkout não recebida')
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error)
      alert(`Erro ao finalizar pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setLoading(false)
    }
  }

  if (loadingProducts) {
    return <div className="text-center py-12">Carregando...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Seu carrinho está vazio.</p>
        <Button
          onClick={() => router.push('/store')}
          className="mt-4"
          variant="outline"
        >
          Ver Produtos
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
      {/* Mensagem de erro geral */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-6">
          <p className="text-sm font-semibold text-red-900 mb-3">
            Por favor, corrija os erros abaixo antes de continuar:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1.5">
            {errors.name && (
              <li>Nome: {errors.name.message}</li>
            )}
            {errors.email && (
              <li>Email: {errors.email.message}</li>
            )}
            {errors.cpf && (
              <li>CPF: {errors.cpf.message}</li>
            )}
            {errors.whatsapp && (
              <li>WhatsApp: {errors.whatsapp.message}</li>
            )}
            {errors.address?.street && (
              <li>Rua: {errors.address.street.message}</li>
            )}
            {errors.address?.number && (
              <li>Número: {errors.address.number.message}</li>
            )}
            {errors.address?.city && (
              <li>Cidade: {errors.address.city.message}</li>
            )}
            {errors.address?.state && (
              <li>Estado: {errors.address.state.message}</li>
            )}
            {errors.address?.zipcode && (
              <li>CEP: {errors.address.zipcode.message}</li>
            )}
          </ul>
        </div>
      )}
      {/* Itens do carrinho */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Itens</h3>
        {cartItems.map((item) => {
          const product = products[item.productId]
          if (!product) return null

          return (
            <div
              key={item.productId}
              className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{product.title}</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Quantidade: {item.quantity}
                </p>
                {(item.personalizationImageUrl || item.personalizationDescription) && (
                  <div className="mt-3 space-y-2">
                    {item.personalizationImageUrl && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">Imagem de personalização:</p>
                        <img
                          src={item.personalizationImageUrl}
                          alt="Personalização"
                          className="mt-2 h-16 w-16 rounded-xl object-cover border border-gray-200"
                        />
                      </div>
                    )}
                    {item.personalizationDescription && (
                      <div>
                        <p className="text-xs font-medium text-gray-700">Descrição:</p>
                        <p className="mt-1 text-xs text-gray-600">{item.personalizationDescription}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(product.price_cents * item.quantity)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromCart(item.productId)}
                  className="mt-3"
                >
                  Remover
                </Button>
              </div>
            </div>
          )
        })}
        <div className="flex justify-between border-t border-gray-200 pt-6 mt-6">
          <span className="text-xl font-semibold text-gray-900">Total:</span>
          <span className="text-2xl font-semibold text-gray-900">
            {formatCurrency(totalCents)}
          </span>
        </div>
      </div>

      {/* Formulário de dados do cliente */}
      <div className="mt-12 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Dados do Cliente
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Preencha seus dados para finalizar o pedido
          </p>
        </div>

        <div>
          <Label htmlFor="name" className="mb-3 block">Nome Completo *</Label>
          <Input
            id="name"
            {...register('name', {
              onChange: (e) => {
                // Capitaliza automaticamente
                const formatted = capitalizeWords(e.target.value)
                e.target.value = formatted
              },
            })}
            placeholder="João Silva"
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="mb-3 block">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="joao@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="cpf" className="mb-3 block">CPF *</Label>
          <Input
            id="cpf"
            {...register('cpf', {
              onChange: (e) => {
                // Formata automaticamente enquanto digita
                const formatted = formatCPF(e.target.value)
                e.target.value = formatted
              },
            })}
            placeholder="000.000.000-00"
            maxLength={14}
          />
          {errors.cpf && (
            <p className="mt-2 text-sm text-red-600">
              {errors.cpf.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="whatsapp" className="mb-3 block">WhatsApp *</Label>
          <Input
            id="whatsapp"
            {...register('whatsapp', {
              onChange: (e) => {
                // Formata automaticamente enquanto digita
                const formatted = formatWhatsApp(e.target.value)
                e.target.value = formatted
              },
            })}
            placeholder="(68) 97293-2250"
            type="tel"
          />
          <p className="mt-2 text-xs text-gray-400">
            Digite com DDD ou código do país (ex: (68) 97293-2250 ou +55 68 97293-2250)
          </p>
          {errors.whatsapp && (
            <p className="mt-2 text-sm text-red-600">
              {errors.whatsapp.message}
            </p>
          )}
        </div>

        <div className="space-y-6 border-t border-gray-200 pt-8">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Endereço</h4>
            <p className="mt-1 text-sm text-gray-500">Informe o endereço de entrega</p>
          </div>

          <div>
            <Label htmlFor="street" className="mb-3 block">Rua *</Label>
            <Input
              id="street"
              {...register('address.street', {
                onChange: (e) => {
                  // Capitaliza automaticamente
                  const formatted = capitalizeWords(e.target.value)
                  e.target.value = formatted
                },
              })}
              placeholder="Rua das Flores"
            />
            {errors.address?.street && (
              <p className="mt-2 text-sm text-red-600">
                {errors.address.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="number" className="mb-3 block">Número *</Label>
              <Input
                id="number"
                {...register('address.number')}
                placeholder="123"
              />
              {errors.address?.number && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address.number.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="zipcode" className="mb-3 block">CEP *</Label>
              <Input
                id="zipcode"
                {...register('address.zipcode', {
                  onChange: (e) => {
                    // Formata automaticamente enquanto digita
                    const formatted = formatCEP(e.target.value)
                    e.target.value = formatted
                  },
                })}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.address?.zipcode && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.address.zipcode.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="city" className="mb-3 block">Cidade *</Label>
            <Input
              id="city"
              {...register('address.city', {
                onChange: (e) => {
                  // Capitaliza automaticamente
                  const formatted = capitalizeWords(e.target.value)
                  e.target.value = formatted
                },
              })}
              placeholder="Rio Branco"
            />
            {errors.address?.city && (
              <p className="mt-2 text-sm text-red-600">
                {errors.address.city.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="state" className="mb-3 block">Estado (UF) *</Label>
            <Input
              id="state"
              {...register('address.state', {
                onChange: (e) => {
                  // Converte para maiúsculo automaticamente
                  e.target.value = e.target.value.toUpperCase()
                },
              })}
              placeholder="AC"
              maxLength={2}
            />
            {errors.address?.state && (
              <p className="mt-2 text-sm text-red-600">
                {errors.address.state.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
      </div>
    </form>
  )
}
