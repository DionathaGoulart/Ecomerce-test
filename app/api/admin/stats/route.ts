import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = await createClient()

    // Verificar autenticação e se é admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar todas as estatísticas em paralelo
    const [productsCount, ordersCount, pendingOrdersCount, paidOrdersCount, cancelledOrdersCount] = await Promise.all([
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    ])

    return NextResponse.json({
      products: productsCount.count || 0,
      orders: ordersCount.count || 0,
      pendingOrders: pendingOrdersCount.count || 0,
      paidOrders: paidOrdersCount.count || 0,
      cancelledOrders: cancelledOrdersCount.count || 0,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

