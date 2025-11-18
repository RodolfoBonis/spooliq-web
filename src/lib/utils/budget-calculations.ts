/**
 * Budget Cost Calculation Utilities
 *
 * These functions mirror the backend calculation logic to provide
 * accurate cost previews while creating budgets in the frontend.
 *
 * Backend reference: features/budget/data/repositories/budget_repository_impl.go (CalculateCosts)
 */

import type { Filament, MachinePreset, EnergyPreset, CostPreset } from '@/types/models'

export interface BudgetItemFilamentInput {
  filament_id: string
  quantity: number // grams
}

export interface BudgetItemInput {
  product_quantity: number
  print_time_hours: number
  print_time_minutes: number
  setup_time_minutes: number
  manual_labor_minutes_total: number
  filaments: BudgetItemFilamentInput[]
}

export interface BudgetInput {
  include_energy_cost: boolean
  include_waste_cost: boolean
  items: BudgetItemInput[]
}

/**
 * Calculate filament cost for a single filament
 * Formula: (quantity_grams / 1000) * price_per_kg
 */
export function calculateSingleFilamentCost(
  filament: Filament | undefined,
  grams: number
): number {
  if (!filament) return 0
  // price_per_kg is in cents, quantity is in grams
  return Math.round((filament.price_per_kg / 1000) * grams)
}

/**
 * Calculate total filament cost for an item
 */
export function calculateFilamentCost(
  item: BudgetItemInput,
  getFilament: (id: string) => Filament | undefined
): number {
  if (!item.filaments || item.filaments.length === 0) return 0

  return item.filaments.reduce((sum, f) => {
    const filament = getFilament(f.filament_id)
    return sum + calculateSingleFilamentCost(filament, f.quantity)
  }, 0)
}

/**
 * Calculate waste cost for multi-color prints (AMS)
 * Formula: 15g per color change * avg_price_per_kg
 * Only applies if budget.include_waste_cost AND item has > 1 filament
 */
export function calculateWasteCost(
  item: BudgetItemInput,
  includeWasteCost: boolean,
  getFilament: (id: string) => Filament | undefined
): number {
  if (!includeWasteCost) return 0
  if (!item.filaments || item.filaments.length <= 1) return 0

  const wastePerChange = 15.0 // grams
  const numChanges = item.filaments.length - 1
  const totalWaste = wastePerChange * numChanges

  // Calculate average price
  let totalPrice = 0
  let validFilaments = 0

  item.filaments.forEach((f) => {
    const fil = getFilament(f.filament_id)
    if (fil) {
      totalPrice += fil.price_per_kg
      validFilaments++
    }
  })

  if (validFilaments === 0) return 0

  const avgPrice = totalPrice / validFilaments
  return Math.round((totalWaste / 1000.0) * avgPrice)
}

/**
 * Calculate energy cost for an item
 * Formula: (power_watts * hours / 1000) * energy_price_kwh * 100
 * Requires both machinePreset and energyPreset
 */
export function calculateEnergyCost(
  item: BudgetItemInput,
  includeEnergyCost: boolean,
  machinePreset: MachinePreset | undefined,
  energyPreset: EnergyPreset | undefined
): number {
  if (!includeEnergyCost) return 0
  if (!machinePreset || !energyPreset) return 0

  const itemHours = item.print_time_hours + item.print_time_minutes / 60.0
  const kwh = (machinePreset.power_consumption * itemHours) / 1000.0

  // energyPreset.energy_cost_per_kwh is already in cents
  // Multiply by 100 to match backend conversion
  return Math.round(kwh * energyPreset.energy_cost_per_kwh * 100)
}

/**
 * Calculate setup cost for an item
 * Formula: (setup_minutes / 60) * labor_rate * 100
 * Requires costPreset
 */
export function calculateSetupCost(
  item: BudgetItemInput,
  costPreset: CostPreset | undefined
): number {
  if (!costPreset) return 0
  if (item.setup_time_minutes <= 0) return 0

  const setupHours = item.setup_time_minutes / 60.0
  // labor_cost_per_hour is in cents, multiply by 100 to match backend
  return Math.round(setupHours * costPreset.labor_cost_per_hour * 100)
}

