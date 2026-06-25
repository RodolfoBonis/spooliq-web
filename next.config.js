/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'localhost' },
      { hostname: 'assets.spooliq.com' },
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


// cdn migration: images served by the public cdn edge (assets.spooliq.com)
