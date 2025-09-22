// Auth Types
export interface User {
  id: string
  name: string
  email: string
  roles: string[]
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface TokenPair {
  access_token: string
  refresh_token: string
}

// Color Types for Advanced Color Picker
export type ColorType = 'solid' | 'gradient' | 'duo' | 'rainbow'

export interface SolidColor {
  type: 'solid'
  color: string
}

export interface GradientColor {
  type: 'gradient'
  direction: number // angle in degrees
  stops: Array<{
    color: string
    position: number // 0-100
  }>
}

export interface DuoColor {
  type: 'duo'
  primary: string
  secondary: string
  pattern: 'mixed' | 'alternating' | 'spiral'
}

export interface RainbowColor {
  type: 'rainbow'
  saturation: number // 0-100
  lightness: number // 0-100
}

export type ColorData = SolidColor | GradientColor | DuoColor | RainbowColor

// Filament Types
export interface Filament {
  id: string
  brand: string
  name: string
  material: string
  color?: string
  color_hex?: string
  color_type?: ColorType
  color_data?: ColorData
  color_preview?: string // Base64 or URL for preview image
  diameter: number
  weight: number
  price_per_kg: number
  price_per_meter?: number
  url?: string
  is_global: boolean
  user_id?: string
  owner_user_id?: string
  created_at: string
  updated_at: string
}

export interface CreateFilamentRequest {
  brand_id: number
  name: string
  material_id: number
  color?: string
  color_hex?: string
  color_type?: ColorType
  color_data?: ColorData
  color_preview?: string
  diameter: number
  weight: number
  price_per_kg: number
  price_per_meter?: number
  url?: string
}

// Quote Types
export interface Quote {
  id: string
  title: string
  notes?: string
  filament_lines: FilamentLine[]
  cost_profile: CostProfile
  energy_profile: EnergyProfile
  machine_profile: MachineProfile
  margin_profile: MarginProfile
  user_id: string
  created_at: string
  updated_at: string
}

export interface FilamentLine {
  id: string
  filament_id: string
  filament: Filament
  weight_needed: number
  quote_id: string
}

export interface CostProfile {
  overhead_amount: number
  wear_percentage: number
}

export interface EnergyProfile {
  base_tariff: number
  flag_surcharge: number
  location: string
  year: number
}

export interface MachineProfile {
  name: string
  brand: string
  model: string
  watt: number
  idle_factor: number
}

export interface MarginProfile {
  printing_only_margin: number
  printing_plus_margin: number
  full_service_margin: number
  operator_rate_per_hour: number
  modeler_rate_per_hour: number
}

export interface CreateQuoteRequest {
  title: string
  notes?: string
  filament_lines: Omit<FilamentLine, 'id' | 'quote_id' | 'filament'>[]
  cost_profile: CostProfile
  energy_profile: EnergyProfile
  machine_profile: MachineProfile
  margin_profile: MarginProfile
}

// Calculation Types
export interface CalculateQuoteRequest {
  print_time_hours: number
  service_type: 'printing_only' | 'printing_plus' | 'full_service'
  operator_minutes?: number
  modeler_minutes?: number
}

export interface CalculationResult {
  material_cost: number
  energy_cost: number
  wear_cost: number
  labor_cost: number
  overhead_cost: number
  subtotal: number
  margin_amount: number
  total_cost: number
  breakdown: {
    material_breakdown: Array<{
      filament_id: string
      filament_name: string
      weight_used: number
      cost: number
    }>
    energy_breakdown: {
      printing_energy_cost: number
      idle_energy_cost: number
      total_energy_cost: number
    }
    labor_breakdown?: {
      operator_cost: number
      modeler_cost: number
      total_labor_cost: number
    }
  }
}

// Filters and Pagination
export interface QuoteFilters {
  search?: string
  dateRange?: {
    from: string
    to: string
  }
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilamentFilters {
  search?: string
  material?: string
  brand?: string
  is_global?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  last_page: number
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

// Brand Types
export interface FilamentBrand {
  id: number
  name: string
  description?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateBrandRequest {
  name: string
  description?: string
}

export interface UpdateBrandRequest {
  name?: string
  description?: string
  active?: boolean
}

export interface BrandFilters {
  active_only?: boolean
  search?: string
}

// Material Types
export interface FilamentMaterial {
  id: number
  name: string
  description?: string
  properties?: string // JSON string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CreateMaterialRequest {
  name: string
  description?: string
  properties?: string // JSON string
}

export interface UpdateMaterialRequest {
  name?: string
  description?: string
  properties?: string // JSON string
  active?: boolean
}

export interface MaterialFilters {
  active_only?: boolean
  search?: string
}

// Preset Types
export interface EnergyPreset {
  key: string
  location: string
  state?: string
  city?: string
  base_tariff: number
  flag_surcharge: number
  year: number
  month?: number
  flag_type?: 'green' | 'yellow' | 'red'
  description?: string
  created_at: string
  updated_at: string
}

export interface MachinePreset {
  key: string
  name: string
  brand: string
  model: string
  watt: number
  idle_factor: number
  description?: string
  url?: string
  build_volume?: {
    x: number
    y: number
    z: number
  }
  nozzle_diameter?: number
  max_temperature?: number
  heated_bed?: boolean
  created_at: string
  updated_at: string
}

export interface CreateEnergyPresetRequest {
  location: string
  state: string
  city: string
  base_tariff: number
  flag_surcharge: number
  year: number
  month?: number
  flag_type: 'green' | 'yellow' | 'red'
  description?: string
}

export interface CreateMachinePresetRequest {
  name: string
  brand: string
  model: string
  watt: number
  idle_factor: number
  build_volume?: {
    x: number
    y: number
    z: number
  }
  nozzle_diameter?: number
  max_temperature?: number
  heated_bed?: boolean
}

export interface UpdatePresetRequest {
  [key: string]: any // Dynamic based on preset type
}

// Cost Profile Preset
export interface CostPreset {
  key: string
  name: string
  description?: string
  overhead_amount: number
  wear_percentage: number
  is_default?: boolean
  created_at: string
  updated_at: string
}

export interface CreateCostPresetRequest {
  name: string
  description?: string
  overhead_amount: number
  wear_percentage: number
  is_default?: boolean
}

// Margin Profile Preset
export interface MarginPreset {
  key: string
  name: string
  description?: string
  printing_only_margin: number
  printing_plus_margin: number
  full_service_margin: number
  operator_rate_per_hour: number
  modeler_rate_per_hour: number
  is_default?: boolean
  created_at: string
  updated_at: string
}

export interface CreateMarginPresetRequest {
  name: string
  description?: string
  printing_only_margin: number
  printing_plus_margin: number
  full_service_margin: number
  operator_rate_per_hour: number
  modeler_rate_per_hour: number
  is_default?: boolean
}