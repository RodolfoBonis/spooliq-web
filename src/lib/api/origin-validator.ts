import { NextRequest, NextResponse } from 'next/server'

// Allowed origins for production environments
export const ALLOWED_ORIGINS = [
  'https://spooliq.com',
  'https://spooliq.stg.rb.lab',
  'http://localhost:3000',
  'http://localhost:3001',
]

/**
 * Validates that the request comes from an allowed origin
 * Only enforced in production environments
 *
 * @param request - The incoming Next.js request
 * @returns true if origin is allowed or in development, false otherwise
 */
export function validateOrigin(request: NextRequest): boolean {
  // Skip validation in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Check origin header first
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return true
  }

  // Fallback to referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`
      if (ALLOWED_ORIGINS.includes(refererOrigin)) {
        return true
      }
    } catch {
      // Invalid referer URL
      return false
    }
  }

  return false
}

/**
 * Returns an unauthorized response when origin validation fails
 */
export function unauthorizedOriginResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized origin' },
    { status: 403 }
  )
}
