import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/utils/admin-auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['user', 'moderador', 'admin', 'superadmin']),
})

/**
 * GET /api/admin/users
 * Lista todos os usuários (apenas superadmin)
 */
export async function GET() {
  try {
    const auth = await checkAdminAuth()

    if (!auth.canManageRoles) {
      return NextResponse.json({ error: 'Acesso negado. Apenas superadmins podem gerenciar cargos.' }, { status: 403 })
    }

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: 500 }
      )
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/users
 * Atualiza o cargo de um usuário (apenas superadmin)
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()

    if (!auth.canManageRoles) {
      return NextResponse.json({ error: 'Acesso negado. Apenas superadmins podem gerenciar cargos.' }, { status: 403 })
    }

    const body = await request.json()
    const validation = updateRoleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { userId, role } = validation.data

    // Não permitir atribuir superadmin via API (apenas via SQL direto no banco)
    if (role === 'superadmin') {
      return NextResponse.json(
        { error: 'Não é possível atribuir o cargo de superadmin através da interface. Use SQL direto no banco de dados.' },
        { status: 403 }
      )
    }

    // Verificar se o usuário que está sendo atualizado é o próprio superadmin
    // Se for, não permitir remover o cargo de superadmin (mas isso já está bloqueado acima)
    // Esta verificação é redundante agora, mas mantida para segurança
    const { data: targetUser } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (targetUser?.role === 'superadmin' && userId === auth.user?.id) {
      return NextResponse.json(
        { error: 'Você não pode remover seu próprio cargo de superadmin através da interface.' },
        { status: 400 }
      )
    }

    // Atualizar cargo
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('id, email, full_name, role')
      .single()

    if (error) {
      console.error('Erro ao atualizar cargo:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar cargo' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user: updatedProfile })
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

