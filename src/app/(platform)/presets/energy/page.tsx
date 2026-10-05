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
  useEnergyPresets,
  useCreateEnergyPreset,
  useUpdateEnergyPreset,
  useDeleteEnergyPreset,
  useSetDefaultPreset,
  useDuplicatePreset,
  useSuggestPresetName,
} from '@/lib/hooks/use-presets'
import { useCanManageDefaults } from '@/lib/hooks/use-can-manage-defaults'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  energyPresetSchema,
  normalizeOptionalName,
  optionalNumber,
  type EnergyPresetFormData,
} from '@/lib/validations/preset'
import { Plus, Zap, LayoutTemplate } from 'lucide-react'
import type { EnergyPreset } from '@/types/models'
import { formatCurrencyFromReais } from '@/lib/utils/format'
import { DefaultBadge } from '@/components/presets/default-badge'
import { PresetNameField } from '@/components/presets/preset-name-field'
import { PresetRowActions } from '@/components/presets/preset-row-actions'
import { PresetTemplateDialog } from '@/components/presets/preset-template-dialog'
import { energyPresetLabel } from '@/components/presets/energy-preset-select'

const EMPTY_FORM: EnergyPresetFormData = {
  name: '',
  description: '',
  country: 'Brasil',
  state: '',
  city: '',
  energy_cost_per_kwh: 0,
  currency: 'BRL',
  provider: '',
  tariff_type: '',
  peak_hour_multiplier: undefined,
  off_peak_hour_multiplier: undefined,
}

/** Multipliers are optional; the API returns 0 when they are not set. */
function formatMultiplier(value: number | undefined): string {
  return value ? `${value}x` : '—'
}

