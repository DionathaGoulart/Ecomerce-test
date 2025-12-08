'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Label } from '@/components/atoms/Label'
import Logo from '@/components/store/Logo'
import { createClient } from '@/lib/supabase/client'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    // O Supabase processa automaticamente os hash fragments (#access_token=...)
    // quando a página carrega. Vamos aguardar um pouco para garantir que o processamento aconteceu.
    const checkSession = async () => {
      try {
        const supabase = createClient()
        
        // Aguardar um pouco para o Supabase processar o hash fragment
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Não vamos mostrar erro aqui, pois o hash fragment pode ainda estar sendo processado
        // O erro real será mostrado quando o usuário tentar atualizar a senha
        if (sessionError) {
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err)
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const onSubmit = async (data: ResetPasswordForm) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Traduzir mensagens de erro comuns
        let errorMessage = result.error || 'Erro ao redefinir senha'
        
        if (errorMessage.includes('Auth session missing') || errorMessage.includes('session')) {
          errorMessage = 'Link inválido ou expirado. Por favor, solicite um novo link de recuperação de senha.'
        } else if (errorMessage.includes('expired') || errorMessage.includes('expirado')) {
          errorMessage = 'Este link expirou. Por favor, solicite um novo link de recuperação de senha.'
        } else if (errorMessage.includes('invalid') || errorMessage.includes('inválido')) {
          errorMessage = 'Link inválido. Por favor, verifique o link ou solicite um novo.'
        }
        
        setError(errorMessage)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('Erro ao redefinir senha. Tente novamente.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Logo />
          </div>

          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-500/20">
              <svg
                className="h-6 w-6 text-success-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white">Senha Redefinida!</h1>
            <p className="text-sm text-neutral-400">
              Sua senha foi redefinida com sucesso. Redirecionando para login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Redefinir Senha</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Digite sua nova senha
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-white">
                Nova Senha
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1 bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-white">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="mt-1 bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {error && (
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
                  <h5 className="mb-1 font-medium text-error-300">Erro ao redefinir senha</h5>
                  <p className="text-sm text-error-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>

          {/* Link para login */}
          <p className="text-center text-sm text-neutral-400">
            <Link
              href="/login"
              className="text-primary-500 hover:text-primary-400 transition-colors font-medium"
            >
              Voltar para Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Redefinir Senha</h1>
            <p className="mt-2 text-sm text-neutral-400">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}

