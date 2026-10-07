'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { BudgetForm } from '@/components/budgets/budget-form'
import { useBudget } from '@/lib/hooks/use-budgets'
import { isoToDateInput } from '@/lib/utils/format'
import { STATUS_CONFIG } from '@/components/budgets/status-badge'
import { ArrowLeft, AlertCircle, Lock } from 'lucide-react'
import type { CreateBudgetFormData } from '@/lib/validations/budget'
import type { BudgetWithDetails, Filament } from '@/types/models'

/** Shipping override is stored in CENTS by the API but edited in REAIS in the form. */
function centsToReais(cents: number): number {
  return cents / 100
}

/** Map the detail response into the form's default values (inverse of the submit payload). */
function budgetToFormValues(budget: BudgetWithDetails): CreateBudgetFormData {
  return {
    name: budget.name,
    description: budget.description ?? '',
    customer_id: budget.customer_id,
    // Prefer the explicit id, falling back to the embedded preset refs.
    profile_id: budget.profile_id ?? budget.profile?.id ?? undefined,
    machine_preset_id: budget.machine_preset_id ?? budget.machine_preset?.id ?? undefined,
    energy_preset_id: budget.energy_preset_id ?? budget.energy_preset?.id ?? undefined,
    cost_preset_id: budget.cost_preset_id ?? budget.cost_preset?.id ?? undefined,
    include_energy_cost: budget.include_energy_cost,
    include_waste_cost: budget.include_waste_cost,
    include_machine_cost: budget.include_machine_cost ?? true,
    // `none` is the form-only placeholder for "no discount".
    discount_type: budget.discount_type ?? 'none',
    // Already REAIS for fixed / percent for percent (see Budget.discount_value).
    discount_value: budget.discount_value ?? undefined,
    include_shipping: budget.include_shipping ?? false,
    // Cents → reais for the input; the submit converts back.
    shipping_override:
      budget.shipping_override != null ? centsToReais(budget.shipping_override) : undefined,
    // null → undefined means "usar padrão da empresa".
    tax_rate: budget.tax_rate ?? undefined,
    delivery_days: budget.delivery_days ?? undefined,
    payment_terms: budget.payment_terms ?? '',
    notes: budget.notes ?? '',
    // ISO datetime → local YYYY-MM-DD for the date input.
    valid_until: isoToDateInput(budget.valid_until) || undefined,
    items: budget.items.map((item, index) => ({
      model_3d_id: item.model_3d_id ?? undefined,
      product_name: item.product_name,
      product_description: item.product_description ?? '',
      product_quantity: item.product_quantity,
      product_dimensions: item.product_dimensions ?? '',
      print_time_hours: item.print_time_hours,
      print_time_minutes: item.print_time_minutes,
      setup_time_minutes: item.setup_time_minutes ?? 0,
      manual_labor_minutes_total: item.manual_labor_minutes_total ?? 0,
      post_processing_minutes: item.post_processing_minutes ?? 0,
      support_removal_minutes: item.support_removal_minutes ?? 0,
      additional_notes: item.additional_notes ?? '',
      filaments: item.filaments.map((f, i) => ({
        filament_id: f.filament_id,
        quantity: f.quantity,
        order: i + 1,
      })),
      order: index,
    })),
  }
}

/**
 * Seed the filament lookup so the form renders names/colors for the budget's
 * pre-selected filaments without re-fetching each one. The detail response already
 * embeds the display fields the form reads.
 */
function budgetToSelectedFilaments(budget: BudgetWithDetails): Record<string, Filament> {
  const map: Record<string, Filament> = {}
  for (const item of budget.items) {
    for (const f of item.filaments) {
      let colorData = f.color_data
      if (typeof colorData === 'string') {
        try {
          colorData = JSON.parse(colorData)
        } catch {
          colorData = {}
        }
      }
      // Only the display fields the form reads are populated.
      map[f.filament_id] = {
        id: f.filament_id,
        name: f.filament_name,
        brand_name: f.brand_name,
        material_name: f.material_name,
        color: f.color,
        color_type: f.color_type,
        color_data: colorData,
        color_hex: f.color_hex,
      } as Filament
    }
  }
  return map
}

export default function EditBudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: budget, isLoading, error } = useBudget(id)

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (error || !budget) {
    return (
      <div className="container max-w-5xl py-6">
        <EmptyState
          icon={AlertCircle}
          title="Orçamento não encontrado"
          description="O orçamento que você está tentando editar não existe ou foi deletado."
          action={
            <Button onClick={() => router.push('/budgets')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para orçamentos
            </Button>
          }
        />
      </div>
    )
  }

  // The API only allows editing drafts — show a read-only notice for anything else.
  if (budget.status !== 'draft') {
    const statusLabel = STATUS_CONFIG[budget.status]?.label ?? budget.status
    return (
      <div className="container max-w-3xl py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Editar Orçamento</h1>
            <p className="text-neutral-600 mt-1">{budget.name}</p>
          </div>
        </div>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Edição indisponível</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Apenas orçamentos em rascunho podem ser editados. Este orçamento está no status{' '}
              <strong>{statusLabel}</strong>.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild variant="outline" size="sm">
                <Link href={`/budgets/${id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao orçamento
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <BudgetForm
      mode="edit"
      budgetId={id}
      initialValues={budgetToFormValues(budget)}
      initialSelectedFilaments={budgetToSelectedFilaments(budget)}
    />
  )
}
