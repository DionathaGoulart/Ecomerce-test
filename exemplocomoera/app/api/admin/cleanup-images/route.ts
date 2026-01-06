import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/cleanup-images
 * Remove imagens de personalização de pedidos concluídos há mais de 15 dias
 * 
 * Esta rota deve ser chamada periodicamente (ex: via cron job) para limpar
 * imagens antigas do storage.
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação (apenas admins)
    const auth = await checkAdminAuth()
    if (!auth.hasAccess) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar pedidos concluídos há mais de 15 dias
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)

    const { data: oldOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .in('status', ['shipped', 'cancelled']) // Pedidos concluídos ou cancelados
      .lte('updated_at', fifteenDaysAgo.toISOString())

    if (ordersError) {
      console.error('Erro ao buscar pedidos antigos:', ordersError)
      return NextResponse.json(
        { error: 'Erro ao buscar pedidos' },
        { status: 500 }
      )
    }

    if (!oldOrders || oldOrders.length === 0) {
      return NextResponse.json({
        message: 'Nenhum pedido antigo encontrado',
        deleted: 0,
      })
    }

    const orderIds = oldOrders.map((o) => o.id)

    // Buscar itens dos pedidos com personalização
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('id, personalization')
      .in('order_id', orderIds)

    if (itemsError) {
      console.error('Erro ao buscar itens:', itemsError)
      return NextResponse.json(
        { error: 'Erro ao buscar itens do pedido' },
        { status: 500 }
      )
    }

    // Extrair URLs das imagens
    const imagePaths: string[] = []
    orderItems?.forEach((item) => {
      if (item.personalization && typeof item.personalization === 'object') {
        const personalization = item.personalization as { imageUrl?: string }
        if (personalization.imageUrl) {
          // Extrair o path do storage da URL
          // Ex: https://...supabase.co/storage/v1/object/sign/personalizations/...?...
          // Precisamos extrair: personalizations/...
          try {
            const url = new URL(personalization.imageUrl)
            const pathMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/personalizations\/(.+)/)
            if (pathMatch) {
              imagePaths.push(`personalizations/${pathMatch[1]}`)
            }
          } catch (error) {
            console.warn('Erro ao processar URL da imagem:', personalization.imageUrl)
          }
        }
      }
    })

    if (imagePaths.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma imagem encontrada para deletar',
        deleted: 0,
      })
    }

    // Deletar imagens do storage
    let deletedCount = 0
    const errors: string[] = []

    for (const path of imagePaths) {
      try {
        const { error: deleteError } = await supabaseAdmin.storage
          .from('personalizations')
          .remove([path])

        if (deleteError) {
          errors.push(`Erro ao deletar ${path}: ${deleteError.message}`)
        } else {
          deletedCount++
        }
      } catch (error) {
        errors.push(`Erro ao deletar ${path}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      }
    }

    return NextResponse.json({
      message: `Limpeza concluída`,
      deleted: deletedCount,
      total: imagePaths.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Erro ao limpar imagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

