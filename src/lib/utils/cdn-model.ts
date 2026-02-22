/**
 * Converts a CDN file URL to the proxied Next.js API route
 */
export function getModelFileUrl(url?: string): string | undefined {
  if (!url) return undefined
  return `/api/cdn/model?url=${encodeURIComponent(url)}`
}

/**
 * Converts a CDN thumbnail URL to the proxied Next.js API route (image proxy)
 */
export function getModelThumbnailUrl(thumbnailUrl?: string): string | undefined {
  if (!thumbnailUrl) return undefined
  return `/api/cdn/image?url=${encodeURIComponent(thumbnailUrl)}`
}

/**
 * Formats file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Returns the display label for a 3D model format
 */
export function formatModelFormat(format: string): string {
  return format.replace('.', '').toUpperCase()
}
