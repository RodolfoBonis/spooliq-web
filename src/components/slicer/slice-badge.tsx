'use client'

import { Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrintTime } from '@/lib/utils/slicer-format'
import type { SliceAnalysis } from '@/types/slicer'

interface SliceBadgeProps {
  analysis: SliceAnalysis
  className?: string
}

/** Total print time (seconds) across every plate in an analysis. */
function totalSeconds(analysis: SliceAnalysis): number {
  return analysis.plates.reduce((sum, p) => sum + p.print_time_seconds, 0)
}

/**
 * "Fatiado" badge summarising a model's stored slice analysis: plate count and
 * total print time. Used on 3D model cards in the catalog.
 */
export function SliceBadge({ analysis, className }: SliceBadgeProps) {
  const plateCount = analysis.plates.length
  const time = formatPrintTime(totalSeconds(analysis))
  return (
    <Badge
      className={cn(
        'gap-1 border-transparent bg-primary/90 text-primary-foreground',
        className
      )}
    >
      <Layers className="h-3 w-3" aria-hidden="true" />
      Fatiado · {plateCount} placa{plateCount === 1 ? '' : 's'} · {time}
    </Badge>
  )
}
