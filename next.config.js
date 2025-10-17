/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Disable automatic trailing slash redirect
  skipTrailingSlashRedirect: true,
}

module.exports = nextConfig

