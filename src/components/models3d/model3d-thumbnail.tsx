'use client'

import { Box } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getModelThumbnailUrl, formatModelFormat } from '@/lib/utils/cdn-model'
import type { Model3D } from '@/types/models'

interface Model3DThumbnailProps {
  model: Model3D
  className?: string
}

export function Model3DThumbnail({ model, className }: Model3DThumbnailProps) {
  const thumbnailUrl = getModelThumbnailUrl(model.thumbnail_url)
  const formatLabel = formatModelFormat(model.file_format)

  return (
    <div className={cn('relative aspect-square overflow-hidden rounded-md bg-[#F5F5F5]', className)}>
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnailUrl}
          alt={model.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Box className="h-1/3 w-1/3 text-neutral-400" />
        </div>
      )}
      {/* Format badge */}
      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white">
        {formatLabel}
      </span>
    </div>
  )
}
