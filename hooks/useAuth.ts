'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkUser = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await response.json()
      setUser(data.user || null)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkUser()
    
    // Escutar mudanças na autenticação
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      // Forçar atualização imediata
      checkUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkUser])

  // Expor função para atualização manual
  return { user, loading, refresh: checkUser }
}

