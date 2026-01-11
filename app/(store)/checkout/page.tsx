'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { ShoppingCart, MapPin, Plus, Store } from 'lucide-react'
import Footer from '@/components/store/Footer'
import { useAuth } from '@/hooks/useAuth'

interface Product {
    id: string
    title: string
    price_cents: number
}

// Endereço estático para retirada
const PICKUP_ADDRESS = "Rua André Rigoni 417 B. Santa Terezinha - B. Santa Terezinha, Garibaldi - CEP 95720000"

export default function CheckoutPage() {
    const router = useRouter()
    const { cartItems, clearCart } = useCart()
    const [products, setProducts] = useState<Record<string, Product>>({})
    const [loading, setLoading] = useState(true)
    const [selectedMethod, setSelectedMethod] = useState<'delivery' | 'pickup'>('delivery')

    const { user, loading: loadingAuth } = useAuth()
    const [savedAddresses, setSavedAddresses] = useState<any[]>([])
    const [loadingAddresses, setLoadingAddresses] = useState(false)

    const [userAddress, setUserAddress] = useState<string | null>(null)

    // Carregar endereços
    useEffect(() => {
        if (!loadingAuth && !user) {
            router.push('/login?redirect=/checkout')
            return
        }

        if (user) {
            // Check cache
            const cachedAddresses = sessionStorage.getItem('checkout_addresses')
            if (cachedAddresses) {
                try {
                    const data = JSON.parse(cachedAddresses)
                    setSavedAddresses(data)
                    if (data.length > 0) {
                        const addr = data[0]
                        setUserAddress(`${addr.street}, ${addr.number} - ${addr.city}/${addr.state}`)
                    }
                    setLoadingAddresses(false)
                } catch (e) {
                    // Fallback if JSON parse fails
                }
            }

            // Always fetch if no cache, or stale-while-revalidate if needed (user asked for 1 loading, so we prefer cache)
            if (!cachedAddresses) {
                setLoadingAddresses(true)
                fetch('/api/addresses')
                    .then(res => res.json())
                    .then(data => {
                        if (data.addresses && data.addresses.length > 0) {
                            setSavedAddresses(data.addresses)
                            sessionStorage.setItem('checkout_addresses', JSON.stringify(data.addresses))
                            // Formatar o primeiro endereço para exibição
                            const addr = data.addresses[0]
                            setUserAddress(`${addr.street}, ${addr.number} - ${addr.city}/${addr.state}`)
                        }
                    })
                    .finally(() => setLoadingAddresses(false))
            }
        }
    }, [user, loadingAuth, router])

    const handleCheckout = async () => {
        if (!user) {
            router.push('/login?redirect=/checkout')
            return
        }

        setLoading(true)

        try {
            // Se for entrega e não tiver endereço
            if (selectedMethod === 'delivery' && !savedAddresses.length) {
                alert('Adicione um endereço de entrega')
                setLoading(false)
                return
            }

            // Construir payload base
            let addressData

            if (selectedMethod === 'delivery') {
                // Usar o primeiro endereço salvo (simplificação conforme UI atual)
                addressData = savedAddresses[0]
            } else {
                // Endereço de retirada
                addressData = {
                    street: 'Rua André Rigoni',
                    number: '417',
                    complement: 'B. Santa Terezinha',
                    city: 'Garibaldi',
                    state: 'RS',
                    zipcode: '95720000'
                }
            }

            const payload = {
                customer: {
                    name: user.full_name || user.email,
                    email: user.email,
                    address: {
                        street: addressData.street,
                        number: addressData.number,
                        // Ensure complement is undefined if null or empty, or string.
                        // Zod optional() expects string or undefined. JSON removes undefined.
                        // If we pass null, it invalidates.
                        complement: addressData.complement ? addressData.complement : undefined,
                        city: addressData.city,
                        state: addressData.state,
                        zipcode: addressData.zipcode,
                    }
                },
                items: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    personalizationImageUrl: item.personalizationImageUrl,
                    personalizationImagePath: item.personalizationImagePath,
                    personalizationDescription: item.personalizationDescription,
                    // Serialize File object metadata if present
                    personalizationImageFile: item.personalizationImageFile ? {
                        name: item.personalizationImageFile.name,
                        type: item.personalizationImageFile.type,
                        size: item.personalizationImageFile.size
                    } : undefined
                })),
                deliveryType: selectedMethod,
                shippingCost: selectedMethod === 'delivery' ? 2500 : 0
            }

            const res = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (data.checkoutUrl) {
                clearCart()
                window.location.href = data.checkoutUrl
            } else {
                const errorMsg = data.details
                    ? `Dados inválidos: ${data.details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ')}`
                    : (data.error || 'Erro desconhecido')
                alert('Erro ao iniciar pagamento: ' + errorMsg)
            }

        } catch (error) {
            console.error(error)
            alert('Erro ao processar pedido')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (cartItems.length > 0) {
            const productIds = cartItems.map((item) => item.productId)

            // Tentar ler cache
            const cachedStr = sessionStorage.getItem('checkout_products')
            const cachedProducts = cachedStr ? JSON.parse(cachedStr) : {}

            // Check missing
            const missingIds = productIds.filter(id => !cachedProducts[id])

            if (missingIds.length === 0) {
                setProducts(cachedProducts)
                setLoading(false)
                return
            }

            const supabase = createClient()
            supabase
                .from('products')
                .select('*')
                .in('id', missingIds)
                .then(({ data, error }) => {
                    if (data) {
                        const newCache = { ...cachedProducts }
                        const productMap: Record<string, Product> = {}

                        // Merge old cache to state
                        Object.assign(productMap, cachedProducts)

                        data.forEach((product) => {
                            productMap[product.id] = product
                            newCache[product.id] = product
                        })

                        // Update state and cache
                        setProducts(productMap)
                        sessionStorage.setItem('checkout_products', JSON.stringify(newCache))
                    }
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [cartItems])

    // Calcular totais
    const subtotalCents = cartItems.reduce((sum, item) => {
        const product = products[item.productId]
        return sum + (product ? product.price_cents * item.quantity : 0)
    }, 0)

    const shippingCents = selectedMethod === 'delivery' ? 2500 : 0 // Exemplo: frete fixo R$ 25,00 ou grátis
    const voucherCents = 0
    const totalCents = subtotalCents + shippingCents - voucherCents

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <div className="w-full max-w-7xl mx-auto pt-32 md:pt-60 flex-1">
                    <div className="text-center py-12">
                        <p className="text-white/70">Carregando...</p>
                    </div>
                </div>
                <div className="-mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32 3xl:-mx-40 2xl:-mx-96 mt-auto -mb-20 md:mb-0">
                    <Footer />
                </div>
            </div>
        )
    }

    // Redirecionar se carrinho vazio (opcional, mas boa prática)
    if (cartItems.length === 0) {
        // router.push('/cart')
        // Manter renderização para evitar fOUC, ou mostrar vazio
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="hidden md:block h-60"></div>
            <div className="w-full max-w-[1400px] mx-auto pb-20 md:pb-32 pt-32 md:pt-0 flex-1">
                <h1 className="text-[96px] font-bold text-white mb-12">Entrega</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Opções de Entrega */}
                    <div className="flex-1 lg:flex-[2] space-y-6">

                        {/* Card 1: Receber em casa (Verde) */}
                        <div
                            className={`relative rounded-2xl p-8 cursor-pointer transition-all border-2 ${selectedMethod === 'delivery'
                                ? 'bg-primary-500 border-primary-500'
                                : 'bg-[#212121] border-[#3D3D3D] hover:border-primary-500/50'
                                }`}
                            onClick={() => setSelectedMethod('delivery')}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className={`text-[32px] font-bold ${selectedMethod === 'delivery' ? 'text-black' : 'text-white'}`}>
                                            Receber em casa
                                        </h3>
                                    </div>

                                    {userAddress ? (
                                        <p className={`text-[16px] mb-4 ${selectedMethod === 'delivery' ? 'text-black/80' : 'text-white/70'}`}>
                                            {userAddress}
                                        </p>
                                    ) : (
                                        <div className="flex items-center gap-2 mb-4">
                                            <p className={`text-[16px] ${selectedMethod === 'delivery' ? 'text-black/80' : 'text-white/70'}`}>
                                                Nenhum endereço salvo.
                                            </p>
                                        </div>
                                    )}

                                    {userAddress && (
                                        <p className={`text-[18px] font-medium ${selectedMethod === 'delivery' ? 'text-black' : 'text-white'}`}>
                                            {formatCurrency(2500)}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6">
                                    {userAddress ? (
                                        <button className={`text-xs font-medium px-4 py-2 rounded-xl border bg-transparent transition-colors ${selectedMethod === 'delivery' ? 'border-black text-black hover:bg-black/5' : 'border-white text-white hover:bg-white/10'}`}>
                                            Alterar Endereço
                                        </button>
                                    ) : (
                                        <button className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${selectedMethod === 'delivery'
                                            ? 'border-black text-black hover:bg-black/5'
                                            : 'border-white/30 text-white hover:bg-white/10'
                                            }`}>
                                            <Plus className="h-4 w-4" />
                                            Adicionar endereço
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Retirar no local (Cinza -> Verde quando selecionado) */}
                        <div
                            className={`relative rounded-2xl p-8 cursor-pointer transition-all border-2 ${selectedMethod === 'pickup'
                                ? 'bg-primary-500 border-primary-500'
                                : 'bg-[#212121] border-[#3D3D3D] hover:border-primary-500/50'
                                }`}
                            onClick={() => setSelectedMethod('pickup')}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className={`text-[32px] font-bold ${selectedMethod === 'pickup' ? 'text-black' : 'text-white'}`}>
                                            Retirar no local
                                        </h3>
                                    </div>

                                    <p className={`text-[16px] mb-4 max-w-md ${selectedMethod === 'pickup' ? 'text-black/80' : 'text-white/70'}`}>
                                        {PICKUP_ADDRESS}
                                    </p>

                                    <p className={`text-[18px] font-bold ${selectedMethod === 'pickup' ? 'text-black' : 'text-white/70'}`}>
                                        Grátis
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Resumo da Compra */}
                    <div className="lg:w-[320px]">
                        <div className="bg-[#212121] border border-[#3D3D3D] rounded-2xl p-6 space-y-4 sticky top-24">
                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-base">Produtos</span>
                                <span className="text-white/70 text-base font-medium">
                                    {formatCurrency(subtotalCents)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-base">Frete</span>
                                <span className="text-white/70 text-base font-medium">
                                    {selectedMethod === 'pickup' ? 'Grátis' : formatCurrency(shippingCents)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/70 text-base">Voucher</span>
                                <span className="text-white/70 text-base font-medium">
                                    {formatCurrency(voucherCents)}
                                </span>
                            </div>

                            <div className="pt-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-white text-2xl font-bold">Total</span>
                                    <span className="text-white text-2xl font-bold">
                                        {formatCurrency(selectedMethod === 'pickup' ? subtotalCents - voucherCents : totalCents)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading || (selectedMethod === 'delivery' && !userAddress)}
                                className="w-full bg-primary-500 hover:bg-primary-600 text-[#121212] font-medium py-5 px-6 rounded-2xl transition-colors flex items-center justify-center gap-3 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {loading ? 'Processando...' : 'Ir para Pagamento'}
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
