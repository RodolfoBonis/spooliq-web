/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: 'rb-cdn.rodolfodebonis.com.br' },
      { hostname: 'api.spooliq.com.br' },
      { hostname: 'api.spooliq.stg.rb.lab' },
    ],
  },
  // Disable automatic trailing slash redirect
  skipTrailingSlashRedirect: true,
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // ESLint runs separately via CI lint step
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

