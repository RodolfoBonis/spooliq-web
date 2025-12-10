import { subMonths, subDays, format, startOfMonth, endOfMonth } from 'date-fns';
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
  ActivityType,
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
// TIER 1: Dashboard Overview
// ============================================================================

export function getMockDashboardOverview(): DashboardOverview {
  const currentMonthRevenue = randomInt(3000000, 8000000); // R$ 30k - 80k
  const lastMonthRevenue = randomInt(2500000, 7000000);

  return {
    current_month_revenue: currentMonthRevenue,
    revenue_change_percentage: parseFloat(
      (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    ),
    conversion_rate: randomFloat(55, 75, 1),
    conversion_rate_change: randomFloat(-5, 10, 1),
    budgets_by_status: {
      draft: randomInt(5, 15),
      sent: randomInt(8, 20),
      approved: randomInt(10, 25),
      rejected: randomInt(2, 8),
      printing: randomInt(3, 10),
      completed: randomInt(15, 40),
    },
    new_customers_count: randomInt(5, 15),
    new_customers_change: randomFloat(-10, 30, 1),
  };
}

// ============================================================================
// Revenue Trend
// ============================================================================

export function getMockRevenueTrend(period: PeriodFilter): RevenueTrendData {
  const data = [];
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

  // Generate data with growing trend
  let baseRevenue = randomInt(2000000, 3000000);
  let basePipeline = randomInt(1000000, 1500000);

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthStr = format(date, 'yyyy-MM');

    // Add some growth and variability
    const growth = randomFloat(0.95, 1.15);
    const revenue = Math.round(baseRevenue * growth);
    const pipeline = Math.round(basePipeline * randomFloat(0.8, 1.2));

    data.push({
      month: monthStr,
      revenue,
      pipeline,
      count: randomInt(15, 40),
    });

    baseRevenue = revenue;
    basePipeline = pipeline;
  }

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalPipeline = data.reduce((sum, item) => sum + item.pipeline, 0);

  return {
    data,
    total_revenue: totalRevenue,
    total_pipeline: totalPipeline,
    period,
  };
}

// ============================================================================
// Conversion Funnel
// ============================================================================

export function getMockConversionFunnel(): ConversionFunnelData {
  const statuses: BudgetStatus[] = ['draft', 'sent', 'approved', 'printing', 'completed'];

  let currentCount = randomInt(80, 120);
  let currentValue = randomInt(15000000, 25000000);

  const stages = statuses.map((status, index) => {
    const count = currentCount;
    const value = currentValue;

    // Calculate conversion rate to next stage
    const nextCount = index < statuses.length - 1 ? Math.round(currentCount * randomFloat(0.65, 0.85)) : 0;
    const conversionRate = nextCount > 0 ? (nextCount / count) * 100 : 0;

    // Reduce for next iteration
    currentCount = nextCount;
    currentValue = Math.round(currentValue * randomFloat(0.7, 0.9));

    return {
      status,
      count,
      total_value: value,
      conversion_rate: parseFloat(conversionRate.toFixed(1)),
      average_time_in_stage: randomFloat(12, 72, 1), // hours
    };
  });

  const firstStage = stages[0];
  const lastStage = stages[stages.length - 1];
  const overallConversionRate = (lastStage.count / firstStage.count) * 100;

  return {
    stages,
    overall_conversion_rate: parseFloat(overallConversionRate.toFixed(1)),
  };
}

// ============================================================================
// Recent Activity
// ============================================================================

export function getMockRecentActivity(): RecentActivityData {
  const activities: ActivityType[] = [
    'budget_created',
    'budget_sent',
    'budget_approved',
    'budget_rejected',
    'budget_printing',
    'budget_completed',
    'customer_created',
  ];

  const customerNames = [
    'João Silva',
    'Maria Santos',
    'Tech Parts Ltd',
    'Carlos Oliveira',
    'Ana Costa',
    'Pedro Almeida',
    'Juliana Ferreira',
    'Roberto Lima',
    'Fernanda Rocha',
    'Lucas Martins',
  ];

  const budgetTitles = [
    'Peças para Drone',
    'Protótipo de Produto',
    'Miniaturas Decorativas',
    'Suporte para Câmera',
    'Case para Eletrônicos',
    'Peças Automotivas',
    'Brinquedos Personalizados',
    'Ferramentas Custom',
  ];

  const activityList = [];

  for (let i = 0; i < 15; i++) {
    const type = getRandomElement(activities);
    const hoursAgo = randomInt(1, 72);
    const timestamp = subDays(new Date(), hoursAgo / 24).toISOString();

    let description = '';
    let relatedEntityName = '';

    if (type === 'customer_created') {
      relatedEntityName = getRandomElement(customerNames);
      description = `Novo cliente cadastrado: ${relatedEntityName}`;
    } else {
      relatedEntityName = getRandomElement(budgetTitles);
      const customerName = getRandomElement(customerNames);

      switch (type) {
        case 'budget_created':
          description = `Orçamento "${relatedEntityName}" criado`;
          break;
        case 'budget_sent':
          description = `Orçamento "${relatedEntityName}" enviado para ${customerName}`;
          break;
        case 'budget_approved':
          description = `Orçamento "${relatedEntityName}" aprovado por ${customerName}`;
          break;
        case 'budget_rejected':
          description = `Orçamento "${relatedEntityName}" rejeitado por ${customerName}`;
          break;
        case 'budget_printing':
          description = `Impressão iniciada: "${relatedEntityName}"`;
          break;
        case 'budget_completed':
          description = `Orçamento "${relatedEntityName}" concluído`;
          break;
      }
    }

    activityList.push({
      id: `activity-${i}`,
      type,
      description,
      timestamp,
      related_entity_id: `entity-${i}`,
      related_entity_name: relatedEntityName,
      value: type !== 'customer_created' ? randomInt(50000, 500000) : undefined,
    });
  }

  // Sort by timestamp (newest first)
  activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    activities: activityList.slice(0, 10), // Return only 10 most recent
  };
}

