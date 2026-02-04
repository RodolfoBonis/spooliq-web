'use client';

import { TrendingUp, FileText, Users, Percent } from 'lucide-react';
import { StatCard } from './stat-card';
import { MetricSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useDashboardOverview } from '@/hooks/dashboard/use-dashboard-overview';
import { useDashboardStore } from '@/stores/dashboard-store';

export function OverviewMetrics() {
  const period = useDashboardStore((state) => state.period);
  const { data, isLoading, error, refetch } = useDashboardOverview();

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar métricas"
        message="Não foi possível carregar as métricas do dashboard."
        onRetry={() => refetch()}
        compact
      />
    );
  }

  if (!data) {
    return (
      <DashboardEmptyState
        type="budgets"
        title="Sem dados para exibir"
        description="Crie orçamentos para começar a ver suas métricas."
        compact
      />
    );
  }

  // Find budget counts by status
  const getStatusCount = (status: string) => {
    const found = data.budgets_by_status.find((s) => s.status === status);
    return found?.count ?? 0;
  };

  const sentCount = getStatusCount('sent');
  const approvedCount = getStatusCount('approved');
  const printingCount = getStatusCount('printing');
  const activeBudgets = sentCount + approvedCount + printingCount;

  return (
    <div
      className="grid gap-4 grid-cols-2"
      role="region"
      aria-label="Métricas principais"
    >
      <StatCard
        title="Margem Lucro"
        value={`${data.avg_profit_margin.toFixed(1)}%`}
        change={data.profit_margin_change}
        changeLabel="vs anterior"
        icon={Percent}
        variant="profit"
        href={`/budgets?status=approved&period=${period}`}
      />

      <StatCard
        title="Aprovação"
        value={`${data.approval_rate.toFixed(1)}%`}
        change={data.approval_rate_change}
        changeLabel="vs anterior"
        icon={TrendingUp}
        variant="approval"
        href={`/budgets?view=funnel&period=${period}`}
      />

      <StatCard
        title="Orçamentos Ativos"
        value={activeBudgets}
        subtitle="em andamento"
        icon={FileText}
        variant="budgets"
        href="/budgets?status=sent,approved,printing"
      />

      <StatCard
        title="Novos Clientes"
        value={data.new_customers}
        change={data.new_customers_change}
        changeLabel="no período"
        icon={Users}
        variant="customers"
        href="/customers?sort=created_at&order=desc"
      />
    </div>
  );
}
