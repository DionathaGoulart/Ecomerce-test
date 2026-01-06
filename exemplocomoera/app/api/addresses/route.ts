import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const addressSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres'),
  zipcode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  is_default: z.boolean().optional().default(false),
})

// GET - Listar endereços do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar endereços:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar endereços' },
        { status: 500 }
      )
    }

    return NextResponse.json({ addresses: addresses || [] })
  } catch (error) {
    console.error('Erro na API de endereços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo endereço
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = addressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const addressData = {
      ...validation.data,
      user_id: user.id,
      zipcode: validation.data.zipcode.replace(/-/g, ''), // Remove formatação do CEP
    }

    const { data: address, error } = await supabase
      .from('user_addresses')
      .insert(addressData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar endereço:', error)
      return NextResponse.json(
        { error: 'Erro ao criar endereço' },
        { status: 500 }
      )
    }

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de endereços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

