'use client'

import { useState } from 'react'
import Image from 'next/image'
import ImageModal from './ImageModal'

interface PersonalizationImageProps {
  imageUrl: string
  alt?: string
}

export default function PersonalizationImage({
  imageUrl,
  alt = 'Personalização',
}: PersonalizationImageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleImageClick = () => {
    console.log('Imagem clicada, abrindo modal...')
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="relative group cursor-pointer inline-block">
        <div className="relative overflow-hidden rounded-md border border-gray-300 mt-2">
          <div
            onClick={handleImageClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleImageClick()
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Clique para ampliar imagem"
            className="cursor-pointer"
          >
            <Image
              src={imageUrl}
              alt={alt}
              width={128}
              height={128}
              className="h-32 w-32 rounded object-cover transition-transform duration-300 group-hover:scale-105 block"
              unoptimized
            />
          </div>
          {/* Overlay no hover - mesmo tamanho da imagem */}
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all duration-300 pointer-events-none">
            <svg
              className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-center">Clique para ampliar</p>
      </div>
      {isModalOpen && (
        <ImageModal
          imageUrl={imageUrl}
          onClose={() => {
            console.log('Fechando modal...')
            setIsModalOpen(false)
          }}
          alt={alt}
        />
      )}
    </>
  )
}
