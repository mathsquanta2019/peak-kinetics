/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Spring Boot bundling, use regular Next.js build (standalone mode)
  
  trailingSlash: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  // This ensures Next.js assets are served from the correct path when bundled
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : undefined,
}

export default nextConfig
