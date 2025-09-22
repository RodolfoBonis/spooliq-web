import { ColorData } from '@/types/api'

/**
 * Generates CSS background string for color preview
 */
export function generateColorPreview(colorData: ColorData): string {
  switch (colorData.type) {
    case 'solid':
      return colorData.color

    case 'gradient':
      const stops = colorData.stops.map(stop =>
        `${stop.color} ${stop.position}%`
      ).join(', ')
      return `linear-gradient(${colorData.direction}deg, ${stops})`

    case 'duo':
      switch (colorData.pattern) {
        case 'mixed':
          return `linear-gradient(45deg, ${colorData.primary} 0%, ${colorData.primary} 50%, ${colorData.secondary} 50%, ${colorData.secondary} 100%)`
        case 'alternating':
          return `repeating-linear-gradient(90deg, ${colorData.primary} 0%, ${colorData.primary} 25%, ${colorData.secondary} 25%, ${colorData.secondary} 50%)`
        case 'spiral':
          return `conic-gradient(from 0deg, ${colorData.primary} 0deg, ${colorData.secondary} 180deg, ${colorData.primary} 360deg)`
        default:
          return `linear-gradient(45deg, ${colorData.primary} 0%, ${colorData.primary} 50%, ${colorData.secondary} 50%, ${colorData.secondary} 100%)`
      }

    case 'rainbow':
      return `linear-gradient(90deg,
        hsl(0, ${colorData.saturation}%, ${colorData.lightness}%) 0%,
        hsl(60, ${colorData.saturation}%, ${colorData.lightness}%) 16.66%,
        hsl(120, ${colorData.saturation}%, ${colorData.lightness}%) 33.33%,
        hsl(180, ${colorData.saturation}%, ${colorData.lightness}%) 50%,
        hsl(240, ${colorData.saturation}%, ${colorData.lightness}%) 66.66%,
        hsl(300, ${colorData.saturation}%, ${colorData.lightness}%) 83.33%,
        hsl(360, ${colorData.saturation}%, ${colorData.lightness}%) 100%)`

    default:
      return '#FF0000'
  }
}

/**
 * Gets a readable description of the color data
 */
export function getColorDescription(colorData: ColorData): string {
  switch (colorData.type) {
    case 'solid':
      return `Cor sólida: ${colorData.color}`

    case 'gradient':
      return `Gradiente com ${colorData.stops.length} cores (${colorData.direction}°)`

    case 'duo':
      const patterns = {
        mixed: 'Misturado',
        alternating: 'Alternado',
        spiral: 'Espiral'
      }
      return `Duo Color - ${patterns[colorData.pattern]}: ${colorData.primary} + ${colorData.secondary}`

    case 'rainbow':
      return `Rainbow - S:${colorData.saturation}% L:${colorData.lightness}%`

    default:
      return 'Cor indefinida'
  }
}

/**
 * Gets the primary color from any color data (for compatibility)
 */
export function getPrimaryColor(colorData: ColorData): string {
  switch (colorData.type) {
    case 'solid':
      return colorData.color
    case 'gradient':
      return colorData.stops[0]?.color || '#FF0000'
    case 'duo':
      return colorData.primary
    case 'rainbow':
      return `hsl(0, ${colorData.saturation}%, ${colorData.lightness}%)`
    default:
      return '#FF0000'
  }
}