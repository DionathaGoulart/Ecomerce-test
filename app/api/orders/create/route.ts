import { NextRequest, NextResponse } from 'next/server'
import { createOrderSchema } from '@/lib/validations/order'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/server'
import { generateOrderNumber } from '@/lib/utils'

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

    // Criar ou buscar cliente
    const { data: existingCustomer } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', customer.email)
      .single()

    let customerId: string
    if (existingCustomer) {
      customerId = existingCustomer.id
      // Atualizar dados do cliente
      await supabaseAdmin
        .from('customers')
        .update({
          name: customer.name,
          cpf: customer.cpf,
          whatsapp: customer.whatsapp,
          address: customer.address,
        })
        .eq('id', customerId)
    } else {
      // Criar novo cliente
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          name: customer.name,
          email: customer.email,
          cpf: customer.cpf,
          whatsapp: customer.whatsapp,
          address: customer.address,
        })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        return NextResponse.json(
          { error: 'Erro ao criar cliente' },
          { status: 500 }
        )
      }
      customerId = newCustomer.id
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

    // Criar pedido
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: 'pending',
        total_cents: totalCents,
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
      let personalization = null
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
      cancel_url: `${appUrl}/store/cart`,
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
