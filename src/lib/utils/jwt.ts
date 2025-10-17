import type { User } from '@/types/models'

/**
 * Decode JWT token and extract user information
 * Note: This is a simple base64 decode, NOT validation
 * The backend is responsible for validating the token
 */
export function decodeJWT(token: string): User | null {
  try {
    // Split the token into parts
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('Invalid JWT format')
      return null
    }

    // Decode the payload (second part)
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const decoded = JSON.parse(jsonPayload)

    // Extract user information from JWT payload
    const user: User = {
      id: decoded.sub || '', // sub is the user ID
      email: decoded.email || '',
      name: decoded.name || '',
      organization_id: decoded.organization_id || '',
      roles: decoded.realm_access?.roles || [],
      created_at: new Date(decoded.iat * 1000).toISOString(), // iat is issued at timestamp
      updated_at: new Date(decoded.iat * 1000).toISOString(),
    }

    return user
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const decoded = JSON.parse(jsonPayload)
    const exp = decoded.exp

    if (!exp) return true

    // Check if token is expired (with 30 second buffer)
    return Date.now() >= exp * 1000 - 30000
  } catch (error) {
    return true
  }
}

