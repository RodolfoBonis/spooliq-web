'use client';

import { DollarSign, TrendingUp, FileText, Users } from 'lucide-react';
import { StatCard } from './stat-card';
import { MetricSkeleton } from './metric-skeleton';
import { useDashboardOverview } from '@/hooks/dashboard/use-dashboard-overview';
import { formatCurrency } from '@/lib/dashboard/formatters';

export function OverviewMetrics() {
  const { data, isLoading } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const activeBudgets =
    data.budgets_by_status.sent +
    data.budgets_by_status.approved +
    data.budgets_by_status.printing;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Receita do Mês"
        value={formatCurrency(data.current_month_revenue)}
        change={data.revenue_change_percentage}
        changeLabel="vs mês anterior"
        icon={DollarSign}
      />

      <StatCard
        title="Taxa de Conversão"
        value={`${data.conversion_rate.toFixed(1)}%`}
        change={data.conversion_rate_change}
        changeLabel="vs mês anterior"
        icon={TrendingUp}
      />

      <StatCard
        title="Orçamentos Ativos"
        value={activeBudgets}
        subtitle={`${data.budgets_by_status.sent} enviados, ${data.budgets_by_status.printing} imprimindo`}
        icon={FileText}
      />

      <StatCard
        title="Novos Clientes"
        value={data.new_customers_count}
        change={data.new_customers_change}
        changeLabel="este mês"
        icon={Users}
      />
    </div>
  );
}
