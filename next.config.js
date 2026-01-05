/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.stripe.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config) => {
    // Resolve o módulo Spline diretamente do arquivo dist para contornar problemas com exports field
    // Usa path.join para construir o caminho diretamente sem passar pelo sistema de resolução
    const path = require('path')
    config.resolve.alias = {
      ...config.resolve.alias,
      '@splinetool/react-spline/next': path.join(
        process.cwd(),
        'node_modules',
        '@splinetool',
        'react-spline',
        'dist',
        'react-spline-next.js'
      ),
    }
    return config
  },
}

module.exports = nextConfig
