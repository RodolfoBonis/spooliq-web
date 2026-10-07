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
 * Format currency value (already in reais) to BRL currency
 * @param reais Amount in reais (e.g., 79.00 = R$ 79,00)
 */
export function formatCurrencyFromReais(reais: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais)
}

/**
 * Format ISO 8601 date to Brazilian format
 * @param isoDate ISO 8601 date string
 * @param formatStr date-fns format string (default: "d 'de' MMMM 'de' yyyy")
 */
export function formatDate(isoDate: string | null | undefined, formatStr = "d 'de' MMMM 'de' yyyy"): string {
  if (!isoDate) return '--'
  
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return '--'
  
  return format(date, formatStr, { locale: ptBR })
}

/**
 * Format ISO 8601 date to short Brazilian format
 * @param isoDate ISO 8601 date string
 */
export function formatDateShort(isoDate: string | null | undefined): string {
  if (!isoDate) return '--'
  
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return '--'
  
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
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
 * Parse BRL currency string to float (reais)
 * @param currencyStr Currency string (e.g., "R$ 100,00" or "100,50")
 * @returns Float value in reais (e.g., 100.50)
 */
export function parseCurrencyToFloat(currencyStr: string): number {
  if (!currencyStr || currencyStr.trim() === '') return 0
  
  // Remove R$, espaços e pontos (separadores de milhares)
  let cleanStr = currencyStr.replace(/[R$\s]/g, '')
  
  // Se tem vírgula, é o separador decimal brasileiro
  if (cleanStr.includes(',')) {
    // Remove pontos (separadores de milhares) e troca vírgula por ponto
    cleanStr = cleanStr.replace(/\./g, '').replace(',', '.')
  }
  
  const value = parseFloat(cleanStr)
  return isNaN(value) ? 0 : value
}

/**
 * Format float value to Brazilian currency input format
 * @param value Float value (e.g., 100.50)
 * @returns Formatted string (e.g., "100,50")
 */
export function formatFloatToCurrencyInput(value: number | string): string {
  if (!value && value !== 0) return ''
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return ''
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Apply Brazilian currency mask to input value
 * @param value Raw input value
 * @returns Masked value (e.g., "1234567" -> "12.345,67")
 */
export function applyCurrencyMask(value: string): string {
  // Remove tudo que não é dígito
  const onlyNumbers = value.replace(/\D/g, '')
  
  if (onlyNumbers.length === 0) return ''
  
  // Converte para centavos e depois para reais
  const cents = parseInt(onlyNumbers)
  const reais = cents / 100
  
  return reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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

/**
 * Convert a date-only value from an <input type="date"> (YYYY-MM-DD) into an ISO
 * 8601 datetime at the end of that local day. Returns undefined for empty/invalid
 * input. Used for the budget "Válido até" field.
 */
export function endOfDayISO(dateOnly: string | null | undefined): string | undefined {
  if (!dateOnly) return undefined
  const date = new Date(`${dateOnly}T23:59:59`)
  if (isNaN(date.getTime())) return undefined
  return date.toISOString()
}

/**
 * Convert an ISO 8601 datetime into the YYYY-MM-DD value expected by an
 * <input type="date">. Returns '' for empty/invalid input.
 */
export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Format a sequential quote number for display, e.g. 1 -> "#0001".
 * Returns '' when the number is missing (older budgets created before Phase 4B).
 */
export function formatQuoteNumberPadded(quoteNumber: number | null | undefined): string {
  if (quoteNumber == null) return ''
  return String(quoteNumber).padStart(4, '0')
}

export function formatQuoteNumber(quoteNumber: number | null | undefined): string {
  if (quoteNumber == null) return ''
  return `#${String(quoteNumber).padStart(4, '0')}`
}
