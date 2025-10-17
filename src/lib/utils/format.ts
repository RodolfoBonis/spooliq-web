import { format as dateFnsFormat } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Format currency from cents to BRL format
 * @param cents - Amount in cents (e.g., 10000 = R$ 100.00)
 * @returns Formatted currency string (e.g., "R$ 100,00")
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Format ISO date string to Brazilian format
 * @param isoString - ISO 8601 date string
 * @param formatStr - Date format pattern (default: "d 'de' MMMM 'de' yyyy")
 * @returns Formatted date string
 */
export function formatDate(
  isoString: string,
  formatStr: string = "d 'de' MMMM 'de' yyyy"
): string {
  return dateFnsFormat(new Date(isoString), formatStr, { locale: ptBR })
}

/**
 * Format print time to human-readable format
 * @param hours - Number of hours
 * @param minutes - Number of minutes
 * @returns Formatted time string (e.g., "5h30m" or "45m")
 */
export function formatTime(hours: number, minutes: number): string {
  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h${minutes}m`
}

/**
 * Get initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

