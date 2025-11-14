/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'rb-cdn.rodolfodebonis.com.br', 'api.spooliq.rodolfodebonis.com.br', 'api.spooliq.stg.rodolfodebonis.com.br'],
  },
  // Disable automatic trailing slash redirect
  skipTrailingSlashRedirect: true,
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // ESLint configuration for build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

