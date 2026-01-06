import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'production', 'shipped', 'delivered', 'cancelled']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await checkAdminAuth()

    if (!auth.hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const supabase = await createClient()

    const body = await request.json()
    const validation = updateStatusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Status inválido', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { status } = validation.data

    // Atualizar status
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
