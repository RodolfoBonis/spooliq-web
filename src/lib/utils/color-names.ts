/**
 * Color naming utility
 * Converts hex colors to descriptive Portuguese names
 */

interface ColorRange {
  name: string
  hueMin: number
  hueMax: number
  satMin?: number
  satMax?: number
  lightMin?: number
  lightMax?: number
}

const COLOR_RANGES: ColorRange[] = [
  // Reds
  { name: 'Vermelho', hueMin: 0, hueMax: 15, satMin: 50 },
  { name: 'Rosa', hueMin: 330, hueMax: 360, satMin: 30, lightMin: 50 },
  { name: 'Vermelho', hueMin: 345, hueMax: 360, satMin: 50 },
  
  // Oranges
  { name: 'Laranja', hueMin: 15, hueMax: 45, satMin: 50 },
  { name: 'Pêssego', hueMin: 15, hueMax: 45, satMin: 30, satMax: 50, lightMin: 70 },
  
  // Yellows
  { name: 'Amarelo', hueMin: 45, hueMax: 70, satMin: 50 },
  { name: 'Dourado', hueMin: 45, hueMax: 60, satMin: 40, lightMin: 40, lightMax: 60 },
  
  // Greens
  { name: 'Verde Lima', hueMin: 70, hueMax: 90, satMin: 50 },
  { name: 'Verde', hueMin: 90, hueMax: 150, satMin: 40 },
  { name: 'Menta', hueMin: 150, hueMax: 180, satMin: 30, lightMin: 60 },
  
  // Cyans
  { name: 'Ciano', hueMin: 180, hueMax: 200, satMin: 40 },
  { name: 'Turquesa', hueMin: 175, hueMax: 195, satMin: 40, lightMin: 50 },
  
  // Blues
  { name: 'Azul', hueMin: 200, hueMax: 250, satMin: 40 },
  { name: 'Azul Claro', hueMin: 200, hueMax: 220, satMin: 30, lightMin: 70 },
  { name: 'Azul Marinho', hueMin: 210, hueMax: 240, satMin: 50, lightMax: 40 },
  
  // Purples
  { name: 'Roxo', hueMin: 250, hueMax: 290, satMin: 40 },
  { name: 'Violeta', hueMin: 270, hueMax: 290, satMin: 50 },
  { name: 'Lavanda', hueMin: 260, hueMax: 280, satMin: 20, lightMin: 70 },
  
  // Magentas
  { name: 'Magenta', hueMin: 290, hueMax: 330, satMin: 50 },
  { name: 'Rosa Pink', hueMin: 300, hueMax: 330, satMin: 70 },
]

/**
 * Convert hex color to HSL
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Get color name from hex
 */
export function getColorName(hex: string): string {
  if (!hex || !hex.match(/^#?[0-9A-Fa-f]{6}$/)) {
    return 'Cor Personalizada'
  }
  
  const { h, s, l } = hexToHSL(hex)
  
  // Check for grayscale
  if (s < 10) {
    if (l > 95) return 'Branco'
    if (l > 70) return 'Cinza Claro'
    if (l > 40) return 'Cinza'
    if (l > 15) return 'Cinza Escuro'
    return 'Preto'
  }
  
  // Find matching color range
  for (const range of COLOR_RANGES) {
    const hueMatch = h >= range.hueMin && h <= range.hueMax
    const satMatch = !range.satMin || (s >= range.satMin && (!range.satMax || s <= range.satMax))
    const lightMatch = !range.lightMin || (l >= range.lightMin && (!range.lightMax || l <= range.lightMax))
    
    if (hueMatch && satMatch && lightMatch) {
      // Add lightness modifier
      if (range.lightMin === undefined && range.lightMax === undefined) {
        if (l > 80) return `${range.name} Claro`
        if (l < 30) return `${range.name} Escuro`
      }
      return range.name
    }
  }
  
  // Fallback
  return 'Cor Personalizada'
}

/**
 * Generate color name from multiple colors
 */
export function generateColorName(colorType: string, colorData: any): string {
  switch (colorType) {
    case 'solid':
      return getColorName(colorData.color || '#000000')
    
    case 'gradient':
      const from = getColorName(colorData.from || '#000000')
      const to = getColorName(colorData.to || '#000000')
      return `${from} → ${to}`
    
    case 'duo':
      const primary = getColorName(colorData.primary || '#000000')
      const secondary = getColorName(colorData.secondary || '#000000')
      return `${primary} / ${secondary}`
    
    case 'rainbow':
      const colors = colorData.colors || []
      if (colors.length === 0) return 'Rainbow'
      if (colors.length <= 3) {
        return colors.map((c: string) => getColorName(c)).join(' / ')
      }
      return 'Rainbow Multi-Color'
    
    default:
      return 'Cor Personalizada'
  }
}

