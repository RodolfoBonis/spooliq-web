'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Model3DThumbnail } from './model3d-thumbnail'
import { formatFileSize } from '@/lib/utils/cdn-model'
import type { Model3D } from '@/types/models'

interface Model3DCardProps {
  model: Model3D
  onEdit?: (model: Model3D) => void
  onDelete?: (id: string) => void
  onClick?: (model: Model3D) => void
}

export function Model3DCard({ model, onEdit, onDelete, onClick }: Model3DCardProps) {
  return (
    <Card
      className="group relative cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
      onClick={() => onClick?.(model)}
    >
      <div className="relative">
        <Model3DThumbnail model={model} className="rounded-none" />
        {/* Hover actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(model)
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(model.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-3">
        <p className="truncate text-sm font-medium text-neutral-900" title={model.name}>
          {model.name}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500">
          {formatFileSize(model.file_size_bytes)}
        </p>
        {model.description && (
          <p className="mt-1 truncate text-xs text-neutral-400" title={model.description}>
            {model.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
