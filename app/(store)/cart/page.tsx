import CartCheckoutForm from '@/components/store/CartCheckoutForm'

export default function CartPage() {
  return (
    <div className="w-full max-w-6xl mx-auto pt-24 sm:pt-32 md:pt-36 lg:pt-40 xl:pt-44 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
          Carrinho de Compras
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-neutral-400">
          Revise seus itens antes de finalizar o pedido
        </p>
      </div>
      <CartCheckoutForm />
    </div>
  )
}

