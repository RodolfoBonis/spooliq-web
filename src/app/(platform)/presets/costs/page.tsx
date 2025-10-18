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
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useCostPresets,
  useCreateCostPreset,
  useUpdateCostPreset,
  useDeleteCostPreset,
} from '@/lib/hooks/use-presets'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { costPresetSchema, type CostPresetFormData } from '@/lib/validations/preset'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import type { CostPreset } from '@/types/models'
import { formatCurrency } from '@/lib/utils/format'

export default function CostPresetsPage() {
  const { data: presets, isLoading } = useCostPresets()
  const { mutate: createPreset, isPending: isCreating } = useCreateCostPreset()
  const { mutate: updatePreset, isPending: isUpdating } = useUpdateCostPreset()
  const { mutate: deletePreset } = useDeleteCostPreset()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<CostPreset | null>(null)
  const [deletingPreset, setDeletingPreset] = useState<CostPreset | null>(null)

  const form = useForm<CostPresetFormData>({
    resolver: zodResolver(costPresetSchema),
    defaultValues: {
      labor_cost_per_hour: 0,
      packaging_cost_per_item: 0,
      shipping_cost_base: 0,
      shipping_cost_per_gram: 0,
      overhead_percentage: 0,
      profit_margin_percentage: 0,
      post_processing_cost_per_hour: 0,
      support_removal_cost_per_hour: 0,
      quality_control_cost_per_item: 0,
    },
  })

  const handleOpenCreate = () => {
    setEditingPreset(null)
    form.reset({
      labor_cost_per_hour: 0,
      packaging_cost_per_item: 0,
      shipping_cost_base: 0,
      shipping_cost_per_gram: 0,
      overhead_percentage: 0,
      profit_margin_percentage: 0,
      post_processing_cost_per_hour: 0,
      support_removal_cost_per_hour: 0,
      quality_control_cost_per_item: 0,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (preset: CostPreset) => {
    setEditingPreset(preset)
    form.reset({
      labor_cost_per_hour: preset.labor_cost_per_hour,
      packaging_cost_per_item: preset.packaging_cost_per_item,
      shipping_cost_base: preset.shipping_cost_base,
      shipping_cost_per_gram: preset.shipping_cost_per_gram,
      overhead_percentage: preset.overhead_percentage,
      profit_margin_percentage: preset.profit_margin_percentage,
      post_processing_cost_per_hour: preset.post_processing_cost_per_hour,
      support_removal_cost_per_hour: preset.support_removal_cost_per_hour,
      quality_control_cost_per_item: preset.quality_control_cost_per_item,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (data: CostPresetFormData) => {
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

  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Card>
          <CardContent className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Presets de Custo</h1>
          <p className="text-neutral-600 mt-1">
            Configure custos operacionais, margens e valores adicionais
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

      <Card>
        <CardContent className="p-0">
          {!presets || presets.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={DollarSign}
                title="Nenhum preset encontrado"
                description="Crie seu primeiro preset de custo para gerenciar margens e custos operacionais"
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
                  <TableHead>Mão de Obra/h</TableHead>
                  <TableHead>Overhead</TableHead>
                  <TableHead>Margem Lucro</TableHead>
                  <TableHead>Embalagem</TableHead>
                  <TableHead>Envio Base</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((preset) => (
                  <TableRow key={preset.id}>
                    <TableCell className="font-medium">
                      {formatCurrency(preset.labor_cost_per_hour)}
                    </TableCell>
                    <TableCell>{preset.overhead_percentage}%</TableCell>
                    <TableCell>{preset.profit_margin_percentage}%</TableCell>
                    <TableCell>{formatCurrency(preset.packaging_cost_per_item)}</TableCell>
                    <TableCell>{formatCurrency(preset.shipping_cost_base)}</TableCell>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? 'Editar Preset' : 'Novo Preset'}
            </DialogTitle>
            <DialogDescription>
              Configure custos operacionais, margens e valores adicionais
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="labor_cost_per_hour">Mão de Obra/Hora (R$)</Label>
                <Input
                  id="labor_cost_per_hour"
                  type="number"
                  step="0.01"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    form.setValue('labor_cost_per_hour', Math.round(value * 100))
                  }}
                />
              </div>
              <div>
                <Label htmlFor="packaging_cost_per_item">Embalagem/Item (R$)</Label>
                <Input
                  id="packaging_cost_per_item"
                  type="number"
                  step="0.01"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    form.setValue('packaging_cost_per_item', Math.round(value * 100))
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shipping_cost_base">Envio Base (R$)</Label>
                <Input
                  id="shipping_cost_base"
                  type="number"
                  step="0.01"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    form.setValue('shipping_cost_base', Math.round(value * 100))
                  }}
                />
              </div>
              <div>
                <Label htmlFor="shipping_cost_per_gram">Envio/Grama (R$)</Label>
                <Input
                  id="shipping_cost_per_gram"
                  type="number"
                  step="0.001"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    form.setValue('shipping_cost_per_gram', Math.round(value * 100))
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overhead_percentage">Overhead (%)</Label>
                <Input
                  id="overhead_percentage"
                  type="number"
                  step="0.1"
                  max="100"
                  {...form.register('overhead_percentage', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="profit_margin_percentage">Margem de Lucro (%)</Label>
                <Input
                  id="profit_margin_percentage"
                  type="number"
                  step="0.1"
                  max="100"
                  {...form.register('profit_margin_percentage', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post_processing_cost_per_hour">Pós-Processamento/Hora (R$)</Label>
                <Input
                  id="post_processing_cost_per_hour"
                  type="number"
                  step="0.01"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    form.setValue('post_processing_cost_per_hour', Math.round(value * 100))
                  }}
                />
              </div>
              <div>
                <Label htmlFor="support_removal_cost_per_hour">Remoção Suporte/Hora (R$)</Label>
                <Input
                  id="support_removal_cost_per_hour"
                  type="number"
                  step="0.01"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    form.setValue('support_removal_cost_per_hour', Math.round(value * 100))
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quality_control_cost_per_item">Controle Qualidade/Item (R$)</Label>
              <Input
                id="quality_control_cost_per_item"
                type="number"
                step="0.01"
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  form.setValue('quality_control_cost_per_item', Math.round(value * 100))
                }}
              />
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

      <ConfirmDialog
        open={!!deletingPreset}
        onOpenChange={(open) => !open && setDeletingPreset(null)}
        title="Deletar preset"
        description="Tem certeza que deseja deletar este preset de custo?"
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}

