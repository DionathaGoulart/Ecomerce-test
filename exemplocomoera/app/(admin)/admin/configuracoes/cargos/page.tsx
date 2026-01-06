'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { canManageRoles, type UserRole } from '@/lib/utils/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/atoms/Spinner'
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const USERS_PER_PAGE = 10

  useEffect(() => {
    if (user && canManageRoles(user.role as UserRole)) {
      loadUsers()
    } else if (user) {
      setError('Acesso negado. Apenas superadmins podem gerenciar cargos.')
      setLoading(false)
    }
  }, [user])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar usuários')
      }

      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUserId(userId)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar cargo')
      }

      setSuccess(`Cargo atualizado com sucesso!`)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar cargo')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      user: 'Usuário',
      moderador: 'Moderador',
      admin: 'Admin',
      superadmin: 'Super Admin',
    }
    return labels[role]
  }

  const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      user: 'text-neutral-400',
      moderador: 'text-blue-400',
      admin: 'text-primary-500',
      superadmin: 'text-yellow-400',
    }
    return colors[role]
  }

  // Ordenar por cargo (do mais alto para o menor) e depois alfabeticamente
  const getRoleOrder = (role: UserRole): number => {
    const order: Record<UserRole, number> = {
      superadmin: 4,
      admin: 3,
      moderador: 2,
      user: 1,
    }
    return order[role]
  }

  // Filtrar e ordenar usuários
  const filteredAndSortedUsers = useMemo(() => {
    let result = users

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const roleLabels: Record<UserRole, string> = {
        user: 'usuário',
        moderador: 'moderador',
        admin: 'admin',
        superadmin: 'super admin',
      }

      result = users.filter((userItem) => {
        const emailMatch = userItem.email.toLowerCase().includes(query)
        const nameMatch = userItem.full_name?.toLowerCase().includes(query) || false
        const roleMatch = roleLabels[userItem.role].includes(query)
        
        return emailMatch || nameMatch || roleMatch
      })
    }

    // Ordenar: primeiro por cargo (do mais alto para o menor), depois alfabeticamente por email
    result = [...result].sort((a, b) => {
      // Primeiro critério: cargo (do mais alto para o menor)
      const roleOrderA = getRoleOrder(a.role)
      const roleOrderB = getRoleOrder(b.role)
      
      if (roleOrderA !== roleOrderB) {
        return roleOrderB - roleOrderA // Ordem decrescente (superadmin primeiro)
      }
      
      // Segundo critério: alfabeticamente por email
      return a.email.localeCompare(b.email, 'pt-BR', { sensitivity: 'base' })
    })

    return result
  }, [users, searchQuery])

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedUsers.length / USERS_PER_PAGE)
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE
    const endIndex = startIndex + USERS_PER_PAGE
    return filteredAndSortedUsers.slice(startIndex, endIndex)
  }, [filteredAndSortedUsers, currentPage])

  // Resetar para página 1 quando a busca mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  if (!user || !canManageRoles(user.role as UserRole)) {
    return (
      <div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
          <p className="text-neutral-400">
            Apenas superadmins podem acessar esta página.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" variant="default" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Gerenciamento de Cargos
        </h1>
        <p className="text-neutral-400">
          Gerencie os cargos dos usuários do sistema.
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 rounded-xl border border-error-500/50 bg-error-950/50 p-4 text-error-400">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-error-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-error-400">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-error-500 hover:text-error-400 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 sm:mb-6 rounded-xl border border-success-500/50 bg-success-950/50 p-4 text-success-400">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-success-400">{success}</p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-success-500 hover:text-success-400 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Barra de Pesquisa */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500" />
            <Input
              type="text"
              placeholder="Buscar por email, nome ou cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 bg-header-bg border-header-border text-white placeholder:text-white/50 text-sm sm:text-base focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-header-border focus-visible:border-header-border"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-neutral-400">
            {searchQuery ? (
              <>
                {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}
              </>
            ) : (
              <>
                {filteredAndSortedUsers.length} {filteredAndSortedUsers.length === 1 ? 'usuário total' : 'usuários totais'}
              </>
            )}
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-neutral-400">
              Página {currentPage} de {totalPages}
            </p>
          )}
        </div>
      </div>

      {filteredAndSortedUsers.length > 0 ? (
        <>
          {/* Desktop: Tabela */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-header-border bg-header-bg">
            <table className="min-w-full divide-y divide-header-border">
              <thead className="bg-header-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Cargo Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-header-bg divide-y divide-header-border">
                {paginatedUsers.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                      {userItem.full_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getRoleColor(userItem.role)}`}>
                        {getRoleLabel(userItem.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {(['user', 'moderador', 'admin'] as UserRole[]).map((role) => {
                          const isCurrentRole = userItem.role === role
                          const isUpdating = updatingUserId === userItem.id

                          return (
                            <Button
                              key={role}
                              onClick={() => updateUserRole(userItem.id, role)}
                              disabled={isCurrentRole || isUpdating}
                              className={`text-xs px-3 py-1.5 ${
                                isCurrentRole
                                  ? 'bg-primary-500 text-neutral-950 hover:opacity-90'
                                  : 'border border-neutral-600 bg-transparent text-white hover:bg-white/10'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isUpdating ? (
                                <Spinner size="sm" variant="default" />
                              ) : (
                                getRoleLabel(role)
                              )}
                            </Button>
                          )
                        })}
                        {userItem.role === 'superadmin' && (
                          <span className="text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
                            {getRoleLabel('superadmin')}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-4">
            {paginatedUsers.map((userItem) => (
              <div
                key={userItem.id}
                className="rounded-xl border border-header-border bg-header-bg p-4 space-y-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{userItem.email}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {userItem.full_name || 'Sem nome'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-1">Cargo Atual</p>
                  <span className={`text-sm font-medium ${getRoleColor(userItem.role)}`}>
                    {getRoleLabel(userItem.role)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 mb-2">Alterar Cargo</p>
                  {userItem.role === 'superadmin' ? (
                    <div className="text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded inline-block">
                      {getRoleLabel('superadmin')} (apenas via SQL)
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(['user', 'moderador', 'admin'] as UserRole[]).map((role) => {
                        const isCurrentRole = userItem.role === role
                        const isUpdating = updatingUserId === userItem.id

                        return (
                          <Button
                            key={role}
                            onClick={() => updateUserRole(userItem.id, role)}
                            disabled={isCurrentRole || isUpdating}
                            className={`text-xs px-3 py-1.5 flex-1 min-w-[80px] ${
                              isCurrentRole
                                ? 'bg-primary-500 text-neutral-950 hover:opacity-90'
                                : 'border border-neutral-600 bg-transparent text-white hover:bg-white/10'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isUpdating ? (
                              <Spinner size="sm" variant="default" />
                            ) : (
                              getRoleLabel(role)
                            )}
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border border-header-border bg-transparent text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Anterior</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Mostrar apenas algumas páginas ao redor da atual
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[40px] ${
                          currentPage === page
                            ? 'bg-primary-500 text-neutral-950 hover:opacity-90'
                            : 'border border-header-border bg-transparent text-white hover:bg-white/10'
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="text-neutral-400 px-2">
                        ...
                      </span>
                    )
                  }
                  return null
                })}
              </div>

              <Button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border border-header-border bg-transparent text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline mr-1">Próxima</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-neutral-400">
            {searchQuery ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário encontrado.'}
          </p>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="mt-4 rounded-lg border border-primary-500 bg-transparent px-4 py-2 text-sm font-medium text-primary-500 transition-opacity hover:opacity-80"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  )
}

