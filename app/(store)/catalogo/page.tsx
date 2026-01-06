'use client'

import { CatalogSection } from '../sections'
import Footer from '@/components/store/Footer'

export default function CatalogoPage() {
  return (
    <>
      <div className="relative z-10 -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-24 xl:-mx-32 3xl:-mx-40 2xl:-mx-96 -mb-20 md:-mb-0">
        <div className="px-4 sm:px-6 md:px-12 lg:px-24 xl:px-32 3xl:px-40 2xl:px-96">
          <CatalogSection />
        </div>
        
        {/* Footer - fora do container com padding para ocupar toda a largura */}
        <div className="relative z-10">
          <Footer />
        </div>
      </div>
    </>
  )
}

