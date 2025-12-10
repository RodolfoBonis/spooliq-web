'use client';

import { motion } from 'framer-motion';
import { DollarSign, Percent, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from './stat-card';
import { MetricSkeleton } from './metric-skeleton';
import { useOperationalInsights } from '@/hooks/dashboard/use-operational-insights';
import { formatCurrency, formatHours } from '@/lib/dashboard/formatters';

export function OperationalInsights() {
  const { data, isLoading } = useOperationalInsights();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      <StatCard
        title="Ticket Médio"
        value={formatCurrency(data.average_ticket)}
        change={data.average_ticket_change}
        changeLabel="vs mês anterior"
        icon={DollarSign}
      />

      <StatCard
        title="Margem de Lucro"
        value={`${data.average_profit_margin.toFixed(1)}%`}
        change={data.profit_margin_change}
        changeLabel="vs mês anterior"
        icon={Percent}
      />

      <StatCard
        title="Tempo de Impressão"
        value={formatHours(data.total_print_time_hours)}
        change={data.print_time_change}
        changeLabel="vs mês anterior"
        icon={Clock}
      />

      <StatCard
        title="Taxa de Rejeição"
        value={`${data.rejection_rate.toFixed(1)}%`}
        change={data.rejection_rate_change}
        changeLabel="vs mês anterior"
        icon={AlertTriangle}
        isPositiveGood={false} // Lower is better for rejection rate
      />
    </motion.div>
  );
}
