import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { shippingSettingsSchema } from '@/lib/validations/shipping'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Configurações gerais podem ser lidas por todos (para cálculo de frete)
    const { data, error } = await supabaseAdmin
      .from('shipping_settings')
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar configurações gerais de frete' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || {
      origin_cep: '01310100',
      origin_state: 'SP',
      origin_city: 'São Paulo',
      default_cost_cents: 2000,
      default_delivery_days: 5,
    })
  } catch (error) {
    console.error('Erro ao buscar configurações gerais de frete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()

    if (!auth.hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const validation = shippingSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Atualizar a única linha (id fixo)
    const { data, error } = await supabaseAdmin
      .from('shipping_settings')
      .update(validation.data)
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select()
      .single()

    if (error) {
      // Se não existir, criar
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabaseAdmin
          .from('shipping_settings')
          .insert({
            id: '00000000-0000-0000-0000-000000000000',
            ...validation.data,
          })
          .select()
          .single()

        if (insertError) {
          return NextResponse.json(
            { error: 'Erro ao criar configurações gerais de frete' },
            { status: 500 }
          )
        }

        return NextResponse.json(newData)
      }

      return NextResponse.json(
        { error: 'Erro ao atualizar configurações gerais de frete' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar configurações gerais de frete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

