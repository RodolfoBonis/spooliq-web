'use client'

import { cn } from '@/lib/utils'
import { formatGrams, formatPrintTime } from '@/lib/utils/slicer-format'
import type { SlicePlate } from '@/types/slicer'

interface SlicePlateSelectorProps {
  plates: SlicePlate[]
  selectedIndex: number
  onSelect: (index: number) => void
}

/** Total filament weight (grams) across a plate's slots. */
export function plateTotalGrams(plate: SlicePlate): number {
  return plate.filaments.reduce((sum, f) => sum + f.grams, 0)
}

/**
 * Radio-card plate picker. Uses native radio inputs (one group) so keyboard
 * arrow-navigation and screen-reader semantics work out of the box.
 */
export function SlicePlateSelector({
  plates,
  selectedIndex,
  onSelect,
}: SlicePlateSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-neutral-700">
        Placas ({plates.length})
      </legend>
      <div
        role="radiogroup"
        aria-label="Selecionar placa"
        className="grid gap-2 sm:grid-cols-2"
      >
        {plates.map((plate, i) => {
          const checked = plate.index === selectedIndex
          const label = plate.name?.trim() || `Placa ${i + 1}`
          return (
            <label
              key={plate.index}
              className={cn(
                'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors',
                'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1',
                checked
                  ? 'border-primary bg-primary/5'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="slice-plate"
                  className="h-4 w-4 accent-primary"
                  value={plate.index}
                  checked={checked}
                  onChange={() => onSelect(plate.index)}
                />
                <span className="text-sm font-medium text-neutral-900">{label}</span>
                {plate.estimated && (
                  <span className="text-xs text-amber-600">(estimado)</span>
                )}
              </div>
              <div className="pl-6 text-xs text-neutral-500">
                {formatPrintTime(plate.print_time_seconds)} ·{' '}
                {formatGrams(plateTotalGrams(plate))} ·{' '}
                {plate.filaments.length} filamento
                {plate.filaments.length === 1 ? '' : 's'}
              </div>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
