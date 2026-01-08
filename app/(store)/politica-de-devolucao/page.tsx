
import type { Metadata } from 'next'
import Footer from '@/components/store/Footer'

export const metadata: Metadata = {
    title: 'Política de Devolução | Mil Ideias',
    description: 'Política de Troca, Devolução e Reembolso da Mil Ideias – Cortes e Gravações.',
}

export default function RefundPolicyPage() {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="hidden md:block h-60"></div>
            <div className="w-full pt-32 md:pt-0 pb-12 flex-1">
                <h1 className="text-[96px] font-bold text-white mb-8 leading-none">Política de Devolução</h1>

                <div className="space-y-8 text-white/80">
                    <section>
                        <p className="text-[16px] font-normal leading-relaxed">
                            A Mil Ideias – Cortes e Gravações, nome empresarial Fabiano Luis Contini, inscrita no CNPJ 31.377.960/0001-07, com sede em Garibaldi/RS, estabelece a presente Política de Troca, Devolução e Reembolso para garantir transparência e clareza nas relações com seus clientes. Ao efetuar uma compra em nosso site, o cliente declara estar ciente e de acordo com as condições descritas abaixo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">1. Produtos personalizados</h2>
                        <p className="text-[16px] font-normal mb-4">Consideram-se produtos personalizados todos aqueles produzidos sob demanda, de acordo com especificações fornecidas pelo cliente, incluindo, mas não se limitando a:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Inserção de logotipos, nomes, textos ou imagens;</li>
                            <li>Alterações de medidas, formatos ou gravações específicas;</li>
                            <li>Envio de artes próprias pelo cliente;</li>
                        </ul>
                        <p className="text-[16px] font-normal mt-4 mb-4">De acordo com o art. 49 do Código de Defesa do Consumidor, produtos personalizados não se enquadram no direito de arrependimento, não sendo passíveis de troca ou devolução por motivos como:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Arrependimento da compra;</li>
                            <li>Erro de digitação ou envio de arte pelo cliente;</li>
                            <li>Mudança de opinião após aprovação da personalização;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">2. Troca ou devolução por defeito ou erro de produção</h2>
                        <p className="text-[16px] font-normal mb-4">Será aceita a troca ou devolução de produtos personalizados apenas nos casos de:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Defeito de fabricação;</li>
                            <li>Erro na personalização quando a falha for de responsabilidade da Mil Ideias;</li>
                            <li>Produto entregue em desacordo com o pedido aprovado;</li>
                        </ul>
                        <p className="text-[16px] font-normal mt-4">Nessas situações, o cliente deverá entrar em contato em até 7 (sete) dias corridos após o recebimento do produto, por meio do e-mail: <a href="mailto:milideiasgravacoes@gmail.com" className="text-white hover:underline">milideiasgravacoes@gmail.com</a></p>
                        <p className="text-[16px] font-normal mt-4">O produto poderá ser solicitado para análise, devendo ser enviado sem sinais de uso indevido ou danos causados após o recebimento.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">3. Produtos não personalizados</h2>
                        <p className="text-[16px] font-normal mb-4">O cliente pode exercer o direito de arrependimento em até 7 (sete) dias corridos após o recebimento do produto, conforme previsto em lei, desde que:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>O produto esteja sem uso;</li>
                            <li>Em perfeitas condições;</li>
                            <li>Preferencialmente na embalagem original;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">4. Reembolso</h2>
                        <p className="text-[16px] font-normal mb-4">Após a análise e aprovação da devolução ou troca, o reembolso será realizado conforme a forma de pagamento utilizada:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Cartão de crédito: estorno solicitado junto à operadora, podendo ocorrer em até duas faturas subsequentes, conforme regras da administradora;</li>
                            <li>Pix ou boleto: reembolso via transferência bancária em até 10 (dez) dias úteis;</li>
                        </ul>
                        <p className="text-[16px] font-normal mt-4">O valor reembolsado corresponderá ao valor pago pelo produto, excluindo eventuais custos de envio, salvo nos casos em que o erro ou defeito seja de responsabilidade da Mil Ideias.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">5. Custos de envio</h2>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Em casos de defeito, erro de produção ou envio incorreto, os custos de frete serão de responsabilidade da Mil Ideias;</li>
                            <li>Em devoluções por arrependimento de produtos não personalizados, os custos de envio poderão ser de responsabilidade do cliente;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">6. Condições gerais</h2>
                        <p className="text-[16px] font-normal mb-4">Não serão aceitas trocas ou devoluções de produtos que:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Apresentem sinais de mau uso;</li>
                            <li>Tenham sido danificados após o recebimento;</li>
                            <li>Tenham sofrido alterações ou reparos por terceiros;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">7. Canais de atendimento</h2>
                        <p className="text-[16px] font-normal">Para solicitações de troca, devolução ou reembolso, o cliente deve entrar em contato pelo e-mail: <a href="mailto:milideiasgravacoes@gmail.com" className="text-white hover:underline">milideiasgravacoes@gmail.com</a></p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">8. Alterações nesta política</h2>
                        <p className="text-[16px] font-normal">A Mil Ideias reserva-se o direito de alterar esta Política de Troca, Devolução e Reembolso a qualquer momento, sem aviso prévio, sendo responsabilidade do cliente consultá-la antes de finalizar a compra.</p>
                    </section>
                </div>
            </div>
            <div className="-mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32 3xl:-mx-40 2xl:-mx-96 mt-auto -mb-20 md:mb-0">
                <Footer />
            </div>
        </div>
    )
}
