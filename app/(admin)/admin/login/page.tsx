'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminLoginSchema, type AdminLoginInput } from '@/lib/validations/admin'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginInput) => {
    setLoading(true)
    setError(null)

    try {
      console.log('🔐 Tentando fazer login com:', data.email)
      
      const supabase = createClient()
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        console.error('❌ Erro no login:', signInError)
        setError(signInError.message || 'Email ou senha incorretos')
        setLoading(false)
        return
      }

      if (!authData?.user) {
        console.error('❌ Login bem-sucedido mas sem usuário')
        setError('Erro ao fazer login. Usuário não encontrado.')
        setLoading(false)
        return
      }

      console.log('✅ Login bem-sucedido! Usuário:', authData.user.email)
      
      // Verificar se a sessão foi salva
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('📋 Sessão após login:', sessionData?.session ? 'OK' : 'Não encontrada')
      
      if (!sessionData?.session) {
        console.error('❌ Sessão não foi criada')
        setError('Erro ao criar sessão. Tente novamente.')
        setLoading(false)
        return
      }
      
      console.log('✅ Sessão confirmada! Atualizando sessão para sincronizar cookies...')
      
      // Forçar refresh da sessão para garantir que os cookies sejam atualizados
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession(sessionData.session)
        if (refreshError) {
          console.warn('⚠️ Erro ao fazer refresh da sessão:', refreshError)
        } else {
          console.log('✅ Sessão atualizada com sucesso')
        }
      } catch (refreshErr) {
        console.warn('⚠️ Erro ao tentar refresh:', refreshErr)
      }
      
      // Aguardar mais tempo para garantir que os cookies HttpOnly foram salvos
      // Cookies HttpOnly podem demorar um pouco mais para serem processados pelo navegador
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Verificar novamente a sessão antes de redirecionar
      const { data: finalSession } = await supabase.auth.getSession()
      if (!finalSession?.session) {
        console.error('❌ Sessão foi perdida após refresh')
        setError('Erro ao manter sessão. Tente novamente.')
        setLoading(false)
        return
      }
      
      console.log('✅ Sessão final confirmada! Redirecionando para /admin...')
      
      // Usar window.location.href para forçar um reload completo
      // Isso garante que o middleware processe os cookies corretamente
      window.location.href = '/admin'
    } catch (err) {
      console.error('❌ Erro inesperado no login:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para continuar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
