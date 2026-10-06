'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { CustomerSelect } from '@/components/customers/customer-select'
import { FilamentSelector } from '@/components/budgets/filament-selector'
import { Model3DCombobox } from '@/components/models3d'
import { BudgetPreviewCard } from '@/components/budgets/budget-preview-card'
import { ProfileSelect } from '@/components/presets/profile-select'
import { MachinePresetSelect } from '@/components/presets/machine-preset-select'
import { EnergyPresetSelect } from '@/components/presets/energy-preset-select'
import { CostPresetSelect } from '@/components/presets/cost-preset-select'
import { useBudgetPreview, useCreateBudget } from '@/lib/hooks/use-budgets'
import { useProfiles } from '@/lib/hooks/use-profiles'
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'
import { createBudgetSchema, type CreateBudgetFormData } from '@/lib/validations/budget'
import { optionalNumber } from '@/lib/validations/preset'
import { formatCurrency, getColorPreviewStyle } from '@/lib/utils/format'
import { buildBudgetPreviewPayload } from '@/lib/utils/budget-preview'
import { Plus, Trash2, Save, ArrowLeft, Settings, Users, Info, Clock, Loader2, FileUp } from 'lucide-react'
import type { Filament } from '@/types/models'
import { toast } from 'sonner'
import { SliceImportDialog, SliceModelPrompt, type SliceApplyPayload } from '@/components/slicer'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const PREVIEW_DEBOUNCE_MS = 400

/** Label for the empty preset option: the API resolves it (profile → default profile → default preset). */
const AUTO_PRESET_LABEL = 'Automático (perfil ou padrão)'

function newItem(order: number): CreateBudgetFormData['items'][number] {
  return {
    model_3d_id: undefined,
    product_name: '',
    product_description: '',
    product_quantity: 1,
    product_dimensions: '',
    print_time_hours: 0,
    print_time_minutes: 0,
    setup_time_minutes: 0,
    manual_labor_minutes_total: 0,
    additional_notes: '',
    filaments: [],
    order,
  }
}

