'use client'

import { AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Model3DThumbnail } from './model3d-thumbnail'
import { useModel3D } from '@/lib/hooks/use-model3d'

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
        <p className="text-xs uppercase text-neutral-500">{model.file_format.replace('.', '')}</p>
      </div>
    </div>
  )
}
