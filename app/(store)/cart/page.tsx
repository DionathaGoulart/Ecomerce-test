import CartCheckoutForm from '@/components/store/CartCheckoutForm'

export default function CartPage() {
  return (
    <div className="w-full max-w-6xl mx-auto pt-32 sm:pt-36 md:pt-40 lg:pt-44 pb-16 sm:pb-20">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Carrinho de Compras
        </h1>
        <p className="mt-3 text-base sm:text-lg text-neutral-400">
          Revise seus itens antes de finalizar o pedido
        </p>
      </div>
      <CartCheckoutForm />
    </div>
  )
}

