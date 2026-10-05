'use client'

import { AlertCircle, DollarSign, Info, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/format'
import { getApiErrorMessage } from '@/lib/api/errors'
import type { BudgetPreview } from '@/services/budget-service'

type PreviewItem = BudgetPreview['items'][number]

interface BudgetPreviewCardProps {
  preview: BudgetPreview | undefined
  /** Form item names, indexed by form position (used as labels). */
  itemNames: string[]
  isReady: boolean
  isLoading: boolean
  isUpdating: boolean
  error: unknown
}

function Row({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <>
      <dt className="text-neutral-600">{label}</dt>
      <dd className={className ?? 'text-right text-neutral-900'}>{formatCurrency(value)}</dd>
    </>
  )
}

function ItemBreakdown({ item, name }: { item: PreviewItem; name: string }) {
  return (
    <div className="border-b border-primary-200 pb-3">
      <div className="flex items-center justify-between mb-1 gap-2">
        <p className="font-medium text-sm text-neutral-900 truncate">
          {name}
          <span className="text-neutral-500 font-normal"> · {item.product_quantity} un.</span>
        </p>
        <p className="font-semibold text-primary-600">{formatCurrency(item.sale_total ?? item.item_total_cost)}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {item.filament_cost > 0 && <Row label="Filamento" value={item.filament_cost} />}
        {item.waste_cost > 0 && <Row label="Desperdício" value={item.waste_cost} />}
        {item.energy_cost > 0 && <Row label="Energia" value={item.energy_cost} />}
        {item.setup_cost > 0 && <Row label="Setup" value={item.setup_cost} />}
        {item.manual_labor_cost > 0 && <Row label="Mão de obra" value={item.manual_labor_cost} />}
        <Row label="Custo do item" value={item.item_total_cost} className="text-right font-medium" />
        {item.sale_unit_price !== undefined && (
          <Row
            label="Preço de venda unitário"
            value={item.sale_unit_price}
            className="text-right font-medium text-primary-700"
          />
        )}
      </dl>
      {item.cost_preset?.name && (
        <p className="text-xs text-neutral-500 mt-1">Preset de custo: {item.cost_preset.name}</p>
      )}
    </div>
  )
}

/** Cost breakdown computed by the API (`POST /budgets/preview`). */
export function BudgetPreviewCard({
  preview,
  itemNames,
  isReady,
  isLoading,
  isUpdating,
  error,
}: BudgetPreviewCardProps) {
  const subtotal = preview
    ? preview.filament_cost + preview.waste_cost + preview.energy_cost + preview.setup_cost + preview.labor_cost
    : 0
  const presetNames = preview
    ? [
        preview.profile?.name && `Perfil: ${preview.profile.name}`,
        preview.machine_preset?.name && `Máquina: ${preview.machine_preset.name}`,
        preview.energy_preset?.name && `Energia: ${preview.energy_preset.name}`,
        preview.cost_preset?.name && `Custos: ${preview.cost_preset.name}`,
      ].filter((label): label is string => !!label)
    : []

  return (
    <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary-600" aria-hidden="true" />
              Prévia de Custos
            </CardTitle>
            <CardDescription>Calculada pelo sistema com os dados e presets atuais</CardDescription>
          </div>
          <span aria-live="polite" className="text-xs text-neutral-500 flex items-center gap-1 min-h-4">
            {isReady && isUpdating && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Atualizando...
              </>
            )}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isReady ? (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              Adicione ao menos um filamento a um item para ver a prévia de custos.
            </AlertDescription>
          </Alert>
        ) : error && !preview ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {getApiErrorMessage(error, 'Não foi possível calcular a prévia. Revise os dados do orçamento.')}
            </AlertDescription>
          </Alert>
        ) : isLoading || !preview ? (
          <div className="space-y-3" aria-busy="true" aria-label="Calculando prévia">
            <Skeleton className="h-16" />
            <Skeleton className="h-10" />
            <Skeleton className="h-8" />
          </div>
        ) : (
          <>
            {error !== null && error !== undefined && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getApiErrorMessage(error, 'Não foi possível atualizar a prévia.')} Exibindo o último cálculo válido.
                </AlertDescription>
              </Alert>
            )}

            {presetNames.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Presets aplicados">
                {presetNames.map((label) => (
                  <li key={label} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {label}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3">
              {preview.items.map((item, idx) => (
                <ItemBreakdown
                  key={`${item.order}-${idx}`}
                  item={item}
                  name={itemNames[item.order] || item.product_name || `Item #${idx + 1}`}
                />
              ))}
            </div>

            <Separator />

            <dl className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-neutral-700 font-medium">Subtotal (custos diretos)</dt>
                <dd className="font-semibold">{formatCurrency(subtotal)}</dd>
              </div>
              {preview.overhead_cost > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">Overhead</dt>
                  <dd className="text-neutral-900">{formatCurrency(preview.overhead_cost)}</dd>
                </div>
              )}
              {preview.profit_amount > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">Margem de lucro</dt>
                  <dd className="text-green-700">{formatCurrency(preview.profit_amount)}</dd>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between pt-1">
                <dt className="font-bold text-neutral-900">Total</dt>
                <dd className="text-2xl font-bold text-primary-600">{formatCurrency(preview.total_cost)}</dd>
              </div>
              {preview.total_print_time_display && (
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <dt>Tempo total de impressão</dt>
                  <dd>{preview.total_print_time_display}</dd>
                </div>
              )}
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  )
}
