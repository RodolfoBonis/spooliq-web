'use client'

import { Scissors } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useModel3D } from '@/lib/hooks/use-model3d'
import { formatPrintTime } from '@/lib/utils/slicer-format'

interface SliceModelPromptProps {
  /** The budget item's selected 3D model. */
  modelId?: string
  /** Opens the import dialog preloaded from this model. */
  onImport: () => void
}

/**
 * Inline prompt shown under a budget item when the selected 3D model has stored
 * slice data, inviting the user to fill the item from it. Renders nothing when
 * the model has no analysis.
 */
export function SliceModelPrompt({ modelId, onImport }: SliceModelPromptProps) {
  const { data: model } = useModel3D(modelId)
  const analysis = model?.slice_analysis
  if (!modelId || !analysis) return null

  const plateCount = analysis.plates.length
  const totalSeconds = analysis.plates.reduce((s, p) => s + p.print_time_seconds, 0)

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <Scissors className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex-1 min-w-0 text-sm text-neutral-700">
        <p className="font-medium text-neutral-900">
          Este modelo tem dados de fatiamento — preencher o item?
        </p>
        <p className="text-xs text-neutral-500">
          {plateCount} placa{plateCount === 1 ? '' : 's'} ·{' '}
          {formatPrintTime(totalSeconds)}
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onImport}>
        Preencher
      </Button>
    </div>
  )
}
