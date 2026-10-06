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
  cost_preset_id?: string // Budget-level cost preset (overhead/margin)
  profile_id?: string
  machine_preset?: PresetRef | null
  energy_preset?: PresetRef | null
  cost_preset?: PresetRef | null
  profile?: PresetRef | null

  // Flags
  include_energy_cost: boolean
  include_waste_cost: boolean

  // Calculated costs (in cents)
  filament_cost: number
  waste_cost: number
  energy_cost: number
  setup_cost: number // Sum of all items setup costs
  labor_cost: number // Sum of all items manual labor costs
  overhead_cost: number // Overhead from CostPreset
  profit_amount: number // Profit margin from CostPreset
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
  model_3d_id?: string // ID do modelo 3D associado (opcional)

  // Product info
  product_name: string
  product_description?: string
  product_quantity: number // units
  product_dimensions?: string

  // Print time
  print_time_hours: number
  print_time_minutes: number
  print_time_display: string // "5h30m"

  // Labor time inputs
  cost_preset_id?: string
  setup_time_minutes: number // Setup time in minutes (one-time per product)
  manual_labor_minutes_total: number // Total manual labor time for ALL units
  additional_notes?: string

  // Calculated costs (in cents)
  filament_cost: number
  waste_cost: number
  energy_cost: number
  setup_cost: number // Calculated setup cost
  manual_labor_cost: number // Calculated manual labor cost
  item_total_cost: number
  unit_price: number // COST per unit (no markup), cents
  sale_unit_price?: number // SALE price per unit (cost + share of overhead/profit), cents
  sale_total?: number // SALE total for the item, cents (sums exactly to budget total)
  cost_preset?: PresetRef | null

  order: number
  created_at: string
  updated_at: string
}

export interface BudgetItemFilament {
  filament_id: string
  filament_name: string
  brand_name: string
  material_name: string
  
  // Legacy color field (maintained for backward compatibility)
  color: string // color name
  
  // Advanced color system
  color_type: ColorType
  color_data: ColorData | string // Can be ColorData object or string (for backward compatibility)
  color_hex: string
  color_preview: string
  
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
  budgets?: CustomerBudget[]
  created_at: string
  updated_at: string
}

