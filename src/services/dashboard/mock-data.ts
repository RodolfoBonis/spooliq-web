/**
 * @deprecated This mock data file is deprecated. Use the real API via dashboardApi from './api.ts' instead.
 * This file is kept for reference only and may be removed in a future release.
 */

import { subMonths, subDays, format } from 'date-fns';
import type {
  DashboardOverview,
  RevenueTrendData,
  ConversionFunnelData,
  RecentActivityData,
  TopCustomersData,
  OperationalInsights,
  TopFilamentsData,
  TopMaterialsData,
  GoalsAlertsData,
  PeriodFilter,
  BudgetStatus,
} from '@/types/dashboard';

// ============================================================================
// Helper Functions
// ============================================================================

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getRandomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

// ============================================================================
// TIER 1: Dashboard Overview (Updated to match backend contract)
// ============================================================================

export function getMockDashboardOverview(): DashboardOverview {
  const totalRevenue = randomInt(3000000, 8000000); // R$ 30k - 80k

  const statuses: BudgetStatus[] = ['draft', 'sent', 'approved', 'rejected', 'printing', 'completed'];

  return {
    total_revenue: totalRevenue,
    revenue_change: randomFloat(-10, 25, 1),
    total_budgets: randomInt(50, 150),
    budgets_change: randomFloat(-5, 20, 1),
    avg_ticket: randomInt(100000, 250000),
    avg_ticket_change: randomFloat(-5, 15, 1),
    approval_rate: randomFloat(55, 75, 1),
    approval_rate_change: randomFloat(-5, 10, 1),
    avg_profit_margin: randomFloat(25, 45, 1),
    profit_margin_change: randomFloat(-3, 8, 1),
    new_customers: randomInt(5, 15),
    new_customers_change: randomFloat(-10, 30, 1),
    budgets_by_status: statuses.map(status => ({
      status,
      count: randomInt(5, 40),
    })),
    period: '30d',
  };
}

// ============================================================================
// Revenue Trend (Updated to match backend contract)
// ============================================================================

export function getMockRevenueTrend(period: PeriodFilter): RevenueTrendData {
  const points = [];
  let months = 12;

  switch (period) {
    case '7d':
      months = 1;
      break;
    case '30d':
      months = 3;
      break;
    case '3m':
      months = 3;
      break;
    case '6m':
      months = 6;
      break;
    case '1y':
      months = 12;
      break;
    default:
      months = 12;
  }

  let baseRevenue = randomInt(2000000, 3000000);
  let baseCost = randomInt(1000000, 1500000);

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const dateStr = format(date, 'yyyy-MM');

    const growth = randomFloat(0.95, 1.15);
    const revenue = Math.round(baseRevenue * growth);
    const cost = Math.round(baseCost * randomFloat(0.8, 1.2));
    const profit = revenue - cost;

    points.push({
      date: dateStr,
      revenue,
      cost,
      profit,
      budget_count: randomInt(15, 40),
    });

    baseRevenue = revenue;
    baseCost = cost;
  }

  return {
    points,
    period,
  };
}

// ============================================================================
// Conversion Funnel (Updated to match backend contract)
// ============================================================================

export function getMockConversionFunnel(): ConversionFunnelData {
  const statuses: BudgetStatus[] = ['draft', 'sent', 'approved', 'printing', 'completed'];

  let currentCount = randomInt(80, 120);

  const steps = statuses.map((status, index) => {
    const count = currentCount;
    const nextCount = index < statuses.length - 1 ? Math.round(currentCount * randomFloat(0.65, 0.85)) : 0;
    const conversionRate = nextCount > 0 ? (nextCount / count) * 100 : 0;

    currentCount = nextCount;

    return {
      status,
      count,
      conversion_rate: parseFloat(conversionRate.toFixed(1)),
    };
  });

  const firstStage = steps[0];
  const lastStage = steps[steps.length - 1];
  const overallConversion = (lastStage.count / firstStage.count) * 100;

  return {
    steps,
    total_budgets: firstStage.count,
    overall_conversion: parseFloat(overallConversion.toFixed(1)),
    period: '30d',
  };
}

// ============================================================================
// Recent Activity (Updated to match backend contract)
// ============================================================================

