'use client'

import Image from 'next/image'
import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  const email = 'milideiasgravacoes@gmail.com'
  const phone = '(54) 99985-1285'
  const address = 'R. Buarque de Macedo, 1432 - São Francisco, Garibaldi - RS, 95720-000'
  const cnpj = '10300135013050130'
  
  // Link para Google Maps
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  
  // Links das redes sociais
  const instagramUrl = 'https://www.instagram.com/milideiasgravacoes/'
  const whatsappMessage = encodeURIComponent('Olá! Gostaria de solicitar um orçamento.')
  const whatsappUrl = `https://wa.me/5554999851285?text=${whatsappMessage}`
  const facebookUrl = 'https://facebook.com' // Atualizar com o link real

  return (
    <footer className="w-full" style={{ backgroundColor: '#212121' }}>
      <div className="w-full max-w-full px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 3xl:px-40 2xl:px-96 py-8 pb-24 sm:pb-12 md:py-16">
        <div className="flex flex-col lg:flex-row justify-center lg:justify-between items-center lg:items-start gap-8 lg:gap-12">
          {/* Mobile: Ordem reorganizada */}
          <div className="flex flex-col items-center lg:items-start w-full lg:w-auto">
            {/* Logo */}
            <Link href="/" className="flex items-center mb-6">
              <Image
                src="/Logotipo.svg"
                alt="Logo"
                width={169}
                height={61}
                className="h-10 sm:h-12 md:h-14 w-auto"
                priority
              />
            </Link>
            
            {/* Telefone */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-primary-500 transition-colors mb-3 text-center lg:text-left"
              style={{ fontSize: '12px' }}
            >
              {phone}
            </a>
            
            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="text-white/80 hover:text-primary-500 transition-colors mb-3 text-center lg:text-left"
              style={{ fontSize: '12px' }}
            >
              {email}
            </a>
            
            {/* Endereço com link para Google Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-primary-500 transition-colors mb-6 text-center lg:text-left"
              style={{ fontSize: '12px' }}
            >
              {address}
            </a>
            
            {/* Redes Sociais */}
            <div className="flex items-center gap-4 mb-6">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-primary-500 transition-colors"
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
                className="text-white/80 hover:text-primary-500 transition-colors"
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
                className="text-white/80 hover:text-primary-500 transition-colors"
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
            
            {/* Desenvolvido por */}
            <div className="flex items-center gap-2">
              <span className="text-white/60" style={{ fontSize: '12px' }}>Desenvolvido por</span>
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

          {/* Desktop: Coluna Direita (oculta no mobile) */}
          <div className="hidden lg:flex flex-col pt-10 sm:pt-12 md:pt-14 items-start">
            {/* CNPJ */}
            <p className="text-white/80 mb-3" style={{ fontSize: '12px' }}>
              Mil ideias - {cnpj}
            </p>
            
            {/* Copyright */}
            <p className="text-white/60 mb-6" style={{ fontSize: '12px' }}>
              2025 © Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

