'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Info } from 'lucide-react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SlicePlateSelector } from './slice-plate-selector'
import { SliceFilamentSlotRow } from './slice-filament-slot-row'
import { roundGrams, secondsToHoursMinutes } from '@/lib/utils/slicer-format'
import type { Filament } from '@/types/models'
import type { SliceAnalysis, SlicePlate } from '@/types/slicer'

/** A catalog filament chosen for a slot, with the grams to apply. */
export interface AppliedSliceFilament {
  filament: Filament
  quantity: number
  order: number
}

/** Everything needed to fill a budget item from an analysis. */
export interface SliceApplyPayload {
  print_time_hours: number
  print_time_minutes: number
  filaments: AppliedSliceFilament[]
}

interface SliceResultViewProps {
  analysis: SliceAnalysis
  /** Emits a ready-to-apply payload, or `null` while any slot is unresolved. */
  onPayloadChange: (payload: SliceApplyPayload | null) => void
}

function findPlate(analysis: SliceAnalysis, index: number): SlicePlate | undefined {
  return analysis.plates.find((p) => p.index === index)
}

/**
 * Builds the apply payload for a plate: validates every slot resolved, merges
 * duplicate filaments (summing grams, keeping the earliest slot order) and
 * re-numbers the resulting order sequentially from 1.
 */
function buildPayload(
  plate: SlicePlate,
  chosen: Record<number, Filament | null>
): SliceApplyPayload | null {
  const slots = plate.filaments
  if (slots.length === 0) return null

  const byFilament = new Map<string, { filament: Filament; grams: number; order: number }>()
  for (const slot of slots) {
    const filament = chosen[slot.slot]
    if (!filament) return null // required: every slot must resolve
    const existing = byFilament.get(filament.id)
    if (existing) {
      existing.grams += slot.grams
      existing.order = Math.min(existing.order, slot.slot)
    } else {
      byFilament.set(filament.id, { filament, grams: slot.grams, order: slot.slot })
    }
  }

  const filaments = Array.from(byFilament.values())
    .sort((a, b) => a.order - b.order)
    .map((entry, i) => ({
      filament: entry.filament,
      quantity: roundGrams(entry.grams),
      order: i + 1,
    }))

  const { hours, minutes } = secondsToHoursMinutes(plate.print_time_seconds)
  return { print_time_hours: hours, print_time_minutes: minutes, filaments }
}

/** Renders slicer info, warnings, plate selector and the editable slot table. */
export function SliceResultView({ analysis, onPayloadChange }: SliceResultViewProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    () => analysis.plates[0]?.index ?? 0
  )
  const [chosen, setChosen] = useState<Record<number, Filament | null>>({})

  // Reset per-slot choices when switching plates (slots differ between plates).
  const handleSelectPlate = useCallback((index: number) => {
    setSelectedIndex(index)
    setChosen({})
  }, [])

  const handleSlotChange = useCallback((slotNumber: number, filament: Filament | null) => {
    setChosen((prev) =>
      prev[slotNumber] === filament ? prev : { ...prev, [slotNumber]: filament }
    )
  }, [])

  const plate = findPlate(analysis, selectedIndex)

  const payload = useMemo(
    () => (plate ? buildPayload(plate, chosen) : null),
    [plate, chosen]
  )

  useEffect(() => {
    onPayloadChange(payload)
  }, [payload, onPayloadChange])

  if (!plate) {
    return (
      <p className="text-sm text-neutral-500">
        Nenhuma placa encontrada no arquivo.
      </p>
    )
  }

  const multiPlate = analysis.plates.length > 1

  return (
    <div className="space-y-4">
      {/* Slicer info */}
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Info className="h-4 w-4 text-neutral-400" />
        <span>
          Fatiado com{' '}
          <span className="font-medium text-neutral-800">{analysis.slicer.name}</span>
          {analysis.slicer.version ? ` ${analysis.slicer.version}` : ''}
        </span>
      </div>

      {/* Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            Avisos
          </div>
          <ul className="list-disc space-y-0.5 pl-6 text-xs text-amber-700">
            {analysis.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Plate selector (multi-plate only) */}
      {multiPlate && (
        <SlicePlateSelector
          plates={analysis.plates}
          selectedIndex={selectedIndex}
          onSelect={handleSelectPlate}
        />
      )}

      {plate.estimated && (
        <p className="text-xs text-amber-600">
          Tempo/peso estimado pelo fatiador — confira antes de aplicar.
        </p>
      )}

      {/* Filament slots */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slot</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Filamento do catálogo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plate.filaments.map((slot) => (
              <SliceFilamentSlotRow
                key={`${selectedIndex}-${slot.slot}`}
                slot={slot}
                onChange={handleSlotChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
