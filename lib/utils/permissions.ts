/**
 * Funções auxiliares para verificação de permissões
 */

export type UserRole = 'user' | 'moderador' | 'admin' | 'superadmin'

export interface UserProfile {
  id: string
  email?: string | null
  full_name?: string | null
  role: UserRole
}

/**
 * Verifica se o usuário tem acesso ao painel admin
 */
export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  if (!role) return false
  return role === 'admin' || role === 'superadmin' || role === 'moderador'
}

/**
 * Verifica se o usuário pode deletar itens
 */
export function canDelete(role: UserRole | null | undefined): boolean {
  if (!role) return false
  return role === 'admin' || role === 'superadmin'
}

/**
 * Verifica se o usuário pode gerenciar cargos
 */
export function canManageRoles(role: UserRole | null | undefined): boolean {
  if (!role) return false
  return role === 'superadmin'
}

/**
 * Verifica se o usuário é superadmin
 */
export function isSuperadmin(role: UserRole | null | undefined): boolean {
  if (!role) return false
  return role === 'superadmin'
}

