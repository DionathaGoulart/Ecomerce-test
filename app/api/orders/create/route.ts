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

    const { customer, items, deliveryType, shippingCost } = validation.data

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
    let subtotalCents = 0

    // Validar que todos os produtos existem e calcular subtotal
    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json(
          { error: `Produto ${item.productId} não encontrado` },
          { status: 404 }
        )
      }
      subtotalCents += product.price_cents * item.quantity
    }
    
    // Total incluindo frete
    const totalCents = subtotalCents + shippingCost

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

    // Salvar endereço apenas se for entrega (não salvar endereço da empresa)
    if (deliveryType === 'delivery') {
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
        // Salvar tipo de entrega e frete como metadata (se a tabela tiver esses campos)
        // Se não tiver, podemos adicionar depois ou usar um campo JSON
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Erro ao criar pedido' },
        { status: 500 }
      )
    }

    // Processar imagens de personalização: copiar temporárias para permanentes
    const uploadedImageUrls: Record<string, string> = {}
    
    for (const item of items) {
      if (!item.personalizationImageUrl) {
        continue
      }

      try {
        // Se tem path temporário, copiar para permanente
        if (item.personalizationImagePath) {
          // Baixar a imagem temporária
          const { data: tempFileData, error: downloadError } = await supabaseAdmin.storage
            .from('personalizations')
            .download(item.personalizationImagePath)

          if (downloadError || !tempFileData) {
            console.error('Erro ao baixar imagem temporária:', downloadError)
            continue
          }

          // Converter para buffer
          const arrayBuffer = await tempFileData.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          // Gerar nome do arquivo permanente
          const fileExt = item.personalizationImageFile?.name?.split('.').pop() || 
            item.personalizationImagePath.split('.').pop() || 'png'
          const fileName = `${order.id}_${item.productId}_${Date.now()}.${fileExt}`
          const permanentPath = `personalizations/${fileName}`

          // Detectar content type
          const contentType = item.personalizationImageFile?.type || 
            (fileExt === 'png' ? 'image/png' : 
             fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' : 
             fileExt === 'webp' ? 'image/webp' : 
             'image/png')

          // Upload para path permanente
          const { error: uploadError } = await supabaseAdmin.storage
            .from('personalizations')
            .upload(permanentPath, buffer, {
              contentType,
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) {
            console.error('Erro ao fazer upload da imagem permanente:', uploadError)
            continue
          }

          // Criar signed URL válida por 1 ano
          const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
            .from('personalizations')
            .createSignedUrl(permanentPath, 60 * 60 * 24 * 365) // 1 ano

          if (signedUrlError || !signedUrlData?.signedUrl) {
            console.error('Erro ao criar signed URL:', signedUrlError)
            continue
          }

          uploadedImageUrls[item.productId] = signedUrlData.signedUrl

          // Deletar imagem temporária
          await supabaseAdmin.storage
            .from('personalizations')
            .remove([item.personalizationImagePath])
        } else if (item.personalizationImageUrl.startsWith('data:')) {
          // É base64 (fallback para compatibilidade), fazer upload
          const base64Data = item.personalizationImageUrl.split(',')[1] || item.personalizationImageUrl
          const buffer = Buffer.from(base64Data, 'base64')
          
          const fileExt = item.personalizationImageFile?.name?.split('.').pop() || 'png'
          const fileName = `${order.id}_${item.productId}_${Date.now()}.${fileExt}`
          const filePath = `personalizations/${fileName}`
          
          const contentType = item.personalizationImageFile?.type || 
            (item.personalizationImageUrl.includes('image/png') ? 'image/png' : 
             item.personalizationImageUrl.includes('image/jpeg') ? 'image/jpeg' : 
             item.personalizationImageUrl.includes('image/webp') ? 'image/webp' : 
             'image/png')
          
          const { error: uploadError } = await supabaseAdmin.storage
            .from('personalizations')
            .upload(filePath, buffer, {
              contentType,
              cacheControl: '3600',
              upsert: false,
            })
          
          if (uploadError) {
            console.error('Erro ao fazer upload da imagem:', uploadError)
            continue
          }
          
          const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
            .from('personalizations')
            .createSignedUrl(filePath, 60 * 60 * 24 * 365)
          
          if (signedUrlError || !signedUrlData?.signedUrl) {
            console.error('Erro ao criar signed URL:', signedUrlError)
            continue
          }
          
          uploadedImageUrls[item.productId] = signedUrlData.signedUrl
        } else {
          // Já é uma URL permanente, usar diretamente
          uploadedImageUrls[item.productId] = item.personalizationImageUrl
        }
      } catch (error) {
        console.error('Erro ao processar imagem:', error)
        // Continuar sem a imagem
      }
    }

    // Criar itens do pedido
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!
      
      // Construir objeto de personalização se houver imagem ou descrição
      let personalization: { imageUrl?: string; description?: string } | null = null
      if (uploadedImageUrls[item.productId] || item.personalizationDescription) {
        personalization = {}
        if (uploadedImageUrls[item.productId]) {
          personalization.imageUrl = uploadedImageUrls[item.productId]
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
    
    // Adicionar frete como item separado se houver
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'brl',
          product_data: {
            name: deliveryType === 'delivery' ? 'Frete' : 'Retirada no Local',
          },
          unit_amount: shippingCost,
        },
        quantity: 1,
      })
    }

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
