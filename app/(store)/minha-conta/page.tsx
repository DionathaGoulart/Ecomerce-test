'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/molecules/Card'
import { formatCurrency } from '@/lib/utils'
import { formatCEP, unformatCEP, capitalizeWords } from '@/lib/utils/formatting'
import { LogOut, Package, MapPin, Receipt, FileText, Settings, Lock, Eye, EyeOff, Plus, Edit, Trash2, Check } from 'lucide-react'
import { LoadingDots } from '@/components/atoms/LoadingDots'
import { Input } from '@/components/atoms/Input'
import { Label } from '@/components/atoms/Label'

interface Order {
  id: string
  order_number: string
  status: string
  total_cents: number
  delivery_address: any
  receipt_url: string | null
  invoice_url: string | null
  created_at: string
}

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
}

export default function MinhaContaPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null)
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Estados para gerenciamento de endereços
  const [addresses, setAddresses] = useState<any[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [addressForm, setAddressForm] = useState({
    label: '',
    street: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    zipcode: '',
    is_default: false,
  })

  const loadAddresses = useCallback(async () => {
    setLoadingAddresses(true)
    try {
      const response = await fetch('/api/addresses')
      if (response.ok) {
        const data = await response.json()
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error)
    } finally {
      setLoadingAddresses(false)
    }
  }, [])

  const loadUserAndOrders = useCallback(async () => {
    try {
      const supabase = createClient()

      // Buscar usuário atual
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      // Buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError)
        // Se o perfil não existe, criar um
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || null,
              role: 'user',
            })
            .select()
            .single()
          
          if (createError) {
            console.error('Erro ao criar perfil:', createError)
          } else if (newProfile) {
            setUser({
              id: newProfile.id,
              email: newProfile.email,
              full_name: newProfile.full_name,
              role: newProfile.role,
            })
          }
        }
      } else if (profile) {
        console.log('Perfil carregado:', profile)
        console.log('Role do perfil:', profile.role)
        console.log('É admin?', profile.role === 'admin')
        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role || 'user', // Garantir que sempre tenha um role
        })
      }

      // Buscar pedidos
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Erro ao buscar pedidos:', ordersError)
      }

      if (ordersData) {
        setOrders(ordersData)
      }

      // Buscar endereços
      await loadAddresses()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [router, loadAddresses])

  useEffect(() => {
    loadUserAndOrders()
  }, [loadUserAndOrders])

  const lastFetchedCEP = useRef<string>('')

  // Função para buscar CEP na API ViaCEP
  const fetchCEP = useCallback(async (cep: string) => {
    const cleanedCEP = unformatCEP(cep)
    
    // Só busca se tiver 8 dígitos
    if (cleanedCEP.length !== 8) {
      return
    }

    // Evitar buscar o mesmo CEP novamente
    if (lastFetchedCEP.current === cleanedCEP) {
      return
    }

    lastFetchedCEP.current = cleanedCEP
    setLoadingCEP(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCEP}/json/`)
      const data = await response.json()

      console.log('Dados do CEP recebidos:', data)

      if (data.erro) {
        // CEP não encontrado, mas não mostra erro (usuário pode digitar manualmente)
        setLoadingCEP(false)
        lastFetchedCEP.current = ''
        return
      }

      // Preencher campos automaticamente - usar função de atualização para garantir que o estado seja atualizado
      setAddressForm(prev => {
        const newForm = {
          ...prev,
          street: data.logradouro ? capitalizeWords(data.logradouro) : '',
          city: data.localidade ? capitalizeWords(data.localidade) : '',
          state: data.uf ? data.uf.toUpperCase() : '',
        }
        console.log('Dados recebidos da API:', data)
        console.log('Formulário antes:', prev)
        console.log('Formulário depois:', newForm)
        return newForm
      })
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      lastFetchedCEP.current = ''
    } finally {
      setLoadingCEP(false)
    }
  }, [])

  // Observar mudanças no CEP e buscar quando completo
  useEffect(() => {
    if (addressForm.zipcode && showAddAddress) {
      const cleanedCEP = unformatCEP(addressForm.zipcode)
      if (cleanedCEP.length === 8 && cleanedCEP !== lastFetchedCEP.current) {
        // Pequeno delay para evitar múltiplas requisições
        const timeoutId = setTimeout(() => {
          fetchCEP(addressForm.zipcode)
        }, 500)
        return () => clearTimeout(timeoutId)
      }
    }
  }, [addressForm.zipcode, showAddAddress, fetchCEP])

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress}` : '/api/addresses'
      const method = editingAddress ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      })

      if (response.ok) {
        await loadAddresses()
        setShowAddAddress(false)
        setEditingAddress(null)
        setAddressForm({
          label: '',
          street: '',
          number: '',
          complement: '',
          city: '',
          state: '',
          zipcode: '',
          is_default: false,
        })
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao salvar endereço')
      }
    } catch (error) {
      console.error('Erro ao salvar endereço:', error)
      alert('Erro ao salvar endereço')
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadAddresses()
      } else {
        alert('Erro ao excluir endereço')
      }
    } catch (error) {
      console.error('Erro ao excluir endereço:', error)
      alert('Erro ao excluir endereço')
    }
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address.id)
    setAddressForm({
      label: address.label || '',
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      city: address.city,
      state: address.state,
      zipcode: address.zipcode.replace(/(\d{5})(\d{3})/, '$1-$2'), // Formatar CEP
      is_default: address.is_default,
    })
    setShowAddAddress(true)
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
      // Forçar reload para atualizar o estado de autenticação
      window.location.href = '/'
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setChangePasswordError(null)
    setChangePasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setChangePasswordError('As senhas não coincidem')
      return
    }

    if (newPassword.length < 6) {
      setChangePasswordError('A nova senha deve ter no mínimo 6 caracteres')
      return
    }

    setChangePasswordLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setChangePasswordError(result.error || 'Erro ao alterar senha')
        setChangePasswordLoading(false)
        return
      }

      setChangePasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setChangePasswordLoading(false)

      // Fechar o formulário após 2 segundos
      setTimeout(() => {
        setShowChangePassword(false)
        setChangePasswordSuccess(false)
      }, 2000)
    } catch (error) {
      setChangePasswordError('Erro ao alterar senha. Tente novamente.')
      setChangePasswordLoading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendente',
      paid: 'Pago',
      production: 'Em Produção',
      shipped: 'Enviado',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-warning-500/20 text-warning-500',
      paid: 'bg-success-500/20 text-success-500',
      production: 'bg-info-500/20 text-info-500',
      shipped: 'bg-primary-500/20 text-primary-500',
      cancelled: 'bg-error-500/20 text-error-500',
    }
    return colors[status] || 'bg-neutral-500/20 text-neutral-500'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingDots size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Debug: mostrar role atual
  const isAdmin = user?.role === 'admin'
  console.log('User state atual:', user)
  console.log('user.role:', user?.role)
  console.log('isAdmin:', isAdmin)

  return (
    <div className="min-h-screen pt-32 pb-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Botão Admin */}
        {isAdmin && (
          <div className="flex items-center gap-3 pt-8">
            <a 
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </a>
          </div>
        )}

        {/* Informações do Usuário */}
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Informações Pessoais</h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-neutral-400">Nome:</span>
                <p className="text-white">{user.full_name || 'Não informado'}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-400">Email:</span>
                <p className="text-white">{user.email}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-800 space-y-4">
              <button
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                <Lock className="h-4 w-4" />
                {showChangePassword ? 'Cancelar' : 'Trocar Senha'}
              </button>

              {showChangePassword && (
                <form onSubmit={handleChangePassword} className="space-y-4 rounded-lg bg-neutral-800 p-4">
                  {changePasswordSuccess && (
                    <div className="rounded-lg bg-success-500/20 border border-success-500/50 p-3 text-sm text-success-500">
                      Senha alterada com sucesso!
                    </div>
                  )}
                  {changePasswordError && (
                    <div className="rounded-lg bg-error-500/20 border border-error-500/50 p-3 text-sm text-error-500">
                      {changePasswordError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white">
                      Senha Atual
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-neutral-900 border-neutral-700 text-white pr-10"
                        placeholder="Digite sua senha atual"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white">
                      Nova Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-neutral-900 border-neutral-700 text-white pr-10"
                        placeholder="Digite sua nova senha (mín. 6 caracteres)"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">
                      Confirmar Nova Senha
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-neutral-900 border-neutral-700 text-white"
                      placeholder="Confirme sua nova senha"
                      required
                      minLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={changePasswordLoading}
                    className="w-full"
                  >
                    {changePasswordLoading ? (
                      <span className="flex items-center gap-2">
                        <LoadingDots size="sm" />
                        <span>Alterando...</span>
                      </span>
                    ) : (
                      'Alterar Senha'
                    )}
                  </Button>
                </form>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </Card>

        {/* Endereços Salvos */}
        <Card className="bg-neutral-900 border-neutral-800">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Endereços Salvos</h2>
              <Button
                onClick={() => {
                  setShowAddAddress(!showAddAddress)
                  setEditingAddress(null)
                  setAddressForm({
                    label: '',
                    street: '',
                    number: '',
                    complement: '',
                    city: '',
                    state: '',
                    zipcode: '',
                    is_default: addresses.length === 0,
                  })
                }}
                variant="outline"
                size="sm"
                className="border-neutral-600 text-white hover:bg-neutral-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Endereço
              </Button>
            </div>

            {showAddAddress && (
              <form onSubmit={handleSaveAddress} className="space-y-4 rounded-lg bg-neutral-800 p-4">
                <div>
                  <Label htmlFor="label" className="mb-2 block text-white">Apelido (opcional)</Label>
                  <Input
                    id="label"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="Ex: Casa, Trabalho"
                    className="bg-neutral-900 border-neutral-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="street" className="mb-2 block text-white">Rua *</Label>
                  <Input
                    id="street"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    required
                    className="bg-neutral-900 border-neutral-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="number" className="mb-2 block text-white">Número *</Label>
                    <Input
                      id="number"
                      value={addressForm.number}
                      onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                      required
                      className="bg-neutral-900 border-neutral-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="complement" className="mb-2 block text-white">Complemento</Label>
                    <Input
                      id="complement"
                      value={addressForm.complement}
                      onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                      className="bg-neutral-900 border-neutral-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipcode" className="mb-2 block text-white">CEP *</Label>
                    <div className="relative">
                      <Input
                        id="zipcode"
                        value={addressForm.zipcode}
                        onChange={async (e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          const formatted = value.length <= 5 ? value : `${value.slice(0, 5)}-${value.slice(5, 8)}`
                          setAddressForm(prev => ({ ...prev, zipcode: formatted }))
                          
                          // Buscar CEP imediatamente quando tiver 8 dígitos
                          if (value.length === 8 && value !== lastFetchedCEP.current) {
                            setTimeout(() => {
                              fetchCEP(formatted)
                            }, 300)
                          }
                        }}
                        maxLength={9}
                        required
                        className="bg-neutral-900 border-neutral-600 text-white pr-10"
                      />
                      {loadingCEP && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <LoadingDots size="sm" />
                        </div>
                      )}
                    </div>
                    {addressForm.zipcode && unformatCEP(addressForm.zipcode).length === 8 && !loadingCEP && addressForm.street && (
                      <p className="mt-2 text-xs text-green-400">
                        ✓ CEP encontrado! Campos preenchidos automaticamente.
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="mb-2 block text-white">Cidade *</Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                      className="bg-neutral-900 border-neutral-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="mb-2 block text-white">Estado *</Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value.toUpperCase() })}
                      maxLength={2}
                      required
                      className="bg-neutral-900 border-neutral-600 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={addressForm.is_default}
                    onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-primary-500"
                  />
                  <Label htmlFor="is_default" className="text-white">Definir como endereço padrão</Label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingAddress ? 'Atualizar' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddAddress(false)
                      setEditingAddress(null)
                      setAddressForm({
                        label: '',
                        street: '',
                        number: '',
                        complement: '',
                        city: '',
                        state: '',
                        zipcode: '',
                        is_default: false,
                      })
                    }}
                    className="border-neutral-600 text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}

            {loadingAddresses ? (
              <div className="flex items-center justify-center py-8">
                <LoadingDots size="sm" />
              </div>
            ) : addresses.length === 0 ? (
              <div className="py-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-neutral-600" />
                <p className="mt-4 text-neutral-400">Nenhum endereço salvo</p>
                <p className="mt-2 text-sm text-neutral-500">Adicione um endereço para facilitar suas compras</p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">
                            {address.label || 'Endereço sem nome'}
                          </h3>
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
                          {address.city} - {address.state} | CEP: {address.zipcode.replace(/(\d{5})(\d{3})/, '$1-$2')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="p-2 rounded-lg border border-neutral-600 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="p-2 rounded-lg border border-error-500/50 text-error-500 hover:bg-error-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Pedidos */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">Meus Pedidos</h2>

          {orders.length === 0 ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-neutral-600" />
                <p className="mt-4 text-neutral-400">Você ainda não fez nenhum pedido</p>
                <Link href="/" className="mt-4 inline-block">
                  <Button className="mt-4">Ver Produtos</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-neutral-900 border-neutral-800">
                  <div className="space-y-4">
                    {/* Header do Pedido */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Pedido #{order.order_number}
                        </h3>
                        <p className="text-sm text-neutral-400">
                          {new Date(order.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="text-lg font-bold text-white">
                          {formatCurrency(order.total_cents)}
                        </span>
                      </div>
                    </div>

                    {/* Endereço de Entrega */}
                    {order.delivery_address && (
                      <div className="rounded-lg bg-neutral-800 p-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-neutral-400">Endereço de Entrega</p>
                            <p className="mt-1 text-sm text-white">
                              {order.delivery_address.street}, {order.delivery_address.number}
                              {order.delivery_address.complement && ` - ${order.delivery_address.complement}`}
                            </p>
                            <p className="text-sm text-white">
                              {order.delivery_address.city} - {order.delivery_address.state}
                            </p>
                            <p className="text-sm text-white">
                              CEP: {order.delivery_address.zipcode}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Links de Recibo e Nota Fiscal */}
                    <div className="flex flex-wrap gap-3">
                      {order.receipt_url && (
                        <a
                          href={order.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
                        >
                          <Receipt className="h-4 w-4" />
                          Ver Recibo
                        </a>
                      )}
                      {order.invoice_url && (
                        <a
                          href={order.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700"
                        >
                          <FileText className="h-4 w-4" />
                          Ver Nota Fiscal
                        </a>
                      )}
                      {!order.invoice_url && (
                        <div className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm text-neutral-500">
                          <FileText className="h-4 w-4" />
                          Nota Fiscal não disponível
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