// ============================================================================
// TIER 2: Top Customers
// ============================================================================

export function getMockTopCustomers(): TopCustomersData {
  const customerNames = [
    'Tech Solutions Brasil',
    'Indústria XYZ Ltda',
    'João Silva - MEI',
    'Inovação 3D Corp',
    'Maria Costa Arquitetura',
    'DronesPro Comercial',
    'Maker Space SP',
    'Carlos Alberto - Hobbista',
  ];

  const customers = customerNames.map((name, index) => {
    const budgetCount = randomInt(3, 25);
    const totalRevenue = randomInt(500000, 5000000); // R$ 5k - 50k
    const daysAgo = randomInt(1, 60);

    return {
      id: `customer-${index}`,
      name,
      total_revenue: totalRevenue,
      budget_count: budgetCount,
      average_ticket: Math.round(totalRevenue / budgetCount),
      last_budget_date: subDays(new Date(), daysAgo).toISOString(),
      status: (daysAgo <= 30 ? 'active' : 'inactive') as 'active' | 'inactive',
    };
  });

  // Sort by revenue (descending) and take top 5
  customers.sort((a, b) => b.total_revenue - a.total_revenue);

  return {
    customers: customers.slice(0, 5),
    total_customers: customerNames.length,
  };
}

// ============================================================================
// Operational Insights
// ============================================================================

export function getMockOperationalInsights(): OperationalInsights {
  return {
    average_ticket: randomInt(100000, 250000), // R$ 1k - 2.5k
    average_ticket_change: randomFloat(-5, 15, 1),
    average_profit_margin: randomFloat(25, 45, 1),
    profit_margin_change: randomFloat(-3, 8, 1),
    total_print_time_hours: randomFloat(80, 200, 1),
    print_time_change: randomFloat(-10, 25, 1),
    rejection_rate: randomFloat(8, 25, 1),
    rejection_rate_change: randomFloat(-8, 5, 1),
  };
}

// ============================================================================
// TIER 3: Top Filaments
// ============================================================================

export function getMockTopFilaments(): TopFilamentsData {
  const filaments = [
    {
      name: 'PLA Premium',
      brand: 'Bambu Lab',
      color: 'Preto',
      color_preview: '#000000',
    },
    {
      name: 'PETG Strong',
      brand: 'Prusament',
      color: 'Branco',
      color_preview: '#FFFFFF',
    },
    {
      name: 'PLA Silk',
      brand: 'eSun',
      color: 'Azul Metálico',
      color_preview: 'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)',
    },
    {
      name: 'ABS Professional',
      brand: 'Creality',
      color: 'Vermelho',
      color_preview: '#dc2626',
    },
    {
      name: 'TPU Flex',
      brand: 'Bambu Lab',
      color: 'Laranja',
      color_preview: '#ea580c',
    },
    {
      name: 'PLA Rainbow',
      brand: 'Sunlu',
      color: 'Arco-íris',
      color_preview: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)',
    },
  ];

  const filamentsData = filaments.map((filament, index) => ({
    id: `filament-${index}`,
    name: filament.name,
    brand: filament.brand,
    color: filament.color,
    color_preview: filament.color_preview,
    total_grams: randomInt(500, 5000),
    total_value: randomInt(50000, 500000), // R$ 500 - 5000
    usage_count: randomInt(5, 50),
  }));

  // Sort by usage count
  filamentsData.sort((a, b) => b.usage_count - a.usage_count);

  const totalFilamentCost = filamentsData.reduce((sum, f) => sum + f.total_value, 0);

  return {
    filaments: filamentsData.slice(0, 5),
    total_filament_cost: totalFilamentCost,
  };
}

// ============================================================================
// Top Materials (by material type)
// ============================================================================

