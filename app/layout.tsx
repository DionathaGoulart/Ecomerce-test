import type { Metadata } from 'next'
import './globals.css'
import { supabaseAdmin } from '@/lib/supabase/admin'
import SEOHead from '@/components/SEOHead'

async function getSEOSettings() {
  try {
    const { data } = await supabaseAdmin
      .from('seo_settings')
      .select('*')
      .single()
    
    return data || {
      site_title: 'E-commerce Personalizados',
      site_description: 'Produtos personalizados com qualidade',
      google_analytics_id: null,
      google_tag_manager_id: null,
      facebook_pixel_id: null,
    }
  } catch (error) {
    console.error('Erro ao buscar configurações de SEO:', error)
    return {
      site_title: 'E-commerce Personalizados',
      site_description: 'Produtos personalizados com qualidade',
      google_analytics_id: null,
      google_tag_manager_id: null,
      facebook_pixel_id: null,
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEOSettings()
  
  const metadata: Metadata = {
    title: seo.site_title || 'E-commerce Personalizados',
    description: seo.site_description || 'Produtos personalizados com qualidade',
    icons: {
      icon: '/Logotipo.svg',
      shortcut: '/Logotipo.svg',
      apple: '/Logotipo.svg',
    },
    openGraph: {
      title: seo.og_title || seo.site_title || 'E-commerce Personalizados',
      description: seo.og_description || seo.site_description || 'Produtos personalizados com qualidade',
      type: 'website',
    },
    twitter: {
      card: seo.twitter_card === 'summary' ? 'summary' : 'summary_large_image',
      title: seo.twitter_title || seo.site_title || 'E-commerce Personalizados',
      description: seo.twitter_description || seo.site_description || 'Produtos personalizados com qualidade',
    },
  }

  // Adicionar keywords se existir
  if (seo.site_keywords) {
    metadata.keywords = seo.site_keywords.split(',').map((k: string) => k.trim())
  }

  // Adicionar OG image se existir
  if (seo.og_image_url) {
    metadata.openGraph!.images = [seo.og_image_url]
  }

  // Adicionar Twitter image se existir
  if (seo.twitter_image_url) {
    metadata.twitter!.images = [seo.twitter_image_url]
  }

  // Adicionar canonical URL se existir
  if (seo.canonical_url) {
    metadata.alternates = {
      canonical: seo.canonical_url,
    }
  }

  // Adicionar robots se existir
  if (seo.robots_txt) {
    metadata.robots = seo.robots_txt
  }

  return metadata
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const seo = await getSEOSettings()
  
  return (
    <html lang="pt-BR">
      <body>
        <SEOHead
          googleAnalyticsId={seo.google_analytics_id}
          googleTagManagerId={seo.google_tag_manager_id}
          facebookPixelId={seo.facebook_pixel_id}
        />
        {children}
      </body>
    </html>
  )
}
