'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/molecules/Card'
import { formatCurrency } from '@/lib/utils'
import { LogOut, Package, MapPin, Receipt, FileText, Settings, Lock, Eye, EyeOff } from 'lucide-react'
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

  useEffect(() => {
    loadUserAndOrders()
  }, [])

  const loadUserAndOrders = async () => {
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
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
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

  const handleChangePassword = async (e: React.FormEvent) => {
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
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Minha Conta</h1>
            <p className="mt-2 text-neutral-400">
              {user.email}
            </p>
            {/* Debug: mostrar role na tela */}
            <p className="mt-1 text-xs text-neutral-500">
              Role atual: {user.role || 'não definido'} | É admin? {isAdmin ? 'SIM' : 'NÃO'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Botão Admin */}
            {isAdmin && (
              <>
                <a 
                  href="/admin"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </a>
                {/* Teste: botão sempre visível para debug */}
                <div className="text-xs text-green-500 bg-green-500/20 px-2 py-1 rounded">
                  ✓ Admin ativo
                </div>
              </>
            )}
            {!isAdmin && (
              <div className="text-xs text-red-500 bg-red-500/20 px-2 py-1 rounded">
                ✗ Não é admin (role: {user.role})
              </div>
            )}
          </div>
        </div>

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

        {/* Pedidos */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">Meus Pedidos</h2>

          {orders.length === 0 ? (
            <Card className="bg-neutral-900 border-neutral-800">
              <div className="py-12 text-center">
                <Package className="mx-auto h-12 w-12 text-neutral-600" />
                <p className="mt-4 text-neutral-400">Você ainda não fez nenhum pedido</p>
                <Link href="/store" className="mt-4 inline-block">
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

