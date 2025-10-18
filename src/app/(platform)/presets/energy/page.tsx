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
  useEnergyPresets,
  useCreateEnergyPreset,
  useUpdateEnergyPreset,
  useDeleteEnergyPreset,
} from '@/lib/hooks/use-presets'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { energyPresetSchema, type EnergyPresetFormData } from '@/lib/validations/preset'
import { Plus, Edit, Trash2, Zap } from 'lucide-react'
import type { EnergyPreset } from '@/types/models'
import { formatCurrency } from '@/lib/utils/format'

export default function EnergyPresetsPage() {
  const { data: presets, isLoading } = useEnergyPresets()
  const { mutate: createPreset, isPending: isCreating } = useCreateEnergyPreset()
  const { mutate: updatePreset, isPending: isUpdating } = useUpdateEnergyPreset()
  const { mutate: deletePreset } = useDeleteEnergyPreset()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<EnergyPreset | null>(null)
  const [deletingPreset, setDeletingPreset] = useState<EnergyPreset | null>(null)

  const form = useForm<EnergyPresetFormData>({
    resolver: zodResolver(energyPresetSchema),
    defaultValues: {
      country: 'Brasil',
      state: '',
      city: '',
      energy_cost_per_kwh: 0,
      currency: 'BRL',
      provider: '',
      tariff_type: '',
      peak_hour_multiplier: 1.5,
      off_peak_hour_multiplier: 0.8,
    },
  })

  const handleOpenCreate = () => {
    setEditingPreset(null)
    form.reset({
      country: 'Brasil',
      state: '',
      city: '',
      energy_cost_per_kwh: 0,
      currency: 'BRL',
      provider: '',
      tariff_type: '',
      peak_hour_multiplier: 1.5,
      off_peak_hour_multiplier: 0.8,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (preset: EnergyPreset) => {
    setEditingPreset(preset)
    form.reset({
      country: preset.country || '',
      state: preset.state || '',
      city: preset.city || '',
      energy_cost_per_kwh: preset.energy_cost_per_kwh,
      currency: preset.currency,
      provider: preset.provider || '',
      tariff_type: preset.tariff_type || '',
      peak_hour_multiplier: preset.peak_hour_multiplier,
      off_peak_hour_multiplier: preset.off_peak_hour_multiplier,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = (data: EnergyPresetFormData) => {
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
                    <TableCell className="font-medium">
                      {getLocation(preset)}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {preset.provider || '—'}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(preset.energy_cost_per_kwh)} ({preset.currency})
                    </TableCell>
                    <TableCell>{preset.peak_hour_multiplier}x</TableCell>
                    <TableCell>{preset.off_peak_hour_multiplier}x</TableCell>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? 'Editar Preset' : 'Novo Preset'}
            </DialogTitle>
            <DialogDescription>
              Configure os custos de energia por localização e tarifa
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <Label htmlFor="energy_cost_per_kwh">Custo por kWh (R$) *</Label>
                <Input
                  id="energy_cost_per_kwh"
                  type="number"
                  step="0.01"
                  placeholder="0.85"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0
                    form.setValue('energy_cost_per_kwh', Math.round(value * 100))
                  }}
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
                <Label htmlFor="peak_hour_multiplier">Multiplicador Pico *</Label>
                <Input
                  id="peak_hour_multiplier"
                  type="number"
                  step="0.1"
                  placeholder="1.5"
                  {...form.register('peak_hour_multiplier', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="off_peak_hour_multiplier">Multiplicador Fora Pico *</Label>
                <Input
                  id="off_peak_hour_multiplier"
                  type="number"
                  step="0.1"
                  placeholder="0.8"
                  {...form.register('off_peak_hour_multiplier', { valueAsNumber: true })}
                />
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

      <ConfirmDialog
        open={!!deletingPreset}
        onOpenChange={(open) => !open && setDeletingPreset(null)}
        title="Deletar preset"
        description={
          deletingPreset
            ? `Tem certeza que deseja deletar o preset de "${getLocation(deletingPreset)}"?`
            : 'Tem certeza que deseja deletar este preset?'
        }
        onConfirm={handleDelete}
        confirmText="Deletar"
        variant="destructive"
      />
    </div>
  )
}

