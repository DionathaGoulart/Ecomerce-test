
import type { Metadata } from 'next'
import Footer from '@/components/store/Footer'

export const metadata: Metadata = {
    title: 'Política de Cookies | Mil Ideias',
    description: 'Política de Cookies da Mil Ideias – Cortes e Gravações.',
}

export default function CookiesPolicyPage() {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="hidden md:block h-60"></div>
            <div className="w-full pt-32 md:pt-0 pb-12 flex-1">
                <h1 className="text-[96px] font-bold text-white mb-8 leading-none">Política de Cookies</h1>

                <div className="space-y-8 text-white/80">
                    <section>
                        <p className="text-[16px] font-normal leading-relaxed">
                            A Mil Ideias – Cortes e Gravações, nome empresarial Fabiano Luis Contini, inscrita no CNPJ 31.377.960/0001-07, com sede em Garibaldi/RS, utiliza cookies e tecnologias semelhantes para melhorar a experiência do usuário, garantir o funcionamento adequado do site e oferecer conteúdos e anúncios relevantes. Ao continuar navegando em nosso site, você concorda com o uso de cookies conforme descrito nesta Política.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">1. O que são cookies?</h2>
                        <p className="text-[16px] font-normal">Cookies são pequenos arquivos de texto armazenados no dispositivo do usuário quando ele visita um site. Eles permitem reconhecer o navegador, lembrar preferências e coletar informações sobre a navegação. Os cookies não armazenam informações pessoais sensíveis, como senhas ou dados completos de cartão de crédito.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">2. Para que utilizamos cookies?</h2>
                        <p className="text-[16px] font-normal mb-4">Utilizamos cookies para as seguintes finalidades:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Garantir o funcionamento correto do site;</li>
                            <li>Lembrar preferências do usuário e dados de login;</li>
                            <li>Facilitar compras futuras;</li>
                            <li>Analisar desempenho, tráfego e comportamento de navegação;</li>
                            <li>Medir a eficácia de campanhas e anúncios;</li>
                            <li>Personalizar conteúdos e ações de marketing;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">3. Tipos de cookies utilizados</h2>

                        <div className="mb-4">
                            <h3 className="text-[16px] font-bold text-white mb-2">a) Cookies essenciais</h3>
                            <p className="text-[16px] font-normal">Necessários para o funcionamento do site e para que o usuário possa navegar e utilizar recursos básicos, como login, carrinho de compras e segurança.</p>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-[16px] font-bold text-white mb-2">b) Cookies de desempenho e análise</h3>
                            <p className="text-[16px] font-normal mb-2">Utilizados para coletar informações estatísticas sobre como os usuários utilizam o site, ajudando a melhorar funcionalidades e experiência. Exemplos:</p>
                            <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                                <li>Google Analytics;</li>
                                <li>Microsoft Clarity;</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[16px] font-bold text-white mb-2">c) Cookies de marketing e publicidade</h3>
                            <p className="text-[16px] font-normal mb-2">Utilizados para exibir anúncios mais relevantes ao usuário, medir campanhas e realizar ações de remarketing. Exemplos:</p>
                            <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                                <li>Meta Pixel;</li>
                                <li>Google Ads;</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">4. Cookies de terceiros</h2>
                        <p className="text-[16px] font-normal">Alguns cookies podem ser definidos por serviços de terceiros integrados ao site, como ferramentas de pagamento, análise ou publicidade. Esses cookies são regidos pelas políticas de privacidade dos respectivos fornecedores. A Mil Ideias – Cortes e Gravações não controla diretamente os cookies definidos por terceiros.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">5. Gerenciamento de cookies</h2>
                        <p className="text-[16px] font-normal mb-4">O usuário pode, a qualquer momento:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>Aceitar ou recusar cookies não essenciais;</li>
                            <li>Configurar seu navegador para bloquear ou alertar sobre o uso de cookies;</li>
                            <li>Excluir cookies armazenados no dispositivo;</li>
                        </ul>
                        <p className="text-[16px] font-normal mt-4">A desativação de cookies pode impactar o funcionamento de algumas funcionalidades do site.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">6. Base legal para o uso de cookies</h2>
                        <p className="text-[16px] font-normal mb-4">O uso de cookies é realizado com base:</p>
                        <ul className="list-disc pl-5 space-y-2 text-[16px] font-normal">
                            <li>No consentimento do usuário, quando aplicável;</li>
                            <li>No legítimo interesse, para cookies essenciais ao funcionamento do site;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">7. Alterações nesta Política</h2>
                        <p className="text-[16px] font-normal">Esta Política de Cookies pode ser atualizada a qualquer momento para refletir mudanças legais, técnicas ou operacionais. Recomendamos a revisão periódica deste documento.</p>
                    </section>

                    <section>
                        <h2 className="text-[16px] font-bold text-white mb-4">8. Contato</h2>
                        <p className="text-[16px] font-normal mb-4">Em caso de dúvidas sobre esta Política de Cookies, entre em contato:</p>
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
