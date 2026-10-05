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
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import {
  useCostPresets,
  useCreateCostPreset,
  useUpdateCostPreset,
  useDeleteCostPreset,
  useSetDefaultPreset,
  useDuplicatePreset,
  useSuggestPresetName,
} from '@/lib/hooks/use-presets'
import { useCanManageDefaults } from '@/lib/hooks/use-can-manage-defaults'
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  costPresetSchema,
  normalizeOptionalName,
  type CostPresetFormData,
} from '@/lib/validations/preset'
import { Plus, DollarSign, LayoutTemplate } from 'lucide-react'
import type { CostPreset } from '@/types/models'
import { formatCurrencyFromReais } from '@/lib/utils/format'
import { DefaultBadge } from '@/components/presets/default-badge'
import { PresetNameField } from '@/components/presets/preset-name-field'
import { PresetRowActions } from '@/components/presets/preset-row-actions'
import { PresetTemplateDialog } from '@/components/presets/preset-template-dialog'

const EMPTY_FORM: CostPresetFormData = {
  name: '',
  description: '',
  labor_cost_per_hour: 0,
  packaging_cost_per_item: 0,
  shipping_cost_base: 0,
  shipping_cost_per_gram: 0,
  overhead_percentage: 0,
  profit_margin_percentage: 0,
  post_processing_cost_per_hour: 0,
  support_removal_cost_per_hour: 0,
  quality_control_cost_per_item: 0,
}

type CurrencyField = Extract<
  FieldPath<CostPresetFormData>,
  | 'labor_cost_per_hour'
  | 'packaging_cost_per_item'
  | 'shipping_cost_base'
  | 'shipping_cost_per_gram'
  | 'post_processing_cost_per_hour'
  | 'support_removal_cost_per_hour'
  | 'quality_control_cost_per_item'
>

function costPresetName(preset: CostPreset): string {
  return preset.name || `Preset ${preset.id.slice(0, 8)}`
}

