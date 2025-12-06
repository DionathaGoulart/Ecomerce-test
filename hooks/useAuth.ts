'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const hasCheckedRef = useRef(false)
  const isCheckingRef = useRef(false)
  const lastCheckTimeRef = useRef(0)
  const DEBOUNCE_MS = 2000 // Só permitir verificação a cada 2 segundos

  const checkUser = useCallback(async () => {
    // Evitar múltiplas verificações simultâneas
    if (isCheckingRef.current) {
      return
    }

    // Debounce: evitar verificações muito frequentes
    const now = Date.now()
    if (now - lastCheckTimeRef.current < DEBOUNCE_MS) {
      console.log('Verificação ignorada por debounce')
      return
    }
    lastCheckTimeRef.current = now

    try {
      isCheckingRef.current = true
      setLoading(true)
      const response = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await response.json()
      setUser(data.user || null)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(null)
    } finally {
      setLoading(false)
      isCheckingRef.current = false
    }
  }, [])

  useEffect(() => {
    // Só verificar uma vez na montagem inicial
    if (!hasCheckedRef.current) {
      checkUser()
      hasCheckedRef.current = true
    }
    
    // Escutar apenas eventos customizados (não os automáticos do Supabase)
    // O Supabase dispara eventos automaticamente quando a janela/aba muda de foco,
    // o que causa verificações desnecessárias
    const handleAuthStateChanged = () => {
      checkUser()
    }
    
    window.addEventListener('auth-state-changed', handleAuthStateChanged)

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChanged)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Array vazio para executar apenas uma vez na montagem

  // Expor função para atualização manual
  return { user, loading, refresh: checkUser }
}

