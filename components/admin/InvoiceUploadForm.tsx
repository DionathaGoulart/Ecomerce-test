'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InvoiceUploadFormProps {
  orderId: string
  currentUrl?: string
}

export default function InvoiceUploadForm({ orderId, currentUrl }: InvoiceUploadFormProps) {
  const router = useRouter()
  const [url, setUrl] = useState(currentUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar URL
      if (!url) {
        setError('URL é obrigatória')
        setLoading(false)
        return
      }

      try {
        new URL(url) // Validar se é uma URL válida
      } catch {
        setError('URL inválida')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/admin/orders/${orderId}/invoice`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_url: url }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Erro ao atualizar nota fiscal')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar nota fiscal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="invoice_url">URL da Nota Fiscal</Label>
        <Input
          id="invoice_url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplo.com/nota-fiscal.pdf"
          disabled={loading}
          className="mt-1"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
      <Button type="submit" disabled={loading || !url || url === currentUrl} size="sm">
        {loading ? 'Salvando...' : currentUrl ? 'Atualizar' : 'Adicionar'}
      </Button>
    </form>
  )
}