export interface CustomerBudget {
    id: string
    name: string
    status: BudgetStatus
    total_cost: number
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

// ✅ CORRECTED PRESET MODELS - Aligned with Backend
// Preset monetary rates (cost_per_hour, energy_cost_per_kwh, labor_cost_per_hour, ...) are in REAIS.

export type PresetType = 'machine' | 'energy' | 'cost'

/** Lightweight `{id, name}` reference embedded in API responses. */
export interface PresetRef {
  id: string
  name: string
}

export interface PresetTemplate {
  key: string
  name: string
  description?: string
  type: PresetType
  machine?: Partial<
    Pick<
      MachinePreset,
      | 'brand'
      | 'model'
      | 'build_volume_x'
      | 'build_volume_y'
      | 'build_volume_z'
      | 'nozzle_diameter'
      | 'filament_diameter'
      | 'power_consumption'
    >
  >
  energy?: Partial<Pick<EnergyPreset, 'country' | 'currency' | 'energy_cost_per_kwh'>>
  cost?: Partial<
    Pick<CostPreset, 'labor_cost_per_hour' | 'overhead_percentage' | 'profit_margin_percentage'>
  >
}

export interface PrintProfile {
  id: string
  name: string
  description?: string
  is_default: boolean
  machine_preset: PresetRef
  energy_preset: PresetRef
  cost_preset?: PresetRef | null
  created_by?: string
  created_at: string
  updated_at: string
}

export interface MachinePreset {
  id: string
  organization_id: string
  name: string
  description?: string
  is_default?: boolean
  brand?: string
  model?: string
  build_volume_x: number // mm
  build_volume_y: number // mm
  build_volume_z: number // mm
  nozzle_diameter: number // mm
  layer_height_min: number // mm
  layer_height_max: number // mm
  print_speed_max: number // mm/s
  power_consumption: number // Watts
  bed_temperature_max: number // °C
  extruder_temperature_max: number // °C
  filament_diameter: number // mm (1.75 or 2.85)
  cost_per_hour: number // reais
  created_at?: string
  updated_at?: string
}

export interface EnergyPreset {
  id: string
  organization_id: string
  name: string
  description?: string
  is_default?: boolean
  country?: string
  state?: string
  city?: string
  energy_cost_per_kwh: number // reais
  currency: string // "BRL", "USD", etc (3-letter ISO code)
  provider?: string
  tariff_type?: string
  peak_hour_multiplier?: number // 0/absent = not set
  off_peak_hour_multiplier?: number
  created_at?: string
  updated_at?: string
}

export interface CostPreset {
  id: string
  organization_id: string
  name: string
  description?: string
  is_default?: boolean
  labor_cost_per_hour: number // reais
  packaging_cost_per_item: number // reais
  shipping_cost_base: number // reais
  shipping_cost_per_gram: number // reais
  overhead_percentage: number // 0-100
  profit_margin_percentage: number // 0-1000
  post_processing_cost_per_hour: number // reais
  support_removal_cost_per_hour: number // reais
  quality_control_cost_per_item: number // reais
  created_at?: string
  updated_at?: string
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

// Subscription Payment Models
export type PaymentStatus = 'pending' | 'confirmed' | 'received' | 'overdue' | 'failed'

export interface SubscriptionPayment {
  id: string
  organization_id: string
  asaas_payment_id?: string
  asaas_invoice_id?: string
  amount: number // in cents
  status: PaymentStatus
  payment_date?: string // ISO 8601
  due_date: string // ISO 8601
  invoice_url?: string
  created_at: string
}

// Payment Method Models
export interface PaymentMethod {
  id: string
  organization_id: string
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto'
  last_four_digits?: string
  card_brand?: string
  holder_name?: string
  expiry_month?: string
  expiry_year?: string
  is_primary: boolean
  asaas_payment_method_id?: string
  created_at: string
  updated_at: string
}

// Subscription Models
export interface Subscription {
  id: string
  organization_id: string
  plan_id: string
  plan?: SubscriptionPlanModel
  status: SubscriptionStatus
  started_at?: string
  trial_ends_at?: string
  current_period_start?: string
  current_period_end?: string
  cancelled_at?: string
  cancel_reason?: string
  asaas_subscription_id?: string
  payment_method_id?: string
  payment_method?: PaymentMethod
  created_at: string
  updated_at: string
}

// Subscription Plan Models
export interface PlanFeature {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPlanModel {
  id: string
  name: string
  description: string
  price: number
  cycle: 'MONTHLY' | 'YEARLY' | 'CUSTOM'
  features: PlanFeature[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// Plan Management Models
export interface PlanStats {
  plan_id: string
  plan_name: string
  total_companies: number
  active_companies: number
  trial_companies: number
  total_active_users: number
  monthly_revenue: number
  annual_revenue: number
  churn_rate: number
  conversion_rate: number
}

export interface PlanCompany {
  id: string
  organization_id: string
  name: string
  email: string
  subscription_status: string
  trial_ends_at?: string
  total_users: number
  created_at: string
}

export interface PlanCompaniesResponse {
  companies: PlanCompany[]
  page: number
  page_size: number
  total_count: number
  total_pages: number
}

export interface FinancialReport {
  plan_id: string
  plan_name: string
  report_period: string
  revenue: {
    current_period: number
    previous_period: number
    growth_percentage: number
    average_per_user: number
    total_lifetime: number
  }
  subscriptions: {
    new_subscriptions: number
    cancelled_subscriptions: number
    churn_rate: number
    retention_rate: number
    conversion_rate: number
  }
  projections: {
    next_month: number
    next_quarter: number
    next_year: number
    methodology: string
  }
  trends: Array<{
    period: string
    revenue: number
    subscriptions: number
  }>
}

export interface CanDeleteResponse {
  can_delete: boolean
  reason: string
  active_companies: number
  trial_companies: number
  blocking_issues: string[]
  recommendations: string[]
}

export interface AvailableFeature {
  name: string
  description: string
  category: string
  is_active: boolean
}

// PDF Generation Models
export interface PDFGenerationResponse {
  pdf_url: string
  budget_id: string
  budget_name: string
  generated: boolean
  message?: string
}

// Webhook Models
export interface AsaasWebhookEvent {
  event: string
  payment?: {
    id: string
    customer: string
    subscription?: string
    value: number
    netValue: number
    description?: string
    billingType: string
    status: string
    dueDate: string
    paymentDate?: string
    clientPaymentDate?: string
    invoiceUrl: string
    bankSlipUrl?: string
    invoiceNumber: string
  }
  subscription?: {
    id: string
    customer: string
    value: number
    nextDueDate: string
    cycle: string
    description?: string
    status: string
    creditCard?: {
      creditCardNumber: string
      creditCardBrand: string
    }
  }
}

// 3D Model Models
export interface Model3D {
  id: string
  organization_id: string
  customer_id?: string
  name: string
  description: string
  file_name: string
  file_url: string
  file_format: string // ".stl" ou ".3mf"
  file_size_bytes: number
  file_hash: string
  thumbnail_url?: string
  notes?: string
  tags?: string
  owner_user_id: string
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface FindAllModel3DResponse {
  data: Model3D[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface UploadConflictResponse {
  error: string
  existing: Model3D
}
