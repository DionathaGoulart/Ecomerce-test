import ShippingConfigForm from '@/components/admin/ShippingConfigForm'

export default function NewShippingConfigPage() {
  return (
    <div>
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl font-bold text-white">
        Nova Configuração de Frete
      </h1>
      <ShippingConfigForm />
    </div>
  )
}