export function getMockRecentActivity(): RecentActivityData {
  const actions = ['created', 'updated', 'sent', 'approved', 'rejected', 'printing', 'completed'];
  const entityTypes = ['budget', 'customer', 'filament'];

  const customerNames = [
    'Joao Silva',
    'Maria Santos',
    'Tech Parts Ltd',
    'Carlos Oliveira',
    'Ana Costa',
  ];

  const budgetTitles = [
    'Pecas para Drone',
    'Prototipo de Produto',
    'Miniaturas Decorativas',
    'Suporte para Camera',
    'Case para Eletronicos',
  ];

  const activities = [];

  for (let i = 0; i < 15; i++) {
    const action = getRandomElement(actions);
    const entityType = action === 'created' && Math.random() > 0.7 ? 'customer' : 'budget';
    const hoursAgo = randomInt(1, 72);
    const createdAt = subDays(new Date(), hoursAgo / 24).toISOString();

    const entityName = entityType === 'customer'
      ? getRandomElement(customerNames)
      : getRandomElement(budgetTitles);

    activities.push({
      id: `activity-${i}`,
      user_id: `user-${randomInt(1, 5)}`,
      action,
      entity_type: entityType,
      entity_id: `entity-${i}`,
      entity_name: entityName,
      description: `${action} ${entityType}: ${entityName}`,
      metadata: entityType === 'budget' ? { total_value: randomInt(50000, 500000) } : undefined,
      created_at: createdAt,
    });
  }

  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return {
    activities: activities.slice(0, 10),
    total: activities.length,
  };
}

// ============================================================================
// TIER 2: Top Customers (Updated to match backend contract)
// ============================================================================

export function getMockTopCustomers(): TopCustomersData {
  const customerNames = [
    'Tech Solutions Brasil',
    'Industria XYZ Ltda',
    'Joao Silva - MEI',
    'Inovacao 3D Corp',
    'Maria Costa Arquitetura',
  ];

  const customers = customerNames.map((name, index) => {
    const budgetCount = randomInt(3, 25);
    const totalRevenue = randomInt(500000, 5000000);

    return {
      id: `customer-${index}`,
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
      total_revenue: totalRevenue,
      budget_count: budgetCount,
      avg_ticket: Math.round(totalRevenue / budgetCount),
    };
  });

  customers.sort((a, b) => b.total_revenue - a.total_revenue);

  return {
    customers: customers.slice(0, 5),
    period: '30d',
  };
}

// ============================================================================
// Operational Insights (Updated to match backend contract)
// ============================================================================

export function getMockOperationalInsights(): OperationalInsights {
  return {
    avg_ticket: randomInt(100000, 250000),
    avg_ticket_change: randomFloat(-5, 15, 1),
    avg_profit_margin: randomFloat(25, 45, 1),
    profit_margin_change: randomFloat(-3, 8, 1),
    total_print_time_hours: randomFloat(80, 200, 1),
    print_time_change: randomFloat(-10, 25, 1),
    rejection_rate: randomFloat(8, 25, 1),
    rejection_rate_change: randomFloat(-8, 5, 1),
    cost_breakdown: {
      filament_pct: randomFloat(35, 50, 1),
      waste_pct: randomFloat(5, 15, 1),
      energy_pct: randomFloat(8, 15, 1),
      setup_pct: randomFloat(5, 10, 1),
      labor_pct: randomFloat(15, 25, 1),
      overhead_pct: randomFloat(5, 15, 1),
    },
    period: '30d',
  };
}

// ============================================================================
// TIER 3: Top Filaments (Updated to match backend contract)
// ============================================================================

export function getMockTopFilaments(): TopFilamentsData {
  const filaments = [
    { name: 'PLA Premium', brand_name: 'Bambu Lab', material_name: 'PLA', color_hex: '#000000' },
    { name: 'PETG Strong', brand_name: 'Prusament', material_name: 'PETG', color_hex: '#FFFFFF' },
    { name: 'PLA Silk', brand_name: 'eSun', material_name: 'PLA', color_hex: '#1e3a8a' },
    { name: 'ABS Professional', brand_name: 'Creality', material_name: 'ABS', color_hex: '#dc2626' },
    { name: 'TPU Flex', brand_name: 'Bambu Lab', material_name: 'TPU', color_hex: '#ea580c' },
  ];

  const filamentsData = filaments.map((filament, index) => ({
    id: `filament-${index}`,
    name: filament.name,
    brand_name: filament.brand_name,
    material_name: filament.material_name,
    color_hex: filament.color_hex,
    total_grams: randomInt(500, 5000),
    usage_count: randomInt(5, 50),
  }));

  filamentsData.sort((a, b) => b.usage_count - a.usage_count);

  return {
    filaments: filamentsData.slice(0, 5),
    period: '30d',
  };
}

