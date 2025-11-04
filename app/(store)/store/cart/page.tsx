import CartCheckoutForm from '@/components/store/CartCheckoutForm'

export default function CartPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          Carrinho de Compras
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          Revise seus itens antes de finalizar o pedido
        </p>
      </div>
      <CartCheckoutForm />
    </div>
  )
}
