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
  useMachinePresets,
  useCreateMachinePreset,
  useUpdateMachinePreset,
  useDeleteMachinePreset,
  useSetDefaultPreset,
  useDuplicatePreset,
  useSuggestPresetName,
} from '@/lib/hooks/use-presets'
import { useCanManageDefaults } from '@/lib/hooks/use-can-manage-defaults'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  machinePresetSchema,
  normalizeOptionalName,
  type MachinePresetFormData,
} from '@/lib/validations/preset'
import { Plus, Settings, LayoutTemplate } from 'lucide-react'
import type { MachinePreset } from '@/types/models'
import { formatCurrencyFromReais } from '@/lib/utils/format'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DefaultBadge } from '@/components/presets/default-badge'
import { PresetNameField } from '@/components/presets/preset-name-field'
import { PresetRowActions } from '@/components/presets/preset-row-actions'
import { PresetTemplateDialog } from '@/components/presets/preset-template-dialog'
import { machinePresetLabel } from '@/components/presets/machine-preset-select'

export default function MachinePresetsPage() {
  const { data: presets, isLoading } = useMachinePresets()
  const { mutate: createPreset, isPending: isCreating } = useCreateMachinePreset()
  const { mutate: updatePreset, isPending: isUpdating } = useUpdateMachinePreset()
  const { mutate: deletePreset } = useDeleteMachinePreset()
  const { mutate: setDefaultPreset, isPending: isSettingDefault } = useSetDefaultPreset('machine')
  const { mutate: duplicatePreset, isPending: isDuplicating } = useDuplicatePreset('machine')
  const canManageDefaults = useCanManageDefaults()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<MachinePreset | null>(null)
  const [deletingPreset, setDeletingPreset] = useState<MachinePreset | null>(null)

  const form = useForm<MachinePresetFormData>({
    resolver: zodResolver(machinePresetSchema),
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      model: '',
      build_volume_x: 256,
      build_volume_y: 256,
      build_volume_z: 256,
      nozzle_diameter: 0.4,
      layer_height_min: 0.08,
      layer_height_max: 0.32,
      print_speed_max: 500,
      power_consumption: 350,
      bed_temperature_max: 110,
      extruder_temperature_max: 300,
      filament_diameter: 1.75,
      cost_per_hour: 0,
    },
  })

  const handleOpenCreate = () => {
    setEditingPreset(null)
    form.reset({
      name: '',
      description: '',
      brand: '',
      model: '',
      build_volume_x: 256,
      build_volume_y: 256,
      build_volume_z: 256,
      nozzle_diameter: 0.4,
      layer_height_min: 0.08,
      layer_height_max: 0.32,
      print_speed_max: 500,
      power_consumption: 350,
      bed_temperature_max: 110,
      extruder_temperature_max: 300,
      filament_diameter: 1.75,
      cost_per_hour: 0,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (preset: MachinePreset) => {
    setEditingPreset(preset)
    form.reset({
      name: preset.name || '',
      description: preset.description || '',
      brand: preset.brand || '',
      model: preset.model || '',
      build_volume_x: preset.build_volume_x,
      build_volume_y: preset.build_volume_y,
      build_volume_z: preset.build_volume_z,
      nozzle_diameter: preset.nozzle_diameter,
      layer_height_min: preset.layer_height_min,
      layer_height_max: preset.layer_height_max,
      print_speed_max: preset.print_speed_max,
      power_consumption: preset.power_consumption,
      bed_temperature_max: preset.bed_temperature_max,
      extruder_temperature_max: preset.extruder_temperature_max,
      filament_diameter: preset.filament_diameter,
      cost_per_hour: preset.cost_per_hour,
    })
    setIsDialogOpen(true)
  }

  // Name suggestion (only while the name field is empty)
  const [nameValue, brand, model, nozzleDiameter] = useWatch({
    control: form.control,
    name: ['name', 'brand', 'model', 'nozzle_diameter'],
  })
  const isNameEmpty = !nameValue?.trim()
  const { data: suggestedName, isFetching: isSuggesting } = useSuggestPresetName(
    {
      type: 'machine',
      brand: brand || undefined,
      model: model || undefined,
      nozzle_diameter: Number.isFinite(nozzleDiameter) ? nozzleDiameter : undefined,
    },
    isDialogOpen && isNameEmpty
  )

  const handleSubmit = (formData: MachinePresetFormData) => {
    // Default status is changed only through the "Definir como padrão" action.
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Presets de Máquina</h1>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Novo Preset
          </Button>
        </div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Presets de Máquina</h1>
          <p className="text-neutral-600 mt-1">
            Configure as especificações técnicas das suas impressoras 3D
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

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {!presets || presets.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon={Settings}
                title="Nenhum preset encontrado"
                description="Crie seu primeiro preset de máquina para gerenciar suas impressoras"
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
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Volume (mm³)</TableHead>
                  <TableHead>Bico (mm)</TableHead>
                  <TableHead>Potência (W)</TableHead>
                  <TableHead>Custo/hora</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((preset) => (
                  <TableRow key={preset.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{machinePresetLabel(preset)}</p>
                          {preset.is_default && <DefaultBadge />}
                        </div>
                        {preset.description && (
                          <p className="text-xs text-neutral-500">{preset.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {preset.brand && preset.model
                        ? `${preset.brand} ${preset.model}`
                        : preset.brand || preset.model || '—'}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {preset.build_volume_x}×{preset.build_volume_y}×{preset.build_volume_z}
                    </TableCell>
                    <TableCell>{preset.nozzle_diameter}</TableCell>
                    <TableCell>{preset.power_consumption}</TableCell>
                    <TableCell>{formatCurrencyFromReais(preset.cost_per_hour)}</TableCell>
                    <TableCell className="text-right">
                      <PresetRowActions
                        itemLabel={machinePresetLabel(preset)}
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

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? 'Editar Preset' : 'Novo Preset'}
            </DialogTitle>
            <DialogDescription>
              Configure as especificações técnicas da impressora 3D
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name and Description */}
            <div className="space-y-4">
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
                  placeholder="Ex: Impressora profissional com alta precisão"
                  {...form.register('description')}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  placeholder="Ex: Bambu Lab"
                  {...form.register('brand')}
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  placeholder="Ex: X1 Carbon"
                  {...form.register('model')}
                />
              </div>
            </div>

            {/* Build Volume */}
            <div>
              <Label>Volume de Impressão (mm)</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="X"
                  {...form.register('build_volume_x', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Y"
                  {...form.register('build_volume_y', { valueAsNumber: true })}
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Z"
                  {...form.register('build_volume_z', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Nozzle & Filament */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nozzle_diameter">Diâmetro do Bico (mm)</Label>
                <Input
                  id="nozzle_diameter"
                  type="number"
                  step="0.01"
                  placeholder="0.4"
                  {...form.register('nozzle_diameter', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="filament_diameter">Diâmetro do Filamento (mm)</Label>
                <Input
                  id="filament_diameter"
                  type="number"
                  step="0.01"
                  placeholder="1.75"
                  {...form.register('filament_diameter', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Layer Height */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="layer_height_min">Altura Mín. Camada (mm)</Label>
                <Input
                  id="layer_height_min"
                  type="number"
                  step="0.01"
                  placeholder="0.08"
                  {...form.register('layer_height_min', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="layer_height_max">Altura Máx. Camada (mm)</Label>
                <Input
                  id="layer_height_max"
                  type="number"
                  step="0.01"
                  placeholder="0.32"
                  {...form.register('layer_height_max', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Speed & Power */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="print_speed_max">Velocidade Máx. (mm/s)</Label>
                <Input
                  id="print_speed_max"
                  type="number"
                  step="1"
                  placeholder="500"
                  {...form.register('print_speed_max', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="power_consumption">Consumo (Watts)</Label>
                <Input
                  id="power_consumption"
                  type="number"
                  step="1"
                  placeholder="350"
                  {...form.register('power_consumption', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Temperatures */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bed_temperature_max">Temp. Máx. Mesa (°C)</Label>
                <Input
                  id="bed_temperature_max"
                  type="number"
                  step="1"
                  placeholder="110"
                  {...form.register('bed_temperature_max', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="extruder_temperature_max">Temp. Máx. Extrusor (°C)</Label>
                <Input
                  id="extruder_temperature_max"
                  type="number"
                  step="1"
                  placeholder="300"
                  {...form.register('extruder_temperature_max', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Cost */}
            <div>
              <Label htmlFor="cost_per_hour">Custo por Hora</Label>
              <Controller
                control={form.control}
                name="cost_per_hour"
                render={({ field }) => (
                  <CurrencyInput
                    id="cost_per_hour"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="R$ 0,00"
                  />
                )}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Custo operacional por hora de impressão
              </p>
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

      <PresetTemplateDialog
        type="machine"
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingPreset}
        onOpenChange={(open) => !open && setDeletingPreset(null)}
        title="Deletar preset"
        description={`Tem certeza que deseja deletar o preset "${deletingPreset ? machinePresetLabel(deletingPreset) : ''}"?`}
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}

