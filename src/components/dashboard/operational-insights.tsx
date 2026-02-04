'use client';

import { motion } from 'framer-motion';
import { DollarSign, Percent, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from './stat-card';
import { MetricSkeleton } from './metric-skeleton';
import { DashboardErrorState } from './error-state';
import { DashboardEmptyState } from './empty-state';
import { useOperationalInsights } from '@/hooks/dashboard/use-operational-insights';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { formatCurrency, formatHours } from '@/lib/dashboard/formatters';

export function OperationalInsights() {
  const prefersReducedMotion = useReducedMotion();
  const { data, isLoading, error, refetch } = useOperationalInsights();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <DashboardErrorState
        title="Erro ao carregar insights"
        message="Não foi possível carregar os insights operacionais."
        onRetry={() => refetch()}
        compact
      />
    );
  }

  if (!data) {
    return (
      <DashboardEmptyState
        type="generic"
        title="Sem dados operacionais"
        description="Os insights operacionais aparecerão quando houver orçamentos aprovados."
        compact
      />
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Insights operacionais"
    >
      <StatCard
        title="Ticket Médio"
        value={formatCurrency(data.avg_ticket)}
        change={data.avg_ticket_change}
        changeLabel="vs período anterior"
        icon={DollarSign}
      />

      <StatCard
        title="Margem de Lucro"
        value={`${data.avg_profit_margin.toFixed(1)}%`}
        change={data.profit_margin_change}
        changeLabel="vs período anterior"
        icon={Percent}
      />

      <StatCard
        title="Tempo de Impressão"
        value={formatHours(data.total_print_time_hours)}
        change={data.print_time_change}
        changeLabel="vs período anterior"
        icon={Clock}
      />

      <StatCard
        title="Taxa de Rejeição"
        value={`${data.rejection_rate.toFixed(1)}%`}
        change={data.rejection_rate_change}
        changeLabel="vs período anterior"
        icon={AlertTriangle}
        isPositiveGood={false}
      />
    </motion.div>
  );
}
