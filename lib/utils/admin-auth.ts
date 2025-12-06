import { createClient } from '@/lib/supabase/server'
import { canAccessAdmin, canDelete, canManageRoles, type UserRole } from './permissions'

export interface AdminAuthResult {
  user: { id: string } | null
  profile: { role: UserRole } | null
  hasAccess: boolean
  canDelete: boolean
  canManageRoles: boolean
}

/**
 * Verifica autenticação e permissões do admin
 */
export async function checkAdminAuth(): Promise<AdminAuthResult> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user || authError) {
    return {
      user: null,
      profile: null,
      hasAccess: false,
      canDelete: false,
      canManageRoles: false,
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return {
      user,
      profile: null,
      hasAccess: false,
      canDelete: false,
      canManageRoles: false,
    }
  }

  const role = profile.role as UserRole

  return {
    user,
    profile: { role },
    hasAccess: canAccessAdmin(role),
    canDelete: canDelete(role),
    canManageRoles: canManageRoles(role),
  }
}

