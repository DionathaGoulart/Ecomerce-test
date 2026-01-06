import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()

    if (!auth.hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Construir query
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: orders, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar pedidos' },
        { status: 500 }
      )
    }

    // Buscar perfis dos usuários em paralelo
    const userIds = orders?.map((o) => o.user_id).filter(Boolean) || []
    const profilesMap = new Map<string, { email: string; full_name: string | null }>()

    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)

      profiles?.forEach((profile) => {
        profilesMap.set(profile.id, {
          email: profile.email,
          full_name: profile.full_name,
        })
      })
    }

    // Adicionar informações do perfil aos pedidos
    const ordersWithProfiles = orders?.map((order) => ({
      ...order,
      profile: order.user_id ? profilesMap.get(order.user_id) : null,
    }))

    return NextResponse.json(ordersWithProfiles || [])
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

