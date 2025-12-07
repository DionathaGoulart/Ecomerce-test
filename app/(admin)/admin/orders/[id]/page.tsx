import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import UpdateOrderStatus from '@/components/admin/UpdateOrderStatus'
import PersonalizationImage from '@/components/admin/PersonalizationImage'
import InvoiceUploadForm from '@/components/admin/InvoiceUploadForm'

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  production: 'Em Produção',
  shipped: 'Saiu para Entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Usar supabaseAdmin para bypassar RLS e acessar qualquer pedido
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select(
      `
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Buscar perfil do usuário separadamente
  let profile: { id: string; email: string; full_name: string | null } | null = null
  if (order.user_id) {
    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', order.user_id)
      .single()
    
    profile = profileData
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Pedido #{order.order_number}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-white/70">
            Criado em{' '}
            {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Informações do Cliente */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white">
              Informações do Cliente
            </h2>
            <div className="space-y-2 text-sm sm:text-base text-white">
              <p>
                <span className="font-medium">Nome:</span>{' '}
                {profile?.full_name || 'Não informado'}
              </p>
              <p>
                <span className="font-medium">Email:</span> {profile?.email || '-'}
              </p>
              {order.delivery_address && (
                <div className="mt-4">
                  <p className="font-medium">Endereço de Entrega:</p>
                  <p className="text-xs sm:text-sm text-white/70">
                    {order.delivery_address.street}, {order.delivery_address.number}
                    {order.delivery_address.complement && ` - ${order.delivery_address.complement}`}
                    <br />
                    {order.delivery_address.city} - {order.delivery_address.state}
                    <br />
                    CEP: {order.delivery_address.zipcode}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white">
              Itens do Pedido
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {order.items?.map((item: any) => {
                const product = item.product as {
                  id: string
                  title: string
                  image_url?: string
                }
                const personalization = item.personalization as {
                  imageUrl?: string
                  description?: string
                } | null

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 border-b border-header-border pb-3 sm:pb-4 last:border-0"
                  >
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-white">
                        {product.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="text-xs sm:text-sm text-white/70">
                        Preço unitário: {formatCurrency(item.unit_price_cents)}
                      </p>
                      {(personalization?.imageUrl || personalization?.description) && (
                        <div className="mt-2 space-y-2">
                          {personalization?.imageUrl && (
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-white">
                                Imagem de Personalização:
                              </p>
                              <PersonalizationImage
                                imageUrl={personalization.imageUrl}
                                alt={`Personalização - ${product.title}`}
                              />
                            </div>
                          )}
                          {personalization?.description && (
                            <div>
                              <p className="text-xs sm:text-sm font-medium text-white">
                                Descrição da Personalização:
                              </p>
                              <p className="text-xs sm:text-sm text-white/70 mt-1 bg-white/5 p-2 sm:p-3 rounded border border-header-border">
                                {personalization.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-auto text-left sm:text-right">
                      <p className="text-sm sm:text-base font-medium text-white">
                        {formatCurrency(item.unit_price_cents * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="space-y-4 sm:space-y-6">
          <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white">Resumo</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-white/70">Status:</span>
                <span className="font-medium text-white">
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex justify-between border-t border-header-border pt-2">
                <span className="text-base sm:text-lg font-semibold text-white">Total:</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {formatCurrency(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {order.receipt_url && (
            <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
              <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-medium text-white">Recibo do Stripe</h3>
              <div className="space-y-2">
                <p className="text-xs text-white/70 mb-3">
                  Recibo oficial do pagamento processado pelo Stripe
                </p>
                <a
                  href={order.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary-500 hover:text-primary-400 transition-colors break-all underline"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Abrir Recibo do Stripe
                </a>
              </div>
            </div>
          )}

          {/* Upload de Nota Fiscal */}
          <div className="rounded-xl border border-header-border bg-header-bg p-4 sm:p-6">
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-medium text-white">Nota Fiscal</h3>
            {order.invoice_url ? (
              <div className="space-y-2">
                <a
                  href={order.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs sm:text-sm text-primary-500 hover:text-primary-400 transition-colors break-all"
                >
                  Ver Nota Fiscal →
                </a>
                <InvoiceUploadForm orderId={order.id} currentUrl={order.invoice_url} />
              </div>
            ) : (
              <InvoiceUploadForm orderId={order.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

