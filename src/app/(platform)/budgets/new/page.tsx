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
import { createBudgetSchema, type CreateBudgetFormData } from '@/lib/validations/budget'
import { formatCurrency, getColorPreviewStyle } from '@/lib/utils/format'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'
import type { Filament } from '@/types/models'

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
          additional_labor_cost: 0,
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
      additional_labor_cost: 0,
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

  const calculateFilamentCost = (filamentId: string, grams: number): number => {
    const filament = getFilament(filamentId)
    if (!filament) return 0
    // price_per_kg is in cents, so: (cents / 1000g) * grams
    return Math.round((filament.price_per_kg / 1000) * grams)
  }

  const calculateItemTotal = (itemIndex: number): number => {
    const item = form.getValues(`items.${itemIndex}`)
    if (!item) return 0

    const filamentCost = (item.filaments || []).reduce((sum, f) => {
      return sum + calculateFilamentCost(f.filament_id, f.quantity)
    }, 0)

    return filamentCost + (item.additional_labor_cost || 0)
  }

  const calculateBudgetTotal = (): number => {
    return items.reduce((sum, _, index) => sum + calculateItemTotal(index), 0)
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
                    const cost = calculateFilamentCost(f.filament_id, f.quantity)

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
                
                <div>
                  <Label>Custo Adicional de Mão de Obra (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      form.setValue(
                        `items.${itemIndex}.additional_labor_cost`,
                        Math.round(value * 100) // Convert to cents
                      )
                    }}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Custos extras como pintura, acabamento, etc.
                  </p>
                </div>
              </div>

              {/* Item Total */}
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-sm font-medium text-neutral-700">
                  Total do Item:
                </span>
                <span className="text-lg font-bold text-primary-600">
                  {formatCurrency(calculateItemTotal(itemIndex))}
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
                  {formatCurrency(calculateBudgetTotal())}
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

