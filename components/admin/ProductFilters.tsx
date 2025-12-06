'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ProductFilters({ currentSearch }: { currentSearch: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentSearch)

  // Atualizar o estado quando o searchParams mudar (navegação do browser)
  useEffect(() => {
    setSearch(currentSearch)
  }, [currentSearch])

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    router.push(`/admin/products?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')
    router.push(`/admin/products?${params.toString()}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Buscar produtos por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyPress={handleKeyPress}
        className="max-w-xs bg-header-bg border-header-border text-white placeholder:text-white/50"
      />
      <Button 
        onClick={handleSearch} 
        size="sm"
        className="bg-primary-500 text-neutral-950 hover:opacity-90"
      >
        Buscar
      </Button>
      {currentSearch && (
        <Button 
          variant="outline" 
          onClick={handleClear} 
          size="sm"
          className="border-header-border text-white hover:bg-white/10"
        >
          Limpar
        </Button>
      )}
    </div>
  )
}
