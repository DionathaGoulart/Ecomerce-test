import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.error('⚠️ RESEND_API_KEY não está definida nas variáveis de ambiente')
  console.error('O envio de emails não funcionará até que esta variável seja configurada')
}

// Inicializar Resend mesmo sem a key para não quebrar a aplicação
// Mas vamos verificar antes de usar
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SendOrderConfirmationParams {
  to: string
  orderNumber: string
  customerName: string
  customerWhatsApp?: string
  items: Array<{
    productTitle: string
    quantity: number
    unitPriceCents: number
    personalizationImageUrl?: string
  }>
  receiptUrl?: string
  totalCents: number
}

/**
 * Formata número do WhatsApp para link (remove formatação e adiciona código do país se necessário)
 */
function formatWhatsAppForLink(whatsapp: string): string {
  // Remove todos os caracteres não numéricos
  const cleaned = whatsapp.replace(/\D/g, '')
  
  // Se já começa com 55, retorna como está
  if (cleaned.startsWith('55')) {
    return cleaned
  }
  
  // Se não começa com 55, adiciona o código do país (assume Brasil)
  return `55${cleaned}`
}

/**
 * Cria link do WhatsApp com mensagem pré-formatada
 */
function createWhatsAppLink(whatsapp?: string, orderNumber?: string): string {
  // Se não tem WhatsApp configurado na loja, retorna vazio
  const storeWhatsApp = process.env.STORE_WHATSAPP
  if (!storeWhatsApp) {
    return ''
  }
  
  const formattedWhatsApp = formatWhatsAppForLink(storeWhatsApp)
  const message = orderNumber 
    ? `Olá! Tenho uma dúvida sobre o pedido #${orderNumber}.`
    : 'Olá! Tenho uma dúvida sobre meu pedido.'
  
  return `https://wa.me/${formattedWhatsApp}?text=${encodeURIComponent(message)}`
}

