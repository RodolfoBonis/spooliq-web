// Dashboard Analytics Types

export type PeriodFilter = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'printing' | 'completed';

// ============================================================================
// TIER 1: Overview Metrics (matches backend entities.OverviewResponse)
// ============================================================================

export interface BudgetStatusCount {
  status: string;
  count: number;
}

export interface DashboardOverview {
  total_revenue: number; // in cents
  revenue_change: number;
  total_budgets: number;
  budgets_change: number;
  avg_ticket: number; // in cents
  avg_ticket_change: number;
  approval_rate: number;
  approval_rate_change: number;
  avg_profit_margin: number;
  profit_margin_change: number;
  new_customers: number;
  new_customers_change: number;
  budgets_by_status: BudgetStatusCount[];
  period: string;
}

// ============================================================================
// Revenue Trend (matches backend entities.RevenueTrendResponse)
// ============================================================================

export interface RevenueTrendPoint {
  date: string;
  revenue: number; // in cents
  cost: number; // in cents
  profit: number; // in cents
  budget_count: number;
}

export interface RevenueTrendData {
  points: RevenueTrendPoint[];
  period: string;
}

// ============================================================================
// Conversion Funnel (matches backend entities.ConversionFunnelResponse)
// ============================================================================

export interface FunnelStep {
  status: string;
  count: number;
  conversion_rate: number;
}

export interface ConversionFunnelData {
  steps: FunnelStep[];
  total_budgets: number;
  overall_conversion: number;
  period: string;
}

// ============================================================================
// Recent Activity (matches backend entities.RecentActivityResponse)
// ============================================================================

export interface RecentActivity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string; // ISO date
}

export interface RecentActivityData {
  activities: RecentActivity[];
  total: number;
}

// ============================================================================
// TIER 2: Top Customers (matches backend entities.TopCustomersResponse)
// ============================================================================

export interface TopCustomer {
  id: string;
  name: string;
  email?: string;
  total_revenue: number; // in cents
  budget_count: number;
  avg_ticket: number; // in cents
}

export interface TopCustomersData {
  customers: TopCustomer[];
  period: string;
}

// ============================================================================
// Operational Insights (matches backend entities.OperationalInsightsResponse)
// ============================================================================

export interface CostBreakdown {
  filament_pct: number;
  waste_pct: number;
  energy_pct: number;
  setup_pct: number;
  labor_pct: number;
  overhead_pct: number;
}

export interface OperationalInsights {
  avg_ticket: number; // in cents
  avg_ticket_change: number;
  avg_profit_margin: number;
  profit_margin_change: number;
  total_print_time_hours: number;
  print_time_change: number;
  rejection_rate: number;
  rejection_rate_change: number;
  cost_breakdown: CostBreakdown;
  period: string;
}

// ============================================================================
// TIER 3: Top Filaments (matches backend entities.TopFilamentsResponse)
// ============================================================================

export interface TopFilament {
  id: string;
  name: string;
  brand_name: string;
  material_name: string;
  color_hex?: string;
  total_grams: number;
  usage_count: number;
}

export interface TopFilamentsData {
  filaments: TopFilament[];
  period: string;
}

// ============================================================================
// Top Materials (matches backend entities.TopMaterialsResponse)
// ============================================================================

export interface TopMaterial {
  id: string;
  name: string;
  total_grams: number;
  usage_count: number;
}

export interface TopMaterialsData {
  materials: TopMaterial[];
  period: string;
}

// ============================================================================
// Goals and Alerts (matches backend entities.GoalsAlertsResponse)
// ============================================================================

export interface Goal {
  name: string;
  current: number;
  target: number;
  progress: number;
  unit: string;
}

export interface Alert {
  type: string;
  severity: 'warning' | 'danger' | 'info';
  message: string;
  count?: number;
  entity_type?: string;
}

export interface GoalsAlertsData {
  goals: Goal[];
  alerts: Alert[];
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DashboardApiResponse<T> {
  data: T;
  timestamp: string;
  period?: PeriodFilter;
}

// ============================================================================
// Filter State
// ============================================================================

export interface DashboardFilters {
  period: PeriodFilter;
  start_date?: string;
  end_date?: string;
}

// ============================================================================
// Export Types
// ============================================================================

export interface DashboardExportOptions {
  format: 'pdf' | 'png';
  sections: ('overview' | 'revenue' | 'funnel' | 'customers' | 'insights' | 'filaments' | 'goals')[];
  include_charts: boolean;
  include_tables: boolean;
}
