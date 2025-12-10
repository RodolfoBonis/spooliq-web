// Dashboard Analytics Types

export type PeriodFilter = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

export type BudgetStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'printing' | 'completed';

export type ActivityType =
  | 'budget_created'
  | 'budget_sent'
  | 'budget_approved'
  | 'budget_rejected'
  | 'budget_printing'
  | 'budget_completed'
  | 'customer_created';

// ============================================================================
// TIER 1: Overview Metrics
// ============================================================================

export interface DashboardOverview {
  current_month_revenue: number; // in cents
  revenue_change_percentage: number;
  conversion_rate: number;
  conversion_rate_change: number;
  budgets_by_status: Record<BudgetStatus, number>;
  new_customers_count: number;
  new_customers_change: number;
}

// ============================================================================
// Revenue Trend
// ============================================================================

export interface RevenueTrendDataPoint {
  month: string; // "2025-01" or date
  revenue: number; // in cents
  pipeline: number; // sent budgets value in cents
  count: number; // number of budgets
}

export interface RevenueTrendData {
  data: RevenueTrendDataPoint[];
  total_revenue: number;
  total_pipeline: number;
  period: PeriodFilter;
}

// ============================================================================
// Conversion Funnel
// ============================================================================

export interface ConversionFunnelStage {
  status: BudgetStatus;
  count: number;
  total_value: number; // in cents
  conversion_rate: number; // percentage to next stage
  average_time_in_stage: number; // in hours
}

export interface ConversionFunnelData {
  stages: ConversionFunnelStage[];
  overall_conversion_rate: number;
}

// ============================================================================
// Recent Activity
// ============================================================================

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string; // ISO date
  related_entity_id: string; // budget or customer ID
  related_entity_name: string; // budget title or customer name
  value?: number; // budget value in cents (optional)
}

export interface RecentActivityData {
  activities: RecentActivity[];
}

// ============================================================================
// TIER 2: Top Customers
// ============================================================================

export interface TopCustomer {
  id: string;
  name: string;
  total_revenue: number; // in cents
  budget_count: number;
  average_ticket: number; // in cents
  last_budget_date: string; // ISO date
  status: 'active' | 'inactive'; // active if budget in last 30 days
}

export interface TopCustomersData {
  customers: TopCustomer[];
  total_customers: number;
}

// ============================================================================
// Operational Insights
// ============================================================================

export interface OperationalInsights {
  average_ticket: number; // in cents
  average_ticket_change: number; // percentage
  average_profit_margin: number; // percentage
  profit_margin_change: number; // percentage
  total_print_time_hours: number; // hours
  print_time_change: number; // percentage
  rejection_rate: number; // percentage
  rejection_rate_change: number; // percentage
}

// ============================================================================
// TIER 3: Top Filaments
// ============================================================================

export interface TopFilament {
  id: string;
  name: string;
  brand: string;
  color: string;
  color_preview: string; // hex or gradient CSS
  total_grams: number;
  total_value: number; // in cents
  usage_count: number; // how many times used
}

export interface TopFilamentsData {
  filaments: TopFilament[];
  total_filament_cost: number; // in cents
}

// ============================================================================
// Top Materials (by material type: PLA, ABS, PETG, etc)
// ============================================================================

export interface TopMaterial {
  material_type: string; // 'PLA', 'ABS', 'PETG', 'TPU', etc
  total_grams: number;
  total_value: number; // in cents
  percentage: number; // percentage of total usage
  filament_count: number; // how many different filaments of this type
  color: string; // standardized color for this material type
}

export interface TopMaterialsData {
  materials: TopMaterial[];
  total_usage: number; // total grams across all materials
}

// ============================================================================
// Goals and Alerts
// ============================================================================

export interface Goal {
  id: string;
  type: 'revenue' | 'customers' | 'conversion';
  title: string;
  target: number;
  current: number;
  progress: number; // percentage
  status: 'on_track' | 'at_risk' | 'behind';
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  count?: number;
  action_url?: string;
  timestamp: string;
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
