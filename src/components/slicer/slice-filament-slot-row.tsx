'use client'

import { useEffect, useState } from 'react'
import { TableCell, TableRow } from '@/components/ui/table'
import { FilamentSelector } from '@/components/budgets/filament-selector'
import { Button } from '@/components/ui/button'
import { ConfidenceBadge } from './confidence-badge'
import { useFilament } from '@/lib/hooks/use-filaments'
import { formatGrams } from '@/lib/utils/slicer-format'
import type { Filament } from '@/types/models'
import type { SliceFilament } from '@/types/slicer'

interface SliceFilamentSlotRowProps {
  slot: SliceFilament
  /** Reports the effective chosen filament (override → suggestion → null). */
  onChange: (slotNumber: number, filament: Filament | null) => void
}

/**
 * One row of the slice filament table: color swatch, material, weight and the
 * catalog match. An EXACT match (same material and color) is pre-selected; any
 * other suggestion is only offered ("Usar sugestão") and the user picks the
 * filament. The effective choice is reported upward via `onChange`.
 */
export function SliceFilamentSlotRow({ slot, onChange }: SliceFilamentSlotRowProps) {
  const suggestion = slot.suggestion ?? null
  const suggestedId = suggestion?.filament_id
  const isExact = suggestion?.confidence === 'exact'
  const [override, setOverride] = useState<Filament | null>(null)
  // Only exact matches are applied automatically; others need an explicit choice.
  const [useSuggested, setUseSuggested] = useState(isExact)

  // Resolve the suggested filament to a full entity for display/apply — only when
  // it is in use and not overridden. `useFilament('')` stays disabled.
  const suggestedQuery = useFilament(!override && useSuggested && suggestedId ? suggestedId : '')
  const chosen = override ?? (useSuggested ? suggestedQuery.data ?? null : null)
  const usingSuggestion = !!chosen && chosen.id === suggestedId

  useEffect(() => {
    onChange(slot.slot, chosen)
  }, [slot.slot, chosen, onChange])

  const swatchColor = slot.color_hex || suggestion?.color_hex || '#cccccc'
  const resolvingSuggestion = !override && useSuggested && !!suggestedId && suggestedQuery.isLoading

  return (
    <TableRow>
      <TableCell className="align-top">
        <div className="flex items-center gap-2">
          <span
            className="h-6 w-6 shrink-0 rounded-full border"
            style={{ backgroundColor: swatchColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-neutral-800">
            Slot {slot.slot}
          </span>
        </div>
      </TableCell>
      <TableCell className="align-top text-sm text-neutral-700">
        {slot.material || '—'}
      </TableCell>
      <TableCell className="align-top text-sm text-neutral-700">
        {formatGrams(slot.grams)}
      </TableCell>
      <TableCell className="align-top">
        <div className="space-y-2">
          {suggestion ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-neutral-500">Sugestão:</span>
              <span className="text-sm text-neutral-800">{suggestion.name}</span>
              <ConfidenceBadge confidence={suggestion.confidence} />
              {!usingSuggestion && !resolvingSuggestion && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => {
                    setOverride(null)
                    setUseSuggested(true)
                  }}
                >
                  Usar sugestão
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">
              Nenhuma sugestão encontrada para este slot.
            </p>
          )}

          <FilamentSelector
            value={chosen?.id}
            onValueChange={(filament) => setOverride(filament)}
          />

          {isExact && usingSuggestion && !override && (
            <p className="text-xs text-green-700">
              Preenchido automaticamente: mesmo material e cor.
            </p>
          )}

          {!chosen && (
            <p className="text-xs text-red-600">
              {resolvingSuggestion
                ? 'Carregando filamento sugerido...'
                : 'Selecione um filamento para este slot.'}
            </p>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}
