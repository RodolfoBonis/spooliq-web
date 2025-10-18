import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { ColorData, ColorType } from '@/types/models'

/**
 * Format cents to BRL currency
 * @param cents Amount in cents (e.g., 10000 = R$ 100,00)
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Format ISO 8601 date to Brazilian format
 * @param isoDate ISO 8601 date string
 * @param formatStr date-fns format string (default: "d 'de' MMMM 'de' yyyy")
 */
export function formatDate(isoDate: string, formatStr = "d 'de' MMMM 'de' yyyy"): string {
  return format(new Date(isoDate), formatStr, { locale: ptBR })
}

/**
 * Format ISO 8601 date to short Brazilian format
 * @param isoDate ISO 8601 date string
 */
export function formatDateShort(isoDate: string): string {
  return format(new Date(isoDate), 'dd/MM/yyyy', { locale: ptBR })
}

/**
 * Format time (hours and minutes) to display string
 * @param hours Number of hours
 * @param minutes Number of minutes
 * @returns Formatted time string (e.g., "5h30m" or "45m")
 */
export function formatTime(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) {
    return '0m'
  }
  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h${minutes}m`
}

/**
 * Format weight in grams to kg with proper unit
 * @param grams Weight in grams
 */
export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`
  }
  return `${grams.toFixed(0)}g`
}

/**
 * Get CSS style for color preview
 */
export function getColorPreviewStyle(colorType: ColorType, colorData: ColorData): React.CSSProperties {
  switch (colorType) {
    case 'solid':
      return {
        background: colorData.color || '#cccccc',
      }

    case 'gradient':
      if (colorData.colors && colorData.colors.length > 0) {
        const stops = colorData.colors
          .map((stop) => `${stop.color} ${stop.position}%`)
          .join(', ')
        const direction = colorData.direction || '90deg'
        return {
          background: `linear-gradient(${direction}, ${stops})`,
        }
      }
      return { background: '#cccccc' }

    case 'duo':
      const primary = colorData.primary || '#ff6b6b'
      const secondary = colorData.secondary || '#26c5c5'
      const pattern = colorData.pattern || 'stripes'

      if (pattern === 'stripes') {
        return {
          background: `repeating-linear-gradient(
            45deg,
            ${primary},
            ${primary} 10px,
            ${secondary} 10px,
            ${secondary} 20px
          )`,
        }
      } else if (pattern === 'spots') {
        return {
          background: `radial-gradient(circle, ${secondary} 30%, transparent 30%),
                       radial-gradient(circle, ${secondary} 30%, transparent 30%),
                       ${primary}`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }
      } else if (pattern === 'marbled') {
        return {
          background: `linear-gradient(135deg, ${primary} 25%, transparent 25%),
                       linear-gradient(225deg, ${primary} 25%, transparent 25%),
                       linear-gradient(45deg, ${primary} 25%, transparent 25%),
                       linear-gradient(315deg, ${primary} 25%, ${secondary} 25%)`,
          backgroundSize: '20px 20px',
        }
      } else {
        // random
        return {
          background: `linear-gradient(${primary}, ${secondary})`,
        }
      }

    case 'rainbow':
      const intensity = colorData.intensity || 1.0
      const saturation = colorData.saturation || 1.0
      const repetitions = colorData.repetitions || 1

      const rainbowColors = [
        `hsl(0, ${saturation * 100}%, ${50 + (1 - intensity) * 30}%)`,
        `hsl(60, ${saturation * 100}%, ${50 + (1 - intensity) * 30}%)`,
        `hsl(120, ${saturation * 100}%, ${50 + (1 - intensity) * 30}%)`,
        `hsl(180, ${saturation * 100}%, ${50 + (1 - intensity) * 30}%)`,
        `hsl(240, ${saturation * 100}%, ${50 + (1 - intensity) * 30}%)`,
        `hsl(300, ${saturation * 100}%, ${50 + (1 - intensity) * 30}%)`,
      ]

      const repeatedColors = Array.from({ length: repetitions }, () => rainbowColors).flat()

      return {
        background: `linear-gradient(90deg, ${repeatedColors.join(', ')})`,
      }

    default:
      return { background: '#cccccc' }
  }
}

/**
 * Parse BRL currency string to cents
 * @param currencyStr Currency string (e.g., "R$ 100,00")
 */
export function parseCurrency(currencyStr: string): number {
  const cleanStr = currencyStr.replace(/[R$\s.]/g, '').replace(',', '.')
  return Math.round(parseFloat(cleanStr) * 100)
}

/**
 * Format phone number to Brazilian format
 * @param phone Phone number string
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    // Mobile: (99) 99999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    // Landline: (99) 9999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}

/**
 * Format document (CPF or CNPJ)
 * @param document Document string
 */
export function formatDocument(document: string): string {
  const cleaned = document.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    // CPF: 999.999.999-99
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
  } else if (cleaned.length === 14) {
    // CNPJ: 99.999.999/9999-99
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
  }
  
  return document
}

/**
 * Get initials from a name
 * @param name Full name
 * @returns Initials (e.g., "João Silva" -> "JS")
 */
export function getInitials(name: string): string {
  if (!name) return '?'
  
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}
