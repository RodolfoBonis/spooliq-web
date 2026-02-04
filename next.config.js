/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'rb-cdn.rodolfodebonis.com.br', 'api.spooliq.com.br', 'api.spooliq.stg.rb.lab'],
  },
  // Disable automatic trailing slash redirect
  skipTrailingSlashRedirect: true,
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // Note: Next.js v16 no longer runs ESLint during builds
  // Run 'npm run lint' separately before building if needed
}

module.exports = nextConfig