// ============================================================================
// Top Materials (Updated to match backend contract)
// ============================================================================

export function getMockTopMaterials(): TopMaterialsData {
  const materials = [
    { name: 'PLA', total_grams: randomInt(8000, 15000) },
    { name: 'PETG', total_grams: randomInt(4000, 8000) },
    { name: 'ABS', total_grams: randomInt(3000, 6000) },
    { name: 'TPU', total_grams: randomInt(1000, 3000) },
    { name: 'ASA', total_grams: randomInt(500, 2000) },
  ];

  const materialsData = materials.map((material, index) => ({
    id: `material-${index}`,
    name: material.name,
    total_grams: material.total_grams,
    usage_count: randomInt(10, 100),
  }));

  materialsData.sort((a, b) => b.total_grams - a.total_grams);

  return {
    materials: materialsData,
    period: '30d',
  };
}

// ============================================================================
// Goals and Alerts (Updated to match backend contract)
// ============================================================================

export function getMockGoalsAlerts(): GoalsAlertsData {
  const revenueTarget = 10000000;
  const revenueCurrent = randomInt(6000000, 9000000);
  const revenueProgress = (revenueCurrent / revenueTarget) * 100;

  const customersTarget = 10;
  const customersCurrent = randomInt(5, 12);
  const customersProgress = (customersCurrent / customersTarget) * 100;

  const goals = [
    {
      name: 'Meta de Receita Mensal',
      current: revenueCurrent / 100, // Convert to reais for display
      target: revenueTarget / 100,
      progress: parseFloat(revenueProgress.toFixed(1)),
      unit: 'R$',
    },
    {
      name: 'Novos Clientes este Mes',
      current: customersCurrent,
      target: customersTarget,
      progress: parseFloat(customersProgress.toFixed(1)),
      unit: 'clientes',
    },
  ];

  const alerts = [];

  const pendingCount = randomInt(2, 8);
  if (pendingCount > 5) {
    alerts.push({
      type: 'pending_budgets',
      severity: 'warning' as const,
      message: `${pendingCount} orcamentos enviados ha mais de 7 dias sem resposta`,
      count: pendingCount,
      entity_type: 'budget',
    });
  }

  const inactiveCount = randomInt(5, 15);
  if (inactiveCount > 10) {
    alerts.push({
      type: 'inactive_customers',
      severity: 'info' as const,
      message: `${inactiveCount} clientes sem orcamentos ha mais de 30 dias`,
      count: inactiveCount,
      entity_type: 'customer',
    });
  }

  return {
    goals,
    alerts,
  };
}

// ============================================================================
// Mock Delays (to simulate real API)
// ============================================================================

function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Exported Mock API Service (DEPRECATED - use dashboardApi from './api.ts')
// ============================================================================

/**
 * @deprecated Use dashboardApi from './api.ts' instead for real API calls.
 */
export const mockDashboardApi = {
  async getOverview(): Promise<DashboardOverview> {
    await delay(randomInt(300, 800));
    return getMockDashboardOverview();
  },

  async getRevenueTrend(period: PeriodFilter): Promise<RevenueTrendData> {
    await delay(randomInt(400, 1000));
    return getMockRevenueTrend(period);
  },

  async getConversionFunnel(): Promise<ConversionFunnelData> {
    await delay(randomInt(300, 700));
    return getMockConversionFunnel();
  },

  async getRecentActivity(): Promise<RecentActivityData> {
    await delay(randomInt(200, 600));
    return getMockRecentActivity();
  },

  async getTopCustomers(): Promise<TopCustomersData> {
    await delay(randomInt(300, 800));
    return getMockTopCustomers();
  },

  async getOperationalInsights(): Promise<OperationalInsights> {
    await delay(randomInt(300, 700));
    return getMockOperationalInsights();
  },

  async getTopFilaments(): Promise<TopFilamentsData> {
    await delay(randomInt(300, 800));
    return getMockTopFilaments();
  },

  async getTopMaterials(): Promise<TopMaterialsData> {
    await delay(randomInt(300, 800));
    return getMockTopMaterials();
  },

  async getGoalsAlerts(): Promise<GoalsAlertsData> {
    await delay(randomInt(300, 700));
    return getMockGoalsAlerts();
  },
};
