'use client'

import { useState, useCallback } from 'react'
import { Plus, Search, Grid3x3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { TableSkeleton } from '@/components/common/loading-skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'
import { useConfirmation } from '@/lib/hooks/use-confirmation'
import { useModels3D, useDeleteModel3D } from '@/lib/hooks/use-model3d'
import {
  Model3DCard,
  Model3DTable,
  Model3DUploadDialog,
  Model3DEditDialog,
  Model3DViewer,
} from '@/components/models3d'
import { formatFileSize } from '@/lib/utils/cdn-model'
import { toast } from 'sonner'
import type { Model3D } from '@/types/models'

type ViewMode = 'grid' | 'list'

export default function ModelsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [search, setSearch] = useState('')
  const [format, setFormat] = useState('')
  const [page, setPage] = useState(1)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<Model3D | null>(null)
  const [viewingModel, setViewingModel] = useState<Model3D | null>(null)

  const { data, isLoading } = useModels3D({
    search: search || undefined,
    format: format && format !== 'all' ? format : undefined,
    page,
    page_size: 24,
  })
  const { mutate: deleteModel } = useDeleteModel3D()
  const { isOpen: isConfirmOpen, confirm, handleConfirm, handleCancel } = useConfirmation()

  const models = data?.data || []
  const totalPages = data?.total_pages || 1

  const handleDelete = useCallback(
    (id: string) => {
      confirm(() => {
        deleteModel(id, {
          onSuccess: () => toast.success('Modelo excluído com sucesso!'),
          onError: () => toast.error('Erro ao excluir modelo'),
        })
      })
    },
    [confirm, deleteModel]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Modelos 3D</h1>
          <p className="text-sm text-neutral-500">
            {data?.total ?? 0} modelo{data?.total !== 1 ? 's' : ''} cadastrado{data?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Modelo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar por nome ou tag..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select value={format || 'all'} onValueChange={(v) => { setFormat(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value=".stl">STL</SelectItem>
            <SelectItem value=".3mf">3MF</SelectItem>
          </SelectContent>
        </Select>
        {/* View toggle */}
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <TableSkeleton />
      ) : models.length === 0 ? (
        <EmptyState
          title="Nenhum modelo encontrado"
          description={search || format ? 'Tente ajustar os filtros.' : 'Faça upload do seu primeiro modelo 3D.'}
          action={
            <Button onClick={() => setIsUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Modelo
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {models.map((model) => (
            <Model3DCard
              key={model.id}
              model={model}
              onClick={setViewingModel}
              onEdit={setEditingModel}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Model3DTable
          models={models}
          onRowClick={setViewingModel}
          onEdit={setEditingModel}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-neutral-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próximo
          </Button>
        </div>
      )}

      {/* Model detail sheet */}
      <Sheet open={!!viewingModel} onOpenChange={(o) => !o && setViewingModel(null)}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          {viewingModel && (
            <>
              <SheetHeader>
                <SheetTitle className="truncate">{viewingModel.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="h-64 w-full rounded-lg overflow-hidden">
                  <Model3DViewer
                    fileUrl={viewingModel.file_url}
                    format={viewingModel.file_format}
                    className="h-full w-full"
                  />
                </div>
                <dl className="space-y-2 text-sm">
                  {viewingModel.description && (
                    <div>
                      <dt className="font-medium text-neutral-700">Descrição</dt>
                      <dd className="text-neutral-600">{viewingModel.description}</dd>
                    </div>
                  )}
                  <div className="flex gap-6">
                    <div>
                      <dt className="font-medium text-neutral-700">Formato</dt>
                      <dd className="uppercase text-neutral-600">{viewingModel.file_format.replace('.', '')}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-neutral-700">Tamanho</dt>
                      <dd className="text-neutral-600">{formatFileSize(viewingModel.file_size_bytes)}</dd>
                    </div>
                  </div>
                  {viewingModel.tags && (
                    <div>
                      <dt className="font-medium text-neutral-700">Tags</dt>
                      <dd className="text-neutral-600">{viewingModel.tags}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-neutral-700">Criado em</dt>
                    <dd className="text-neutral-600">
                      {new Date(viewingModel.created_at).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                </dl>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setEditingModel(viewingModel); setViewingModel(null) }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => { handleDelete(viewingModel.id); setViewingModel(null) }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <Model3DUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />
      <Model3DEditDialog
        model={editingModel}
        open={!!editingModel}
        onOpenChange={(o) => !o && setEditingModel(null)}
      />
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={(o) => !o && handleCancel()}
        onConfirm={handleConfirm}
        title="Excluir modelo 3D"
        description="Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  )
}
