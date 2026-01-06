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
import { canAccessAdmin } from '@/lib/utils/permissions'

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

      
      // Verificar se tem acesso ao admin (admin, superadmin ou moderador)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      if (!profile || !canAccessAdmin(profile.role)) {
        await supabase.auth.signOut()
        setError('Acesso negado. Apenas administradores podem acessar esta área.')
        setLoading(false)
        return
      }
      
      // Verificar se a sessão foi salva
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData?.session) {
        console.error('❌ Sessão não foi criada')
        setError('Erro ao criar sessão. Tente novamente.')
        setLoading(false)
        return
      }
      
      
      // Redirecionar para admin
      window.location.href = '/admin'
    } catch (err) {
      console.error('❌ Erro inesperado no login:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-center text-sm text-white/70">
            Faça login para continuar
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1 bg-header-bg border-header-border text-white placeholder:text-white/50"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-error-500/20 border border-error-500 p-4">
              <p className="text-sm text-error-400">{error}</p>
            </div>
          )}

          <div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-primary-500 text-neutral-950 hover:opacity-90 font-medium py-3"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
