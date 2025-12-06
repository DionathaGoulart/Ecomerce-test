import { NextRequest, NextResponse } from 'next/server'
import { createOrderSchema } from '@/lib/validations/order'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { generateOrderNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados de entrada
    const validation = createOrderSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { customer, items } = validation.data

    // Verificar autenticação do usuário
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado. Faça login para continuar.' },
        { status: 401 }
      )
    }

    // Buscar produtos e calcular total
    const productIds = items.map((item) => item.productId)
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, title, price_cents')
      .in('id', productIds)

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      )
    }

    const productMap = new Map(products.map((p) => [p.id, p]))
    let totalCents = 0

    // Validar que todos os produtos existem e calcular total
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.productId} não encontrado` },
          { status: 404 }
        )
      }
      totalCents += product.price_cents * item.quantity
    }

    // Atualizar perfil do usuário com nome se fornecido
    if (customer.name) {
      await supabaseAdmin
        .from('profiles')
        .update({ full_name: customer.name })
        .eq('id', user.id)
    }

    // Gerar número único do pedido
    let orderNumber: string
    let attempts = 0
    do {
      orderNumber = generateOrderNumber()
      const { data: existing } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .single()
      
      if (!existing) break
      attempts++
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'Erro ao gerar número do pedido' },
          { status: 500 }
        )
      }
    } while (true)

    // Verificar se o endereço já existe salvo
    const addressForCheck = {
      street: customer.address.street,
      number: customer.address.number,
      city: customer.address.city,
      state: customer.address.state,
      zipcode: customer.address.zipcode.replace(/-/g, ''), // Remove formatação
    }

    const { data: existingAddresses } = await supabaseAdmin
      .from('user_addresses')
      .select('id')
      .eq('user_id', user.id)
      .eq('street', addressForCheck.street)
      .eq('number', addressForCheck.number)
      .eq('city', addressForCheck.city)
      .eq('state', addressForCheck.state)
      .eq('zipcode', addressForCheck.zipcode)
      .limit(1)

    // Se não existe, salvar o endereço automaticamente
    if (!existingAddresses || existingAddresses.length === 0) {
      // Verificar se é o primeiro endereço (será o padrão)
      const { count } = await supabaseAdmin
        .from('user_addresses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const isFirstAddress = (count || 0) === 0

      await supabaseAdmin
        .from('user_addresses')
        .insert({
          user_id: user.id,
          label: null, // Sem apelido, será preenchido pelo usuário depois se quiser
          street: addressForCheck.street,
          number: addressForCheck.number,
          complement: customer.address.complement || null,
          city: addressForCheck.city,
          state: addressForCheck.state,
          zipcode: addressForCheck.zipcode,
          is_default: isFirstAddress, // Primeiro endereço é padrão
        })
    }

    // Criar pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        status: 'pending',
        total_cents: totalCents,
        delivery_address: customer.address,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Criar itens do pedido
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!
      
      // Construir objeto de personalização se houver imagem ou descrição
      let personalization: { imageUrl?: string; description?: string } | null = null
      if (item.personalizationImageUrl || item.personalizationDescription) {
        personalization = {}
        if (item.personalizationImageUrl) {
          personalization.imageUrl = item.personalizationImageUrl
        }
        if (item.personalizationDescription) {
          personalization.description = item.personalizationDescription
        }
      }
      
      return {
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price_cents: product.price_cents,
        personalization,
      }
    })

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      // Rollback: deletar pedido criado
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Erro ao criar itens do pedido' },
        { status: 500 }
      )
    }

    // Criar sessão do Stripe Checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId)!
      return {
        price_data: {
          currency: 'brl',
          product_data: {
            name: product.title,
          },
          unit_amount: product.price_cents,
        },
        quantity: item.quantity,
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
      },
    })

    // Atualizar pedido com session_id
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({
      checkoutUrl: session.url,
      orderNumber,
    })
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
