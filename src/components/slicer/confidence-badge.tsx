'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SliceConfidence } from '@/types/slicer'

const CONFIDENCE_CONFIG: Record<
  SliceConfidence,
  { label: string; className: string }
> = {
  exact: {
    label: 'Exato',
    className: 'border-transparent bg-green-100 text-green-800',
  },
  close: {
    label: 'Próximo',
    className: 'border-transparent bg-amber-100 text-amber-800',
  },
  none: {
    label: 'Sem correspondência',
    className: 'border-transparent bg-neutral-100 text-neutral-600',
  },
}

interface ConfidenceBadgeProps {
  confidence: SliceConfidence
  className?: string
}

/** Colored badge describing how confident the catalog-match suggestion is. */
export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const config = CONFIDENCE_CONFIG[confidence]
  return (
    <Badge className={cn(config.className, className)}>{config.label}</Badge>
  )
}