export default function NewBudgetPage() {
  const router = useRouter()
  const { mutate: createBudget, isPending } = useCreateBudget()
  const { data: profiles } = useProfiles()
  const [selectedFilaments, setSelectedFilaments] = useState<Record<string, Filament>>({})
  const [sliceImport, setSliceImport] = useState<{ itemIndex: number; modelId?: string } | null>(null)

  const form = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: '',
      description: '',
      customer_id: '',
      profile_id: undefined,
      machine_preset_id: undefined,
      energy_preset_id: undefined,
      cost_preset_id: undefined,
      include_energy_cost: true,
      include_waste_cost: true,
      items: [newItem(0)],
    },
  })

  const { fields: items, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const values = useWatch({ control: form.control })

  // Fill a budget item from a slicer analysis: print time + replacing its filaments.
  // setValue updates the watched values, so the debounced server preview re-runs.
  const applySliceToItem = useCallback(
    (itemIndex: number, payload: SliceApplyPayload) => {
      const shouldValidate = form.formState.isSubmitted
      form.setValue(`items.${itemIndex}.print_time_hours`, payload.print_time_hours, { shouldValidate })
      form.setValue(`items.${itemIndex}.print_time_minutes`, payload.print_time_minutes, { shouldValidate })
      const filaments = payload.filaments.map((f) => ({
        filament_id: f.filament.id,
        quantity: f.quantity,
        order: f.order,
      }))
      form.setValue(`items.${itemIndex}.filaments`, filaments, { shouldValidate })
      setSelectedFilaments((prev) => {
        const next = { ...prev }
        for (const f of payload.filaments) next[f.filament.id] = f.filament
        return next
      })
      toast.success('Item preenchido a partir do fatiamento.')
    },
    [form]
  )

  // Choosing a profile fills the presets; the user can still override each one.
  const applyProfile = useCallback(
    (profileId: string | undefined) => {
      form.setValue('profile_id', profileId)
      const profile = profiles?.find((p) => p.id === profileId)
      if (!profile) return
      form.setValue('machine_preset_id', profile.machine_preset.id)
      form.setValue('energy_preset_id', profile.energy_preset.id)
      form.setValue('cost_preset_id', profile.cost_preset?.id ?? undefined)
    },
    [form, profiles]
  )

  // Preselect the organization's default profile once profiles load.
  const didPreselectProfile = useRef(false)
  useEffect(() => {
    if (didPreselectProfile.current || !profiles) return
    didPreselectProfile.current = true
    const defaultProfile = profiles.find((p) => p.is_default)
    if (defaultProfile && !form.getValues('profile_id')) applyProfile(defaultProfile.id)
  }, [profiles, applyProfile, form])

  // Server-side preview: the API is the single source of truth for budget math.
  const previewPayload = useMemo(() => buildBudgetPreviewPayload(values), [values])
  const debouncedPayload = useDebouncedValue(previewPayload, PREVIEW_DEBOUNCE_MS)
  const previewQuery = useBudgetPreview(debouncedPayload)
  const preview = debouncedPayload ? previewQuery.data : undefined
  const previewItemsByIndex = new Map((preview?.items ?? []).map((item) => [item.order, item]))
  const isPreviewDebouncing = JSON.stringify(previewPayload) !== JSON.stringify(debouncedPayload)
  const isPreviewUpdating = previewQuery.isFetching || isPreviewDebouncing

  const onSubmit = (data: CreateBudgetFormData) => {
    createBudget(
      {
        ...data,
        profile_id: data.profile_id || undefined,
        cost_preset_id: data.cost_preset_id || undefined,
      },
      {
        onSuccess: () => {
          router.push('/budgets')
        },
      }
    )
  }

  const addItem = () => {
    appendItem(newItem(items.length))
  }

  const addFilamentToItem = (itemIndex: number, filament: Filament | null) => {
    if (!filament) return

    const currentFilaments = form.getValues(`items.${itemIndex}.filaments`) || []

    const newFilament = {
      filament_id: filament.id,
      quantity: 100, // default 100g
      order: currentFilaments.length + 1,
    }

    form.setValue(`items.${itemIndex}.filaments`, [...currentFilaments, newFilament], {
      shouldValidate: form.formState.isSubmitted,
    })
    setSelectedFilaments(prev => ({ ...prev, [filament.id]: filament }))
  }

  const removeFilamentFromItem = (itemIndex: number, filamentIndex: number) => {
    const currentFilaments = form.getValues(`items.${itemIndex}.filaments`) || []
    const updated = currentFilaments
      .filter((_, i) => i !== filamentIndex)
      .map((fil, i) => ({ ...fil, order: i + 1 })) // Recalculate orders starting from 1
    form.setValue(`items.${itemIndex}.filaments`, updated)
  }

  const getFilament = (filamentId: string): Filament | undefined => {
    return selectedFilaments[filamentId]
  }

  const itemNames = (values.items ?? []).map(
    (item, idx) => item?.product_name?.trim() || `Item #${idx + 1}`
  )

  return (
    <div className="container max-w-5xl py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Novo Orçamento</h1>
          <p className="text-neutral-600 mt-1">
            Crie um orçamento detalhado para seu cliente
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Dados gerais do orçamento e cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                placeholder="Ex: Impressão de 100 chaveiros personalizados"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="customer">Cliente *</Label>
              <CustomerSelect
                value={values.customer_id ?? ''}
                onValueChange={(value) =>
                  form.setValue('customer_id', value, { shouldValidate: form.formState.isSubmitted })
                }
              />
              {form.formState.errors.customer_id && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.customer_id.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Detalhes adicionais sobre o projeto..."
                rows={3}
                {...form.register('description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Presets */}
        <Card>
          <CardHeader>
            <CardTitle>Presets de Cálculo</CardTitle>
            <CardDescription>
              Escolha um perfil de impressão ou ajuste cada preset individualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProfileSelect
              id="budget-profile"
              value={values.profile_id}
              onChange={applyProfile}
              noneLabel="Nenhum perfil"
              description="Ao escolher um perfil, os presets abaixo são preenchidos automaticamente."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                control={form.control}
                name="machine_preset_id"
                render={({ field }) => (
                  <MachinePresetSelect
                    id="budget-machine-preset"
                    value={field.value}
                    onChange={field.onChange}
                    label="Máquina"
                    placeholder="Selecione a máquina"
                    noneLabel={AUTO_PRESET_LABEL}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="energy_preset_id"
                render={({ field }) => (
                  <EnergyPresetSelect
                    id="budget-energy-preset"
                    value={field.value}
                    onChange={field.onChange}
                    label="Energia"
                    placeholder="Selecione o preset de energia"
                    noneLabel={AUTO_PRESET_LABEL}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="cost_preset_id"
                render={({ field }) => (
                  <CostPresetSelect
                    id="budget-cost-preset"
                    value={field.value}
                    onChange={field.onChange}
                    label="Custos (mão de obra, overhead e margem)"
                    placeholder="Selecione o preset de custo"
                    noneLabel={AUTO_PRESET_LABEL}
                    description="Aplicado a todos os itens do orçamento."
                  />
                )}
              />
            </div>
            <p className="text-xs text-neutral-500">
              Presets em &quot;Automático&quot; são resolvidos pelo sistema: perfil escolhido, depois o
              perfil padrão e, por fim, o preset padrão da organização. Gerencie-os em{' '}
              <strong>Presets</strong> no menu lateral.
            </p>

            <Separator />

            <div className="space-y-3">
              <Label>Opções de Custo</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_energy"
                  checked={values.include_energy_cost ?? true}
                  onCheckedChange={(checked) =>
                    form.setValue('include_energy_cost', checked === true)
                  }
                />
                <label
                  htmlFor="include_energy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Incluir custo de energia
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_waste"
                  checked={values.include_waste_cost ?? true}
                  onCheckedChange={(checked) =>
                    form.setValue('include_waste_cost', checked === true)
                  }
                />
                <label
                  htmlFor="include_waste"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Incluir custo de desperdício (AMS)
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        {items.map((item, itemIndex) => {
          const watchedItem = values.items?.[itemIndex]
          const watchedFilaments = watchedItem?.filaments ?? []
          const previewItem = previewItemsByIndex.get(itemIndex)

          return (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Item #{itemIndex + 1}</CardTitle>
                  <CardDescription>
                    Produto a ser impresso e seus filamentos
                  </CardDescription>
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(itemIndex)}
                    aria-label={`Remover item #${itemIndex + 1}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nome do Produto *</Label>
                  <Input
                    placeholder="Ex: Chaveiro Rosa/Branco"
                    {...form.register(`items.${itemIndex}.product_name`)}
                  />
                  {form.formState.errors.items?.[itemIndex]?.product_name && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.items[itemIndex]?.product_name?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Quantidade (unidades) *</Label>
                  <Input
                    type="number"
                    min="1"
                    {...form.register(`items.${itemIndex}.product_quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Descrição do Produto</Label>
                <Textarea
                  placeholder="Detalhes sobre o produto..."
                  rows={2}
                  {...form.register(`items.${itemIndex}.product_description`)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>Dimensões</Label>
                  <Input
                    placeholder="Ex: 26×48×9 mm"
                    {...form.register(`items.${itemIndex}.product_dimensions`)}
                  />
                </div>
                <div>
                  <Label>Tempo (horas)</Label>
                  <Input
                    type="number"
                    min="0"
                    {...form.register(`items.${itemIndex}.print_time_hours`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
                <div>
                  <Label>Tempo (minutos)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    {...form.register(`items.${itemIndex}.print_time_minutes`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>

              <Separator />

              {/* Filaments */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Label className="block">Filamentos *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSliceImport({ itemIndex })}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Importar arquivo fatiado
                  </Button>
                </div>
                <div className="space-y-3">
                  {watchedFilaments.map((f, fIndex) => {
                    const filament = f?.filament_id ? getFilament(f.filament_id) : undefined

                    return (
                      <div
                        key={`${f?.filament_id ?? 'filament'}-${fIndex}`}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-neutral-50"
                      >
                        {filament && (
                          <div
                            className="h-10 w-10 rounded-full border shrink-0"
                            style={getColorPreviewStyle(
                              filament.color_type,
                              filament.color_data
                            )}
                            aria-hidden="true"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {filament?.name || 'Filamento desconhecido'}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {filament?.brand_name} - {filament?.material_name} ({filament?.color})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            step="0.1"
                            placeholder="gramas"
                            className="w-24"
                            aria-label={`Quantidade em gramas de ${filament?.name ?? 'filamento'}`}
                            {...form.register(
                              `items.${itemIndex}.filaments.${fIndex}.quantity`,
                              { valueAsNumber: true }
                            )}
                          />
                          <span className="text-sm text-neutral-500">g</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFilamentFromItem(itemIndex, fIndex)}
                            aria-label={`Remover ${filament?.name ?? 'filamento'}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-3">
                  <FilamentSelector
                    onValueChange={(filament) => addFilamentToItem(itemIndex, filament)}
                    excludeIds={watchedFilaments
                      .map((f) => f?.filament_id)
                      .filter((id): id is string => !!id)}
                  />
                </div>

                {/* Model 3D selector (optional) */}
                <div className="mt-3 space-y-1">
                  <label
                    htmlFor={`model-3d-${itemIndex}`}
                    className="text-sm font-medium text-neutral-700"
                  >
                    Modelo 3D <span className="text-neutral-400 font-normal">(opcional)</span>
                  </label>
                  <Model3DCombobox
                    id={`model-3d-${itemIndex}`}
                    value={watchedItem?.model_3d_id}
                    onChange={(id) => form.setValue(`items.${itemIndex}.model_3d_id`, id)}
                    customerId={values.customer_id}
                  />
                </div>

                <SliceModelPrompt
                  modelId={watchedItem?.model_3d_id}
                  onImport={() => setSliceImport({ itemIndex, modelId: watchedItem?.model_3d_id })}
                />

                {form.formState.errors.items?.[itemIndex]?.filaments && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.items[itemIndex]?.filaments?.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* Labor time (rates come from the budget-level cost preset) */}
              <div className="space-y-4">
                {/* Labor Time Card */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tempo de Trabalho Manual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Setup Time */}
                      <div className="bg-white p-3 rounded-lg border">
                        <TooltipProvider>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="flex items-center gap-2">
                              <Settings className="h-3 w-3" />
                              Setup (uma vez)
                            </Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-neutral-400" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">
                                  O tempo de setup é cobrado UMA VEZ por produto, independente da quantidade.
                                  Inclui: preparação da impressora, troca de filamento, calibração, etc.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex: 15"
                          {...form.register(`items.${itemIndex}.setup_time_minutes`, {
                            valueAsNumber: true,
                          })}
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Minutos para preparar a máquina
                        </p>
                      </div>

                      {/* Manual Labor */}
                      <div className="bg-white p-3 rounded-lg border">
                        <TooltipProvider>
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              Trabalho Manual (total)
                            </Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-neutral-400" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="text-xs">
                                  Tempo total de trabalho manual para TODAS as {watchedItem?.product_quantity ?? 0} unidades.
                                  Inclui: pintura, lixamento, acabamento, embalagem, controle de qualidade, etc.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Ex: 60"
                          {...form.register(`items.${itemIndex}.manual_labor_minutes_total`, {
                            valueAsNumber: true,
                          })}
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                          Minutos de trabalho para todas as unidades
                        </p>
                        {(watchedItem?.product_quantity ?? 0) > 1 &&
                         (watchedItem?.manual_labor_minutes_total ?? 0) > 0 && (
                          <p className="text-xs text-primary-600 mt-1 font-medium">
                            ≈ {Math.round(
                              (watchedItem?.manual_labor_minutes_total ?? 0) /
                              (watchedItem?.product_quantity ?? 1)
                            )} min/unidade
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Item Total */}
              <div className="pt-3 border-t space-y-1" aria-live="polite">
                {previewItem ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Custo do item:</span>
                      <span className="text-neutral-900">{formatCurrency(previewItem.item_total_cost)}</span>
                    </div>
                    {previewItem.sale_unit_price !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">Preço de venda unitário:</span>
                        <span className="text-neutral-900">{formatCurrency(previewItem.sale_unit_price)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">Total de venda do item:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(previewItem.sale_total ?? previewItem.item_total_cost)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-neutral-500">
                    {watchedFilaments.length === 0
                      ? 'Adicione filamentos para calcular o total do item.'
                      : 'Calculando total do item...'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          )
        })}

        {/* Add Item Button */}
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Item
        </Button>

        {/* Cost Preview Card */}
        <BudgetPreviewCard
          preview={preview}
          itemNames={itemNames}
          isReady={previewPayload !== null}
          isLoading={previewQuery.isLoading || (previewPayload !== null && debouncedPayload === null)}
          isUpdating={isPreviewUpdating}
          error={previewQuery.error}
        />

        {/* Commercial Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Comerciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="delivery_days">Prazo de Entrega (dias)</Label>
                <Input
                  id="delivery_days"
                  type="number"
                  min="1"
                  placeholder="Ex: 7"
                  {...form.register('delivery_days', { setValueAs: optionalNumber })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment_terms">Condições de Pagamento</Label>
              <Textarea
                id="payment_terms"
                placeholder="Ex: 50% de entrada e 50% na entrega"
                rows={2}
                {...form.register('payment_terms')}
              />
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Notas adicionais..."
                rows={3}
                {...form.register('notes')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total and Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div aria-live="polite">
                <p className="text-sm text-neutral-600">Total do Orçamento:</p>
                <p className="text-3xl font-bold text-primary-600 flex items-center gap-2">
                  {preview ? formatCurrency(preview.total_cost) : '—'}
                  {isPreviewUpdating && previewPayload !== null && (
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" aria-label="Atualizando total" />
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  * Valor calculado pelo sistema; é confirmado ao salvar o orçamento
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-primary-500 hover:bg-primary-600"
              >
                <Save className="mr-2 h-4 w-4" />
                {isPending ? 'Salvando...' : 'Salvar Orçamento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <SliceImportDialog
        open={sliceImport !== null}
        onOpenChange={(next) => { if (!next) setSliceImport(null) }}
        modelId={sliceImport?.modelId}
        onApply={(payload) => {
          if (sliceImport) applySliceToItem(sliceImport.itemIndex, payload)
        }}
      />
    </div>
  )
}
