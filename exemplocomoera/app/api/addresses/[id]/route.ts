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
  is_default: z.boolean().optional(),
})

// PUT - Atualizar endereço
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se o endereço pertence ao usuário
    const { data: existingAddress, error: checkError } = await supabase
      .from('user_addresses')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingAddress) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
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
      zipcode: validation.data.zipcode.replace(/-/g, ''), // Remove formatação do CEP
    }

    const { data: address, error } = await supabase
      .from('user_addresses')
      .update(addressData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar endereço:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar endereço' },
        { status: 500 }
      )
    }

    return NextResponse.json({ address })
  } catch (error) {
    console.error('Erro na API de endereços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar endereço
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se o endereço pertence ao usuário
    const { data: existingAddress, error: checkError } = await supabase
      .from('user_addresses')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existingAddress) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar endereço:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar endereço' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro na API de endereços:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