export function getMockTopMaterials(): TopMaterialsData {
  const materialColors: Record<string, string> = {
    PLA: '#3B82F6', // Blue
    PETG: '#8B5CF6', // Purple
    ABS: '#EF4444', // Red
    TPU: '#F97316', // Orange
    ASA: '#EAB308', // Yellow
    Nylon: '#22C55E', // Green
  };

  const materials = [
    {
      material_type: 'PLA',
      total_grams: randomInt(8000, 15000),
      filament_count: randomInt(8, 15),
    },
    {
      material_type: 'PETG',
      total_grams: randomInt(4000, 8000),
      filament_count: randomInt(4, 8),
    },
    {
      material_type: 'ABS',
      total_grams: randomInt(3000, 6000),
      filament_count: randomInt(3, 6),
    },
    {
      material_type: 'TPU',
      total_grams: randomInt(1000, 3000),
      filament_count: randomInt(2, 4),
    },
    {
      material_type: 'ASA',
      total_grams: randomInt(500, 2000),
      filament_count: randomInt(1, 3),
    },
  ];

  const totalUsage = materials.reduce((sum, m) => sum + m.total_grams, 0);

  const materialsData = materials.map((material) => ({
    material_type: material.material_type,
    total_grams: material.total_grams,
    total_value: Math.round(material.total_grams * randomFloat(0.08, 0.15) * 100), // R$ 0.08-0.15 per gram
    percentage: parseFloat(((material.total_grams / totalUsage) * 100).toFixed(1)),
    filament_count: material.filament_count,
    color: materialColors[material.material_type] || '#6B7280',
  }));

  // Sort by total grams
  materialsData.sort((a, b) => b.total_grams - a.total_grams);

  return {
    materials: materialsData,
    total_usage: totalUsage,
  };
}

// ============================================================================
// Goals and Alerts
// ============================================================================

export function getMockGoalsAlerts(): GoalsAlertsData {
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthProgress = (currentDay / daysInMonth) * 100;

  const revenueTarget = 10000000; // R$ 100k
  const revenueCurrent = randomInt(6000000, 9000000);
  const revenueProgress = (revenueCurrent / revenueTarget) * 100;

  const customersTarget = 10;
  const customersCurrent = randomInt(5, 12);
  const customersProgress = (customersCurrent / customersTarget) * 100;

  const conversionTarget = 70;
  const conversionCurrent = randomFloat(60, 75);
  const conversionProgress = (conversionCurrent / conversionTarget) * 100;

  const goals = [
    {
      id: 'goal-1',
      type: 'revenue' as const,
      title: 'Meta de Receita Mensal',
      target: revenueTarget,
      current: revenueCurrent,
      progress: parseFloat(revenueProgress.toFixed(1)),
      status:
        revenueProgress >= monthProgress
          ? ('on_track' as const)
          : revenueProgress < monthProgress - 20
          ? ('behind' as const)
          : ('at_risk' as const),
    },
    {
      id: 'goal-2',
      type: 'customers' as const,
      title: 'Novos Clientes este Mês',
      target: customersTarget,
      current: customersCurrent,
      progress: parseFloat(customersProgress.toFixed(1)),
      status:
        customersProgress >= monthProgress
          ? ('on_track' as const)
          : customersProgress < monthProgress - 20
          ? ('behind' as const)
          : ('at_risk' as const),
    },
    {
      id: 'goal-3',
      type: 'conversion' as const,
      title: 'Taxa de Conversão',
      target: conversionTarget,
      current: conversionCurrent,
      progress: parseFloat(conversionProgress.toFixed(1)),
      status:
        conversionProgress >= 90
          ? ('on_track' as const)
          : conversionProgress < 70
          ? ('behind' as const)
          : ('at_risk' as const),
    },
  ];

  const alerts = [];

  // Pending budgets alert
  const pendingCount = randomInt(2, 8);
  if (pendingCount > 5) {
    alerts.push({
      id: 'alert-1',
      type: 'warning' as const,
      title: 'Orçamentos Pendentes',
      description: `${pendingCount} orçamentos enviados há mais de 7 dias sem resposta`,
      count: pendingCount,
      action_url: '/budgets?status=sent',
      timestamp: subDays(new Date(), 1).toISOString(),
    });
  }

  // Inactive customers alert
  const inactiveCount = randomInt(5, 15);
  if (inactiveCount > 10) {
    alerts.push({
      id: 'alert-2',
      type: 'info' as const,
      title: 'Clientes Inativos',
      description: `${inactiveCount} clientes sem orçamentos há mais de 30 dias`,
      count: inactiveCount,
      action_url: '/customers?status=inactive',
      timestamp: subDays(new Date(), 2).toISOString(),
    });
  }

  // Low conversion rate alert
  if (conversionCurrent < 60) {
    alerts.push({
      id: 'alert-3',
      type: 'danger' as const,
      title: 'Taxa de Conversão Baixa',
      description: 'Taxa de conversão abaixo da meta. Revise sua estratégia de precificação.',
      timestamp: subDays(new Date(), 0).toISOString(),
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
// Exported Mock API Service
// ============================================================================

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
