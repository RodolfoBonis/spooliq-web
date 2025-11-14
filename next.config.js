/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'rb-cdn.rodolfodebonis.com.br', 'api.spooliq.rodolfodebonis.com.br', 'api.spooliq.stg.rodolfodebonis.com.br'],
  },
  // Disable automatic trailing slash redirect
  skipTrailingSlashRedirect: true,
  // Enable standalone output for Docker optimization
  output: 'standalone',
}

module.exports = nextConfig

