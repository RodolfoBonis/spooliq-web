/**
 * Builds the authenticated, org-scoped URL that streams a 3D model's binary file
 * through the Next.js proxy (`/api/models3d/:id/file` → backend `GET /v1/models3d/:id/file`).
 */
export function getModelFileUrl(id: string): string {
  return `/api/models3d/${id}/file`
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
