import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { shippingConfigSchema } from '@/lib/validations/shipping'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await checkAdminAuth()

    if (!auth.hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('shipping_configs')
      .select('*')
      .order('priority', { ascending: false })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar configurações de frete' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Erro ao buscar configurações de frete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
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
      .insert(validation.data)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao criar configuração de frete' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar configuração de frete:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

