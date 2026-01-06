export interface Step {
  step: number
  icon: string
  title: string
  titleMobile?: string
  description: string
  descriptionMobile?: string
}

export const STEPS: Step[] = [
  {
    step: 1,
    icon: '/icons/step1.svg',
    title: 'Escolha no Catálogo',
    titleMobile: 'Escolha o Produto',
    description: 'Navegue por nossas categorias e selecione o produto base que atende sua necessidade.',
    descriptionMobile: 'Navegue por nossas categorias e selecione o produto que deseja.'
  },
  {
    step: 2,
    icon: '/icons/step2.svg',
    title: 'Defina os Detalhes',
    titleMobile: 'Defina os Detalhes',
    description: 'Selecione quantas unidades precisa e faça o upload do arquivo (logo ou desenho) que será gravado na peça.',
    descriptionMobile: 'Escolha a quantidade que precisa e faça o upload do arquivo que será gravado.'
  },
  {
    step: 3,
    icon: '/icons/step3.svg',
    title: 'Realize o Pagamento',
    titleMobile: 'Realize o Pagamento',
    description: 'Finalize seu pedido de forma segura diretamente pelo site para garantir sua reserva de produção.',
    descriptionMobile: 'Finalize seu pedido de forma segura diretamente pelo site para garantir sua produção.'
  },
  {
    step: 4,
    icon: '/icons/step4.svg',
    title: 'Pronto!',
    titleMobile: 'Pronto!',
    description: 'Aguarde nossa equipe entrar em contato. Vamos confirmar os detalhes da arte e garantir que tudo esteja perfeito antes de ligar as máquinas.',
    descriptionMobile: 'Nossa equipe entrará em contato para confirmar os detalhes antes da produção.'
  }
]