/**
 * Calculate manual labor cost for an item
 * Formula: (manual_labor_minutes_total / 60) * labor_rate * 100
 * Requires costPreset
 */
export function calculateManualLaborCost(
  item: BudgetItemInput,
  costPreset: CostPreset | undefined
): number {
  if (!costPreset) return 0
  if (item.manual_labor_minutes_total <= 0) return 0

  const laborHours = item.manual_labor_minutes_total / 60.0
  // labor_cost_per_hour is in cents, multiply by 100 to match backend
  return Math.round(laborHours * costPreset.labor_cost_per_hour * 100)
}

/**
 * Calculate total cost for a single item
 */
export function calculateItemTotal(
  item: BudgetItemInput,
  budget: BudgetInput,
  getFilament: (id: string) => Filament | undefined,
  machinePreset: MachinePreset | undefined,
  energyPreset: EnergyPreset | undefined,
  costPreset: CostPreset | undefined
): number {
  const filamentCost = calculateFilamentCost(item, getFilament)
  const wasteCost = calculateWasteCost(item, budget.include_waste_cost, getFilament)
  const energyCost = calculateEnergyCost(item, budget.include_energy_cost, machinePreset, energyPreset)
  const setupCost = calculateSetupCost(item, costPreset)
  const laborCost = calculateManualLaborCost(item, costPreset)

  return filamentCost + wasteCost + energyCost + setupCost + laborCost
}

/**
 * Calculate budget subtotal (sum of all items)
 */
export function calculateBudgetSubtotal(
  budget: BudgetInput,
  getFilament: (id: string) => Filament | undefined,
  machinePreset: MachinePreset | undefined,
  energyPreset: EnergyPreset | undefined,
  getCostPreset: (itemIndex: number) => CostPreset | undefined
): number {
  return budget.items.reduce((sum, item, index) => {
    const costPreset = getCostPreset(index)
    return sum + calculateItemTotal(item, budget, getFilament, machinePreset, energyPreset, costPreset)
  }, 0)
}

/**
 * Calculate overhead cost
 * Formula: subtotal * (overhead_percentage / 100)
 * Uses the first available CostPreset
 */
export function calculateOverheadCost(
  subtotal: number,
  costPreset: CostPreset | undefined
): number {
  if (!costPreset) return 0
  if (!costPreset.overhead_percentage || costPreset.overhead_percentage <= 0) return 0

  return Math.round(subtotal * (costPreset.overhead_percentage / 100.0))
}

/**
 * Calculate profit amount
 * Formula: (subtotal + overhead) * (profit_margin_percentage / 100)
 * Uses the first available CostPreset
 */
export function calculateProfitAmount(
  subtotal: number,
  overheadCost: number,
  costPreset: CostPreset | undefined
): number {
  if (!costPreset) return 0
  if (!costPreset.profit_margin_percentage || costPreset.profit_margin_percentage <= 0) return 0

  const baseForProfit = subtotal + overheadCost
  return Math.round(baseForProfit * (costPreset.profit_margin_percentage / 100.0))
}

/**
 * Calculate final budget total
 * Formula: subtotal + overhead + profit
 */
export function calculateBudgetTotal(
  budget: BudgetInput,
  getFilament: (id: string) => Filament | undefined,
  machinePreset: MachinePreset | undefined,
  energyPreset: EnergyPreset | undefined,
  getCostPreset: (itemIndex: number) => CostPreset | undefined,
  budgetLevelCostPreset: CostPreset | undefined
): number {
  const subtotal = calculateBudgetSubtotal(
    budget,
    getFilament,
    machinePreset,
    energyPreset,
    getCostPreset
  )

  const overheadCost = calculateOverheadCost(subtotal, budgetLevelCostPreset)
  const profitAmount = calculateProfitAmount(subtotal, overheadCost, budgetLevelCostPreset)

  return subtotal + overheadCost + profitAmount
}

/**
 * Get unit price for an item
 * Formula: item_total / product_quantity
 */
export function calculateUnitPrice(itemTotal: number, productQuantity: number): number {
  if (productQuantity <= 0) return 0
  return Math.round(itemTotal / productQuantity)
}
