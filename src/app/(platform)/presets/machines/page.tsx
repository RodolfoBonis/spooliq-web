'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useMachinePresets,
  useCreateMachinePreset,
  useUpdateMachinePreset,
  useDeleteMachinePreset,
} from '@/lib/hooks/use-presets'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { machinePresetSchema, type MachinePresetFormData } from '@/lib/validations/preset'
import { Plus, Edit, Trash2, Settings } from 'lucide-react'
import type { MachinePreset } from '@/types/models'

export default function MachinePresetsPage() {
  const { data, isLoading } = useMachinePresets()
  const { mutate: createPreset, isPending: isCreating } = useCreateMachinePreset()
  const { mutate: updatePreset, isPending: isUpdating } = useUpdateMachinePreset()
  const { mutate: deletePreset } = useDeleteMachinePreset()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<MachinePreset | null>(null)
  const [deletingPreset, setDeletingPreset] = useState<MachinePreset | null>(null)

  const form = useForm<MachinePresetFormData>({
    resolver: zodResolver(machinePresetSchema),
    defaultValues: {
      name: '',
      description: '',
      waste_percentage: 15,
      is_default: false,
    },
  })

  const handleOpenCreate = () => {
    setEditingPreset(null)
    form.reset({
      name: '',
      description: '',
      waste_percentage: 15,
      is_default: false,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (preset: MachinePreset) => {
    setEditingPreset(preset)
    form.reset({
      name: preset.name,
      description: preset.description || '',
      waste_percentage: preset.waste_percentage,
      is_default: preset.is_default,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (data: MachinePresetFormData) => {
    if (editingPreset) {
      updatePreset(
        { id: editingPreset.id, data },
        {
          onSuccess: () => {
            setIsDialogOpen(false)
            form.reset()
          },
        }
      )
    } else {
      createPreset(data, {
        onSuccess: () => {
          setIsDialogOpen(false)
          form.reset()
        },
      })
    }
  }

  const handleDelete = () => {
    if (deletingPreset) {
      deletePreset(deletingPreset.id)
      setDeletingPreset(null)
    }
  }

  const presets = data?.presets || []

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Presets de Máquina</h1>
          <p className="text-neutral-600 mt-1">
            Configure o percentual de desperdício AMS (Automatic Material System)
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary-500 hover:bg-primary-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Preset
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : presets.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Settings}
                title="Nenhum preset encontrado"
                description="Crie seu primeiro preset de máquina para calcular o desperdício AMS"
                action={
                  <Button
                    onClick={handleOpenCreate}
                    className="bg-primary-500 hover:bg-primary-600"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Preset
                  </Button>
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center">Desperdício (%)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((preset) => (
                  <TableRow key={preset.id}>
                    <TableCell className="font-medium">{preset.name}</TableCell>
                    <TableCell className="text-neutral-600">
                      {preset.description || '—'}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {preset.waste_percentage}%
                    </TableCell>
                    <TableCell className="text-center">
                      {preset.is_default && (
                        <Badge className="bg-primary-100 text-primary-700">
                          Padrão
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(preset)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingPreset(preset)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? 'Editar Preset' : 'Novo Preset'}
            </DialogTitle>
            <DialogDescription>
              Configure o percentual de desperdício para impressões multi-filamento (AMS)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Bambu X1C AMS"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Informações sobre este preset..."
                rows={2}
                {...form.register('description')}
              />
            </div>

            <div>
              <Label htmlFor="waste_percentage">Desperdício AMS (%) *</Label>
              <Input
                id="waste_percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Ex: 15"
                {...form.register('waste_percentage', { valueAsNumber: true })}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Percentual de filamento perdido em purge/prime entre trocas de cor
              </p>
              {form.formState.errors.waste_percentage && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.waste_percentage.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_default"
                checked={form.watch('is_default')}
                onCheckedChange={(checked) =>
                  form.setValue('is_default', checked as boolean)
                }
              />
              <label
                htmlFor="is_default"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Definir como preset padrão
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
                className="bg-primary-500 hover:bg-primary-600"
              >
                {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingPreset}
        onOpenChange={(open) => !open && setDeletingPreset(null)}
        title="Deletar preset"
        description={`Tem certeza que deseja deletar o preset "${deletingPreset?.name}"?`}
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}