export async function sendOrderConfirmation({
  to,
  orderNumber,
  customerName,
  customerWhatsApp,
  items,
  receiptUrl,
  totalCents,
}: SendOrderConfirmationParams) {
  const totalFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalCents / 100)

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.productTitle}</strong> ${item.quantity > 1 ? `(x${item.quantity})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format((item.unitPriceCents * item.quantity) / 100)}
      </td>
    </tr>
    ${item.personalizationImageUrl ? `<tr><td colspan="2" style="padding: 10px; text-align: center;"><img src="${item.personalizationImageUrl}" alt="Personalização" style="max-width: 300px; border-radius: 8px;" /></td></tr>` : ''}
  `
    )
    .join('')

  const whatsAppLink = createWhatsAppLink(customerWhatsApp, orderNumber)
  const storeEmail = process.env.STORE_EMAIL || 'contato@loja.com'
  const storeWhatsAppDisplay = process.env.STORE_WHATSAPP_DISPLAY || process.env.STORE_WHATSAPP || '(XX) XXXXX-XXXX'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Pedido #${orderNumber}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #4F46E5;">
            <h1 style="color: #4F46E5; margin: 0;">✅ Pedido Confirmado!</h1>
          </div>
          
          <div style="padding: 20px 0;">
            <p>Olá, <strong>${customerName}</strong>!</p>
            
            <p>Seu pedido foi confirmado com sucesso e está sendo processado. Todas as informações estão abaixo:</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h2 style="margin-top: 0; color: #1f2937;">Pedido #${orderNumber}</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              ${itemsHtml}
              <tr>
                <td style="padding: 15px; font-weight: bold; font-size: 18px; border-top: 2px solid #1f2937; background-color: #ffffff;">
                  Total
                </td>
                <td style="padding: 15px; font-weight: bold; font-size: 18px; text-align: right; border-top: 2px solid #1f2937; background-color: #ffffff;">
                  ${totalFormatted}
                </td>
              </tr>
            </table>
          </div>
          
          ${receiptUrl ? `
          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="margin: 0;">
              <strong>Recibo de Pagamento:</strong><br>
              <a href="${receiptUrl}" style="color: #2563eb; text-decoration: none;">Clique aqui para ver o recibo do Stripe</a>
            </p>
          </div>
          ` : ''}
          
          <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #92400e;">📞 Precisa de Ajuda?</h3>
            <p style="margin-bottom: 10px; color: #78350f;">
              Se você tiver alguma dúvida sobre seu pedido, entre em contato conosco:
            </p>
            ${whatsAppLink ? `
            <p style="margin: 10px 0;">
              <strong>WhatsApp:</strong><br>
              <a href="${whatsAppLink}" style="display: inline-block; margin-top: 5px; padding: 10px 20px; background-color: #25D366; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">
                💬 Falar no WhatsApp (${storeWhatsAppDisplay})
              </a>
            </p>
            ` : ''}
            <p style="margin: 10px 0;">
              <strong>Email:</strong><br>
              <a href="mailto:${storeEmail}" style="color: #2563eb; text-decoration: none;">${storeEmail}</a>
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">
              Obrigado por sua compra! 🎉<br>
              Enviaremos atualizações sobre o status do seu pedido por email.
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  if (!resend) {
    throw new Error('Resend não está configurado. Verifique a variável RESEND_API_KEY no .env.local')
  }

  // Verificar se temos um domínio customizado configurado
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  
  try {
    console.log(`\n📨 [EMAIL] Iniciando envio de email`)
    console.log(`📨 [EMAIL] Para: ${to}`)
    console.log(`📨 [EMAIL] Pedido: #${orderNumber}`)
    console.log(`📨 [EMAIL] From: ${fromEmail}`)
    
    const { data, error } = await resend.emails.send({
      from: `E-commerce <${fromEmail}>`,
      to,
      subject: `Pedido #${orderNumber} Confirmado`,
      html,
    })

    if (error) {
      console.error('\n❌ [EMAIL] Erro retornado pela API Resend')
      console.error('❌ [EMAIL] Error object:', JSON.stringify(error, null, 2))
      console.error('❌ [EMAIL] Error type:', typeof error)
      
      // Mensagens de erro mais amigáveis baseadas no statusCode do Resend
      const errorMessage = error.message || (error as any).message || JSON.stringify(error)
      const statusCode = (error as any).statusCode
      
      if (statusCode === 403) {
        // Erro 403 geralmente significa que precisa verificar domínio ou está tentando enviar para email não autorizado
        if (errorMessage.toLowerCase().includes('testing emails') || errorMessage.toLowerCase().includes('own email')) {
          const errorMsg = `O Resend em modo de teste só permite enviar emails para o email cadastrado na sua conta. Para enviar para outros emails, você precisa verificar um domínio no Resend. Veja: https://resend.com/domains`
          console.error('❌ [EMAIL]', errorMsg)
          console.error('❌ [EMAIL] Email tentado:', to)
          throw new Error(errorMsg)
        } else {
          const errorMsg = 'Domínio não verificado no Resend. Configure um domínio em https://resend.com/domains e atualize RESEND_FROM_EMAIL no .env.local'
          console.error('❌ [EMAIL]', errorMsg)
          throw new Error(errorMsg)
        }
      }
      
      if (errorMessage?.toLowerCase().includes('domain') || errorMessage?.toLowerCase().includes('domain')) {
        const errorMsg = 'Domínio não verificado no Resend. Configure um domínio em https://resend.com/domains e atualize RESEND_FROM_EMAIL no .env.local'
        console.error('❌ [EMAIL]', errorMsg)
        throw new Error(errorMsg)
      }
      
      if (errorMessage?.toLowerCase().includes('api key') || errorMessage?.toLowerCase().includes('api')) {
        const errorMsg = 'Chave da API do Resend inválida. Verifique RESEND_API_KEY no .env.local'
        console.error('❌ [EMAIL]', errorMsg)
        throw new Error(errorMsg)
      }
      
      // Se for um objeto de erro do Resend, converter para Error
      throw new Error(errorMessage)
    }

    console.log('\n✅ [EMAIL] Email enviado com sucesso!')
    console.log('✅ [EMAIL] Data:', JSON.stringify(data, null, 2))
    return data
  } catch (error) {
    console.error('\n❌ [EMAIL] Exceção capturada ao enviar email')
    console.error('❌ [EMAIL] Error:', error)
    if (error instanceof Error) {
      console.error('❌ [EMAIL] Mensagem:', error.message)
      console.error('❌ [EMAIL] Stack:', error.stack)
      console.error('❌ [EMAIL] Name:', error.name)
    } else {
      console.error('❌ [EMAIL] Tipo:', typeof error)
      console.error('❌ [EMAIL] Valor:', JSON.stringify(error, null, 2))
    }
    throw error
  }
}
