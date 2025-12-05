'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/atoms/Input'
import { Button } from '@/components/atoms/Button'
import { Label } from '@/components/atoms/Label'
import Logo from '@/components/store/Logo'
import { Alert } from '@/components/molecules/Alert'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Erro ao enviar email')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError('Erro ao enviar email. Tente novamente.')
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

            <h1 className="text-3xl font-bold text-white">Email Enviado!</h1>
            <p className="text-sm text-neutral-400">
              Se o email existir em nossa base, você receberá um link para
              redefinir sua senha.
            </p>

            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800">
                  Voltar para Login
                </Button>
              </Link>
            </div>
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
          <h1 className="text-3xl font-bold text-white">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

          {error && (
            <Alert variant="error" title="Erro">
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </Button>

          {/* Link para login */}
          <p className="text-center text-sm text-neutral-400">
            Lembrou sua senha?{' '}
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

