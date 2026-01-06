import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await checkAdminAuth()

    if (!auth.hasAccess) {
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

