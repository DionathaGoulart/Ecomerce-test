
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Política de Privacidade | Mil Ideias',
    description: 'Política de Privacidade e proteção de dados da Mil Ideias – Cortes e Gravações.',
}

import Footer from '@/components/store/Footer'

export default function PrivacyPolicyPage() {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="hidden md:block h-60"></div>
            <div className="w-full pt-32 md:pt-0 pb-12 flex-1">
                <h1 className="text-[96px] font-bold text-white mb-8 leading-none">Política de Privacidade</h1>

                <div className="space-y-8 text-white/80">
                    <section>
                        <p className="text-[16px] font-normal leading-relaxed">
                            A Mil Ideias – Cortes e Gravações, nome empresarial Fabiano Luis Contini, inscrita no CNPJ sob nº 31.377.960/0001-07, com sede em Garibaldi/RS, valoriza a privacidade e a proteção dos dados pessoais de seus usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos as informações fornecidas pelos usuários ao acessar nosso site e utilizar nossos serviços. Ao utilizar nosso site, você declara estar ciente e de acordo com os termos desta Política.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">1. Dados pessoais coletados</h2>
                        <p className="text-[16px] font-normal mb-4">Podemos coletar as seguintes informações, de acordo com a interação do usuário com o site:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Nome completo;</li>
                            <li>Endereço de e-mail;</li>
                            <li>Número de telefone;</li>
                            <li>Endereço para faturamento e entrega;</li>
                            <li>Dados necessários para login (incluindo login via Google);</li>
                            <li>Informações relacionadas a pedidos e personalizações enviadas pelo usuário;</li>
                            <li>Dados de pagamento (processados por terceiros, sem armazenamento de dados de cartão);</li>
                            <li>Endereço IP, tipo de navegador, dispositivo, páginas acessadas;</li>
                            <li>Cookies e tecnologias similares;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">2. Forma de coleta dos dados</h2>
                        <p className="text-[16px] font-normal mb-4">Os dados podem ser coletados por meio de:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Cadastro e login no site;</li>
                            <li>Finalização de compras no e-commerce;</li>
                            <li>Envio de artes para personalização de produtos;</li>
                            <li>Solicitações de orçamento via botões de contato (ex.: WhatsApp);</li>
                            <li>Cookies e ferramentas de análise e marketing;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">3. Finalidade do uso dos dados</h2>
                        <p className="text-[16px] font-normal mb-4">Os dados pessoais coletados são utilizados para:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Identificação e autenticação do usuário;</li>
                            <li>Processamento de pedidos e pagamentos;</li>
                            <li>Personalização de produtos conforme solicitação do cliente;</li>
                            <li>Facilitar compras futuras, evitando a necessidade de novo preenchimento de dados;</li>
                            <li>Comunicação com o usuário sobre pedidos, orçamentos e atendimento;</li>
                            <li>Melhoria da experiência do usuário no site;</li>
                            <li>Análise de desempenho, tráfego e comportamento de navegação;</li>
                            <li>Ações de marketing, anúncios e remarketing;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">4. Compartilhamento de dados com terceiros</h2>
                        <p className="text-[16px] font-normal mb-4">Os dados podem ser compartilhados apenas quando necessário, com parceiros e serviços essenciais para o funcionamento do site, como:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Stripe: processamento de pagamentos (não armazenamos dados de cartão de crédito);</li>
                            <li>Ferramentas de análise e marketing, como: Google Analytics; Google Ads; Meta Pixel; Microsoft Clarity;</li>
                            <li>Serviços de hospedagem e infraestrutura do site;</li>
                        </ul>
                        <p className="text-[16px] font-normal mt-4">Esses terceiros possuem suas próprias políticas de privacidade e são responsáveis pelo tratamento adequado das informações conforme a legislação vigente.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">5. Uso de cookies</h2>
                        <p className="text-[16px] font-normal mb-4">Utilizamos cookies para:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Garantir o funcionamento adequado do site;</li>
                            <li>Lembrar preferências do usuário;</li>
                            <li>Analisar métricas de acesso e navegação;</li>
                            <li>Personalizar anúncios e campanhas de marketing;</li>
                        </ul>
                        <p className="text-[16px] font-normal mt-4">O usuário pode, a qualquer momento, configurar seu navegador para bloquear ou alertar sobre o uso de cookies, ciente de que algumas funcionalidades do site podem ser afetadas.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">6. Armazenamento e segurança dos dados</h2>
                        <p className="text-[16px] font-normal leading-relaxed">
                            Os dados pessoais são armazenados em ambiente seguro e protegidos por medidas técnicas e organizacionais adequadas para evitar acessos não autorizados, vazamentos ou uso indevido. Os dados são armazenados por tempo indeterminado, enquanto forem necessários para cumprir as finalidades descritas nesta Política, obrigações legais ou até que o usuário solicite sua exclusão, quando aplicável. Eventualmente, dados podem ser removidos por motivos técnicos, como limitação de armazenamento ou manutenção de servidores.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">7. Direitos do titular dos dados</h2>
                        <p className="text-[16px] font-normal mb-4">De acordo com a LGPD, o usuário pode solicitar, a qualquer momento:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Confirmação da existência de tratamento de dados;</li>
                            <li>Acesso aos seus dados pessoais;</li>
                            <li>Correção de dados incompletos ou desatualizados;</li>
                            <li>Exclusão de dados pessoais, quando permitido por lei;</li>
                        </ul>
                        <p className="text-[16px] font-normal mt-4">As solicitações podem ser feitas pelo e-mail: <a href="mailto:milideiasgravacoes@gmail.com" className="text-white hover:underline">milideiasgravacoes@gmail.com</a></p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">8. Público atendido</h2>
                        <p className="text-[16px] font-normal">Os serviços são destinados a empresas e pessoas físicas, não havendo exigência de pedido mínimo. O site não é direcionado a menores de idade.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">9. Alterações nesta Política</h2>
                        <p className="text-[16px] font-normal">Esta Política de Privacidade pode ser atualizada a qualquer momento para refletir mudanças legais, técnicas ou operacionais. Recomendamos que o usuário revise este documento periodicamente.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">10. Contato</h2>
                        <p className="text-[16px] font-normal mb-4">Em caso de dúvidas sobre esta Política de Privacidade ou sobre o tratamento de dados pessoais, entre em contato:</p>
                        <p className="text-[16px] font-normal mt-2">
                            <strong>Mil Ideias – Cortes e Gravações</strong><br />
                            CNPJ: 31.377.960/0001-07<br />
                            Garibaldi/RS – Brasil<br />
                            <a href="mailto:milideiasgravacoes@gmail.com" className="text-white hover:underline">milideiasgravacoes@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
            <div className="-mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32 3xl:-mx-40 2xl:-mx-96 mt-auto -mb-20 md:mb-0">
                <Footer />
            </div>
        </div>
    )
}
