import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { shippingConfigSchema } from '@/lib/validations/shipping'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

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

    const body = await request.json()
    const validation = shippingConfigSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('shipping_configs')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao atualizar configuração de frete' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar configuração de frete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await checkAdminAuth()

    if (!auth.canDelete) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem deletar itens.' },
        { status: 403 }
      )
    }

    const { error } = await supabaseAdmin
      .from('shipping_configs')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao deletar configuração de frete' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar configuração de frete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

