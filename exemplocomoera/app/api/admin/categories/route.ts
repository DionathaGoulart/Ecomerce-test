import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { categorySchema } from '@/lib/validations/category'
import { checkAdminAuth } from '@/lib/utils/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = await checkAdminAuth()

    if (!auth.hasAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao buscar categorias' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
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

    const supabase = await createClient()

    const body = await request.json()
    const validation = categorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(validation.data)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Erro ao criar categoria' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

