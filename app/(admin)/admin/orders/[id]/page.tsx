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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Pedido #{order.order_number}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Criado em{' '}
            {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </div>
        <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Informações do Cliente */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-header-border bg-header-bg p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Informações do Cliente
            </h2>
            <div className="space-y-2 text-white">
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
                  <p className="text-sm text-white/70">
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
          <div className="rounded-xl border border-header-border bg-header-bg p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">
              Itens do Pedido
            </h2>
            <div className="space-y-4">
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
                    className="flex items-start gap-4 border-b border-header-border pb-4 last:border-0"
                  >
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-white">
                        {product.title}
                      </h3>
                      <p className="text-sm text-white/70">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="text-sm text-white/70">
                        Preço unitário: {formatCurrency(item.unit_price_cents)}
                      </p>
                      {(personalization?.imageUrl || personalization?.description) && (
                        <div className="mt-2 space-y-2">
                          {personalization?.imageUrl && (
                            <div>
                              <p className="text-sm font-medium text-white">
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
                              <p className="text-sm font-medium text-white">
                                Descrição da Personalização:
                              </p>
                              <p className="text-sm text-white/70 mt-1 bg-white/5 p-3 rounded border border-header-border">
                                {personalization.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">
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
        <div className="space-y-6">
          <div className="rounded-xl border border-header-border bg-header-bg p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Resumo</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">Status:</span>
                <span className="font-medium text-white">
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex justify-between border-t border-header-border pt-2">
                <span className="text-lg font-semibold text-white">Total:</span>
                <span className="text-lg font-bold text-white">
                  {formatCurrency(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {order.receipt_url && (
            <div className="rounded-xl border border-header-border bg-header-bg p-6">
              <h3 className="mb-2 text-sm font-medium text-white">Recibo</h3>
              <a
                href={order.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:text-primary-400 transition-colors"
              >
                Ver Recibo do Stripe →
              </a>
            </div>
          )}

          {/* Upload de Nota Fiscal */}
          <div className="rounded-xl border border-header-border bg-header-bg p-6">
            <h3 className="mb-4 text-sm font-medium text-white">Nota Fiscal</h3>
            {order.invoice_url ? (
              <div className="space-y-2">
                <a
                  href={order.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-primary-500 hover:text-primary-400 transition-colors"
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

