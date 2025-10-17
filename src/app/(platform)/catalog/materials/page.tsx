'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, AlertTriangle, Boxes } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/common/confirmation-dialog'
import { TableSkeleton } from '@/components/common/loading-skeleton'
import { EmptyState } from '@/components/common/empty-state'

import {
  useMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from '@/lib/hooks/use-materials'
import { materialSchema, type MaterialFormData } from '@/lib/validations/catalog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Material } from '@/types/models'

export default function MaterialsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useMaterials({ search, page: 1, pageSize: 50 })
  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial()
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial()
  const { mutate: deleteMaterial, isPending: isDeleting } = useDeleteMaterial()

  const [showDialog, setShowDialog] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null)

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      description: '',
      tempTable: undefined,
      tempExtruder: undefined,
    },
  })

  const handleOpenCreate = () => {
    setEditingMaterial(null)
    form.reset({
      name: '',
      description: '',
      tempTable: undefined,
      tempExtruder: undefined,
    })
    setShowDialog(true)
  }

  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material)
    form.reset({
      name: material.name,
      description: material.description || '',
      tempTable: material.tempTable,
      tempExtruder: material.tempExtruder,
    })
    setShowDialog(true)
  }

  const onSubmit = (data: MaterialFormData) => {
    if (editingMaterial) {
      updateMaterial(
        { id: editingMaterial.id, data },
        {
          onSuccess: () => {
            setShowDialog(false)
            form.reset()
          },
        }
      )
    } else {
      createMaterial(data, {
        onSuccess: () => {
          setShowDialog(false)
          form.reset()
        },
      })
    }
  }

  const handleDelete = () => {
    if (!materialToDelete) return
    deleteMaterial(materialToDelete.id)
    setMaterialToDelete(null)
  }

  const materials = data?.data || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Materiais</h1>
          <p className="text-neutral-600 mt-2">
            Gerencie os tipos de materiais de impressão 3D
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary-500 hover:bg-primary-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Material
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Buscar materiais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Nenhum material encontrado"
          description="Comece adicionando materiais como PLA, ABS, PETG, TPU, etc."
          action={
            <Button
              onClick={handleOpenCreate}
              className="bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Material
            </Button>
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Temp. Mesa (°C)</TableHead>
                <TableHead>Temp. Extrusora (°C)</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {material.tempTable ? `${material.tempTable}°C` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {material.tempExtruder ? `${material.tempExtruder}°C` : '-'}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600 max-w-md truncate">
                    {material.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(material)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMaterialToDelete(material)}
                        className="text-error hover:text-error"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Editar Material' : 'Novo Material'}
            </DialogTitle>
            <DialogDescription>
              {editingMaterial
                ? 'Atualize as informações do material'
                : 'Adicione um novo material de impressão 3D'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: PLA, ABS, PETG, TPU, Nylon"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Breve descrição do material"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-4">
                  Propriedades Técnicas (Opcional)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tempTable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp. Mesa (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Ex: PLA = 50-60°C
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tempExtruder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temp. Extrusora (°C)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="210"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseFloat(e.target.value) : undefined
                              )
                            }
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Ex: PLA = 190-220°C
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={isCreating || isUpdating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!materialToDelete}
        onOpenChange={(open) => !open && setMaterialToDelete(null)}
        onConfirm={handleDelete}
        title="Deletar Material"
        description={`Tem certeza que deseja deletar o material "${materialToDelete?.name}"? Esta ação não pode ser desfeita e todos os filamentos deste material serão afetados.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        variant="danger"
        icon={AlertTriangle}
        isLoading={isDeleting}
      />
    </div>
  )
}

