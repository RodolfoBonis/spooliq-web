'use client'

import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Model3DThumbnail } from './model3d-thumbnail'
import { formatFileSize, formatModelFormat } from '@/lib/utils/cdn-model'
import type { Model3D } from '@/types/models'

interface Model3DTableProps {
  models: Model3D[]
  onEdit?: (model: Model3D) => void
  onDelete?: (id: string) => void
  onRowClick?: (model: Model3D) => void
}

export function Model3DTable({ models, onEdit, onDelete, onRowClick }: Model3DTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Formato</TableHead>
          <TableHead>Tamanho</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="w-20 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((model) => (
          <TableRow
            key={model.id}
            className={onRowClick ? 'cursor-pointer' : undefined}
            onClick={() => onRowClick?.(model)}
          >
            <TableCell>
              <Model3DThumbnail model={model} className="h-10 w-10" />
            </TableCell>
            <TableCell>
              <span className="font-medium">{model.name}</span>
              {model.description && (
                <p className="truncate text-xs text-neutral-500 max-w-xs">{model.description}</p>
              )}
            </TableCell>
            <TableCell>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium">
                {formatModelFormat(model.file_format)}
              </span>
            </TableCell>
            <TableCell className="text-sm text-neutral-600">
              {formatFileSize(model.file_size_bytes)}
            </TableCell>
            <TableCell className="text-sm text-neutral-600">
              {new Date(model.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                {onEdit && (
                  <Button
                    size="icon"
                    variant="ghost"
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
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(model.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
