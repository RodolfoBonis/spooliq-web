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

/**
 * Generate CSS preview style for filament colors
 * @param colorType - Type of color (solid, gradient, duo, rainbow)
 * @param colorData - Color data object
 * @returns CSS properties for color preview
 */
export function getColorPreviewStyle(
  colorType: string,
  colorData: any
): React.CSSProperties {
  switch (colorType) {
    case 'solid':
      return {
        backgroundColor: colorData.color || '#000000',
      }
    case 'gradient':
      const colors = colorData.colors || []
      if (colors.length === 0) {
        return { backgroundColor: '#000000' }
      }
      const stops = colors.map((stop: any) => `${stop.color} ${stop.position}%`).join(', ')
      return {
        background: `linear-gradient(${colorData.direction || '90deg'}, ${stops})`,
      }
    case 'duo':
      const ratio = (colorData.ratio || 0.5) * 100
      const pattern = colorData.pattern || 'stripes'
      
      if (pattern === 'stripes') {
        return {
          background: `linear-gradient(90deg, ${colorData.primary || '#000000'} ${ratio}%, ${colorData.secondary || '#FFFFFF'} ${ratio}%)`,
        }
      } else if (pattern === 'spots') {
        return {
          background: `radial-gradient(circle, ${colorData.primary || '#000000'} 30%, ${colorData.secondary || '#FFFFFF'} 30%)`,
        }
      } else if (pattern === 'marbled') {
        return {
          background: `linear-gradient(45deg, ${colorData.primary || '#000000'} 0%, ${colorData.secondary || '#FFFFFF'} 25%, ${colorData.primary || '#000000'} 50%, ${colorData.secondary || '#FFFFFF'} 75%, ${colorData.primary || '#000000'} 100%)`,
        }
      } else {
        return {
          background: `linear-gradient(45deg, ${colorData.primary || '#000000'} ${ratio}%, ${colorData.secondary || '#FFFFFF'} ${ratio}%)`,
        }
      }
    case 'rainbow':
      return {
        background: `linear-gradient(${colorData.direction || '90deg'}, #ff0000 0%, #ff8000 8.33%, #ffff00 16.66%, #80ff00 25%, #00ff00 33.33%, #00ff80 41.66%, #00ffff 50%, #0080ff 58.33%, #0000ff 66.66%, #8000ff 75%, #ff00ff 83.33%, #ff0080 91.66%, #ff0000 100%)`,
      }
    default:
      return {
        backgroundColor: '#CCCCCC',
      }
  }
}

