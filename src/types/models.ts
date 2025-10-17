// Domain Models

export interface User {
  id: string
  email: string
  name: string
  organization_id: string
  roles: string[]
  avatar?: string
  created_at: string
  updated_at: string
}

export type SubscriptionStatus = 'trial' | 'active' | 'overdue' | 'cancelled'
export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise'

export interface Company {
  id: string
  organization_id: string
  name: string
  trade_name?: string
  document?: string // CNPJ
  email?: string
  phone?: string
  whatsapp?: string // ⚠️ NO UNDERSCORE
  instagram?: string
  website?: string
  logo_url?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string

  // Subscription fields
  subscription_status: SubscriptionStatus
  is_platform_company: boolean
  trial_ends_at?: string // ISO 8601
  subscription_started_at?: string // ISO 8601
  subscription_plan: SubscriptionPlan
  asaas_customer_id?: string
  asaas_subscription_id?: string
  last_payment_check?: string // ISO 8601
  next_payment_due?: string // ISO 8601

  created_at: string
  updated_at: string
}

export type BudgetStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'printing'
  | 'completed'

export interface Budget {
  id: string
  organization_id: string
  name: string
  description?: string
  customer_id: string
  status: BudgetStatus

  // Presets
  machine_preset_id?: string
  energy_preset_id?: string

  // Flags
  include_energy_cost: boolean
  include_waste_cost: boolean

  // Calculated costs (in cents)
  filament_cost: number
  waste_cost: number
  energy_cost: number
  labor_cost: number
  total_cost: number

  // Commercial info
  delivery_days?: number
  payment_terms?: string
  notes?: string
  pdf_url?: string

  owner_user_id: string
  created_at: string
  updated_at: string
}

export interface BudgetItem {
  id: string
  budget_id: string

  // Product info
  product_name: string
  product_description?: string
  product_quantity: number // units
  product_dimensions?: string

  // Print time
  print_time_hours: number
  print_time_minutes: number
  print_time_display: string // "5h30m"

  // Additional costs
  cost_preset_id?: string
  additional_labor_cost?: number // cents
  additional_notes?: string

  // Calculated costs (in cents)
  filament_cost: number
  waste_cost: number
  energy_cost: number
  labor_cost: number
  item_total_cost: number
  unit_price: number // item_total_cost / product_quantity

  order: number
  created_at: string
  updated_at: string
}

export interface BudgetItemFilament {
  filament_id: string
  filament_name: string
  brand_name: string
  material_name: string
  color: string // color name or hex
  quantity: number // grams
  cost: number // cents
  order: number // application order for AMS
}

export interface BudgetWithDetails extends Budget {
  customer: Customer
  items: Array<BudgetItem & { filaments: BudgetItemFilament[] }>
  total_print_time_hours: number
  total_print_time_minutes: number
  total_print_time_display: string
}

export interface Customer {
  id: string
  organization_id: string
  name: string
  email: string
  phone?: string
  document?: string // CPF/CNPJ
  address?: string
  city?: string
  state?: string
  zip_code?: string
  notes?: string
  budgets_count?: number
  total_spent?: number // cents
  created_at: string
  updated_at: string
}

export type ColorType = 'solid' | 'gradient' | 'duo' | 'rainbow'

export interface GradientStop {
  color: string // #HEX
  position: number // 0-100
}

export interface ColorData {
  // Solid
  color?: string // #HEX

  // Gradient
  direction?: string // CSS direction (e.g., "90deg", "to right")
  colors?: GradientStop[] // Array of color stops

  // Duo
  primary?: string // #HEX
  secondary?: string // #HEX
  pattern?: 'stripes' | 'spots' | 'random' | 'marbled'
  ratio?: number // 0.1-0.9 (primary color ratio)

  // Rainbow
  intensity?: number // 0.1-1.0
  saturation?: number // 0.1-1.0
  repetitions?: number // 1-10
}

export interface Filament {
  id: string
  organization_id: string
  name: string
  brand_id: string
  brand_name: string
  material_id: string
  material_name: string
  color: string // Readable color name (e.g., "Rosa", "Azul Metálico")
  color_hex: string // Legacy hex color
  color_type: ColorType
  color_data: ColorData
  color_preview: string // CSS string for preview
  diameter: 1.75 | 2.85
  price_per_kg: number // cents
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  organization_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  organization_id: string
  name: string // PLA, ABS, PETG, TPU, etc.
  description?: string
  tempTable?: number // Bed temperature in °C
  tempExtruder?: number // Extruder temperature in °C
  created_at: string
  updated_at: string
}

export interface MachinePreset {
  id: string
  organization_id: string
  name: string
  description?: string
  waste_percentage: number // AMS waste % (e.g., 15 for 15%)
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface EnergyPreset {
  id: string
  organization_id: string
  name: string
  kwh_cost: number // Cost per kWh in cents
  printer_power: number // Power in Watts
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CostPreset {
  id: string
  organization_id: string
  name: string
  labor_cost_per_hour: number // Labor cost per hour in cents
  profit_margin?: number // Profit margin %
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface CompanyBrandingColors {
  template_name?: string
  header_bg_color: string // #HEX
  header_text_color: string // #HEX
  primary_color: string // #HEX
  primary_text_color: string // #HEX
  secondary_color: string // #HEX
  secondary_text_color: string // #HEX
  title_color: string // #HEX
  body_text_color: string // #HEX
  accent_color: string // #HEX
  border_color: string // #HEX
  background_color: string // #HEX
  table_header_bg_color: string // #HEX
  table_row_alt_bg_color: string // #HEX
}

export interface CompanyBrandingEntity extends CompanyBrandingColors {
  id: string
  organization_id: string
  created_at: string
  updated_at: string
}

export interface BrandingTemplate {
  name: string
  display_name: string
  description: string
  colors: CompanyBrandingEntity
}

