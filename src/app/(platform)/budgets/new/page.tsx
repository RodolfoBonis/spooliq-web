'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
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
import { MachinePresetSelect } from '@/components/presets/machine-preset-select'
import { EnergyPresetSelect } from '@/components/presets/energy-preset-select'
import { CostPresetSelect } from '@/components/presets/cost-preset-select'
import { useCreateBudget } from '@/lib/hooks/use-budgets'
import { useMachinePreset, useEnergyPreset, useCostPreset } from '@/lib/hooks/use-presets'
import { createBudgetSchema, type CreateBudgetFormData } from '@/lib/validations/budget'
import { formatCurrency, getColorPreviewStyle } from '@/lib/utils/format'
import {
  calculateSingleFilamentCost,
  calculateFilamentCost,
  calculateWasteCost,
  calculateEnergyCost,
  calculateSetupCost,
  calculateManualLaborCost,
  calculateItemTotal,
  calculateBudgetSubtotal,
  calculateOverheadCost,
  calculateProfitAmount,
  calculateBudgetTotal,
} from '@/lib/utils/budget-calculations'
import { Plus, Trash2, Save, ArrowLeft, Settings, Users, Info, Clock, DollarSign } from 'lucide-react'
import type { Filament, MachinePreset, EnergyPreset, CostPreset } from '@/types/models'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export default function NewBudgetPage() {
  const router = useRouter()
  const { mutate: createBudget, isPending } = useCreateBudget()
  const [selectedFilaments, setSelectedFilaments] = useState<Record<string, Filament>>({})

  const form = useForm<CreateBudgetFormData>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: {
      name: '',
      description: '',
      customer_id: '',
      machine_preset_id: undefined,
      energy_preset_id: undefined,
      include_energy_cost: true,
      include_waste_cost: true,
      items: [
        {
          product_name: '',
          product_description: '',
          product_quantity: 1,
          product_dimensions: '',
          print_time_hours: 0,
          print_time_minutes: 0,
          cost_preset_id: undefined,
          setup_time_minutes: 0,
          manual_labor_minutes_total: 0,
          additional_notes: '',
          filaments: [],
          order: 0,
        },
      ],
    },
  })

  const { fields: items, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Fetch preset data for calculations
  const machinePresetId = form.watch('machine_preset_id')
  const energyPresetId = form.watch('energy_preset_id')

  const { data: machinePreset } = useMachinePreset(machinePresetId || '')
  const { data: energyPreset } = useEnergyPreset(energyPresetId || '')

  // Track cost presets for each item (using first item's preset for budget-level calculations)
  const [itemCostPresets, setItemCostPresets] = useState<Record<number, CostPreset | undefined>>({})

  // Fetch cost preset for first item (used for budget-level overhead/profit)
  const firstItemCostPresetId = form.watch('items.0.cost_preset_id')
  const { data: firstItemCostPreset } = useCostPreset(firstItemCostPresetId || '')

  const onSubmit = (data: CreateBudgetFormData) => {
    createBudget(data, {
      onSuccess: () => {
        router.push('/budgets')
      },
    })
  }

  const addItem = () => {
    appendItem({
      product_name: '',
      product_description: '',
      product_quantity: 1,
      product_dimensions: '',
      print_time_hours: 0,
      print_time_minutes: 0,
      cost_preset_id: undefined,
      setup_time_minutes: 0,
      manual_labor_minutes_total: 0,
      additional_notes: '',
      filaments: [],
      order: items.length,
    })
  }

  const addFilamentToItem = (itemIndex: number, filament: Filament | null) => {
    if (!filament) return

    const currentFilaments = form.getValues(`items.${itemIndex}.filaments`) || []
    
    const newFilament = {
      filament_id: filament.id,
      quantity: 100, // default 100g
      order: currentFilaments.length + 1,
    }

    form.setValue(`items.${itemIndex}.filaments`, [...currentFilaments, newFilament])
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

  // Helper to get cost preset for an item
  const getCostPresetForItem = (itemIndex: number): CostPreset | undefined => {
    const itemCostPresetId = form.watch(`items.${itemIndex}.cost_preset_id`)
    // For simplicity, we'll use firstItemCostPreset for all items in preview
    // This matches backend behavior which uses first available cost preset
    return itemCostPresetId ? firstItemCostPreset : undefined
  }

  // Calculate individual item costs using imported functions
  const calculateItemFilamentCost = (itemIndex: number): number => {
    const item = form.getValues(`items.${itemIndex}`)
    if (!item) return 0
    return calculateFilamentCost(item, getFilament)
  }

  const calculateItemWasteCost = (itemIndex: number): number => {
    const item = form.getValues(`items.${itemIndex}`)
    if (!item) return 0
    return calculateWasteCost(item, form.watch('include_waste_cost'), getFilament)
  }

  const calculateItemEnergyCost = (itemIndex: number): number => {
    const item = form.getValues(`items.${itemIndex}`)
    if (!item) return 0
    return calculateEnergyCost(item, form.watch('include_energy_cost'), machinePreset, energyPreset)
  }

  const calculateItemSetupCost = (itemIndex: number): number => {
    const item = form.getValues(`items.${itemIndex}`)
    if (!item) return 0
    return calculateSetupCost(item, getCostPresetForItem(itemIndex))
  }

  const calculateItemManualLaborCost = (itemIndex: number): number => {
    const item = form.getValues(`items.${itemIndex}`)
    if (!item) return 0
    return calculateManualLaborCost(item, getCostPresetForItem(itemIndex))
  }

  const calculateItemTotalCost = (itemIndex: number): number => {
    const item = form.getValues(`items.${itemIndex}`)
    if (!item) return 0

    const budget = {
      include_energy_cost: form.watch('include_energy_cost'),
      include_waste_cost: form.watch('include_waste_cost'),
      items: form.getValues('items'),
    }

    return calculateItemTotal(
      item,
      budget,
      getFilament,
      machinePreset,
      energyPreset,
      getCostPresetForItem(itemIndex)
    )
  }

  const calculateBudgetSubtotalCost = (): number => {
    const budget = {
      include_energy_cost: form.watch('include_energy_cost'),
      include_waste_cost: form.watch('include_waste_cost'),
      items: form.getValues('items'),
    }

    return calculateBudgetSubtotal(
      budget,
      getFilament,
      machinePreset,
      energyPreset,
      getCostPresetForItem
    )
  }

  const calculateBudgetOverheadCost = (): number => {
    const subtotal = calculateBudgetSubtotalCost()
    return calculateOverheadCost(subtotal, firstItemCostPreset)
  }

  const calculateBudgetProfitAmount = (): number => {
    const subtotal = calculateBudgetSubtotalCost()
    const overhead = calculateBudgetOverheadCost()
    return calculateProfitAmount(subtotal, overhead, firstItemCostPreset)
  }

  const calculateBudgetTotalCost = (): number => {
    const subtotal = calculateBudgetSubtotalCost()
    const overhead = calculateBudgetOverheadCost()
    const profit = calculateBudgetProfitAmount()
    return subtotal + overhead + profit
  }

  return (
    <div className="container max-w-5xl py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
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
                value={form.watch('customer_id')}
                onValueChange={(value) => form.setValue('customer_id', value)}
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
              Selecione os presets para cálculo automático de custos (opcional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MachinePresetSelect
                value={form.watch('machine_preset_id')}
                onChange={(value) => form.setValue('machine_preset_id', value)}
                label="Máquina"
                placeholder="Selecione a máquina"
              />
              <EnergyPresetSelect
                value={form.watch('energy_preset_id')}
                onChange={(value) => form.setValue('energy_preset_id', value)}
                label="Energia"
                placeholder="Selecione o preset de energia"
              />
            </div>
            <p className="text-xs text-neutral-500">
              💡 Os presets são usados para calcular automaticamente custos de energia e desperdício.
              Você pode criar novos presets em <strong>Presets</strong> no menu lateral.
            </p>

            <Separator />

            <div className="space-y-3">
              <Label>Opções de Custo</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_energy"
                  checked={form.watch('include_energy_cost')}
                  onCheckedChange={(checked) =>
                    form.setValue('include_energy_cost', checked as boolean)
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
                  checked={form.watch('include_waste_cost')}
                  onCheckedChange={(checked) =>
                    form.setValue('include_waste_cost', checked as boolean)
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
        {items.map((item, itemIndex) => (
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
                <Label className="mb-2 block">Filamentos *</Label>
                <div className="space-y-3">
                  {(form.watch(`items.${itemIndex}.filaments`) || []).map((f, fIndex) => {
                    const filament = getFilament(f.filament_id)
                    const cost = calculateSingleFilamentCost(filament, f.quantity)

                    return (
                      <div
                        key={fIndex}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-neutral-50"
                      >
                        {filament && (
                          <div
                            className="h-10 w-10 rounded-full border shrink-0"
                            style={getColorPreviewStyle(
                              filament.color_type,
                              filament.color_data
                            )}
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
                            {...form.register(
                              `items.${itemIndex}.filaments.${fIndex}.quantity`,
                              { valueAsNumber: true }
                            )}
                          />
                          <span className="text-sm text-neutral-500 min-w-[80px] text-right">
                            {formatCurrency(cost)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFilamentFromItem(itemIndex, fIndex)}
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
                    excludeIds={
                      (form.watch(`items.${itemIndex}.filaments`) || []).map(
                        (f) => f.filament_id
                      )
                    }
                  />
                </div>

                {form.formState.errors.items?.[itemIndex]?.filaments && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.items[itemIndex]?.filaments?.message}
                  </p>
                )}
              </div>

              <Separator />

              {/* Cost Preset & Additional Cost */}
              <div className="space-y-4">
                <CostPresetSelect
                  value={form.watch(`items.${itemIndex}.cost_preset_id`)}
                  onChange={(value) => form.setValue(`items.${itemIndex}.cost_preset_id`, value)}
                  label="Preset de Custo (opcional)"
                  placeholder="Selecione um preset"
                />
                
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
                                  Tempo total de trabalho manual para TODAS as {form.watch(`items.${itemIndex}.product_quantity`)} unidades.
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
                        {form.watch(`items.${itemIndex}.product_quantity`) > 1 &&
                         form.watch(`items.${itemIndex}.manual_labor_minutes_total`) > 0 && (
                          <p className="text-xs text-primary-600 mt-1 font-medium">
                            ≈ {Math.round(
                              form.watch(`items.${itemIndex}.manual_labor_minutes_total`) /
                              form.watch(`items.${itemIndex}.product_quantity`)
                            )} min/unidade
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Item Total */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium text-neutral-700">
                  Total do Item:
                </span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(calculateItemTotalCost(itemIndex))}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

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
        <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary-600" />
              Prévia de Custos
            </CardTitle>
            <CardDescription>
              Estimativa calculada com base nos dados e presets selecionados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Status Indicators */}
            <div className="flex flex-wrap gap-2">
              {machinePreset && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✓ Máquina
                </span>
              )}
              {energyPreset && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✓ Energia
                </span>
              )}
              {firstItemCostPreset && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  ✓ Custo
                </span>
              )}
              {(!machinePreset || !energyPreset) && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                  Configure presets para estimativa completa
                </span>
              )}
            </div>

            <Separator />

            {/* Per-Item Breakdown */}
            {items.length > 0 && (
              <div className="space-y-3">
                {items.map((item, idx) => {
                  const itemName = form.watch(`items.${idx}.product_name`) || `Item #${idx + 1}`
                  const filamentCost = calculateItemFilamentCost(idx)
                  const wasteCost = calculateItemWasteCost(idx)
                  const energyCost = calculateItemEnergyCost(idx)
                  const setupCost = calculateItemSetupCost(idx)
                  const laborCost = calculateItemManualLaborCost(idx)
                  const itemTotal = calculateItemTotalCost(idx)

                  return (
                    <div key={item.id} className="border-b border-primary-200 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-neutral-900">{itemName}</p>
                        <p className="font-semibold text-primary-600">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        {filamentCost > 0 && (
                          <>
                            <span className="text-neutral-600">Filamento:</span>
                            <span className="text-right text-neutral-900">
                              {formatCurrency(filamentCost)}
                            </span>
                          </>
                        )}
                        {wasteCost > 0 && (
                          <>
                            <span className="text-neutral-600">Desperdício:</span>
                            <span className="text-right text-neutral-900">
                              {formatCurrency(wasteCost)}
                            </span>
                          </>
                        )}
                        {energyCost > 0 && (
                          <>
                            <span className="text-neutral-600">Energia:</span>
                            <span className="text-right text-neutral-900">
                              {formatCurrency(energyCost)}
                            </span>
                          </>
                        )}
                        {setupCost > 0 && (
                          <>
                            <span className="text-neutral-600">Setup:</span>
                            <span className="text-right text-neutral-900">
                              {formatCurrency(setupCost)}
                            </span>
                          </>
                        )}
                        {laborCost > 0 && (
                          <>
                            <span className="text-neutral-600">Mão de Obra:</span>
                            <span className="text-right text-neutral-900">
                              {formatCurrency(laborCost)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <Separator />

            {/* Budget Totals */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-700 font-medium">Subtotal:</span>
                <span className="font-semibold">
                  {formatCurrency(calculateBudgetSubtotalCost())}
                </span>
              </div>

              {firstItemCostPreset?.overhead_percentage && firstItemCostPreset.overhead_percentage > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    Overhead ({firstItemCostPreset.overhead_percentage}%):
                  </span>
                  <span className="text-neutral-900">
                    {formatCurrency(calculateBudgetOverheadCost())}
                  </span>
                </div>
              )}

              {firstItemCostPreset?.profit_margin_percentage && firstItemCostPreset.profit_margin_percentage > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    Lucro ({firstItemCostPreset.profit_margin_percentage}%):
                  </span>
                  <span className="text-green-700">
                    {formatCurrency(calculateBudgetProfitAmount())}
                  </span>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-neutral-900">Total Estimado:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(calculateBudgetTotalCost())}
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-900">
                <strong>Esta é uma estimativa.</strong> O custo final será recalculado pelo
                sistema ao salvar o orçamento.
                {(!machinePreset || !energyPreset) && (
                  <> Configure os presets de máquina e energia para uma estimativa mais
                  precisa.</>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

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
                  {...form.register('delivery_days', { valueAsNumber: true })}
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
              <div>
                <p className="text-sm text-neutral-600">Total do Orçamento:</p>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(calculateBudgetTotalCost())}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  * Valores de energia e desperdício serão calculados no backend
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
    </div>
  )
}

