import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function AdminDashboard() {
  // Usar supabaseAdmin para garantir acesso a todos os dados
  const { count: productsCount } = await supabaseAdmin
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: ordersCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: pendingOrdersCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const { count: paidOrdersCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')

  const { count: cancelledOrdersCount } = await supabaseAdmin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-600">Total de Produtos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {productsCount || 0}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-600">Total de Pedidos</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {ordersCount || 0}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-600">Pedidos Pendentes</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingOrdersCount || 0}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-600">Pedidos Pagos</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {paidOrdersCount || 0}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-600">Pedidos Cancelados</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {cancelledOrdersCount || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
