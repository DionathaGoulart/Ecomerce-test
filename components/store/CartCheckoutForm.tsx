'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
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
import ProductPersonalizeModal from '@/components/store/ProductPersonalizeModal'
import { Spinner } from '@/components/atoms/Spinner'

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
  const { cartItems: cartItemsFromHook, updateQuantity, removeItem, addItem } = useCart()
  
  // Criar uma string de hash das URLs das imagens para detectar mudanças
  const imageUrlsHash = useMemo(() => {
    return cartItemsFromHook.map(item => `${item.productId}:${item.personalizationImageUrl || 'no-image'}`).join('|')
  }, [cartItemsFromHook])
  
  // Usar useMemo para criar nova referência sempre que cartItemsFromHook ou imageUrlsHash mudar
  const cartItems = useMemo(() => {
    const items = cartItemsFromHook.map(item => ({ ...item }))
    console.log('useMemo - cartItemsFromHook mudou, criando nova referência')
    console.log('Hash das imagens:', imageUrlsHash)
    console.log('Itens no useMemo:', items.map(item => ({
      productId: item.productId,
      hasImage: !!item.personalizationImageUrl,
      imageUrl: item.personalizationImageUrl?.substring(0, 50),
    })))
    return items
  }, [cartItemsFromHook, imageUrlsHash])
  
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Forçar atualização do refreshKey quando cartItems mudar
  useEffect(() => {
    console.log('CartItems mudou no useMemo, atualizando refreshKey')
    setRefreshKey(prev => prev + 1)
  }, [cartItems])
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [personalizeModalOpen, setPersonalizeModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  
  // Estados para upload de imagem inline por produto
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})
  const [tempImageUrls, setTempImageUrls] = useState<Record<string, string>>({})
  const [tempImagePaths, setTempImagePaths] = useState<Record<string, string>>({})
  const [personalizationDescriptions, setPersonalizationDescriptions] = useState<Record<string, string>>({})
  
  // Estados para frete e retirada
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery')
  const [shippingCost, setShippingCost] = useState<number>(0)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  
  // Endereço da empresa (Google Brasil)
  const companyAddress = {
    street: 'Avenida Brigadeiro Faria Lima',
    number: '3477',
    complement: '18º andar',
    city: 'São Paulo',
    state: 'SP',
    zipcode: '04538-133',
    fullAddress: 'Avenida Brigadeiro Faria Lima, 3477, 18º andar - CEP 04538-133, São Paulo/SP'
  }

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

  // Não precisa mais de sincronização, usando diretamente do hook

  // Debug: Log quando cartItems mudar e forçar re-render
  useEffect(() => {
    console.log('CartCheckoutForm - cartItems mudou, quantidade:', cartItems.length)
    console.log('CartCheckoutForm - cartItems detalhes:', cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      hasImage: !!item.personalizationImageUrl,
      hasPath: !!item.personalizationImagePath,
      imageUrl: item.personalizationImageUrl?.substring(0, 50) + '...',
    })))
    
    // Verificar se há itens sem imagem que deveriam ter
    cartItems.forEach(item => {
      if (!item.personalizationImageUrl) {
        console.warn('Item sem imagem encontrado:', item.productId)
      } else {
        console.log('Item COM imagem:', item.productId, 'URL:', item.personalizationImageUrl?.substring(0, 100))
      }
    })
    
    // Forçar atualização do refreshKey para garantir re-render
    setRefreshKey(prev => {
      const newKey = prev + 1
      console.log('Atualizando refreshKey para:', newKey)
      return newKey
    })
  }, [cartItems])

  // Listener para eventos de atualização do carrinho
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Evento cart-updated recebido no CartCheckoutForm')
      console.log('CartItemsFromHook no momento do evento:', cartItemsFromHook.map(item => ({
        productId: item.productId,
        hasImage: !!item.personalizationImageUrl,
      })))
      
      // Forçar atualização do refreshKey para garantir re-render
      setRefreshKey(prev => {
        const newKey = prev + 1
        console.log('Atualizando refreshKey (evento) para:', newKey)
        return newKey
      })
      
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => {
        setRefreshKey(prev => {
          const newKey = prev + 1
          console.log('Atualizando refreshKey (evento delay) para:', newKey)
          return newKey
        })
      }, 100)
    }

    window.addEventListener('cart-updated', handleCartUpdate)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [cartItemsFromHook])

  // Sincronizar estados de personalização com itens do carrinho
  useEffect(() => {
    setPersonalizationDescriptions(prev => {
      // Manter valores existentes que não estão no carrinho (para edição em andamento)
      const merged = { ...prev }
      cartItems.forEach(item => {
        if (item.personalizationDescription) {
          merged[item.productId] = item.personalizationDescription
        }
      })
      return merged
    })
    
    // Limpar apenas erros, manter URLs temporárias (serão substituídas pela URL do item quando existir)
    setUploadErrors(prev => {
      const updated = { ...prev }
      cartItems.forEach(item => {
        if (item.personalizationImageUrl && updated[item.productId]) {
          delete updated[item.productId]
        }
      })
      return updated
    })
  }, [cartItems])

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

  // Handler para upload de imagem inline
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
          personalizationDescription: personalizationDescriptions[productId] || currentItem.personalizationDescription,
        })
        
        // Limpar apenas erros, manter URLs temporárias para preview (será substituído pela URL do item)
        setUploadErrors(prev => {
          const updated = { ...prev }
          delete updated[productId]
          return updated
        })
      } else {
        // Se não encontrou o item, manter estados temporários para preview
        setTempImageUrls(prev => ({ ...prev, [productId]: data.url }))
        setTempImagePaths(prev => ({ ...prev, [productId]: data.path }))
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

  // Handler para atualizar descrição
  const handleDescriptionChange = (productId: string, description: string) => {
    setPersonalizationDescriptions(prev => ({ ...prev, [productId]: description }))
    
    // Atualizar item do carrinho automaticamente
    const currentItem = cartItems.find(item => item.productId === productId)
    if (currentItem) {
      addItem({
        productId,
        quantity: currentItem.quantity,
        personalizationImageUrl: currentItem.personalizationImageUrl || tempImageUrls[productId],
        personalizationImagePath: currentItem.personalizationImagePath || tempImagePaths[productId],
        personalizationDescription: description.trim() || undefined,
      })
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

  // Calcular total dos produtos
  const subtotalCents = cartItems.reduce((sum, item) => {
    const product = products[item.productId]
    return sum + (product ? product.price_cents * item.quantity : 0)
  }, 0)
  
  // Total incluindo frete (se for entrega)
  const totalCents = subtotalCents + (deliveryType === 'delivery' ? shippingCost : 0)
  
  // Função para calcular frete baseado no CEP usando API
  const calculateShipping = useCallback(async (destinationCEP: string) => {
    const cleanedCEP = unformatCEP(destinationCEP)
    
    if (cleanedCEP.length !== 8) {
      setShippingCost(0)
      setShippingError(null)
      return
    }
    
    setLoadingShipping(true)
    setShippingError(null)
    
    try {
      // CEP da empresa (origem)
      const originCEP = unformatCEP(companyAddress.zipcode)
      
      // Calcular peso total dos produtos (estimativa: 0.3kg por produto)
      const totalWeight = cartItems.reduce((sum, item) => {
        return sum + (item.quantity * 0.3)
      }, 0) || 0.5 // mínimo 0.5kg
      
      // Chamar API de cálculo de frete
      const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cepOrigin: originCEP,
          cepDestination: cleanedCEP,
          weight: totalWeight,
          length: 20, // 20cm
          height: 10, // 10cm
          width: 15, // 15cm
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao calcular frete')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setShippingCost(data.cost)
    } catch (error) {
      console.error('Erro ao calcular frete:', error)
      setShippingError('Erro ao calcular frete. Tente novamente.')
      setShippingCost(0)
    } finally {
      setLoadingShipping(false)
    }
  }, [cartItems, companyAddress.zipcode])
  
  // Calcular frete quando CEP mudar e for entrega
  useEffect(() => {
    if (deliveryType === 'delivery' && zipcode) {
      const cleanedCEP = unformatCEP(zipcode)
      if (cleanedCEP.length === 8) {
        const timeoutId = setTimeout(() => {
          calculateShipping(zipcode)
        }, 800)
        return () => clearTimeout(timeoutId)
      } else {
        setShippingCost(0)
        setShippingError(null)
      }
    } else if (deliveryType === 'pickup') {
      setShippingCost(0)
      setShippingError(null)
    }
  }, [zipcode, deliveryType, calculateShipping])

  const onSubmit = async (customerData: CreateOrderInput['customer']) => {
    console.log('Submetendo formulário com dados:', customerData)
    
    // Verificar se está logado
    if (!user) {
      alert('Você precisa estar logado para finalizar o pedido. Faça login e tente novamente.')
      router.push(`/login?redirect=${encodeURIComponent('/cart')}`)
      return
    }

    // Validar que todos os produtos têm imagem de personalização
    const itemsWithoutImage = cartItems.filter(item => !item.personalizationImageUrl)
    if (itemsWithoutImage.length > 0) {
      const productNames = itemsWithoutImage.map(item => {
        const product = products[item.productId]
        return product?.title || 'Produto'
      }).join(', ')
      alert(`É obrigatório fazer upload de uma imagem para personalização dos seguintes produtos: ${productNames}`)
      return
    }
    
    // Validar se há itens no carrinho
    if (cartItems.length === 0) {
      alert('Seu carrinho está vazio. Adicione produtos antes de finalizar o pedido.')
      return
    }

    // Validar frete e endereço se for entrega
    if (deliveryType === 'delivery') {
      // Validar que o endereço está preenchido
      if (!customerData.address.street || !customerData.address.number || !customerData.address.city || !customerData.address.state || !customerData.address.zipcode) {
        alert('Por favor, preencha todos os campos do endereço de entrega.')
        return
      }
      
      if (!zipcode || unformatCEP(zipcode).length !== 8) {
        alert('Por favor, informe um CEP válido para calcular o frete.')
        return
      }
      if (loadingShipping) {
        alert('Aguarde o cálculo do frete.')
        return
      }
      if (shippingCost === 0 && !shippingError) {
        alert('Por favor, aguarde o cálculo do frete ou informe um CEP válido.')
        return
      }
      if (shippingError) {
        alert('Erro ao calcular frete. Verifique o CEP e tente novamente.')
        return
      }
    }

    setLoading(true)

    // Usar dados do usuário logado se disponíveis
    const finalCustomerData = {
      ...customerData,
      name: user.full_name || customerData.name,
      email: user.email || customerData.email,
    }

    try {
      // Se for retirada, usar endereço da empresa
      const addressData = deliveryType === 'pickup' 
        ? {
            street: companyAddress.street,
            number: companyAddress.number,
            complement: companyAddress.complement,
            city: companyAddress.city,
            state: companyAddress.state,
            zipcode: unformatCEP(companyAddress.zipcode),
          }
        : {
            ...finalCustomerData.address,
            zipcode: unformatCEP(finalCustomerData.address.zipcode), // Remove formatação do CEP
          }

      // Formatar dados antes de enviar
      const formattedData = {
        customer: {
          ...finalCustomerData,
          address: addressData,
        },
        items: cartItems,
        deliveryType,
        shippingCost: deliveryType === 'delivery' ? shippingCost : 0,
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
    <>
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 sm:space-y-8">
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
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-white">Itens</h3>
        {cartItems.map((item) => {
          const product = products[item.productId]
          if (!product) return null

          return (
            <Card key={item.productId} variant="default" padding="md" className="bg-secondary-800 border-secondary-600">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                {product.image_url && (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 w-full sm:w-auto">
                  <h4 className="font-semibold text-sm sm:text-base text-white">{product.title}</h4>
                  <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-neutral-400">Quantidade:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecrease(item.productId)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white border-neutral-600 hover:bg-neutral-700"
                      >
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
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
                        className="w-14 sm:w-16 text-sm sm:text-base text-center no-spinner bg-neutral-900 border-neutral-600 text-white"
                        min={1}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncrease(item.productId)}
                        className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-white border-neutral-600 hover:bg-neutral-700"
                      >
                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Personalização: Imagem e Comentário */}
                  <div className="mt-2 sm:mt-3" key={`personalization-${item.productId}-${refreshKey}-${item.personalizationImageUrl ? 'has-image' : 'no-image'}`}>
                    {/* Formulário inline para adicionar imagem e comentário - sempre visível */}
                    <div className="rounded-xl border border-primary-500/50 bg-primary-950/20 p-3 sm:p-4 space-y-3">
                      <p className="text-xs sm:text-sm text-primary-400 mb-2">
                        ⚠️ É obrigatório fazer upload de uma imagem para personalização deste produto.
                      </p>
                      
                      {/* Upload de Imagem */}
                      <div>
                        <label htmlFor={`image-upload-${item.productId}`} className="block text-xs sm:text-sm font-medium text-white mb-2">
                          Imagem para personalização <span className="text-primary-500">*</span>
                        </label>
                        <input
                          id={`image-upload-${item.productId}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleImageUpload(item.productId, file)
                            }
                          }}
                          className="block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-xs sm:file:text-sm file:font-medium file:text-neutral-950 hover:file:opacity-90 transition-opacity cursor-pointer"
                          disabled={uploadingImages[item.productId]}
                        />
                        {uploadingImages[item.productId] && (
                          <div className="mt-2 flex items-center gap-2">
                            <Spinner size="sm" variant="default" />
                            <p className="text-xs text-neutral-400">Fazendo upload da imagem...</p>
                          </div>
                        )}
                        {uploadErrors[item.productId] && (
                          <p className="mt-2 text-xs text-error-400">{uploadErrors[item.productId]}</p>
                        )}
                        {(tempImageUrls[item.productId] || item.personalizationImageUrl) && !uploadingImages[item.productId] && (
                          <div className="mt-3">
                            <p className="text-xs text-neutral-400 mb-2">Imagem enviada:</p>
                            <Image
                              src={tempImageUrls[item.productId] || item.personalizationImageUrl || ''}
                              alt="Preview"
                              width={100}
                              height={100}
                              className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover border border-neutral-600"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>

                      {/* Input de Comentário */}
                      <div>
                        <label htmlFor={`description-${item.productId}`} className="block text-xs sm:text-sm font-medium text-white mb-2">
                          Descrição da personalização <span className="text-neutral-400 font-normal">(opcional)</span>
                        </label>
                        <Input
                          id={`description-${item.productId}`}
                          type="text"
                          placeholder="Ex: Colocar no centro da caneca"
                          value={personalizationDescriptions[item.productId] || item.personalizationDescription || ''}
                          onChange={(e) => handleDescriptionChange(item.productId, e.target.value)}
                          maxLength={500}
                          className="text-sm bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
                        />
                        <p className="mt-1 text-xs text-neutral-400">
                          {(personalizationDescriptions[item.productId] || item.personalizationDescription || '').length}/500 caracteres
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto gap-2 sm:gap-0">
                  <p className="text-base sm:text-lg font-semibold text-white">
                    {formatCurrency(product.price_cents * item.quantity)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-xs sm:text-sm text-error-500 border-error-500/50 hover:bg-error-500/10"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
        
        {/* Resumo de valores */}
        <div className="border-t border-neutral-600 pt-4 sm:pt-6 mt-4 sm:mt-6 space-y-2">
          <div className="flex justify-between text-sm sm:text-base text-neutral-300">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotalCents)}</span>
          </div>
          {deliveryType === 'delivery' && (
            <div className="flex justify-between text-sm sm:text-base text-neutral-300">
              <span>Frete:</span>
              <span>
                {loadingShipping ? (
                  <span className="flex items-center gap-2">
                    <LoadingDots size="sm" />
                    <span className="text-xs">Calculando...</span>
                  </span>
                ) : shippingError ? (
                  <span className="text-error-400 text-xs">{shippingError}</span>
                ) : shippingCost > 0 ? (
                  formatCurrency(shippingCost)
                ) : (
                  <span className="text-neutral-400 text-xs">Informe o CEP</span>
                )}
              </span>
            </div>
          )}
          {deliveryType === 'pickup' && (
            <div className="flex justify-between text-sm sm:text-base text-primary-400">
              <span>Retirada no local:</span>
              <span className="font-semibold">Grátis</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-600 pt-2 mt-2">
            <span className="text-lg sm:text-xl font-semibold text-white">Total:</span>
            <span className="text-xl sm:text-2xl font-semibold text-primary-500">
              {formatCurrency(totalCents)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Opção de Entrega ou Retirada */}
      {user && !loadingAuth && (
        <div className="mt-8 sm:mt-12">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
            Forma de Entrega
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opção: Entrega */}
            <Card
              variant="outlined"
              padding="md"
              className={`cursor-pointer transition-all ${
                deliveryType === 'delivery'
                  ? 'border-primary-500 bg-primary-950/20'
                  : 'border-neutral-600 bg-neutral-900/50 hover:border-neutral-500'
              }`}
              onClick={() => setDeliveryType('delivery')}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={deliveryType === 'delivery'}
                  onChange={() => setDeliveryType('delivery')}
                  className="h-4 w-4 text-primary-500 border-neutral-600 focus:ring-primary-500 mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Entrega</h4>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    Receba seu pedido no endereço informado
                  </p>
                  {deliveryType === 'delivery' && shippingCost > 0 && (
                    <p className="text-xs text-primary-400 mt-2">
                      Frete: {formatCurrency(shippingCost)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
            
            {/* Opção: Retirada */}
            <Card
              variant="outlined"
              padding="md"
              className={`cursor-pointer transition-all ${
                deliveryType === 'pickup'
                  ? 'border-primary-500 bg-primary-950/20'
                  : 'border-neutral-600 bg-neutral-900/50 hover:border-neutral-500'
              }`}
              onClick={() => setDeliveryType('pickup')}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  checked={deliveryType === 'pickup'}
                  onChange={() => setDeliveryType('pickup')}
                  className="h-4 w-4 text-primary-500 border-neutral-600 focus:ring-primary-500 mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">Retirada no Local</h4>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    Retire seu pedido em nossa loja física
                  </p>
                  <p className="text-xs text-primary-400 mt-2 font-semibold">
                    Grátis
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Mostrar endereço da empresa quando escolher retirada */}
          {deliveryType === 'pickup' && (
            <div className="mt-4 rounded-xl border border-primary-500/50 bg-primary-950/20 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-white mb-2">Endereço para Retirada</h5>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {companyAddress.fullAddress}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2">
                    Horário de atendimento: Segunda a Sexta, 9h às 18h
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formulário de dados do cliente */}
      {!user && !loadingAuth ? (
        <div className="mt-8 sm:mt-12">
          <div className="rounded-xl border border-primary-500/50 bg-primary-950/20 p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-primary-500 flex-shrink-0"
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
                <h5 className="mb-2 text-sm sm:text-base font-medium text-primary-300">Login necessário</h5>
                <p className="text-xs sm:text-sm text-primary-400 mb-3 sm:mb-4">
                  Você precisa estar logado para finalizar o pedido. Faça login para continuar com a compra.
                </p>
                <Link href={`/login?redirect=${encodeURIComponent('/cart')}`}>
                  <Button className="w-full sm:w-auto text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
        <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white">
            Dados do Cliente
          </h3>
        </div>

          {/* Informações do usuário logado */}
          {user && !loadingAuth && (
            <div className="rounded-xl border border-neutral-600 bg-neutral-900/50 p-3 sm:p-4 space-y-2">
              <div className="flex items-center gap-2">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-xs sm:text-sm text-neutral-300 break-words">
                  <span className="font-medium">Nome:</span> {user.full_name || 'Não informado'}
                </p>
        </div>
              <div className="flex items-center gap-2">
                <svg className="h-3 w-3 sm:h-4 sm:w-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-xs sm:text-sm text-neutral-300 break-words">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Campos de endereço - só aparecem se estiver logado e escolher entrega */}
          {user && !loadingAuth && deliveryType === 'delivery' && (
            <div className="space-y-4 sm:space-y-6 border-t border-neutral-600 pt-6 sm:pt-8">
          <div>
            <h4 className="text-base sm:text-lg font-semibold text-white">Endereço de Entrega</h4>
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
            <Label htmlFor="street" className="mb-2 sm:mb-3 block text-sm sm:text-base text-white">Rua *</Label>
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
              className="text-sm sm:text-base bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
            />
            {errors.address?.street && (
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-error-500">
                {errors.address.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="number" className="mb-2 sm:mb-3 block text-sm sm:text-base text-white">Número *</Label>
              <Input
                id="number"
                {...register('address.number')}
                placeholder="123"
                className="text-sm sm:text-base bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
              {errors.address?.number && (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-error-500">
                  {errors.address.number.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="complement" className="mb-2 sm:mb-3 block text-sm sm:text-base text-white">Complemento</Label>
              <Input
                id="complement"
                {...register('address.complement')}
                placeholder="Apto 101"
                className="text-sm sm:text-base bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
            </div>

            <div>
              <Label htmlFor="zipcode" className="mb-2 sm:mb-3 block text-sm sm:text-base text-white">CEP *</Label>
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
                  className="text-sm sm:text-base bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500 pr-10"
                />
                {loadingCEP && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <LoadingDots size="sm" />
                  </div>
                )}
              </div>
              {errors.address?.zipcode && (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-error-500">
                  {errors.address.zipcode.message}
                </p>
              )}
              {zipcode && unformatCEP(zipcode).length === 8 && !loadingCEP && !errors.address?.zipcode && (
                <p className="mt-1 sm:mt-2 text-xs text-neutral-400">
                  CEP encontrado! Campos preenchidos automaticamente.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label htmlFor="city" className="mb-2 sm:mb-3 block text-sm sm:text-base text-white">Cidade *</Label>
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
                className="text-sm sm:text-base bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
              {errors.address?.city && (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-error-500">
                  {errors.address.city.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="state" className="mb-2 sm:mb-3 block text-sm sm:text-base text-white">Estado (UF) *</Label>
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
                className="text-sm sm:text-base bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
              />
              {errors.address?.state && (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-error-500">
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

      <div className="mt-8 sm:mt-12">
        {!user && !loadingAuth ? (
          <div className="rounded-xl border border-neutral-600 bg-neutral-900/50 p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm text-neutral-400 mb-3 sm:mb-4">
              Faça login para finalizar o pedido
            </p>
            <Link href={`/login?redirect=${encodeURIComponent('/cart')}`} className="block">
              <Button className="w-full text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90" size="lg">
                Fazer Login e Continuar
              </Button>
            </Link>
          </div>
        ) : (
          <Button type="submit" disabled={loading || loadingAuth} className="w-full text-sm sm:text-base bg-primary-500 text-neutral-950 hover:opacity-90" size="lg">
          {loading ? 'Processando...' : 'Finalizar Pedido'}
        </Button>
        )}
      </div>
    </form>

      {/* Modal de Personalização */}
      {selectedProductId && (
        <ProductPersonalizeModal
          productId={selectedProductId}
          productTitle={products[selectedProductId]?.title || ''}
          isOpen={personalizeModalOpen}
          onClose={() => {
            setPersonalizeModalOpen(false)
            setSelectedProductId(null)
          }}
          onAdd={() => {
            // Callback após adicionar ao carrinho
            console.log('Modal onAdd chamado')
            // O hook useCart já atualiza automaticamente
            // Forçar atualização do estado para garantir que a UI seja atualizada
            setPersonalizeModalOpen(false)
            setSelectedProductId(null)
            // Forçar atualização imediata
            setRefreshKey(prev => prev + 1)
            // Pequeno delay para garantir que o estado foi atualizado
            setTimeout(() => {
              setRefreshKey(prev => prev + 1)
              console.log('CartItems após adicionar:', cartItemsFromHook)
            }, 100)
          }}
          initialQuantity={cartItemsFromHook.find(item => item.productId === selectedProductId)?.quantity || 1}
          initialImageUrl={cartItemsFromHook.find(item => item.productId === selectedProductId)?.personalizationImageUrl}
          initialDescription={cartItemsFromHook.find(item => item.productId === selectedProductId)?.personalizationDescription || ''}
        />
      )}
    </>
  )
}