export default function CostPresetsPage() {
  const { data: presets, isLoading } = useCostPresets()
  const { mutate: createPreset, isPending: isCreating } = useCreateCostPreset()
  const { mutate: updatePreset, isPending: isUpdating } = useUpdateCostPreset()
  const { mutate: deletePreset } = useDeleteCostPreset()
  const { mutate: setDefaultPreset, isPending: isSettingDefault } = useSetDefaultPreset('cost')
  const { mutate: duplicatePreset, isPending: isDuplicating } = useDuplicatePreset('cost')
  const canManageDefaults = useCanManageDefaults()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<CostPreset | null>(null)
  const [deletingPreset, setDeletingPreset] = useState<CostPreset | null>(null)

  const form = useForm<CostPresetFormData>({
    resolver: zodResolver(costPresetSchema),
    defaultValues: EMPTY_FORM,
  })

  const handleOpenCreate = () => {
    setEditingPreset(null)
    form.reset(EMPTY_FORM)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (preset: CostPreset) => {
    setEditingPreset(preset)
    form.reset({
      name: preset.name || '',
      description: preset.description || '',
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

  // Name suggestion (only while the name field is empty)
  const [nameValue, laborCost, profitMargin] = useWatch({
    control: form.control,
    name: ['name', 'labor_cost_per_hour', 'profit_margin_percentage'],
  })
  const isNameEmpty = !nameValue?.trim()
  const { data: suggestedName, isFetching: isSuggesting } = useSuggestPresetName(
    {
      type: 'cost',
      labor_cost_per_hour: laborCost || undefined,
      profit_margin_percentage: Number.isFinite(profitMargin) ? profitMargin : undefined,
    },
    isDialogOpen && isNameEmpty
  )

  const renderCurrencyField = (name: CurrencyField, label: string) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Controller
        control={form.control}
        name={name}
        render={({ field, fieldState }) => (
          <>
            <CurrencyInput
              id={name}
              showCurrencySymbol
              value={field.value || 0}
              onChange={field.onChange}
              aria-invalid={fieldState.error ? true : undefined}
            />
            {fieldState.error && (
              <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  )

  const handleSubmit = (formData: CostPresetFormData) => {
    const data = { ...formData, name: normalizeOptionalName(formData.name) }
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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsTemplateDialogOpen(true)}>
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Criar a partir de modelo
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Preset
          </Button>
        </div>
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
                  <TableHead>Nome</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{costPresetName(preset)}</p>
                        {preset.is_default && <DefaultBadge />}
                      </div>
                      {preset.description && (
                        <p className="text-xs text-neutral-500">{preset.description}</p>
                      )}
                    </TableCell>
                    <TableCell>{formatCurrencyFromReais(preset.labor_cost_per_hour)}</TableCell>
                    <TableCell>{preset.overhead_percentage}%</TableCell>
                    <TableCell>{preset.profit_margin_percentage}%</TableCell>
                    <TableCell>{formatCurrencyFromReais(preset.packaging_cost_per_item)}</TableCell>
                    <TableCell>{formatCurrencyFromReais(preset.shipping_cost_base)}</TableCell>
                    <TableCell className="text-right">
                      <PresetRowActions
                        itemLabel={costPresetName(preset)}
                        isDefault={!!preset.is_default}
                        canManageDefaults={canManageDefaults}
                        onEdit={() => handleOpenEdit(preset)}
                        onDuplicate={() => duplicatePreset(preset.id)}
                        onSetDefault={() => setDefaultPreset(preset.id)}
                        onDelete={() => setDeletingPreset(preset)}
                        isBusy={isSettingDefault || isDuplicating}
                      />
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
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <PresetNameField
                  label="Nome do Preset"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  suggestion={isNameEmpty ? suggestedName : undefined}
                  isSuggesting={isSuggesting}
                  error={fieldState.error?.message}
                />
              )}
            />
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Custos padrão da oficina"
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderCurrencyField('labor_cost_per_hour', 'Mão de Obra/Hora')}
              {renderCurrencyField('packaging_cost_per_item', 'Embalagem/Item')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderCurrencyField('shipping_cost_base', 'Envio Base')}
              {renderCurrencyField('shipping_cost_per_gram', 'Envio/Grama')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overhead_percentage">Overhead (%)</Label>
                <Input
                  id="overhead_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  aria-invalid={form.formState.errors.overhead_percentage ? true : undefined}
                  {...form.register('overhead_percentage', { valueAsNumber: true })}
                />
                {form.formState.errors.overhead_percentage && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.overhead_percentage.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="profit_margin_percentage">Margem de Lucro (%)</Label>
                <Input
                  id="profit_margin_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1000"
                  aria-describedby="profit_margin_percentage-help"
                  aria-invalid={form.formState.errors.profit_margin_percentage ? true : undefined}
                  {...form.register('profit_margin_percentage', { valueAsNumber: true })}
                />
                {form.formState.errors.profit_margin_percentage ? (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.profit_margin_percentage.message}
                  </p>
                ) : (
                  <p id="profit_margin_percentage-help" className="text-xs text-neutral-500 mt-1">
                    De 0% a 1000%
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderCurrencyField('post_processing_cost_per_hour', 'Pós-Processamento/Hora')}
              {renderCurrencyField('support_removal_cost_per_hour', 'Remoção Suporte/Hora')}
            </div>

            {renderCurrencyField('quality_control_cost_per_item', 'Controle Qualidade/Item')}

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

      <PresetTemplateDialog
        type="cost"
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      />

      <ConfirmDialog
        open={!!deletingPreset}
        onOpenChange={(open) => !open && setDeletingPreset(null)}
        title="Deletar preset"
        description={
          deletingPreset
            ? `Tem certeza que deseja deletar o preset "${costPresetName(deletingPreset)}"?`
            : 'Tem certeza que deseja deletar este preset de custo?'
        }
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}


