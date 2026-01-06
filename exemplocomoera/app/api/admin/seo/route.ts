import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { seoSettingsSchema } from '@/lib/validations/seo'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Configurações de SEO podem ser lidas por todos (para renderização)
    const { data, error } = await supabaseAdmin
      .from('seo_settings')
      .select('*')
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar configurações de SEO' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || {
      site_title: 'E-commerce Personalizados',
      site_description: 'Produtos personalizados com qualidade',
    })
  } catch (error) {
    console.error('Erro ao buscar configurações de SEO:', error)
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
    const validation = seoSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Limpar campos vazios
    const cleanedData = Object.fromEntries(
      Object.entries(validation.data).map(([key, value]) => [
        key,
        value === '' ? null : value,
      ])
    )

    // Atualizar a única linha (id fixo)
    const { data, error } = await supabaseAdmin
      .from('seo_settings')
      .update(cleanedData)
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .select()
      .single()

    if (error) {
      // Se não existir, criar
      if (error.code === 'PGRST116') {
        const { data: newData, error: insertError } = await supabaseAdmin
          .from('seo_settings')
          .insert({
            id: '00000000-0000-0000-0000-000000000001',
            ...cleanedData,
          })
          .select()
          .single()

        if (insertError) {
          return NextResponse.json(
            { error: 'Erro ao criar configurações de SEO' },
            { status: 500 }
          )
        }

        return NextResponse.json(newData)
      }

      return NextResponse.json(
        { error: 'Erro ao atualizar configurações de SEO' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar configurações de SEO:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

