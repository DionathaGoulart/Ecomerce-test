'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Label } from '@/components/atoms/Label'
import Logo from '@/components/store/Logo'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erro ao fazer login')
        setLoading(false)
        return
      }

      // Redirecionar e forçar atualização do estado
      const redirectTo = searchParams.get('redirect') || '/minha-conta'
      // Pequeno delay para garantir que a sessão foi salva
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
        // Forçar atualização do estado de autenticação
        window.dispatchEvent(new Event('auth-state-changed'))
      }, 100)
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Título */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Entrar</h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 bg-neutral-900 border-neutral-600 text-white placeholder:text-neutral-500"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-white">
                Senha
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
          </div>

          {/* Esqueci a senha */}
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

          {error && (
            <div className="rounded-xl border border-error-500/50 bg-error-950/50 p-3 sm:p-4 text-error-400">
              <div className="flex items-start gap-2 sm:gap-3">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-error-500 flex-shrink-0"
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
                  <h5 className="mb-1 text-sm sm:text-base font-medium text-error-300">Erro ao fazer login</h5>
                  <p className="text-xs sm:text-sm text-error-400">{error}</p>
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
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#060606] text-neutral-400">
                ou continue com
              </span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800"
            size="lg"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>

          {/* Link para registro */}
          <p className="text-center text-sm text-neutral-400">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="text-primary-500 hover:text-primary-400 transition-colors font-medium"
            >
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Entrar</h1>
            <p className="mt-2 text-sm text-neutral-400">Carregando...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

