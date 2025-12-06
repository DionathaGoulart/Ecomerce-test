export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  // Verificar se há session_id - se não houver, ainda mostrar a página de sucesso genérica
  // mas sem buscar dados do banco
  if (!sessionId) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-gray-900">
            Pedido Confirmado!
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            Seu pagamento foi processado com sucesso.
          </p>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Verifique seu email para ver todos os detalhes do pedido.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
          >
            Continuar Comprando
          </a>
        </div>
      </div>
    )
  }

  // Se houver session_id, apenas verificar se o pagamento foi processado
  // mas não mostrar dados sensíveis
  try {
    const { stripe } = await import('@/lib/stripe/server')
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verificar se o pagamento foi concluído
    if (session.payment_status === 'paid') {
      return (
        <div className="mx-auto max-w-2xl px-6 py-20 sm:px-8 lg:px-12">
          <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-gray-900">
              Pedido Confirmado!
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              Seu pagamento foi processado com sucesso.
            </p>
            <p className="text-gray-600 mb-2 leading-relaxed">
              Verifique seu email (<strong className="text-gray-900">{session.customer_email || 'o email informado no pedido'}</strong>) para ver todos os detalhes do pedido.
            </p>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              O email contém todas as informações, incluindo número do pedido, itens comprados e formas de contato.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
            >
              Continuar Comprando
            </a>
          </div>
        </div>
      )
    }
  } catch (error) {
    // Se houver erro, ainda mostrar mensagem de sucesso genérica
    console.error('Erro ao verificar sessão:', error)
  }

  // Fallback - sempre mostrar mensagem de sucesso
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-gray-900">
          Pedido Confirmado!
        </h1>
        <p className="text-lg text-gray-500 mb-6">
          Seu pagamento foi processado com sucesso.
        </p>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Verifique seu email para ver todos os detalhes do pedido.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-8 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
        >
          Continuar Comprando
        </a>
      </div>
    </div>
  )
}
