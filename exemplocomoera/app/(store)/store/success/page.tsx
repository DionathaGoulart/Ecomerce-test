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
      <div className="w-full max-w-2xl mx-auto pt-24 sm:pt-32 md:pt-36 lg:pt-40 xl:pt-44 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
        <div className="rounded-2xl border border-header-border bg-header-bg p-8 sm:p-12 text-center">
          <div className="mb-6 inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-success-500/20 border border-success-500/30">
            <svg className="h-8 w-8 sm:h-10 sm:w-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Pedido Confirmado!
          </h1>
          <p className="text-base sm:text-lg text-primary-500 mb-6">
            Seu pagamento foi processado com sucesso.
          </p>
          <p className="text-sm sm:text-base text-neutral-400 mb-8 leading-relaxed">
            Verifique seu email para ver todos os detalhes do pedido.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium text-neutral-950 hover:opacity-90 transition-opacity"
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
        <div className="w-full max-w-2xl mx-auto pt-24 sm:pt-32 md:pt-36 lg:pt-40 xl:pt-44 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
          <div className="rounded-2xl border border-header-border bg-header-bg p-8 sm:p-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-success-500/20 border border-success-500/30">
              <svg className="h-8 w-8 sm:h-10 sm:w-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              Pedido Confirmado!
            </h1>
            <p className="text-base sm:text-lg text-primary-500 mb-6">
              Seu pagamento foi processado com sucesso.
            </p>
            <p className="text-sm sm:text-base text-neutral-400 mb-2 leading-relaxed">
              Verifique seu email (<strong className="text-white">{session.customer_email || 'o email informado no pedido'}</strong>) para ver todos os detalhes do pedido.
            </p>
            <p className="text-xs sm:text-sm text-neutral-500 mb-8 leading-relaxed">
              O email contém todas as informações, incluindo número do pedido, itens comprados e formas de contato.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium text-neutral-950 hover:opacity-90 transition-opacity"
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
    <div className="w-full max-w-2xl mx-auto pt-24 sm:pt-32 md:pt-36 lg:pt-40 xl:pt-44 pb-12 sm:pb-16 md:pb-20 px-4 sm:px-6">
      <div className="rounded-2xl border border-header-border bg-header-bg p-8 sm:p-12 text-center">
        <div className="mb-6 inline-flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-success-500/20 border border-success-500/30">
          <svg className="h-8 w-8 sm:h-10 sm:w-10 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Pedido Confirmado!
        </h1>
        <p className="text-base sm:text-lg text-primary-500 mb-6">
          Seu pagamento foi processado com sucesso.
        </p>
        <p className="text-sm sm:text-base text-neutral-400 mb-8 leading-relaxed">
          Verifique seu email para ver todos os detalhes do pedido.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-primary-500 px-6 sm:px-8 py-3 text-sm sm:text-base font-medium text-neutral-950 hover:opacity-90 transition-opacity"
        >
          Continuar Comprando
        </a>
      </div>
    </div>
  )
}