export default function EnergyPresetsPage() {
  const { data: presets, isLoading } = useEnergyPresets()
  const { mutate: createPreset, isPending: isCreating } = useCreateEnergyPreset()
  const { mutate: updatePreset, isPending: isUpdating } = useUpdateEnergyPreset()
  const { mutate: deletePreset } = useDeleteEnergyPreset()
  const { mutate: setDefaultPreset, isPending: isSettingDefault } = useSetDefaultPreset('energy')
  const { mutate: duplicatePreset, isPending: isDuplicating } = useDuplicatePreset('energy')
  const canManageDefaults = useCanManageDefaults()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<EnergyPreset | null>(null)
  const [deletingPreset, setDeletingPreset] = useState<EnergyPreset | null>(null)

  const form = useForm<EnergyPresetFormData>({
    resolver: zodResolver(energyPresetSchema),
    defaultValues: EMPTY_FORM,
  })

  const handleOpenCreate = () => {
    setEditingPreset(null)
    form.reset(EMPTY_FORM)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (preset: EnergyPreset) => {
    setEditingPreset(preset)
    form.reset({
      name: preset.name || '',
      description: preset.description || '',
      country: preset.country || '',
      state: preset.state || '',
      city: preset.city || '',
      energy_cost_per_kwh: preset.energy_cost_per_kwh,
      currency: preset.currency,
      provider: preset.provider || '',
      tariff_type: preset.tariff_type || '',
      peak_hour_multiplier: preset.peak_hour_multiplier || undefined,
      off_peak_hour_multiplier: preset.off_peak_hour_multiplier || undefined,
    })
    setIsDialogOpen(true)
  }

  // Name suggestion (only while the name field is empty)
  const [nameValue, provider, city, state, energyCost] = useWatch({
    control: form.control,
    name: ['name', 'provider', 'city', 'state', 'energy_cost_per_kwh'],
  })
  const isNameEmpty = !nameValue?.trim()
  const { data: suggestedName, isFetching: isSuggesting } = useSuggestPresetName(
    {
      type: 'energy',
      provider: provider || undefined,
      city: city || undefined,
      state: state || undefined,
      energy_cost_per_kwh: energyCost || undefined,
    },
    isDialogOpen && isNameEmpty
  )

  const handleSubmit = (formData: EnergyPresetFormData) => {
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

  const getLocation = (preset: EnergyPreset) => {
    const parts = [preset.city, preset.state, preset.country].filter(Boolean)
    return parts.join(', ') || '—'
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
          <h1 className="text-3xl font-bold text-neutral-900">Presets de Energia</h1>
          <p className="text-neutral-600 mt-1">
            Configure os custos de energia por localização e tarifa
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
                icon={Zap}
                title="Nenhum preset encontrado"
                description="Crie seu primeiro preset de energia para calcular custos energéticos"
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
                  <TableHead>Localização</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Custo/kWh</TableHead>
                  <TableHead>Pico</TableHead>
                  <TableHead>Fora Pico</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((preset) => (
                  <TableRow key={preset.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{energyPresetLabel(preset)}</p>
                        {preset.is_default && <DefaultBadge />}
                      </div>
                      {preset.description && (
                        <p className="text-xs text-neutral-500">{preset.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-neutral-600">{getLocation(preset)}</TableCell>
                    <TableCell className="text-neutral-600">
                      {preset.provider || '—'}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyFromReais(preset.energy_cost_per_kwh)} ({preset.currency})
                    </TableCell>
                    <TableCell>{formatMultiplier(preset.peak_hour_multiplier)}</TableCell>
                    <TableCell>{formatMultiplier(preset.off_peak_hour_multiplier)}</TableCell>
                    <TableCell className="text-right">
                      <PresetRowActions
                        itemLabel={energyPresetLabel(preset)}
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
              Configure os custos de energia por localização e tarifa
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
                placeholder="Ex: Tarifa residencial convencional"
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">País</Label>
                <Input id="country" placeholder="Brasil" {...form.register('country')} />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="SP" {...form.register('state')} />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" placeholder="São Paulo" {...form.register('city')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="energy_cost_per_kwh">Custo por kWh *</Label>
                <Controller
                  control={form.control}
                  name="energy_cost_per_kwh"
                  render={({ field, fieldState }) => (
                    <>
                      <CurrencyInput
                        id="energy_cost_per_kwh"
                        showCurrencySymbol
                        value={field.value || 0}
                        onChange={field.onChange}
                        placeholder="R$ 0,85"
                        aria-invalid={fieldState.error ? true : undefined}
                      />
                      {fieldState.error && (
                        <p className="text-sm text-red-600 mt-1">{fieldState.error.message}</p>
                      )}
                    </>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="currency">Moeda *</Label>
                <Input
                  id="currency"
                  placeholder="BRL"
                  maxLength={3}
                  {...form.register('currency')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Fornecedor</Label>
                <Input id="provider" placeholder="Ex: CPFL" {...form.register('provider')} />
              </div>
              <div>
                <Label htmlFor="tariff_type">Tipo de Tarifa</Label>
                <Input
                  id="tariff_type"
                  placeholder="Ex: Branca"
                  {...form.register('tariff_type')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="peak_hour_multiplier">
                  Multiplicador Pico <span className="font-normal text-neutral-500">(opcional)</span>
                </Label>
                <Input
                  id="peak_hour_multiplier"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 1.5"
                  {...form.register('peak_hour_multiplier', { setValueAs: optionalNumber })}
                />
                {form.formState.errors.peak_hour_multiplier && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.peak_hour_multiplier.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="off_peak_hour_multiplier">
                  Multiplicador Fora Pico <span className="font-normal text-neutral-500">(opcional)</span>
                </Label>
                <Input
                  id="off_peak_hour_multiplier"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ex: 0.8"
                  {...form.register('off_peak_hour_multiplier', { setValueAs: optionalNumber })}
                />
                {form.formState.errors.off_peak_hour_multiplier && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.off_peak_hour_multiplier.message}
                  </p>
                )}
              </div>
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
        type="energy"
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
      />

      <ConfirmDialog
        open={!!deletingPreset}
        onOpenChange={(open) => !open && setDeletingPreset(null)}
        title="Deletar preset"
        description={
          deletingPreset
            ? `Tem certeza que deseja deletar o preset "${energyPresetLabel(deletingPreset)}"?`
            : 'Tem certeza que deseja deletar este preset?'
        }
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}

