
import type { Metadata } from 'next'
import Footer from '@/components/store/Footer'

export const metadata: Metadata = {
    title: 'Termos de Uso | Mil Ideias',
    description: 'Termos de Uso e condições da Mil Ideias – Cortes e Gravações.',
}

export default function TermsOfUsePage() {
    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="hidden md:block h-60"></div>
            <div className="w-full pt-32 md:pt-0 pb-12 flex-1">
                <h1 className="text-8xl font-bold text-white mb-8 leading-none">Termos de Uso</h1>

                <div className="space-y-8 text-white/80">
                    <section>
                        <p className="text-base font-normal leading-relaxed">
                            Bem-vindo ao site da Mil Ideias – Cortes e Gravações, nome empresarial Fabiano Luis Contini, inscrita no CNPJ 31.377.960/0001-07, com sede em Garibaldi/RS. Ao acessar, navegar ou utilizar este site, o usuário declara que leu, compreendeu e concorda integralmente com os termos e condições descritos nesta Política de Uso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">1. Aceitação dos termos</h2>
                        <p className="text-base font-normal">O uso deste site está condicionado à aceitação plena e sem reservas destes Termos de Uso, bem como das demais políticas aplicáveis, incluindo Política de Privacidade, Política de Cookies e Política de Troca, Devolução e Reembolso. Caso o usuário não concorde com qualquer condição aqui descrita, recomenda-se que não utilize o site.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">2. Finalidade do site</h2>
                        <p className="text-base font-normal mb-4">O site tem como finalidade:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base font-normal">
                            <li>Apresentar e comercializar produtos em MDF;</li>
                            <li>Permitir a personalização de produtos conforme especificações do cliente;</li>
                            <li>Possibilitar o envio de artes, logotipos, textos ou imagens para gravação;</li>
                            <li>Facilitar solicitações de orçamento para projetos específicos, inclusive via WhatsApp;</li>
                        </ul>
                        <p className="text-base font-normal mt-4">Todos os produtos são produzidos sob demanda, conforme as informações fornecidas pelo usuário.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">3. Cadastro e responsabilidade do usuário</h2>
                        <p className="text-base font-normal mb-4">Para realizar compras ou acessar determinadas funcionalidades, o usuário poderá criar uma conta ou utilizar login por terceiros (ex.: Google).</p>
                        <p className="text-base font-normal mb-4">O usuário é responsável por:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base font-normal">
                            <li>Fornecer informações verdadeiras, completas e atualizadas;</li>
                            <li>Manter a confidencialidade de seus dados de acesso;</li>
                            <li>Todas as ações realizadas em sua conta;</li>
                        </ul>
                        <p className="text-base font-normal mt-4">A Mil Ideias não se responsabiliza por acessos indevidos decorrentes de negligência do usuário.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">4. Envio de conteúdos e artes para personalização</h2>
                        <p className="text-base font-normal mb-4">Ao enviar qualquer arte, imagem, logotipo, texto ou material para personalização, o usuário declara que:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base font-normal">
                            <li>Possui os direitos de uso, reprodução e autorização sobre o conteúdo enviado;</li>
                            <li>O conteúdo não viola direitos autorais, marcas, imagem ou qualquer legislação vigente;</li>
                        </ul>
                        <p className="text-base font-normal mt-4">A Mil Ideias não realiza verificação jurídica do material enviado e não se responsabiliza por eventuais infrações cometidas pelo usuário.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">5. Propriedade intelectual</h2>
                        <p className="text-base font-normal">Todo o conteúdo presente no site, incluindo textos, imagens, layouts, logotipos, marcas, elementos gráficos e identidade visual, é de propriedade da Mil Ideias – Cortes e Gravações, salvo quando indicado o contrário. É proibida a reprodução, distribuição, modificação ou uso do conteúdo sem autorização prévia e expressa.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">6. Pagamentos e preços</h2>
                        <p className="text-base font-normal">Os preços, condições de pagamento e prazos informados no site podem ser alterados a qualquer momento, sem aviso prévio. Os pagamentos são processados por plataformas terceiras, como o Stripe, não sendo armazenados dados sensíveis de cartão de crédito pela Mil Ideias.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">7. Limitação de responsabilidade</h2>
                        <p className="text-base font-normal mb-4">A Mil Ideias não se responsabiliza por:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base font-normal">
                            <li>Erros no envio de informações, artes ou dados fornecidos pelo usuário;</li>
                            <li>Interrupções temporárias do site por manutenção ou falhas técnicas;</li>
                            <li>Expectativas subjetivas do cliente quanto ao resultado final do produto, desde que esteja conforme o aprovado;</li>
                            <li>Conteúdos enviados por terceiros ou acessados por links externos;</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">8. Uso adequado do site</h2>
                        <p className="text-base font-normal mb-4">O usuário compromete-se a não utilizar o site para:</p>
                        <ul className="list-disc pl-5 space-y-2 text-base font-normal">
                            <li>Práticas ilegais ou contrárias à legislação vigente;</li>
                            <li>Envio de conteúdos ofensivos, discriminatórios ou ilícitos;</li>
                            <li>Tentativas de invasão, violação de segurança ou coleta indevida de dados;</li>
                        </ul>
                        <p className="text-base font-normal mt-4">O descumprimento destas regras poderá resultar na suspensão ou bloqueio de acesso, sem prejuízo de medidas legais cabíveis.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">9. Comunicação</h2>
                        <p className="text-base font-normal">O usuário autoriza o envio de comunicações relacionadas a pedidos, atendimento e informações operacionais. Comunicações de marketing poderão ser enviadas conforme previsto na Política de Privacidade.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">10. Alterações dos termos</h2>
                        <p className="text-base font-normal">A Mil Ideias reserva-se o direito de modificar estes Termos de Uso a qualquer momento, sendo responsabilidade do usuário consultá-los periodicamente.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">11. Legislação aplicável e foro</h2>
                        <p className="text-base font-normal">Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de Garibaldi/RS para dirimir eventuais controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.</p>
                    </section>

                    <section>
                        <h2 className="text-base font-bold text-white mb-4">12. Contato</h2>
                        <p className="text-base font-normal mb-4">Em caso de dúvidas sobre esta Política de Uso, entre em contato:</p>
                        <p className="text-base font-normal mt-2">
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
