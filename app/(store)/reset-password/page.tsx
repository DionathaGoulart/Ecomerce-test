'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Label } from '@/components/atoms/Label'
import Logo from '@/components/store/Logo'
import { Alert } from '@/components/molecules/Alert'

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
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    // Verificar se há token de recuperação na URL
    const token = searchParams.get('token')
    if (!token) {
      setError('Link inválido ou expirado')
    }
  }, [searchParams])

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
        setError(result.error || 'Erro ao redefinir senha')
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
            <Alert variant="destructive" title="Erro">
              {error}
            </Alert>
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

