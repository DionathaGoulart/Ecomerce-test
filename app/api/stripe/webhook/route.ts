import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/email'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Logs forçados para garantir que apareçam
  console.log('\n' + '='.repeat(50))
  console.log('🔔 WEBHOOK RECEBIDO DO STRIPE')
  console.log('='.repeat(50) + '\n')
  
  try {
    // Obter o body como texto raw (importante para verificação de assinatura)
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    console.log('📋 Signature presente:', !!signature)
    console.log('📋 Body length:', body.length)
    console.log('📋 Body preview:', body.substring(0, 100))

    if (!signature) {
      console.error('❌ Assinatura não fornecida no webhook')
      return NextResponse.json(
        { error: 'Assinatura não fornecida' },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET não está configurada')
      return NextResponse.json(
        { error: 'Webhook secret não configurada' },
        { status: 500 }
      )
    }

    console.log('🔐 Webhook secret configurado:', !!process.env.STRIPE_WEBHOOK_SECRET)
    console.log('🔐 Webhook secret prefix:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10))

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
      console.log(`✅ Webhook verificado com sucesso. Tipo: ${event.type}`)
    } catch (err) {
      const error = err as Error
      console.error('❌ Erro ao verificar webhook:', error.message)
      console.error('❌ Erro completo:', err)
      
      // Log adicional para debug
      console.error('📋 Signature recebida:', signature?.substring(0, 20) + '...')
      console.error('📋 Body recebido (primeiros 200 chars):', body.substring(0, 200))
      
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      )
    }

  // Processar evento de pagamento bem-sucedido
  if (event.type === 'checkout.session.completed') {
    console.log('✅ Evento checkout.session.completed recebido')
    const session = event.data.object as Stripe.Checkout.Session
    console.log(`📋 Session ID: ${session.id}`)
    console.log(`📋 Metadata:`, session.metadata)

    try {
      // Buscar pedido pelo session_id
      console.log('🔍 Buscando pedido no banco...')
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, total_cents, user_id')
        .eq('stripe_session_id', session.id)
        .single()
      
      console.log('📦 Resultado da busca:', { order, orderError })

      if (orderError || !order) {
        console.error('❌ Pedido não encontrado:', orderError)
        console.error('Session ID buscado:', session.id)
        return NextResponse.json(
          { error: 'Pedido não encontrado' },
          { status: 404 }
        )
      }

      console.log(`✅ Pedido encontrado: #${order.order_number}`)

      // Buscar dados do usuário
      console.log('👤 Buscando dados do usuário...')
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', order.user_id)
        .single()
      
      if (profileError || !profile) {
        console.error('❌ Perfil não encontrado:', profileError)
        return NextResponse.json(
          { error: 'Perfil não encontrado' },
          { status: 404 }
        )
      }
      
      console.log(`✅ Perfil encontrado: ${profile.email}`)

      // Buscar itens do pedido
      console.log('🛒 Buscando itens do pedido...')
      const { data: orderItems, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select(`
          quantity,
          unit_price_cents,
          personalization,
          product:products!inner(title)
        `)
        .eq('order_id', order.id)
      
      if (itemsError) {
        console.error('❌ Erro ao buscar itens:', itemsError)
      } else {
        console.log(`✅ ${orderItems?.length || 0} itens encontrados`)
      }

      // Buscar recibo do Stripe
      console.log('💰 Buscando recibo do Stripe...')
      const paymentIntentId = session.payment_intent as string
      let receiptUrl: string | undefined
      
      if (paymentIntentId) {
        try {
          console.log(`📋 Payment Intent ID: ${paymentIntentId}`)
          
          // Buscar o PaymentIntent
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          console.log(`📋 Payment Intent status: ${paymentIntent.status}`)
          
          // Tentar buscar charges
          const charges = await stripe.charges.list({
            payment_intent: paymentIntentId,
            limit: 1,
          })
          
          console.log(`📋 Charges encontrados: ${charges.data.length}`)
          
          if (charges.data.length > 0) {
            const charge = charges.data[0]
            receiptUrl = charge.receipt_url || undefined
            console.log(`✅ Recibo URL: ${receiptUrl || 'não disponível'}`)
            
            // Se não tiver receipt_url, tentar gerar um
            if (!receiptUrl && charge.id) {
              try {
                // Tentar buscar o charge diretamente para obter o receipt_url
                const chargeDetails = await stripe.charges.retrieve(charge.id)
                receiptUrl = chargeDetails.receipt_url || undefined
                console.log(`✅ Recibo URL (detalhes): ${receiptUrl || 'não disponível'}`)
              } catch (err) {
                console.warn('⚠️ Erro ao buscar detalhes do charge:', err)
              }
            }
          } else {
            console.warn('⚠️ Nenhum charge encontrado para o payment intent')
          }
        } catch (receiptError) {
          console.warn('⚠️ Erro ao buscar recibo:', receiptError)
          if (receiptError instanceof Error) {
            console.warn('⚠️ Mensagem:', receiptError.message)
          }
        }
      } else {
        console.warn('⚠️ Payment Intent ID não encontrado na session')
      }

      // Atualizar status do pedido
      console.log('📝 Atualizando status do pedido para "paid"...')
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          receipt_url: receiptUrl,
        })
        .eq('id', order.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar pedido:', updateError)
      } else {
        console.log('✅ Pedido atualizado com sucesso')
      }

      // Enviar email de confirmação
      if (profile && orderItems && orderItems.length > 0) {
        const emailItems = orderItems.map((item: any) => {
          // A query do Supabase pode retornar product como objeto ou null
          const product = item.product
          const productTitle = product?.title || 'Produto'
          
          return {
            productTitle,
            quantity: item.quantity,
            unitPriceCents: item.unit_price_cents,
            personalizationImageUrl:
              item.personalization && typeof item.personalization === 'object' && 'imageUrl' in item.personalization
                ? (item.personalization as { imageUrl?: string }).imageUrl
                : undefined,
          }
        })

        try {
          console.log('\n' + '📧'.repeat(20))
          console.log('📧 INICIANDO ENVIO DE EMAIL')
          console.log('📧'.repeat(20))
          console.log(`📧 Para: ${profile.email}`)
          console.log(`📧 Pedido: #${order.order_number}`)
          console.log(`📧 Itens: ${emailItems.length}`)
          console.log(`📧 RESEND_API_KEY configurada: ${!!process.env.RESEND_API_KEY}`)
          
          const emailResult = await sendOrderConfirmation({
            to: profile.email,
            orderNumber: order.order_number,
            customerName: profile.full_name || 'Cliente',
            customerWhatsApp: undefined, // Não armazenamos mais WhatsApp
            items: emailItems,
            receiptUrl,
            totalCents: order.total_cents,
          })
          
          console.log('\n' + '✅'.repeat(20))
          console.log('✅ EMAIL ENVIADO COM SUCESSO!')
          console.log('✅'.repeat(20))
          console.log('✅ Resultado:', JSON.stringify(emailResult, null, 2))
          console.log('\n')
        } catch (emailError) {
          console.error('\n' + '❌'.repeat(20))
          console.error('❌ ERRO AO ENVIAR EMAIL')
          console.error('❌'.repeat(20))
          console.error('❌ Erro completo:', emailError)
          
          // Log detalhado do erro
          if (emailError instanceof Error) {
            console.error('❌ Mensagem:', emailError.message)
            console.error('❌ Stack:', emailError.stack)
            console.error('❌ Name:', emailError.name)
          } else {
            console.error('❌ Tipo do erro:', typeof emailError)
            console.error('❌ Valor:', JSON.stringify(emailError, null, 2))
          }
          console.error('\n')
          
          // Não falhar o webhook se o email falhar, mas logamos o erro
        }
      } else {
        console.warn('Não foi possível enviar email: profile ou orderItems não encontrados', {
          hasProfile: !!profile,
          hasOrderItems: !!orderItems,
        })
      }

      console.log('✅ Webhook processado com sucesso')
      return NextResponse.json({ received: true })
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error)
      if (error instanceof Error) {
        console.error('Mensagem:', error.message)
        console.error('Stack:', error.stack)
      }
      return NextResponse.json(
        { error: 'Erro ao processar webhook' },
        { status: 500 }
      )
    }
  }

  console.log(`ℹ️ Evento ${event.type} não processado (não é checkout.session.completed)`)
  return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erro geral no webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
