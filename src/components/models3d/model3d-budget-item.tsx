'use client'

import { AlertCircle, Download } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Model3DThumbnail } from './model3d-thumbnail'
import { useModel3D } from '@/lib/hooks/use-model3d'
import { getModelFileUrl } from '@/lib/utils/cdn-model'

interface Model3DBudgetItemProps {
  modelId: string
}

export function Model3DBudgetItem({ modelId }: Model3DBudgetItemProps) {
  const { data: model, isLoading, isError } = useModel3D(modelId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  if (isError || !model) {
    return (
      <div className="flex items-center gap-1 text-xs text-neutral-400">
        <AlertCircle className="h-3 w-3" />
        <span>Modelo removido</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Model3DThumbnail model={model} className="h-10 w-10 shrink-0 rounded" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{model.name}</p>
        <a
          href={getModelFileUrl(model.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
        >
          <Download className="h-3 w-3" />
          <span className="uppercase">{model.file_format.replace('.', '')}</span>
        </a>
      </div>
    </div>
  )
}
