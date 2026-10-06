/**
 * Format a print duration (seconds) as a compact pt-BR string, e.g. "1h 23min",
 * "45min" or "2h". Seconds are rounded UP to the next whole minute to match how
 * the budget item stores print time (hours + minutes).
 */
export function formatPrintTime(seconds: number): string {
  const totalMinutes = Math.ceil(Math.max(0, seconds) / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}

/**
 * Split a print duration (seconds) into whole hours and minutes, rounding the
 * total UP to the next minute. Used when applying an analysis to a budget item.
 */
export function secondsToHoursMinutes(seconds: number): { hours: number; minutes: number } {
  const totalMinutes = Math.ceil(Math.max(0, seconds) / 60)
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 }
}

/** Format a filament weight (grams) as "12,3 g" (pt-BR, one decimal). */
export function formatGrams(grams: number): string {
  const value = grams.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  return `${value} g`
}

/** Round a gram amount to one decimal place (0.1g), the budget item's resolution. */
export function roundGrams(grams: number): number {
  // Budget filament quantities must be > 0: a tiny slot still counts as 0.1 g.
  return Math.max(0.1, Math.round(grams * 10) / 10)
}
