'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AlertTriangle, PlusCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StockMovementHistory } from '@/components/catalog/stock-movement-history'
import {
  useFilament,
  useUpdateFilament,
  useCreateStockMovement,
} from '@/lib/hooks/use-filaments'
import { buildStockSettingsPayload } from '@/services/filament-service'
import { stockMovementSchema, type StockMovementFormData } from '@/lib/validations/catalog'
import { getApiErrorMessage } from '@/lib/api/errors'
import { STOCK_ERROR_BY_CODE } from '@/lib/catalog/stock'
import { formatGrams, getColorPreviewStyle } from '@/lib/utils/format'
import type { Filament } from '@/types/models'

interface FilamentStockDialogProps {
  filament: Filament | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOVEMENT_TYPE_OPTIONS = [
  { value: 'purchase', label: 'Compra' },
  { value: 'adjustment', label: 'Ajuste' },
  { value: 'waste', label: 'Perda' },
] as const

export function FilamentStockDialog({ filament, open, onOpenChange }: FilamentStockDialogProps) {
  const filamentId = filament?.id ?? ''
  const { data: liveFilament } = useFilament(filamentId)
  // Prefer the freshest server data; fall back to the row that opened the dialog.
  const current = liveFilament ?? filament

  const { mutate: updateFilament, isPending: isSavingSettings } = useUpdateFilament()
  const { mutate: createMovement, isPending: isSubmitting } = useCreateStockMovement()

  // Stock settings (kept local so the user can edit before saving).
  const [trackStock, setTrackStock] = useState(false)
  const [threshold, setThreshold] = useState('')
  const [thresholdError, setThresholdError] = useState<string | null>(null)
  // True while the user has unsaved edits to the settings (blocks background re-sync).
  const settingsDirty = useRef(false)
  // Filament id whose settings were last initialized from fresh server data.
  const initializedFor = useRef<string | null>(null)

  // Purchase helper: spools × weight per spool fills the grams field.
  const [spools, setSpools] = useState('')
  const [spoolWeight, setSpoolWeight] = useState('')

  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { type: 'purchase', grams: undefined, note: '', unit_price_reais: undefined },
  })

  const movementType = form.watch('type')

  // Sync settings when the dialog opens or targets a different filament.
  useEffect(() => {
    if (!open || !filament) return
    setTrackStock(filament.track_stock ?? false)
    setThreshold(
      filament.low_stock_threshold_grams != null ? String(filament.low_stock_threshold_grams) : ''
    )
    setThresholdError(null)
    settingsDirty.current = false
    initializedFor.current = null
    setSpools('')
    setSpoolWeight('')
    form.reset({ type: 'purchase', grams: undefined, note: '', unit_price_reais: undefined })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filament?.id])

  // Re-sync settings from the live filament once it loads, so stale row data is never saved.
  useEffect(() => {
    if (!open || !liveFilament || liveFilament.id !== filament?.id) return
    if (initializedFor.current === liveFilament.id || settingsDirty.current) return
    initializedFor.current = liveFilament.id
    setTrackStock(liveFilament.track_stock ?? false)
    setThreshold(
      liveFilament.low_stock_threshold_grams != null
        ? String(liveFilament.low_stock_threshold_grams)
        : ''
    )
  }, [open, liveFilament, filament?.id])

  if (!filament) return null

  const stockGrams = current?.stock_grams ?? 0
  const isLowStock = current?.is_low_stock ?? false
  const isTracked = current?.track_stock ?? false

  const handleSaveSettings = () => {
    const parsedThreshold = threshold.trim() === '' ? '' : Number(threshold)
    if (parsedThreshold !== '' && (!Number.isInteger(parsedThreshold) || parsedThreshold < 0)) {
      setThresholdError('Informe um número inteiro de gramas maior ou igual a zero.')
      return
    }
    setThresholdError(null)

    updateFilament(
      {
        id: filament.id,
        data: buildStockSettingsPayload({
          track_stock: trackStock,
          low_stock_threshold_grams: parsedThreshold,
        }),
      },
      {
        onSuccess: () => {
          settingsDirty.current = false
          toast.success('Configurações de estoque salvas!')
        },
        onError: (error: unknown) =>
          toast.error(
            getApiErrorMessage(error, 'Erro ao salvar configurações de estoque', {
              byCode: STOCK_ERROR_BY_CODE,
            })
          ),
      }
    )
  }

  const applyPurchaseHelper = (nextSpools: string, nextWeight: string) => {
    const count = Number(nextSpools)
    const weight = Number(nextWeight)
    if (count > 0 && weight > 0) {
      form.setValue('grams', Math.round(count * weight), { shouldValidate: true })
    } else {
      form.setValue('grams', undefined as unknown as number)
    }
  }

  const handleSubmit = (data: StockMovementFormData) => {
    const note = data.note?.trim()
    createMovement(
      {
        id: filament.id,
        data: {
          type: data.type,
          grams: data.grams,
          note: note ? note : undefined,
          unit_price_per_kg:
            data.type === 'purchase' && data.unit_price_reais
              ? Math.round(data.unit_price_reais * 100)
              : undefined,
        },
      },
      {
        onSuccess: (result) => {
          toast.success('Movimentação registrada!')
          // Any manual movement turns stock tracking on.
          // Leave the threshold input alone, and don't clobber unsaved settings edits.
          if (!settingsDirty.current) {
            setTrackStock(result.filament.track_stock)
          }
          form.reset({ type: data.type, grams: undefined, note: '', unit_price_reais: undefined })
          setSpools('')
          setSpoolWeight('')
        },
        onError: (error: unknown) =>
          toast.error(
            getApiErrorMessage(error, 'Erro ao registrar movimentação', {
              byCode: STOCK_ERROR_BY_CODE,
            })
          ),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span
              className="h-6 w-6 rounded-md border border-neutral-200"
              style={getColorPreviewStyle(filament.color_type, filament.color_data)}
              aria-hidden="true"
            />
            Estoque · {filament.name}
          </DialogTitle>
          <DialogDescription>
            Controle o saldo de filamento e registre compras, ajustes e perdas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Balance + settings */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500">Saldo atual</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {isTracked ? formatGrams(stockGrams) : '—'}
                </p>
              </div>
              {isTracked && isLowStock && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                  Estoque baixo
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="track-stock">Controlar estoque</Label>
                <p className="text-xs text-neutral-500">
                  Acompanhe o saldo e receba alertas de estoque baixo.
                </p>
              </div>
              <Switch id="track-stock" checked={trackStock} onCheckedChange={(checked) => {
                  settingsDirty.current = true
                  setTrackStock(checked)
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low-stock-threshold">Alertar quando abaixo de (g)</Label>
              <Input
                id="low-stock-threshold"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Ex: 200"
                value={threshold}
                onChange={(e) => {
                  settingsDirty.current = true
                  setThreshold(e.target.value)
                  setThresholdError(null)
                }}
              />
              {thresholdError && <p className="text-sm text-error">{thresholdError}</p>}
              <p className="text-xs text-neutral-500">Deixe em branco para não receber alertas.</p>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
              >
                {isSavingSettings ? 'Salvando...' : 'Salvar configurações'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Movement form */}
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <h4 className="text-sm font-semibold text-neutral-900">Registrar movimentação</h4>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="movement-type">Tipo</Label>
                <Select
                  value={movementType}
                  onValueChange={(value) =>
                  {
                    form.setValue('type', value as StockMovementFormData['type'], {
                      shouldValidate: form.formState.isSubmitted,
                    })
                    // The price only applies to purchases; never keep a hidden stale value.
                    if (value !== 'purchase') {
                      form.setValue('unit_price_reais', undefined)
                    }
                  }
                }
                >
                  <SelectTrigger id="movement-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="movement-grams">Quantidade (g)</Label>
                <Input
                  id="movement-grams"
                  type="number"
                  step="1"
                  placeholder="Ex: 1000"
                  {...form.register('grams', { valueAsNumber: true })}
                />
                {movementType === 'adjustment' && (
                  <p className="text-xs text-neutral-500">Use negativo para reduzir.</p>
                )}
                {form.formState.errors.grams && (
                  <p className="text-sm text-error">{form.formState.errors.grams.message}</p>
                )}
              </div>
            </div>

            {movementType === 'purchase' && (
              <div className="rounded-md bg-neutral-50 p-3 space-y-3">
                <p className="text-xs font-medium text-neutral-600">
                  Calcular por carretéis (carretéis × peso do carretel)
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="spools" className="text-xs">
                      Carretéis
                    </Label>
                    <Input
                      id="spools"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex: 2"
                      value={spools}
                      onChange={(e) => {
                        setSpools(e.target.value)
                        applyPurchaseHelper(e.target.value, spoolWeight)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="spool-weight" className="text-xs">
                      Peso do carretel (g)
                    </Label>
                    <Input
                      id="spool-weight"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Ex: 1000"
                      value={spoolWeight}
                      onChange={(e) => {
                        setSpoolWeight(e.target.value)
                        applyPurchaseHelper(spools, e.target.value)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="unit-price" className="text-xs">
                      Preço por kg (opcional)
                    </Label>
                    <CurrencyInput
                      id="unit-price"
                      showCurrencySymbol
                      value={form.watch('unit_price_reais')}
                      onChange={(value) =>
                        form.setValue('unit_price_reais', value > 0 ? value : undefined)
                      }
                      placeholder="R$ 120,00"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="movement-note">Observação (opcional)</Label>
              <Textarea
                id="movement-note"
                rows={2}
                maxLength={500}
                placeholder="Ex: Compra no fornecedor X"
                {...form.register('note')}
              />
              {form.formState.errors.note && (
                <p className="text-sm text-error">{form.formState.errors.note.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-500 hover:bg-primary-600 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Registrando...' : 'Registrar movimentação'}
              </Button>
            </div>
          </form>

          <Separator />

          <StockMovementHistory filamentId={filament.id} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
