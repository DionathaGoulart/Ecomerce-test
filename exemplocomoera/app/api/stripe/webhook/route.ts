import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendOrderConfirmation } from '@/lib/email'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Obter o body como array buffer primeiro para garantir que não seja modificado
    const arrayBuffer = await request.arrayBuffer()
    const body = Buffer.from(arrayBuffer).toString('utf8')
    const signature = request.headers.get('stripe-signature')

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

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    
    // Verificar se o secret começa com whsec_
    if (!webhookSecret || !webhookSecret.startsWith('whsec_')) {
      console.error('❌ Webhook secret inválido!')
      console.error('❌ Secret deve começar com whsec_')
      console.error('❌ Secret recebido (primeiros 20 chars):', webhookSecret?.substring(0, 20) || 'NÃO CONFIGURADO')
      console.error('')
      console.error('📝 COMO CORRIGIR:')
      console.error('1. Acesse: https://dashboard.stripe.com/webhooks')
      console.error('2. Clique no webhook: https://ecomerce-alpha-ten.vercel.app/api/stripe/webhook')
      console.error('3. Na seção "Signing secret", clique em "Reveal"')
      console.error('4. Copie o secret completo (começa com whsec_)')
      console.error('5. No Vercel, vá em Settings > Environment Variables')
      console.error('6. Atualize STRIPE_WEBHOOK_SECRET com o valor correto')
      console.error('7. Faça um novo deploy')
      console.error('')
      return NextResponse.json(
        { error: 'Webhook secret inválido. Verifique a configuração.' },
        { status: 500 }
      )
    }

    let event: Stripe.Event

    try {
      // Tentar verificar a assinatura com o body como string
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      )
    } catch (err) {
      const error = err as Error
      console.error('❌ Erro ao verificar webhook:', error.message)
      console.error('❌ Erro completo:', err)
      
      // Log adicional para debug
      console.error('📋 Signature recebida (primeiros 50 chars):', signature?.substring(0, 50))
      console.error('📋 Signature recebida (últimos 50 chars):', signature?.substring(Math.max(0, signature.length - 50)))
      console.error('📋 Body recebido (primeiros 200 chars):', body.substring(0, 200))
      console.error('📋 Body recebido (últimos 200 chars):', body.substring(Math.max(0, body.length - 200)))
      console.error('📋 Body é string?', typeof body === 'string')
      console.error('📋 Body tem conteúdo?', body.length > 0)
      console.error('📋 Body completo (JSON):', body)
      
      // Tentar verificar se o problema é com múltiplos secrets (teste vs produção)
      console.error('⚠️ DICA: Verifique se o STRIPE_WEBHOOK_SECRET no Vercel corresponde ao secret do webhook no Stripe Dashboard')
      console.error('⚠️ DICA: O secret deve começar com whsec_ e ser do webhook de PRODUÇÃO (não teste)')
      console.error('⚠️ DICA: Se você tem webhooks de teste e produção, use o secret correto para cada um')
      
      // Tentar também com o body como Buffer (fallback)
      try {
        const bodyBuffer = Buffer.from(body, 'utf8')
        event = stripe.webhooks.constructEvent(
          bodyBuffer,
          signature,
          webhookSecret
        )
      } catch (bufferErr) {
        console.error('❌ Também falhou com Buffer:', bufferErr instanceof Error ? bufferErr.message : bufferErr)
        return NextResponse.json(
          { error: `Webhook Error: ${error.message}` },
          { status: 400 }
        )
      }
    }

  // Processar evento de pagamento bem-sucedido
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      // Buscar pedido pelo session_id
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('id, order_number, total_cents, user_id')
        .eq('stripe_session_id', session.id)
        .single()

      if (orderError || !order) {
        console.error('❌ Pedido não encontrado:', orderError)
        console.error('Session ID buscado:', session.id)
        return NextResponse.json(
          { error: 'Pedido não encontrado' },
          { status: 404 }
        )
      }

      // Buscar dados do usuário
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

      // Buscar itens do pedido
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
      }

      // Buscar recibo do Stripe
      const paymentIntentId = session.payment_intent as string
      let receiptUrl: string | undefined
      
      if (paymentIntentId) {
        try {
          // Buscar o PaymentIntent
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          
          // Tentar buscar charges
          const charges = await stripe.charges.list({
            payment_intent: paymentIntentId,
            limit: 1,
          })
          
          if (charges.data.length > 0) {
            const charge = charges.data[0]
            receiptUrl = charge.receipt_url || undefined
            
            // Se não tiver receipt_url, tentar gerar um
            if (!receiptUrl && charge.id) {
              try {
                // Tentar buscar o charge diretamente para obter o receipt_url
                const chargeDetails = await stripe.charges.retrieve(charge.id)
                receiptUrl = chargeDetails.receipt_url || undefined
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
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          receipt_url: receiptUrl,
        })
        .eq('id', order.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar pedido:', updateError)
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
          await sendOrderConfirmation({
            to: profile.email,
            orderNumber: order.order_number,
            customerName: profile.full_name || 'Cliente',
            customerWhatsApp: undefined, // Não armazenamos mais WhatsApp
            items: emailItems,
            receiptUrl,
            totalCents: order.total_cents,
          })
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

  return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Erro geral no webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}
