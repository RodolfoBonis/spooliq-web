'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Lazy load — three.js/fiber are NOT SSR-compatible
const Model3DViewerInner = dynamic(
  () =>
    import('./model3d-viewer-inner').then((mod) => ({
      default: mod.Model3DViewerInner,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    ),
  }
)

interface Model3DViewerProps {
  /** ID of the model to render; its file is fetched authenticated via axios. */
  modelId: string
  format: string
  className?: string
}

export function Model3DViewer({ modelId, format, className }: Model3DViewerProps) {
  return (
    <div className={cn('h-full w-full', className)}>
      <Model3DViewerInner key={`${modelId}:${format}`} modelId={modelId} format={format} className="h-full w-full" />
    </div>
  )
}
