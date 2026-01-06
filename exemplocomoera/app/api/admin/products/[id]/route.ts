import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { updateProductSchema } from '@/lib/validations/product'
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
    const validation = updateProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(validation.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar produto:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
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

    // Verificar se há order_items associados ao produto
    const { data: orderItems, error: checkError } = await supabaseAdmin
      .from('order_items')
      .select('id')
      .eq('product_id', id)
      .limit(1)

    if (checkError) {
      console.error('Erro ao verificar order_items:', checkError)
      return NextResponse.json(
        { error: 'Erro ao verificar dependências do produto' },
        { status: 500 }
      )
    }

    // Se houver order_items, não permitir deletar (ou deletar os order_items primeiro)
    if (orderItems && orderItems.length > 0) {
      // Opção 1: Deletar os order_items primeiro
      const { error: deleteItemsError } = await supabaseAdmin
        .from('order_items')
        .delete()
        .eq('product_id', id)

      if (deleteItemsError) {
        console.error('Erro ao deletar order_items:', deleteItemsError)
        return NextResponse.json(
          { error: 'Erro ao deletar itens de pedido associados. Este produto está em pedidos existentes.' },
          { status: 500 }
        )
      }
    }

    // Deletar produto usando supabaseAdmin para bypassar RLS
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar produto:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar produto', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
