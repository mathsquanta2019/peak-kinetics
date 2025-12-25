/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',   // 👈 THIS is missing

  trailingSlash: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true, // required for static export
  },
}

export default nextConfig
