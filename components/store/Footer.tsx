'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  const email = 'milideiasgravacoes@gmail.com'
  const phone = '(54) 99985-1285'
  const address = 'R. Buarque de Macedo, 1432 - São Francisco, Garibaldi/RS'
  
  // Link para Google Maps
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  
  // Links das redes sociais
  const instagramUrl = 'https://www.instagram.com/milideiasgravacoes/'
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de solicitar um orçamento.')
  const whatsappUrl = `https://wa.me/5554999851285?text=${whatsappMessage}`
  const facebookUrl = 'https://facebook.com' // Atualizar com o link real

  return (
    <footer className="w-full bg-header">
      <div className="w-full max-w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 3xl:px-40 2xl:px-96 py-8 pb-24 sm:pb-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[248px]">
          {/* Coluna 1: Contato */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white/70 font-semibold mb-8 text-[16px]">Contato</h3>
            
            {/* Telefone */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-primary-500 transition-colors mb-3 text-center md:text-left text-[12px]"
            >
              {phone}
            </a>
            
            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="text-white/70 hover:text-primary-500 transition-colors mb-3 text-center md:text-left text-[12px]"
            >
              {email}
            </a>
            
            {/* Endereço com link para Google Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-primary-500 transition-colors mb-4 text-center md:text-left text-[12px] whitespace-nowrap"
            >
              {address}
            </a>
            
            {/* Redes Sociais */}
            <div className="flex items-center gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <Image
                  src="/icons/insta.svg"
                  alt="Instagram"
                  width={20}
                  height={20}
                  className="h-4 w-4"
                />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-primary-500 transition-colors"
                aria-label="WhatsApp"
              >
                <Image
                  src="/icons/zap.svg"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="h-4 w-4"
                />
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <Image
                  src="/icons/face.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                  className="h-4 w-4"
                />
              </a>
            </div>
          </div>

          {/* Coluna 2: Política e Termos */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white/70 font-semibold mb-8 text-[16px]">Política e Termos</h3>
            
            <Link
              href="/politica-de-privacidade"
              className="text-white/70 hover:text-primary-500 transition-colors mb-3 text-center md:text-left text-[12px]"
            >
              Política de Privacidade
            </Link>
            
            <Link
              href="/politica-de-devolucao"
              className="text-white/70 hover:text-primary-500 transition-colors mb-3 text-center md:text-left text-[12px]"
            >
              Política de Devolução
            </Link>
            
            <Link
              href="/politica-de-cookies"
              className="text-white/70 hover:text-primary-500 transition-colors mb-3 text-center md:text-left text-[12px]"
            >
              Política de Cookies
            </Link>
            
            <Link
              href="/termos-de-uso"
              className="text-white/70 hover:text-primary-500 transition-colors text-center md:text-left text-[12px]"
            >
              Termos de Uso
            </Link>
          </div>

          {/* Coluna 3: Informações */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white/70 font-semibold mb-8 text-[16px]">Informações</h3>
            
            <p className="text-white/70 mb-3 text-center md:text-left text-[12px]">
              Fabiano Luis Contini
            </p>
            
            <p className="text-white/70 mb-3 text-center md:text-left text-[12px]">
              31.377.960/0001-07
            </p>
            
            <p className="text-white/70 mb-4 text-center md:text-left text-[12px]">
              2026 © Todos os direitos reservados
            </p>
            
            {/* Desenvolvido por */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-[12px]">Desenvolvido por</span>
              <a
                href="https://containner.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/containnerlogo.svg"
                  alt="Container Logo"
                  width={96}
                  height={14}
                  className="h-4 w-auto"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

