'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Settings, Truck, Users, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { canManageRoles, type UserRole } from '@/lib/utils/permissions'

export default function ConfiguracoesPage() {
  const { user } = useAuth()
  const [tabs, setTabs] = useState<Array<{ id: string; label: string; icon: any; href: string }>>([])

  useEffect(() => {
    const availableTabs = [
      { id: 'frete', label: 'Frete', icon: Truck, href: '/admin/configuracoes/frete' },
      { id: 'seo', label: 'SEO', icon: Search, href: '/admin/configuracoes/seo' },
    ]

    // Adicionar Cargos apenas se o usuário tiver permissão
    if (user && canManageRoles(user.role as UserRole)) {
      availableTabs.push({ id: 'cargos', label: 'Cargos', icon: Users, href: '/admin/configuracoes/cargos' })
    }

    setTabs(availableTabs)
  }, [user])

  return (
    <div>
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
        Configurações
      </h1>

      <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
        <div className={`grid grid-cols-1 ${tabs.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link key={tab.id} href={tab.href}>
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg border border-header-border bg-header-bg hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="p-3 rounded-lg bg-primary-500/20">
                    <Icon className="h-6 w-6 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{tab.label}</h3>
                  <p className="text-sm text-white/70 text-center">
                    {tab.id === 'frete' && 'Configure opções de frete e endereço da sede'}
                    {tab.id === 'cargos' && 'Gerencie cargos e permissões de usuários'}
                    {tab.id === 'seo' && 'Configure meta tags e analytics do site'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

