import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import UpdateOrderStatus from '@/components/admin/UpdateOrderStatus'
import PersonalizationImage from '@/components/admin/PersonalizationImage'
import WhatsAppButton from '@/components/admin/WhatsAppButton'

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
      customer:customers(*),
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

  const customer = order.customer as {
    name: string
    email: string
    cpf: string
    whatsapp?: string
    address?: {
      street: string
      number: string
      city: string
      state: string
      zipcode: string
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pedido #{order.order_number}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Criado em{' '}
            {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </div>
        <UpdateOrderStatus orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Informações do Cliente */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Informações do Cliente
              </h2>
              {customer.whatsapp && (
                <WhatsAppButton
                  phoneNumber={customer.whatsapp}
                  orderNumber={order.order_number}
                  customerName={customer.name}
                />
              )}
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Nome:</span> {customer.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {customer.email}
              </p>
              <p>
                <span className="font-medium">CPF:</span> {customer.cpf}
              </p>
              {customer.whatsapp && (
                <p>
                  <span className="font-medium">WhatsApp:</span>{' '}
                  {customer.whatsapp}
                </p>
              )}
              {customer.address && (
                <div className="mt-4">
                  <p className="font-medium">Endereço:</p>
                  <p className="text-sm text-gray-600">
                    {customer.address.street}, {customer.address.number}
                    <br />
                    {customer.address.city} - {customer.address.state}
                    <br />
                    CEP: {customer.address.zipcode}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
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
                    className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-0"
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
                      <h3 className="font-medium text-gray-900">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        Preço unitário: {formatCurrency(item.unit_price_cents)}
                      </p>
                      {(personalization?.imageUrl || personalization?.description) && (
                        <div className="mt-2 space-y-2">
                          {personalization?.imageUrl && (
                            <div>
                              <p className="text-sm font-medium text-gray-900">
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
                              <p className="text-sm font-medium text-gray-900">
                                Descrição da Personalização:
                              </p>
                              <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded border border-gray-200">
                                {personalization.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
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
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Resumo</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900">
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {order.receipt_url && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <a
                href={order.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Ver Recibo do Stripe →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
