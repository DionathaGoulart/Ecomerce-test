'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOrderSchema, type CreateOrderInput } from '@/lib/validations/order'
import { Input } from '@/components/atoms/Input'
import { Label } from '@/components/atoms/Label'
import { Button } from '@/components/atoms/Button'
import { Card, CardContent } from '@/components/molecules/Card'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  formatCEP,
  unformatCEP,
  capitalizeWords,
} from '@/lib/utils/formatting'
import Image from 'next/image'
import { LoadingDots } from '@/components/atoms/LoadingDots'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import Link from 'next/link'
import { ChevronUp, ChevronDown } from 'lucide-react'

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

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface SavedAddress {
  id: string
  label: string | null
  street: string
  number: string
  complement: string | null
  city: string
  state: string
  zipcode: string
  is_default: boolean
}

export default function CartCheckoutForm() {
  const router = useRouter()
  const { user, loading: loadingAuth } = useAuth()
  const { cartItems: cartItemsFromHook, updateQuantity } = useCart()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateOrderInput['customer']>({
    resolver: zodResolver(createOrderSchema.shape.customer),
    mode: 'onChange',
  })

  const zipcode = watch('address.zipcode')

  const selectAddress = useCallback((address: SavedAddress) => {
    setSelectedAddressId(address.id)
    setUseNewAddress(false)
    
    // Preencher campos com o endereço selecionado
    setValue('address.street', address.street, { shouldValidate: false })
    setValue('address.number', address.number, { shouldValidate: false })
    setValue('address.complement', address.complement || '', { shouldValidate: false })
    setValue('address.city', address.city, { shouldValidate: false })
    setValue('address.state', address.state, { shouldValidate: false })
    setValue('address.zipcode', formatCEP(address.zipcode), { shouldValidate: false })
  }, [setValue])

  const loadSavedAddresses = useCallback(async () => {
    if (!user) return
    
    setLoadingAddresses(true)
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setSavedAddresses(data.addresses || [])
        
        // Se houver endereço padrão, selecionar automaticamente
        const defaultAddress = data.addresses?.find((addr: SavedAddress) => addr.is_default)
        if (defaultAddress && !useNewAddress) {
          selectAddress(defaultAddress)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error)
    } finally {
      setLoadingAddresses(false)
    }
  }, [user, useNewAddress, selectAddress])

  // Carregar endereços salvos quando usuário estiver logado
  useEffect(() => {
    if (user && !loadingAuth) {
      loadSavedAddresses()
    }
  }, [user, loadingAuth, loadSavedAddresses])

  // Preencher dados do usuário quando logado
  useEffect(() => {
    if (user && !loadingAuth) {
      // Sempre preencher os campos mesmo que não sejam visíveis
      if (user.full_name) {
        setValue('name', user.full_name, { shouldValidate: false })
      }
      if (user.email) {
        setValue('email', user.email, { shouldValidate: false })
      }
    }
  }, [user, loadingAuth, setValue])

  // Escutar mudanças na autenticação (quando usuário faz login)
  useEffect(() => {
    const handleAuthChange = () => {
      // Forçar atualização quando o estado de auth mudar
      window.location.reload()
    }

    window.addEventListener('auth-state-changed', handleAuthChange)
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange)
    }
  }, [])

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

  // Sincronizar cartItems do hook com o estado local
  useEffect(() => {
    setCartItems(cartItemsFromHook)
  }, [cartItemsFromHook])

  useEffect(() => {
    // Carregar produtos do carrinho
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
          setLoadingProducts(false)
        })
    } else {
      setLoadingProducts(false)
    }
  }, [cartItems])

  const removeFromCart = (productId: string) => {
    updateQuantity(productId, 0) // Remove o item
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

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
        removeFromCart(productId)
      }
    }
  }

  // Função para buscar CEP na API ViaCEP
  const fetchCEP = useCallback(async (cep: string) => {
    const cleanedCEP = unformatCEP(cep)
    
    // Só busca se tiver 8 dígitos
    if (cleanedCEP.length !== 8) {
      return
    }

    setLoadingCEP(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`)
      const data: ViaCEPResponse = await response.json()

      if (data.erro) {
        // CEP não encontrado, mas não mostra erro (usuário pode digitar manualmente)
        setLoadingCEP(false)
        return
      }

      // Preencher campos automaticamente
      if (data.logradouro) {
        setValue('address.street', capitalizeWords(data.logradouro))
      }
      if (data.localidade) {
        setValue('address.city', capitalizeWords(data.localidade))
      }
      if (data.uf) {
        setValue('address.state', data.uf.toUpperCase())
      }
      if (data.bairro) {
        // Bairro pode ser usado como complemento se necessário
        // Mas não temos campo de bairro no schema, então não preenchemos
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    } finally {
      setLoadingCEP(false)
    }
  }, [setValue])

  // Observar mudanças no CEP e buscar quando completo
  useEffect(() => {
    if (zipcode) {
      const cleanedCEP = unformatCEP(zipcode)
      if (cleanedCEP.length === 8) {
        // Pequeno delay para evitar múltiplas requisições
        const timeoutId = setTimeout(() => {
          fetchCEP(zipcode)
        }, 500)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [zipcode, fetchCEP])

  const totalCents = cartItems.reduce((sum, item) => {
    const product = products[item.productId]
    return sum + (product ? product.price_cents * item.quantity : 0)
  }, 0)

  const onSubmit = async (customerData: CreateOrderInput['customer']) => {
    console.log('Submetendo formulário com dados:', customerData)
    
    // Verificar se está logado
    if (!user) {
      alert('Você precisa estar logado para finalizar o pedido. Faça login e tente novamente.')
      router.push(`/login?redirect=${encodeURIComponent('/cart')}`)
      return
    }
    
    // Validar se há itens no carrinho
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio. Adicione produtos antes de finalizar o pedido.')
      return
    }

    setLoading(true)

    // Usar dados do usuário logado se disponíveis
    const finalCustomerData = {
      ...customerData,
      name: user.full_name || customerData.name,
      email: user.email || customerData.email,
    }

    try {
      // Formatar dados antes de enviar
      const formattedData = {
        customer: {
          ...finalCustomerData,
          address: {
            ...finalCustomerData.address,
            zipcode: unformatCEP(finalCustomerData.address.zipcode), // Remove formatação do CEP
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
    return (
      <div className="text-center py-12">
        <LoadingDots size="lg" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Seu carrinho está vazio.</p>
        <Button
          onClick={() => router.push('/')}
          className="mt-4"
          variant="primary"
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
        <div className="rounded-xl border border-error-500/50 bg-error-950/50 p-4 text-error-400">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 mt-0.5 text-error-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h5 className="mb-1 font-medium text-error-300">Por favor, corrija os erros abaixo antes de continuar:</h5>
              <ul className="list-disc list-inside space-y-1.5 mt-2 text-sm text-error-400">
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
          </div>
        </div>
      )}
      {/* Itens do carrinho */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-white">Itens</h3>
        {cartItems.map((item) => {
          const product = products[item.productId]
          if (!product) return null

          return (
            <Card key={item.productId} variant="default" padding="md" className="bg-secondary-800 border-secondary-600">
              <div className="flex items-start gap-4">
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
                  <h4 className="font-semibold text-white">{product.title}</h4>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm text-neutral-400">Quantidade:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecrease(item.productId)}
                        className="h-8 w-8 p-0 text-white border-neutral-600 hover:bg-neutral-700"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1
                          if (newQuantity >= 1) {
                            handleQuantityChange(item.productId, newQuantity)
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value)
                          if (!value || value < 1) {
                            handleQuantityChange(item.productId, 1)
                          }
                        }}
                        className="w-16 text-center no-spinner bg-neutral-900 border-neutral-600 text-white"
                        min={1}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncrease(item.productId)}
                        className="h-8 w-8 p-0 text-white border-neutral-600 hover:bg-neutral-700"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {(item.personalizationImageUrl || item.personalizationDescription) && (
                    <div className="mt-3 space-y-2">
                      {item.personalizationImageUrl && (
                        <div>
                          <p className="text-xs font-medium text-neutral-300">Imagem de personalização:</p>
                          <Image
                            src={item.personalizationImageUrl}
                            alt="Personalização"
                            width={64}
                            height={64}
                            className="mt-2 h-16 w-16 rounded-xl object-cover border border-neutral-600"
                            unoptimized
                          />
                        </div>
                      )}
                      {item.personalizationDescription && (
                        <div>
                          <p className="text-xs font-medium text-neutral-300">Descrição:</p>
                          <p className="mt-1 text-xs text-neutral-400">{item.personalizationDescription}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    {formatCurrency(product.price_cents * item.quantity)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(item.productId)}
                    className="mt-3 text-error-500 border-error-500/50 hover:bg-error-500/10"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
        <div className="flex justify-between border-t border-neutral-600 pt-6 mt-6">
          <span className="text-xl font-semibold text-white">Total:</span>
          <span className="text-2xl font-semibold text-primary-500">
            {formatCurrency(totalCents)}
          </span>
        </div>
      </div>

      {/* Formulário de dados do cliente */}
      {!user && !loadingAuth ? (
        <div className="mt-12">
          <div className="rounded-xl border border-primary-500/50 bg-primary-950/20 p-6">
            <div className="flex items-start gap-4">
              <svg
                className="h-5 w-5 mt-0.5 text-primary-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div className="flex-1">
                <h5 className="mb-2 font-medium text-primary-300">Login necessário</h5>
                <p className="text-sm text-primary-400 mb-4">
                  Você precisa estar logado para finalizar o pedido. Faça login para continuar com a compra.
                </p>
                <Link href={`/login?redirect=${encodeURIComponent('/cart')}`}>
                  <Button className="bg-primary-500 text-neutral-950 hover:opacity-90">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white">
              Dados do Cliente
            </h3>
          </div>

          {/* Informações do usuário logado */}
          {user && !loadingAuth && (
            <div className="rounded-xl border border-neutral-600 bg-neutral-900/50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm text-neutral-300">
                  <span className="font-medium">Nome:</span> {user.full_name || 'Não informado'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-neutral-300">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Campos de endereço - só aparecem se estiver logado */}
          {user && !loadingAuth && (
            <div className="space-y-6 border-t border-neutral-600 pt-8">
          <div>
            <h4 className="text-lg font-semibold text-white">Endereço de Entrega</h4>
          </div>

          {/* Lista de endereços salvos - só mostra se houver endereços salvos */}
          {loadingAddresses ? (
            <div className="flex items-center justify-center py-4">
              <LoadingDots size="sm" />
            </div>
          ) : savedAddresses.length > 0 ? (
            !useNewAddress ? (
              <div className="space-y-3">
                {savedAddresses.map((address) => (
                  <Card
                    key={address.id}
                    variant="outlined"
                    padding="md"
                    className={`cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? 'border-primary-500 bg-primary-950/20'
                        : 'border-neutral-600 bg-neutral-900/50 hover:border-neutral-500'
                    }`}
                    onClick={() => selectAddress(address)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-semibold text-white">
                            {address.label || 'Endereço sem nome'}
                          </h5>
                          {address.is_default && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary-500/20 text-primary-400">
                              Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-300">
                          {address.street}, {address.number}
                          {address.complement && ` - ${address.complement}`}
                        </p>
                        <p className="text-sm text-neutral-400">
                          {address.city} - {address.state} | CEP: {formatCEP(address.zipcode)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={selectedAddressId === address.id}
                          onChange={() => selectAddress(address)}
                          className="h-4 w-4 text-primary-500 border-neutral-600 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUseNewAddress(true)
                    setSelectedAddressId(null)
                    // Limpar campos
                    setValue('address.street', '')
                    setValue('address.number', '')
                    setValue('address.complement', '')
                    setValue('address.city', '')
                    setValue('address.state', '')
                    setValue('address.zipcode', '')
                  }}
                  className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-800"
                >
                  + Usar um endereço novo
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUseNewAddress(false)
                  const defaultAddress = savedAddresses.find(addr => addr.is_default) || savedAddresses[0]
                  if (defaultAddress) {
                    selectAddress(defaultAddress)
                  }
                }}
                className="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-800 mb-4"
              >
                ← Voltar para endereços salvos
              </Button>
            )
          ) : null}

          {/* Campos de endereço - aparecem quando usar novo endereço ou não houver endereços salvos */}
          {(useNewAddress || savedAddresses.length === 0) && (
            <div className="space-y-6">

          <div>
            <Label htmlFor="street" className="mb-3 block text-white">Rua *</Label>
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
              className="bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
            />
            {errors.address?.street && (
              <p className="mt-2 text-sm text-error-500">
                {errors.address.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label htmlFor="number" className="mb-3 block text-white">Número *</Label>
              <Input
                id="number"
                {...register('address.number')}
                placeholder="123"
                className="bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
              {errors.address?.number && (
                <p className="mt-2 text-sm text-error-500">
                  {errors.address.number.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="complement" className="mb-3 block text-white">Complemento</Label>
              <Input
                id="complement"
                {...register('address.complement')}
                placeholder="Apto 101"
                className="bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
            </div>

            <div>
              <Label htmlFor="zipcode" className="mb-3 block text-white">CEP *</Label>
              <div className="relative">
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
                  className="bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500 pr-10"
                />
                {loadingCEP && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <LoadingDots size="sm" />
                  </div>
                )}
              </div>
              {errors.address?.zipcode && (
                <p className="mt-2 text-sm text-error-500">
                  {errors.address.zipcode.message}
                </p>
              )}
              {zipcode && unformatCEP(zipcode).length === 8 && !loadingCEP && !errors.address?.zipcode && (
                <p className="mt-2 text-xs text-neutral-400">
                  CEP encontrado! Campos preenchidos automaticamente.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="city" className="mb-3 block text-white">Cidade *</Label>
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
                className="bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
              {errors.address?.city && (
                <p className="mt-2 text-sm text-error-500">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="mb-3 block text-white">Estado (UF) *</Label>
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
                className="bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
              {errors.address?.state && (
                <p className="mt-2 text-sm text-error-500">
                  {errors.address.state.message}
                </p>
              )}
            </div>
          </div>
        </div>
            )}
          </div>
          )}
        </div>
      )}

      <div className="mt-12">
        {!user && !loadingAuth ? (
          <div className="rounded-xl border border-neutral-600 bg-neutral-900/50 p-4 text-center">
            <p className="text-sm text-neutral-400 mb-4">
              Faça login para finalizar o pedido
            </p>
            <Link href={`/login?redirect=${encodeURIComponent('/cart')}`} className="block">
              <Button className="w-full bg-primary-500 text-neutral-950 hover:opacity-90" size="lg">
                Fazer Login e Continuar
              </Button>
            </Link>
          </div>
        ) : (
          <Button type="submit" disabled={loading || loadingAuth} className="w-full bg-primary-500 text-neutral-950 hover:opacity-90" size="lg">
            {loading ? 'Processando...' : 'Finalizar Pedido'}
          </Button>
        )}
      </div>
    </form>
  )
}
